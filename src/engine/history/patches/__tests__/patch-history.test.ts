import { describe, it, expect, beforeEach } from 'vitest';
import type { Block } from '@/types/builder';
import type { Patch } from '@/engine/diff/types';
import { PatchOp } from '@/engine/diff/types';
import { PatchHistory } from '../patch-history';

function block(id: string, type: string = 'section', overrides: Partial<Block> = {}): Block {
  return { id, type, content: {}, style: {}, children: [], ...overrides };
}

function textBlock(id: string, text: string): Block {
  return block(id, 'text', { content: { text } });
}

describe('PatchHistory', () => {
  let history: PatchHistory;

  beforeEach(() => {
    history = new PatchHistory({ maxEntries: 10 });
  });

  describe('initial state', () => {
    it('should start empty', () => {
      expect(history.undoCount).toBe(0);
      expect(history.redoCount).toBe(0);
      expect(history.canUndo).toBe(false);
      expect(history.canRedo).toBe(false);
    });
  });

  describe('record', () => {
    it('should record forward patches', () => {
      const before = [block('a')];
      const patches: Patch[] = [
        { op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: undefined, next: 'hello' },
      ];

      const entry = history.record(patches, before, 'edit text');
      expect(entry.forward).toHaveLength(1);
      expect(entry.inverse).toHaveLength(1);
      expect(entry.label).toBe('edit text');
      expect(history.undoCount).toBe(1);
      expect(history.canUndo).toBe(true);
    });

    it('should clear redo stack on new record', () => {
      const before = [block('a')];
      history.record([{ op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: undefined, next: 'v1' }], before);
      history.undo([block('a', 'text', { content: { text: 'v1' } })]);
      expect(history.redoCount).toBe(1);

      history.record([{ op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: undefined, next: 'v2' }], before);
      expect(history.redoCount).toBe(0);
    });

    it('should enforce max entries by dropping oldest', () => {
      const small = new PatchHistory({ maxEntries: 3 });
      const before = [block('a')];

      for (let i = 0; i < 5; i++) {
        small.record(
          [{ op: PatchOp.UPDATE_CONTENT as never, nodeId: 'a', path: ['text'], previous: '', next: `v${i}` }],
          before,
        );
      }

      expect(small.undoCount).toBe(3);
      small.undo([block('a')]);
      expect(small.undoCount).toBe(2);
    });
  });

  describe('inverse generation', () => {
    it('should invert UPDATE_CONTENT', () => {
      const before = [textBlock('a', 'old')];
      const patches: Patch[] = [
        { op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: 'old', next: 'new' },
      ];

      const entry = history.record(patches, before);
      expect(entry.inverse[0].op).toBe(PatchOp.UPDATE_CONTENT);
      expect((entry.inverse[0] as typeof patches[0]).previous).toBe('new');
      expect((entry.inverse[0] as typeof patches[0]).next).toBe('old');
    });

    it('should invert UPDATE_STYLE', () => {
      const before = [block('a', 'section', { style: { color: 'red' } })];
      const patches: Patch[] = [
        { op: PatchOp.UPDATE_STYLE, nodeId: 'a', path: ['color'], previous: 'red', next: 'blue' },
      ];

      const entry = history.record(patches, before);
      expect(entry.inverse[0].op).toBe(PatchOp.UPDATE_STYLE);
      expect((entry.inverse[0] as typeof patches[0]).previous).toBe('blue');
    });

    it('should invert CREATE_NODE into DELETE_NODE', () => {
      const before = [block('a')];
      const patches: Patch[] = [
        { op: PatchOp.CREATE_NODE, node: block('b', 'text'), parentId: null, index: 1 },
      ];

      const entry = history.record(patches, before);
      expect(entry.inverse[0].op).toBe(PatchOp.DELETE_NODE);
      expect((entry.inverse[0] as typeof patches[0]).nodeId).toBe('b');
    });

    it('should invert DELETE_NODE into CREATE_NODE', () => {
      const before = [block('a'), block('b', 'text', { content: { text: 'hello' } })];
      const patches: Patch[] = [
        { op: PatchOp.DELETE_NODE, nodeId: 'b', parentId: null },
      ];

      const entry = history.record(patches, before);
      expect(entry.inverse[0].op).toBe(PatchOp.CREATE_NODE);
      const inverse = entry.inverse[0] as Patch & { node: Block };
      expect(inverse.node).toBeDefined();
      expect(inverse.node.id).toBe('b');
      expect(inverse.node.content?.text).toBe('hello');
    });

    it('should invert MOVE_NODE', () => {
      const before = [block('parent1'), block('parent2')];
      const patches: Patch[] = [
        { op: PatchOp.MOVE_NODE, nodeId: 'child', fromParentId: 'parent1', toParentId: 'parent2', fromIndex: 0, toIndex: 1 },
      ];

      const entry = history.record(patches, before);
      expect(entry.inverse[0].op).toBe(PatchOp.MOVE_NODE);
      const inverse = entry.inverse[0] as typeof patches[0];
      expect(inverse.fromParentId).toBe('parent2');
      expect(inverse.toParentId).toBe('parent1');
      expect(inverse.fromIndex).toBe(1);
      expect(inverse.toIndex).toBe(0);
    });

    it('should invert UPDATE_ENABLED', () => {
      const before = [block('a', 'section', { enabled: true })];
      const patches: Patch[] = [
        { op: PatchOp.UPDATE_ENABLED, nodeId: 'a', previous: true, next: false },
      ];

      const entry = history.record(patches, before);
      expect(entry.inverse[0].op).toBe(PatchOp.UPDATE_ENABLED);
      expect((entry.inverse[0] as typeof patches[0]).previous).toBe(false);
      expect((entry.inverse[0] as typeof patches[0]).next).toBe(true);
    });
  });

  describe('undo/redo', () => {
    it('should undo an UPDATE_CONTENT patch', () => {
      const before = [textBlock('a', 'old')];
      const after = [textBlock('a', 'new')];

      history.record(
        [{ op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: 'old', next: 'new' }],
        before,
      );

      const result = history.undo(after);
      expect(result).not.toBeNull();
      expect(result!.blocks[0].content.text).toBe('old');
      expect(history.undoCount).toBe(0);
      expect(history.redoCount).toBe(1);
    });

    it('should redo after undo', () => {
      const before = [textBlock('a', 'old')];
      const after = [textBlock('a', 'new')];

      history.record(
        [{ op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: 'old', next: 'new' }],
        before,
      );

      history.undo(after);
      const result = history.redo([textBlock('a', 'old')]);
      expect(result).not.toBeNull();
      expect(result!.blocks[0].content.text).toBe('new');
      expect(history.undoCount).toBe(1);
      expect(history.redoCount).toBe(0);
    });

    it('should return null on undo when empty', () => {
      const result = history.undo([block('a')]);
      expect(result).toBeNull();
    });

    it('should return null on redo when empty', () => {
      const result = history.redo([block('a')]);
      expect(result).toBeNull();
    });

    it('should support multiple undo steps', () => {
      const base = [block('a')];

      history.record(
        [{ op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: undefined, next: 'v1' }],
        base, 'step1',
      );
      history.record(
        [{ op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: 'v1', next: 'v2' }],
        base, 'step2',
      );

      const afterV2 = [block('a', 'text', { content: { text: 'v2' } })];
      const step1 = history.undo(afterV2);
      expect(step1!.entry.label).toBe('step2');

      const afterV1 = [block('a', 'text', { content: { text: 'v1' } })];
      const step2 = history.undo(afterV1);
      expect(step2!.entry.label).toBe('step1');
    });
  });

  describe('getSummary', () => {
    it('should return correct summary', () => {
      expect(history.getSummary().undoCount).toBe(0);

      history.record(
        [{ op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: undefined, next: 'hi' }],
        [block('a')],
      );

      const summary = history.getSummary();
      expect(summary.undoCount).toBe(1);
      expect(summary.redoCount).toBe(0);
      expect(summary.totalEntries).toBe(1);
    });
  });

  describe('peek', () => {
    it('should return the latest undo entry without popping', () => {
      history.record(
        [{ op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: undefined, next: 'hi' }],
        [block('a')],
      );

      const peeked = history.peekUndo();
      expect(peeked).not.toBeNull();
      expect(history.undoCount).toBe(1);
    });

    it('should return null when nothing to redo', () => {
      expect(history.peekRedo()).toBeNull();
    });
  });

  describe('reset', () => {
    it('should clear all stacks', () => {
      history.record(
        [{ op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: undefined, next: 'hi' }],
        [block('a')],
      );
      expect(history.undoCount).toBe(1);

      history.reset();
      expect(history.undoCount).toBe(0);
      expect(history.redoCount).toBe(0);
      expect(history.canUndo).toBe(false);
      expect(history.canRedo).toBe(false);
    });
  });
});
