export type {
  ViewportRect,
  ViewportState,
  RenderItem,
  VirtualizationConfig,
  VisibilityResult,
  VisibleState,
  SpatialIndex,
} from './types';

export {
  DEFAULT_VIRTUALIZATION_CONFIG,
} from './types';

export {
  rectsOverlap,
  rectContains,
  overlapArea,
  visibleFraction,
  computeVisibleState,
  computeVisibleNodes,
  isNodeVisible,
} from './visibility';

export {
  flattenComputedTree,
  sortRenderItems,
  buildSpatialIndex,
  computeCanvasBounds,
  buildItemMap,
  computeVirtualization,
  createMemoizedVirtualization,
} from './renderer';

export type { VirtualizationResult } from './renderer';

export {
  QuadTreeSpatialIndex,
  GridSpatialIndex,
  createSpatialIndex,
} from './indexing';

export {
  MemoCache,
  createViewportKey,
} from './cache';

export type { VirtualizationCacheKey } from './cache';

export {
  getViewportRect,
  viewportStateEquals,
  fitToViewport,
  clampScroll,
} from './viewport';

export {
  useViewportState,
  useVirtualizedRender,
  useVisibleNodes,
  VirtualizedCanvas,
} from './react';

export type { VirtualizedCanvasProps } from './react';
