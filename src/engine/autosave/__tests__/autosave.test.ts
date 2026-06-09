import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Block } from '@/types/builder';
import { useDirtyStore } from '../dirty-store';
import { SaveQueue } from '../save-queue';
import { AutosaveEngine, resetAutosaveEngine } from '../autosave';
import { eventBus } from '@/engine/events/bus';

function block(id: string, type: string = 'section'): Block {
  return { id, type, content: {}, style: {}, children: [] };
}

// ── Dirty Store ──────────────────────────────────────────────

describe('DirtyStore', () => {
  beforeEach(() => {
    useDirtyStore.getState().reset();
  });

  it('should start clean', () => {
    const state = useDirtyStore.getState();
    expect(state.isDirty).toBe(false);
    expect(state.pendingPatches).toEqual([]);
    expect(state.pendingCount).toBe(0);
    expect(state.saveStatus).toBe('idle');
    expect(state.unsavedChangeCount).toBe(0);
  });

  it('should track patches via markDirty', () => {
    const store = useDirtyStore.getState();
    store.markDirty([{ op: 'UPDATE_CONTENT' as never, nodeId: 'a', path: ['text'], previous: 'old', next: 'new' }]);

    const state = useDirtyStore.getState();
    expect(state.isDirty).toBe(true);
    expect(state.pendingCount).toBe(1);
    expect(state.unsavedChangeCount).toBe(1);
    expect(state.lastModifiedAt).toBeTypeOf('number');
  });

  it('should transition through save lifecycle', () => {
    const store = useDirtyStore.getState();
    store.markDirty([{ op: 'UPDATE_STYLE' as never, nodeId: 'a', path: ['color'], previous: 'red', next: 'blue' }]);

    expect(useDirtyStore.getState().saveStatus).toBe('idle');

    store.markSaving();
    expect(useDirtyStore.getState().saveStatus).toBe('saving');

    store.markSaved();
    expect(useDirtyStore.getState().saveStatus).toBe('saved');
    expect(useDirtyStore.getState().isDirty).toBe(false);
    expect(useDirtyStore.getState().pendingCount).toBe(0);
    expect(useDirtyStore.getState().lastSavedAt).toBeTypeOf('number');
  });

  it('should track errors', () => {
    const store = useDirtyStore.getState();
    store.markDirty([{ op: 'CREATE_NODE' as never, node: block('a'), parentId: null, index: 0 }]);
    store.markError('Network error');
    expect(useDirtyStore.getState().saveStatus).toBe('error');
    expect(useDirtyStore.getState().lastError).toBe('Network error');
    expect(useDirtyStore.getState().failedPatches.length).toBeGreaterThan(0);
  });

  it('should support retry state', () => {
    useDirtyStore.getState().markRetrying();
    expect(useDirtyStore.getState().saveStatus).toBe('retrying');
  });

  it('should clear dirty without saving', () => {
    useDirtyStore.getState().markDirty([{ op: 'CREATE_NODE' as never, node: block('a'), parentId: null, index: 0 }]);
    expect(useDirtyStore.getState().isDirty).toBe(true);

    useDirtyStore.getState().clearDirty();
    expect(useDirtyStore.getState().isDirty).toBe(false);
    expect(useDirtyStore.getState().pendingCount).toBe(0);
  });

  it('should accumulate patches across multiple markDirty calls', () => {
    const store = useDirtyStore.getState();
    store.markDirty([{ op: 'UPDATE_CONTENT' as never, nodeId: 'a', path: ['text'], previous: 'o', next: 'n' }]);
    store.markDirty([{ op: 'UPDATE_STYLE' as never, nodeId: 'a', path: ['color'], previous: 'r', next: 'b' }]);

    expect(useDirtyStore.getState().pendingCount).toBe(2);
    expect(useDirtyStore.getState().unsavedChangeCount).toBe(2);
  });
});

// ── Save Queue ───────────────────────────────────────────────

describe('SaveQueue', () => {
  beforeEach(() => {
    useDirtyStore.getState().reset();
  });

  it('should debounce and call persist function', async () => {
    const persistFn = vi.fn().mockResolvedValue(true);
    const queue = new SaveQueue({ debounceMs: 50, maxRetries: 0 });

    queue.setPersistFn(persistFn);
    queue.push([{ op: 'UPDATE_CONTENT' as never, nodeId: 'a', path: ['text'], previous: 'o', next: 'n' }]);

    expect(persistFn).not.toHaveBeenCalled();

    await new Promise((r) => setTimeout(r, 100));

    expect(persistFn).toHaveBeenCalledTimes(1);

    queue.destroy();
  });

  it('should merge identical path patches after flush', async () => {
    const persistFn = vi.fn().mockImplementation(async (patches: unknown[]) => {
      expect(patches).toHaveLength(1);
      expect((patches[0] as Record<string, unknown>).next).toBe('n2');
      return true;
    });

    const queue = new SaveQueue({ debounceMs: 10, maxRetries: 0 });
    queue.setPersistFn(persistFn);

    queue.push([{ op: 'UPDATE_CONTENT' as never, nodeId: 'a', path: ['text'], previous: 'o', next: 'n1' }]);
    queue.push([{ op: 'UPDATE_CONTENT' as never, nodeId: 'a', path: ['text'], previous: 'o', next: 'n2' }]);

    await new Promise((r) => setTimeout(r, 50));

    expect(persistFn).toHaveBeenCalled();

    queue.destroy();
  });

  it('should flush pending patches immediately', async () => {
    const persistFn = vi.fn().mockResolvedValue(true);
    const queue = new SaveQueue({ debounceMs: 50000, maxRetries: 0 });

    queue.setPersistFn(persistFn);
    queue.push([{ op: 'UPDATE_STYLE' as never, nodeId: 'a', path: ['color'], previous: 'r', next: 'b' }]);

    await queue.flush();

    expect(persistFn).toHaveBeenCalledTimes(1);

    queue.destroy();
  });

  it('should not process while already flushing', async () => {
    const persistFn = vi.fn().mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 50));
      return true;
    });

    const queue = new SaveQueue({ debounceMs: 50000, maxRetries: 0 });
    queue.setPersistFn(persistFn);

    queue.push([{ op: 'CREATE_NODE' as never, node: block('a'), parentId: null, index: 0 }]);

    const r1 = queue.flush();
    const r2 = queue.flush();

    expect(await r1).toBe(true);
    expect(await r2).toBe(false);
    expect(persistFn).toHaveBeenCalledTimes(1);

    queue.destroy();
  });

  it('should retry on failure', async () => {
    let attempts = 0;
    const persistFn = vi.fn().mockImplementation(async () => {
      attempts++;
      return attempts >= 2;
    });

    const queue = new SaveQueue({ debounceMs: 10, maxRetries: 3 });
    queue.setPersistFn(persistFn);

    queue.push([{ op: 'UPDATE_CONTENT' as never, nodeId: 'a', path: ['text'], previous: 'o', next: 'n' }]);
    await queue.flush();

    expect(attempts).toBeGreaterThanOrEqual(2);

    queue.destroy();
  });
});

// ── Autosave Engine ──────────────────────────────────────────

describe('AutosaveEngine', () => {
  afterEach(() => {
    resetAutosaveEngine();
  });

  it('should detect changes after seed', () => {
    const engine = new AutosaveEngine();
    engine.seed([block('a')]);
    expect(engine.isDirty).toBe(false);

    engine.detect([block('b')]);
    expect(engine.isDirty).toBe(true);
  });

  it('should auto-seed on first detect', () => {
    const engine = new AutosaveEngine();
    engine.detect([block('a')]);
    engine.detect([block('b')]);
    expect(engine.isDirty).toBe(true);
  });

  it('should markDirty with explicit diff', () => {
    const engine = new AutosaveEngine();
    engine.markDirty([block('b')], [block('a')]);
    expect(engine.isDirty).toBe(true);
  });

  it('should flush and mark clean on success', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const engine = new AutosaveEngine({ onSave, debounceMs: 50000 });
    engine.seed([block('a')]);
    engine.detect([block('b')]);

    expect(useDirtyStore.getState().isDirty).toBe(true);

    await engine.flushNow();

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(useDirtyStore.getState().saveStatus).toBe('saved');
  });

  it('should support reset and re-seed', () => {
    const engine = new AutosaveEngine();
    engine.seed([block('a')]);
    engine.detect([block('b')]);
    expect(engine.isDirty).toBe(true);

    engine.reset();
    expect(useDirtyStore.getState().isDirty).toBe(false);

    engine.seed([block('a')]);
    expect(engine.isDirty).toBe(false);
  });

  it('should fire save:started and save:completed events', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const engine = new AutosaveEngine({ onSave, debounceMs: 50000 });
    engine.seed([block('a')]);

    const events: string[] = [];
    const unsubStart = eventBus.on('save:started', () => { events.push('started'); });
    const unsubComplete = eventBus.on('save:completed', () => { events.push('completed'); });

    engine.detect([block('b')]);
    await engine.flushNow();

    expect(events).toContain('started');
    expect(events).toContain('completed');

    unsubStart();
    unsubComplete();
  });

  it('should not accept new detects after destroy', () => {
    const engine = new AutosaveEngine();
    engine.seed([block('a')]);
    engine.destroy();

    engine.detect([block('b')]);
    expect(engine.isDirty).toBe(false);
  });
});
