import { produceWithPatches, applyPatches, enablePatches } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import type { Block } from '@/types/builder';
import type { PatchEntry, PatchHistoryConfig, PatchUndoRedoResult, PatchHistorySummary } from './types';
import { DEFAULT_PATCH_CONFIG } from './types';

// Immer's patches plugin must be enabled once at module import time.
// This is safe to call multiple times (immer ignores subsequent calls).
enablePatches();

type BlocksRecipe = (draft: Block[]) => void;

/**
 * PatchStore — memory-efficient undo/redo using Immer patches.
 *
 * Instead of storing full Block[] snapshots for every history step,
 * PatchStore records only the { patches, inversePatches } produced by
 * Immer's `produceWithPatches`. Typical patches are 10–100× smaller
 * than full snapshots.
 *
 * Usage:
 *   const store = new PatchStore();
 *   store.reset(initialBlocks);
 *   const nextBlocks = store.record(blocks, (draft) => { draft.push(newBlock); });
 *   const { blocks } = store.undo(currentBlocks);
 *   const { blocks } = store.redo(currentBlocks);
 */
export class PatchStore {
  private entries: PatchEntry[] = [];
  private currentIndex = -1;
  private config: PatchHistoryConfig;
  private _lastKnownState: Block[] = [];

  constructor(config?: Partial<PatchHistoryConfig>) {
    this.config = { ...DEFAULT_PATCH_CONFIG, ...config };
  }

  get length(): number {
    return this.entries.length;
  }

  get index(): number {
    return this.currentIndex;
  }

  get canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  get canRedo(): boolean {
    return this.currentIndex < this.entries.length - 1;
  }

  /**
   * Record a block mutation. Returns the new blocks array.
   *
   * @param blocks Current blocks before mutation
   * @param recipe Immer recipe that mutates a draft copy of blocks
   */
  record(blocks: Block[], recipe: BlocksRecipe): Block[] {
    const [nextBlocks, patches, inversePatches] = produceWithPatches(blocks, recipe);

    // Discard any future entries (redo stack cleared on new mutation)
    this.entries = this.entries.slice(0, this.currentIndex + 1);

    this.entries.push({
      id: uuidv4(),
      patches,
      inversePatches,
      timestamp: Date.now(),
      label: '',
    });

    this.currentIndex = this.entries.length - 1;
    this._lastKnownState = nextBlocks;

    if (this.config.debug) {
      this.logEntry('record', patches, inversePatches);
    }

    // Enforce max entries (discard oldest)
    if (this.entries.length > this.config.maxEntries) {
      const excess = this.entries.length - this.config.maxEntries;
      this.entries.splice(0, excess);
      this.currentIndex -= excess;
    }

    return nextBlocks;
  }

  /**
   * Undo the last mutation by applying inverse patches.
   */
  undo(currentBlocks: Block[]): PatchUndoRedoResult | null {
    if (!this.canUndo) return null;

    const entry = this.entries[this.currentIndex];
    this.currentIndex--;

    const blocks = applyPatches(currentBlocks, entry.inversePatches);
    this._lastKnownState = blocks;

    if (this.config.debug) {
      this.logEntry('undo', entry.inversePatches, entry.patches);
    }

    return { blocks, entry };
  }

  /**
   * Redo a previously undone mutation by applying forward patches.
   */
  redo(currentBlocks: Block[]): PatchUndoRedoResult | null {
    if (!this.canRedo) return null;

    this.currentIndex++;
    const entry = this.entries[this.currentIndex];

    const blocks = applyPatches(currentBlocks, entry.patches);
    this._lastKnownState = blocks;

    if (this.config.debug) {
      this.logEntry('redo', entry.patches, entry.inversePatches);
    }

    return { blocks, entry };
  }

  /**
   * Reset the history stack with a new initial state.
   */
  reset(blocks: Block[]): void {
    this.entries = [];
    this.currentIndex = -1;
    this._lastKnownState = blocks;
  }

  /** Get the entry at a specific index (for jumping to a specific point) */
  getEntry(index: number): PatchEntry | undefined {
    return this.entries[index];
  }

  /** Get all entries (read-only) */
  getEntries(): readonly PatchEntry[] {
    return this.entries;
  }

  /** Get a summary of the current history state */
  getSummary(): PatchHistorySummary {
    const estBytes = this.entries.reduce((sum, e) => {
      const patchSize = JSON.stringify(e.patches).length + JSON.stringify(e.inversePatches).length;
      return sum + patchSize;
    }, 0);

    return {
      entries: this.entries.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo,
      canRedo: this.canRedo,
      estimatedMemoryBytes: estBytes,
    };
  }

  private logEntry(action: string, _patches: PatchEntry['patches'], _inverse: PatchEntry['inversePatches']): void {
    if (typeof console !== 'undefined') {
      console.log(`[PatchStore] ${action}: ${_patches.length} forward, ${_inverse.length} inverse patches`);
    }
  }
}
