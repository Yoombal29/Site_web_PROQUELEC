import type { Block } from '@/types/builder';
import type { ComputedNode, Breakpoint, LayoutEngineConfig } from '@/engine/layout/types';
import type { LayoutCacheEntry } from './types';

/**
 * LayoutCache — stores computed ComputedNode trees indexed by block ID.
 *
 * Enables incremental layout by only recomputing dirty subtrees
 * while returning cached results for unaffected branches.
 */
export class LayoutCache {
  private nodeById = new Map<string, ComputedNode>();
  private blockById = new Map<string, Block>();
  private rootNodeIds: string[] = [];
  private _breakpoint: Breakpoint = 'desktop';
  private _configHash: string = '';

  /** Build or rebuild the entire cache from a block tree */
  build(blocks: Block[], config: LayoutEngineConfig): void {
    this.nodeById.clear();
    this.blockById.clear();
    this.rootNodeIds = [];
    this._breakpoint = config.breakpoint;
    this._configHash = hashConfig(config);

    this.indexBlocks(blocks);
  }

  /** Index a block tree recursively, storing block references */
  private indexBlocks(blocks: Block[], parent?: Block): void {
    for (const block of blocks) {
      this.blockById.set(block.id, block);
      if (!parent) {
        this.rootNodeIds.push(block.id);
      }
      if (block.children) {
        this.indexBlocks(block.children, block);
      }
    }
  }

  /** Store a computed result for a block */
  set(id: string, node: ComputedNode): void {
    this.nodeById.set(id, node);
  }

  /** Get a cached ComputedNode by block ID */
  get(id: string): ComputedNode | undefined {
    return this.nodeById.get(id);
  }

  /** Get the original Block by ID */
  getBlock(id: string): Block | undefined {
    return this.blockById.get(id);
  }

  /** Remove a node from cache (e.g., block was deleted) */
  remove(id: string): void {
    this.nodeById.delete(id);
    this.blockById.delete(id);
  }

  /** Update block reference (e.g., block content/style changed) */
  updateBlock(block: Block): void {
    this.blockById.set(block.id, block);
  }

  /** Remove a block and its descendants from the cache */
  removeSubtree(id: string): void {
    const block = this.blockById.get(id);
    if (block?.children) {
      for (const child of block.children) {
        this.removeSubtree(child.id);
      }
    }
    this.nodeById.delete(id);
    this.blockById.delete(id);
  }

  /** Check if a block has a cached ComputedNode */
  has(id: string): boolean {
    return this.nodeById.has(id);
  }

  /** Check if the cache has no block index (needs build or clear) */
  get isEmpty(): boolean {
    return this.blockById.size === 0;
  }

  /** How many nodes are cached */
  get size(): number {
    return this.nodeById.size;
  }

  /** Get root node IDs (in order) */
  getRootNodeIds(): readonly string[] {
    return this.rootNodeIds;
  }

  /** Get the current breakpoint */
  get breakpoint(): Breakpoint {
    return this._breakpoint;
  }

  /** Invalidate all entries */
  clear(): void {
    this.nodeById.clear();
    this.blockById.clear();
    this.rootNodeIds = [];
  }

  /** Check if config is compatible (same breakpoint, same container dimensions) */
  isCompatible(config: LayoutEngineConfig): boolean {
    return this._configHash === hashConfig(config);
  }

  /** Serialize the cached result into a ComputedNode tree */
  toComputedNodes(): ComputedNode[] {
    return this.rootNodeIds
      .map((id) => this.nodeById.get(id))
      .filter((n): n is ComputedNode => n !== undefined);
  }
}

/** Stable hash of layout config for cache key */
function hashConfig(config: LayoutEngineConfig): string {
  return `${config.containerWidth}:${config.containerHeight}:${config.breakpoint}`;
}
