import type { ComputedNode } from '@/engine/layout/types';

/** 2D rectangle representing viewport or node bounds */
export interface ViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** How much a node overlaps the viewport */
export type VisibleState = 'visible' | 'partial' | 'hidden';

/** Current viewport/camera state */
export interface ViewportState {
  scrollX: number;
  scrollY: number;
  zoom: number;
  width: number;
  height: number;
}

/** A flattened renderable item derived from ComputedNode */
export interface RenderItem {
  id: string;
  type: string;
  depth: number;
  bounds: ViewportRect;
  zIndex: number;
  overflow: string;
  node: ComputedNode;
}

/** Configuration for the virtualization engine */
export interface VirtualizationConfig {
  /** Extra pixels rendered outside the visible area */
  overscan: number;
  /** Whether to enable spatial indexing (recommended) */
  useSpatialIndex: boolean;
  /** Maximum depth for tree flattening */
  maxDepth: number;
  /** Grid cell size for spatial hash (px) */
  gridCellSize: number;
}

export const DEFAULT_VIRTUALIZATION_CONFIG: VirtualizationConfig = {
  overscan: 300,
  useSpatialIndex: true,
  maxDepth: 50,
  gridCellSize: 100,
};

/** Result of a visibility query */
export interface VisibilityResult {
  visible: RenderItem[];
  /** Indices of items that became newly visible since last query */
  newVisibleIds: Set<string>;
  totalCount: number;
  visibleCount: number;
  partialCount: number;
}

/** Interface for spatial index implementations */
export interface SpatialIndex {
  insert(id: string, bounds: ViewportRect): void;
  remove(id: string): void;
  update(id: string, bounds: ViewportRect): void;
  query(rect: ViewportRect): string[];
  clear(): void;
  get size(): number;
}
