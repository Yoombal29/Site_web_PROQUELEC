import type { DirtyReason } from './types';

/**
 * DirtyTracker — tracks which blocks need layout recomputation.
 *
 * Dirty flags are set when a block's style/content/children change,
 * or when blocks are added/removed/moved.
 */
export class DirtyTracker {
  private dirty = new Set<string>();
  private reasons = new Map<string, DirtyReason>();

  /** Mark a single block as dirty */
  mark(id: string, reason: DirtyReason = 'style'): void {
    this.dirty.add(id);
    if (!this.reasons.has(id)) {
      this.reasons.set(id, reason);
    }
  }

  /** Mark a block and all its subtree IDs as dirty */
  markSubtree(rootId: string, reason: DirtyReason = 'style'): void {
    this.dirty.add(rootId);
    if (!this.reasons.has(rootId)) {
      this.reasons.set(rootId, reason);
    }
  }

  /** Mark multiple blocks at once */
  markMany(ids: string[], reason: DirtyReason = 'style'): void {
    for (const id of ids) {
      this.mark(id, reason);
    }
  }

  /** Check if a block is dirty */
  isDirty(id: string): boolean {
    return this.dirty.has(id);
  }

  /** Get all dirty block IDs */
  getDirtyIds(): string[] {
    return Array.from(this.dirty);
  }

  /** Get the reason a block was marked dirty */
  getReason(id: string): DirtyReason | undefined {
    return this.reasons.get(id);
  }

  /** How many blocks are currently dirty */
  get size(): number {
    return this.dirty.size;
  }

  /** Whether there are any dirty blocks */
  get hasDirty(): boolean {
    return this.dirty.size > 0;
  }

  /** Clear a specific block's dirty flag */
  clear(id: string): void {
    this.dirty.delete(id);
    this.reasons.delete(id);
  }

  /** Clear all dirty flags */
  flush(): void {
    this.dirty.clear();
    this.reasons.clear();
  }

  /**
   * Given the full block tree, collect all ancestor IDs of dirty blocks.
   * Ancestors need recomputation because their auto-layout sizes may change.
   */
  collectAncestors(blocks: Block[]): string[] {
    const ancestorIds = new Set<string>();
    const dirtyIds = this.getDirtyIds();

    for (const dirtyId of dirtyIds) {
      // Walk up from dirtyId to root
      const path = this.findPath(blocks, dirtyId);
      for (const id of path) {
        if (id !== dirtyId) {
          ancestorIds.add(id);
        }
      }
    }
    return Array.from(ancestorIds);
  }

  /**
   * Given the full block tree, collect dirty IDs PLUS their ancestors.
   * These are the complete set of nodes that need recomputation.
   */
  collectAffectedIds(blocks: Block[]): string[] {
    const affected = new Set(this.getDirtyIds());
    for (const dirtyId of this.getDirtyIds()) {
      const path = this.findPath(blocks, dirtyId);
      for (const id of path) {
        affected.add(id);
      }
    }
    return Array.from(affected);
  }

  /**
   * Find the path (root → target) through the block tree.
   * Returns [rootId, ...intermediateIds, targetId]
   */
  private findPath(blocks: Block[], targetId: string, path: string[] = []): string[] {
    for (const block of blocks) {
      if (block.id === targetId) {
        return [...path, block.id];
      }
      if (block.children && block.children.length > 0) {
        const found = this.findPath(block.children, targetId, [...path, block.id]);
        if (found.length > 0) return found;
      }
    }
    return [];
  }
}
