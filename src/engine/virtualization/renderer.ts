import type { ComputedNode } from '@/engine/layout/types';
import type { ViewportRect, ViewportState, RenderItem, VirtualizationConfig, VisibilityResult, SpatialIndex } from './types';
import { computeVisibleNodes, computeVisibleState } from './visibility';
import { QuadTreeSpatialIndex } from './indexing';
import { MemoCache, createViewportKey } from './cache';
import { DEFAULT_VIRTUALIZATION_CONFIG } from './types';

/**
 * Flatten a ComputedNode tree into a depth-tracked linear list.
 * Uses depth-first traversal; parent before children.
 */
export function flattenComputedTree(
  nodes: ComputedNode[],
  depth: number = 0,
  result: RenderItem[] = [],
): RenderItem[] {
  for (const node of nodes) {
    result.push({
      id: node.id,
      type: node.type,
      depth,
      bounds: { x: node.x, y: node.y, width: node.width, height: node.height },
      zIndex: node.zIndex || 0,
      overflow: node.overflow || 'visible',
      node,
    });
    if (node.children && node.children.length > 0) {
      flattenComputedTree(node.children, depth + 1, result);
    }
  }
  return result;
}

/** Sort render items by z-index then depth (back-to-front, parent-first) */
export function sortRenderItems(items: RenderItem[]): RenderItem[] {
  return [...items].sort((a, b) => {
    if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
    return a.depth - b.depth;
  });
}

/** Build a spatial index from render items for fast viewport queries */
export function buildSpatialIndex(
  items: RenderItem[],
  config: VirtualizationConfig = DEFAULT_VIRTUALIZATION_CONFIG,
): SpatialIndex {
  const index = new QuadTreeSpatialIndex();
  for (const item of items) {
    index.insert(item.id, item.bounds);
  }
  return index;
}

/** Compute the total canvas bounds from a flattened render tree */
export function computeCanvasBounds(items: RenderItem[]): ViewportRect {
  if (!items.length) return { x: 0, y: 0, width: 0, height: 0 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const item of items) {
    if (item.bounds.x < minX) minX = item.bounds.x;
    if (item.bounds.y < minY) minY = item.bounds.y;
    if (item.bounds.x + item.bounds.width > maxX) maxX = item.bounds.x + item.bounds.width;
    if (item.bounds.y + item.bounds.height > maxY) maxY = item.bounds.y + item.bounds.height;
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Build a lookup map from id → RenderItem */
export function buildItemMap(items: RenderItem[]): Map<string, RenderItem> {
  const map = new Map<string, RenderItem>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return map;
}

export interface VirtualizationResult {
  /** All render items (flattened, sorted) */
  allItems: RenderItem[];
  /** Items visible in current viewport + overscan */
  visibleItems: RenderItem[];
  /** Visibility metadata */
  visibility: Omit<VisibilityResult, 'visible'>;
  /** Total canvas bounds */
  canvasBounds: ViewportRect;
  /** Item id → RenderItem lookup */
  itemMap: Map<string, RenderItem>;
  /** Spatial index for ad-hoc queries */
  spatialIndex: SpatialIndex;
}

/** Main virtualization pipeline */
export function computeVirtualization(
  computedNodes: ComputedNode[],
  viewport: ViewportState,
  config: VirtualizationConfig = DEFAULT_VIRTUALIZATION_CONFIG,
): VirtualizationResult {
  const allItems = flattenComputedTree(computedNodes);
  const sortedItems = sortRenderItems(allItems);

  const viewportRect: ViewportRect = {
    x: viewport.scrollX / viewport.zoom,
    y: viewport.scrollY / viewport.zoom,
    width: viewport.width / viewport.zoom,
    height: viewport.height / viewport.zoom,
  };

  const visibleItems = computeVisibleNodes(sortedItems, viewportRect, config.overscan);
  const canvasBounds = computeCanvasBounds(sortedItems);
  const spatialIndex = buildSpatialIndex(sortedItems, config);
  const itemMap = buildItemMap(sortedItems);

  let visibleCount = 0;
  let partialCount = 0;

  for (const item of visibleItems) {
    const state = computeVisibleState(item.bounds, viewportRect);
    if (state === 'visible') visibleCount++;
    else if (state === 'partial') partialCount++;
  }

  return {
    allItems: sortedItems,
    visibleItems,
    visibility: {
      newVisibleIds: new Set(visibleItems.map((i) => i.id)),
      totalCount: sortedItems.length,
      visibleCount,
      partialCount,
    },
    canvasBounds,
    itemMap,
    spatialIndex,
  };
}

/** Memoized version of the virtualization pipeline */
export function createMemoizedVirtualization(
  config: VirtualizationConfig = DEFAULT_VIRTUALIZATION_CONFIG,
): {
  compute: (computedNodes: ComputedNode[], viewport: ViewportState) => VirtualizationResult;
  clearCache: () => void;
} {
  const flatCache = new MemoCache<string, RenderItem[]>();
  const resultCache = new MemoCache<string, VirtualizationResult>();

  function compute(
    computedNodes: ComputedNode[],
    viewport: ViewportState,
  ): VirtualizationResult {
    const viewportKey = createViewportKey(viewport);
    const treeHash = `${computedNodes.length}:${computedNodes[0]?.id ?? 'empty'}`;

    const allItems = flatCache.get(treeHash) ?? (() => {
      const items = flattenComputedTree(computedNodes);
      flatCache.set(treeHash, items);
      return items;
    })();

    const cacheKey = `${treeHash}|${viewportKey}`;
    const cached = resultCache.get(cacheKey);
    if (cached) return cached;

    const result = computeVirtualization(computedNodes, viewport, config);
    resultCache.set(cacheKey, result);
    return result;
  }

  function clearCache(): void {
    flatCache.clear();
    resultCache.clear();
  }

  return { compute, clearCache };
}
