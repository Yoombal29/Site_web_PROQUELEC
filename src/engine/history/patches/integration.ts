import { PatchStore } from './store';
import type { PatchEntry, PatchHistoryConfig } from './types';
import { eventBus } from '@/engine/events/bus';
import type { Block } from '@/types/builder';

let _store: PatchStore | null = null;

/**
 * Initialize the global PatchStore singleton.
 * Call once during app bootstrap after blocks are loaded.
 */
export function initPatchHistory(blocks: Block[], config?: Partial<PatchHistoryConfig>): PatchStore {
  _store = new PatchStore(config);
  _store.reset(blocks);
  return _store;
}

/**
 * Get the global PatchStore instance.
 * Throws if not initialized.
 */
export function getPatchStore(): PatchStore {
  if (!_store) {
    throw new Error('PatchStore not initialized. Call initPatchHistory() first.');
  }
  return _store;
}

/**
 * Event payload for patch-based history events
 */
export interface PatchRecordedPayload {
  entry: PatchEntry;
  blocksCount: number;
  historySize: number;
  canUndo: boolean;
  canRedo: boolean;
}

export interface PatchUndonePayload {
  entry: PatchEntry;
  newIndex: number;
}

export interface PatchRedonePayload {
  entry: PatchEntry;
  newIndex: number;
}

/**
 * Emit history events for the patch-based system.
 * These complement the existing history:* events.
 */
export const PatchHistoryEvents = {
  recorded(entry: PatchEntry, blocks: Block[]): void {
    const store = getStoreSafe();
    eventBus.emit('history:snapshot:created' as any, {
      snapshot: {
        id: entry.id,
        label: entry.label || `Modification #${store.index + 1}`,
        timestamp: entry.timestamp,
        type: 'auto' as const,
      },
      blocksCount: blocks.length,
    });
  },

  undone(entry: PatchEntry): void {
    const store = getStoreSafe();
    eventBus.emit('history:undo' as any, {
      fromIndex: store.index + 1,
      toIndex: store.index,
    });
  },

  redone(entry: PatchEntry): void {
    const store = getStoreSafe();
    eventBus.emit('history:redo' as any, {
      fromIndex: store.index - 1,
      toIndex: store.index,
    });
  },
};

function getStoreSafe(): PatchStore {
  if (!_store) throw new Error('PatchStore not initialized');
  return _store;
}
