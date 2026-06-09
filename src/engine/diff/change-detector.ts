import type { Block } from '@/types/builder';
import type { ChangeSet, Patch } from './types';
import { diffTrees } from './tree-diff';
import { hashTree, compareHashes } from './structural-hash';
import type { StructuralHash } from './types';

export type DirtyListener = (changeSet: ChangeSet) => void;

export class ChangeDetector {
  private previousHashes: StructuralHash[] | null = null;
  private previousBlocks: Block[] = [];
  private listeners: Set<DirtyListener> = new Set();
  private _isDirty = false;

  get isDirty(): boolean {
    return this._isDirty;
  }

  seed(blocks: Block[]): void {
    this.previousBlocks = JSON.parse(JSON.stringify(blocks));
    this.previousHashes = hashTree(blocks);
    this._isDirty = false;
  }

  detect(blocks: Block[]): ChangeSet | null {
    if (this.previousBlocks.length === 0) {
      this.seed(blocks);
      return null;
    }

    const currentHashes = hashTree(blocks);

    if (this.previousHashes) {
      const comparison = compareHashes(this.previousHashes, currentHashes);
      if (
        comparison.changed.length === 0 &&
        comparison.added.length === 0 &&
        comparison.removed.length === 0
      ) {
        return null;
      }
    }

    const patches = diffTrees(this.previousBlocks, blocks);

    if (patches.length === 0) return null;

    const changeSet: ChangeSet = {
      patches,
      timestamp: Date.now(),
      source: 'change-detector',
    };

    this._isDirty = true;
    this.previousBlocks = JSON.parse(JSON.stringify(blocks));
    this.previousHashes = currentHashes;

    this.emit(changeSet);
    return changeSet;
  }

  markClean(): void {
    this._isDirty = false;
  }

  onChange(listener: DirtyListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(changeSet: ChangeSet): void {
    for (const listener of this.listeners) {
      try {
        listener(changeSet);
      } catch (err) {
        console.error('[ChangeDetector] Listener error:', err);
      }
    }
  }

  destroy(): void {
    this.listeners.clear();
    this.previousHashes = null;
    this.previousBlocks = [];
    this._isDirty = false;
  }
}
