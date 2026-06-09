import type { Block } from '@/types/builder';
import type { ComputedNode, Breakpoint, LayoutEngineConfig } from '@/engine/layout/types';

/** Why a block was marked dirty */
export type DirtyReason =
  | 'style'
  | 'content'
  | 'added'
  | 'removed'
  | 'moved'
  | 'children'
  | 'breakpoint'
  | 'full';

/** Configuration for incremental layout engine */
export interface IncrementalLayoutConfig {
  /** Whether to use incremental (partial) recompute */
  enabled: boolean;
  /** Max subtree size for forced full recompute (safety limit) */
  maxDirtySubtree: number;
  /** Whether to emit debug events */
  debug: boolean;
}

export const DEFAULT_INCREMENTAL_CONFIG: IncrementalLayoutConfig = {
  enabled: true,
  maxDirtySubtree: 200,
  debug: false,
};

/** Result of an incremental layout computation */
export interface IncrementalLayoutResult {
  /** The full computed node tree */
  computedNodes: ComputedNode[];
  /** IDs of nodes that were actually recomputed */
  recomputedIds: string[];
  /** Whether this was a full recompute (not incremental) */
  wasFullRecompute: boolean;
  /** Elapsed time in ms */
  elapsedMs: number;
}

/** Entry in the layout cache */
export interface LayoutCacheEntry {
  /** Block → ComputedNode map */
  nodeById: Map<string, ComputedNode>;
  /** Block lookup by ID */
  blockById: Map<string, Block>;
  /** Root-level ComputedNode IDs (order preserved) */
  rootNodeIds: string[];
  /** Which breakpoint was used to compute this cache */
  breakpoint: Breakpoint;
  /** Layout engine config hash (for cache invalidation) */
  configHash: string;
}

/** A block with its tree-position metadata */
export interface BlockTreeNode {
  block: Block;
  /** IDs from root → this node */
  path: string[];
  /** Depth in tree (root = 0) */
  depth: number;
  /** Index among siblings */
  siblingIndex: number;
}
