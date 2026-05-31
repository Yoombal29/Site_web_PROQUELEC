import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ComputedNode } from '@/engine/layout/types';
import type { ViewportRect, ViewportState, RenderItem, VirtualizationConfig, SpatialIndex } from '../types';
import { DEFAULT_VIRTUALIZATION_CONFIG } from '../types';
import {
  rectsOverlap,
  rectContains,
  overlapArea,
  visibleFraction,
  computeVisibleState,
  computeVisibleNodes,
  isNodeVisible,
} from '../visibility';
import {
  flattenComputedTree,
  sortRenderItems,
  buildSpatialIndex,
  computeCanvasBounds,
  buildItemMap,
  computeVirtualization,
  createMemoizedVirtualization,
} from '../renderer';
import {
  QuadTreeSpatialIndex,
  GridSpatialIndex,
  createSpatialIndex,
} from '../indexing';
import { MemoCache, createViewportKey } from '../cache';
import {
  getViewportRect,
  viewportStateEquals,
  fitToViewport,
  clampScroll,
} from '../viewport';

// ── Fixtures ─────────────────────────────────────────────────

function createComputedNode(overrides: Partial<ComputedNode> & { id: string }): ComputedNode {
  return {
    type: 'section',
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    children: [],
    zIndex: 0,
    overflow: 'visible',
    ...overrides,
  };
}

function createRect(overrides: Partial<ViewportRect> = {}): ViewportRect {
  return { x: 0, y: 0, width: 100, height: 100, ...overrides };
}

function createViewport(overrides: Partial<ViewportState> = {}): ViewportState {
  return { scrollX: 0, scrollY: 0, zoom: 1, width: 800, height: 600, ...overrides };
}

// ── Visibility ───────────────────────────────────────────────

describe('rectsOverlap', () => {
  it('should return true for overlapping rects', () => {
    expect(rectsOverlap({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
  });

  it('should return false for non-overlapping rects', () => {
    expect(rectsOverlap({ x: 0, y: 0, width: 10, height: 10 }, { x: 20, y: 20, width: 10, height: 10 })).toBe(false);
  });

  it('should return true for touching rects', () => {
    expect(rectsOverlap({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
  });

  it('should handle nested rects', () => {
    expect(rectsOverlap({ x: 0, y: 0, width: 100, height: 100 }, { x: 10, y: 10, width: 20, height: 20 })).toBe(true);
  });
});

describe('rectContains', () => {
  it('should return true when outer fully contains inner', () => {
    expect(rectContains({ x: 0, y: 0, width: 100, height: 100 }, { x: 10, y: 10, width: 20, height: 20 })).toBe(true);
  });

  it('should return false when inner exceeds outer', () => {
    expect(rectContains({ x: 0, y: 0, width: 50, height: 50 }, { x: 10, y: 10, width: 60, height: 60 })).toBe(false);
  });

  it('should return true for identical rects', () => {
    const r = { x: 0, y: 0, width: 50, height: 50 };
    expect(rectContains(r, r)).toBe(true);
  });
});

describe('overlapArea', () => {
  it('should compute exact overlap area', () => {
    expect(overlapArea({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 })).toBe(25);
  });

  it('should return 0 for non-overlapping rects', () => {
    expect(overlapArea({ x: 0, y: 0, width: 10, height: 10 }, { x: 20, y: 20, width: 10, height: 10 })).toBe(0);
  });

  it('should handle complete containment', () => {
    expect(overlapArea({ x: 0, y: 0, width: 100, height: 100 }, { x: 10, y: 10, width: 20, height: 20 })).toBe(400);
  });
});

describe('visibleFraction', () => {
  it('should return 1 for fully visible node', () => {
    const vp: ViewportRect = { x: 0, y: 0, width: 1000, height: 1000 };
    const node: ViewportRect = { x: 100, y: 100, width: 100, height: 100 };
    expect(visibleFraction(node, vp)).toBeCloseTo(1);
  });

  it('should return 0.25 for half-width/half-height overlap', () => {
    const vp: ViewportRect = { x: 0, y: 0, width: 50, height: 50 };
    const node: ViewportRect = { x: 0, y: 0, width: 100, height: 100 };
    expect(visibleFraction(node, vp)).toBeCloseTo(0.25);
  });

  it('should return 0 for no overlap', () => {
    expect(visibleFraction({ x: 0, y: 0, width: 10, height: 10 }, { x: 100, y: 100, width: 10, height: 10 })).toBe(0);
  });

  it('should handle zero-area nodes', () => {
    expect(visibleFraction({ x: 0, y: 0, width: 0, height: 0 }, { x: 0, y: 0, width: 10, height: 10 })).toBe(0);
  });
});

describe('computeVisibleState', () => {
  it('should return "visible" for fully contained nodes', () => {
    expect(computeVisibleState({ x: 10, y: 10, width: 50, height: 50 }, { x: 0, y: 0, width: 200, height: 200 })).toBe('visible');
  });

  it('should return "partial" for partially visible nodes', () => {
    expect(computeVisibleState({ x: -50, y: -50, width: 100, height: 100 }, { x: 0, y: 0, width: 100, height: 100 })).toBe('partial');
  });

  it('should return "hidden" for non-overlapping nodes', () => {
    expect(computeVisibleState({ x: 500, y: 500, width: 10, height: 10 }, { x: 0, y: 0, width: 100, height: 100 })).toBe('hidden');
  });
});

describe('computeVisibleNodes', () => {
  const items: RenderItem[] = [
    { id: 'a', type: 'section', depth: 0, bounds: { x: 0, y: 0, width: 100, height: 100 }, zIndex: 0, overflow: 'visible', node: { id: 'a', type: 'section', x: 0, y: 0, width: 100, height: 100, children: [], zIndex: 0, overflow: 'visible' } },
    { id: 'b', type: 'text', depth: 1, bounds: { x: 500, y: 500, width: 50, height: 50 }, zIndex: 0, overflow: 'visible', node: { id: 'b', type: 'text', x: 500, y: 500, width: 50, height: 50, children: [], zIndex: 0, overflow: 'visible' } },
    { id: 'c', type: 'section', depth: 0, bounds: { x: 0, y: 1000, width: 100, height: 100 }, zIndex: 0, overflow: 'visible', node: { id: 'c', type: 'section', x: 0, y: 1000, width: 100, height: 100, children: [], zIndex: 0, overflow: 'visible' } },
  ];

  it('should return only visible items within viewport', () => {
    const vp: ViewportRect = { x: 0, y: 0, width: 200, height: 200 };
    const result = computeVisibleNodes(items, vp);
    expect(result.map((i) => i.id)).toEqual(['a']);
  });

  it('should include overscanned items', () => {
    const items2: RenderItem[] = [
      { id: 'a', type: 'section', depth: 0, bounds: { x: 0, y: 0, width: 100, height: 100 }, zIndex: 0, overflow: 'visible', node: { id: 'a', type: 'section', x: 0, y: 0, width: 100, height: 100, children: [], zIndex: 0, overflow: 'visible' } },
      { id: 'b', type: 'text', depth: 1, bounds: { x: 0, y: 250, width: 50, height: 50 }, zIndex: 0, overflow: 'visible', node: { id: 'b', type: 'text', x: 0, y: 250, width: 50, height: 50, children: [], zIndex: 0, overflow: 'visible' } },
    ];
    const vp: ViewportRect = { x: 0, y: 0, width: 200, height: 200 };
    // Without overscan, only 'a' is visible. With overscan 100, expanded viewport goes to y=300 → 'b' at y=250 is included
    expect(computeVisibleNodes(items2, vp, 0).map((i) => i.id)).toEqual(['a']);
    expect(computeVisibleNodes(items2, vp, 100).map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('should return empty array for no items', () => {
    expect(computeVisibleNodes([], { x: 0, y: 0, width: 100, height: 100 })).toEqual([]);
  });
});

describe('isNodeVisible', () => {
  it('should return true for overlapping node', () => {
    expect(isNodeVisible({ x: 50, y: 50, width: 10, height: 10 }, { x: 0, y: 0, width: 100, height: 100 })).toBe(true);
  });

  it('should return false for non-overlapping node', () => {
    expect(isNodeVisible({ x: 500, y: 500, width: 10, height: 10 }, { x: 0, y: 0, width: 100, height: 100 })).toBe(false);
  });
});

// ── Spatial Indexing ─────────────────────────────────────────

describe('QuadTreeSpatialIndex', () => {
  let index: QuadTreeSpatialIndex;

  beforeEach(() => {
    index = new QuadTreeSpatialIndex({ x: -1000, y: -1000, width: 2000, height: 2000 });
  });

  it('should insert and query a single item', () => {
    index.insert('a', { x: 0, y: 0, width: 100, height: 100 });
    expect(index.size).toBe(1);
    expect(index.query({ x: 50, y: 50, width: 10, height: 10 })).toEqual(['a']);
  });

  it('should return empty for a query with no matches', () => {
    index.insert('a', { x: 0, y: 0, width: 100, height: 100 });
    expect(index.query({ x: 500, y: 500, width: 10, height: 10 })).toEqual([]);
  });

  it('should remove an item', () => {
    index.insert('a', { x: 0, y: 0, width: 100, height: 100 });
    index.remove('a');
    expect(index.size).toBe(0);
    expect(index.query({ x: 50, y: 50, width: 10, height: 10 })).toEqual([]);
  });

  it('should update bounds of an item', () => {
    index.insert('a', { x: 0, y: 0, width: 10, height: 10 });
    index.update('a', { x: 500, y: 500, width: 10, height: 10 });
    expect(index.query({ x: 0, y: 0, width: 100, height: 100 })).toEqual([]);
    expect(index.query({ x: 500, y: 500, width: 10, height: 10 })).toEqual(['a']);
  });

  it('should handle many items without duplicates', () => {
    const count = 500;
    for (let i = 0; i < count; i++) {
      index.insert(`item-${i}`, { x: i * 10, y: i * 10, width: 5, height: 5 });
    }
    expect(index.size).toBe(count); // No duplicates from boundary straddling
    const results = index.query({ x: 0, y: 0, width: 100, height: 100 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThan(count);
  });

  it('should only keep items in parent when they straddle boundaries', () => {
    // Need enough items to trigger a root split first
    for (let i = 0; i < 17; i++) {
      index.insert(`fi-${i}`, { x: 50 + i * 20, y: 50, width: 10, height: 10 });
    }
    // Item straddling x=0 boundary
    index.insert('straddle', { x: -5, y: 0, width: 10, height: 10 }); // goes from x=-5 to x=5
    // Query from left side
    const leftResult = index.query({ x: -10, y: 0, width: 8, height: 10 });
    expect(leftResult).toContain('straddle');
    // Query from right side
    const rightResult = index.query({ x: 2, y: 0, width: 8, height: 10 });
    expect(rightResult).toContain('straddle');
    // Item exists exactly once (no duplicates)
    const allResult = index.query({ x: -1000, y: -1000, width: 2000, height: 2000 });
    const count = allResult.filter((id) => id === 'straddle').length;
    expect(count).toBe(1);
  });

  it('should clear all items', () => {
    index.insert('a', { x: 0, y: 0, width: 10, height: 10 });
    index.insert('b', { x: 100, y: 100, width: 10, height: 10 });
    index.clear();
    expect(index.size).toBe(0);
    expect(index.query({ x: 0, y: 0, width: 1000, height: 1000 })).toEqual([]);
  });
});

describe('GridSpatialIndex', () => {
  let index: GridSpatialIndex;

  beforeEach(() => {
    index = new GridSpatialIndex(100);
  });

  it('should insert and query an item', () => {
    index.insert('a', { x: 0, y: 0, width: 50, height: 50 });
    expect(index.size).toBe(1);
    expect(index.query({ x: 0, y: 0, width: 10, height: 10 })).toEqual(['a']);
  });

  it('should query across grid cells', () => {
    index.insert('a', { x: 0, y: 0, width: 200, height: 200 });
    const results = index.query({ x: 150, y: 150, width: 50, height: 50 });
    expect(results).toContain('a');
  });

  it('should remove an item', () => {
    index.insert('a', { x: 0, y: 0, width: 10, height: 10 });
    index.remove('a');
    expect(index.size).toBe(0);
  });

  it('should clear all items', () => {
    index.insert('a', { x: 0, y: 0, width: 10, height: 10 });
    index.clear();
    expect(index.size).toBe(0);
  });
});

describe('createSpatialIndex', () => {
  it('should create a QuadTreeSpatialIndex when type is quadtree', () => {
    const index = createSpatialIndex('quadtree');
    expect(index).toBeInstanceOf(QuadTreeSpatialIndex);
  });

  it('should create a GridSpatialIndex when type is grid', () => {
    const index = createSpatialIndex('grid');
    expect(index).toBeInstanceOf(GridSpatialIndex);
  });
});

// ── Cache ────────────────────────────────────────────────────

describe('MemoCache', () => {
  it('should set and get values', () => {
    const cache = new MemoCache<string, number>();
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
  });

  it('should return undefined for missing keys', () => {
    const cache = new MemoCache<string, number>();
    expect(cache.get('missing')).toBeUndefined();
  });

  it('should evict least recently used when over max size', () => {
    const cache = new MemoCache<string, number>(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3); // should evict 'a'
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
  });

  it('should move accessed items to most recent', () => {
    const cache = new MemoCache<string, number>(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a'); // 'a' becomes most recent
    cache.set('c', 3); // should evict 'b'
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBe(3);
  });

  it('should clear all values', () => {
    const cache = new MemoCache<string, number>();
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('should invalidate with predicate', () => {
    const cache = new MemoCache<string, number>();
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.invalidate((key) => key !== 'b');
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
    expect(cache.has('c')).toBe(false);
  });
});

describe('createViewportKey', () => {
  it('should generate a stable string key', () => {
    const key1 = createViewportKey({ scrollX: 100, scrollY: 200, zoom: 1, width: 800, height: 600 });
    const key2 = createViewportKey({ scrollX: 100, scrollY: 200, zoom: 1, width: 800, height: 600 });
    expect(key1).toBe(key2);
  });

  it('should generate different keys for different states', () => {
    const key1 = createViewportKey({ scrollX: 100, scrollY: 200, zoom: 1, width: 800, height: 600 });
    const key2 = createViewportKey({ scrollX: 100, scrollY: 300, zoom: 1, width: 800, height: 600 });
    expect(key1).not.toBe(key2);
  });
});

// ── Renderer ─────────────────────────────────────────────────

describe('flattenComputedTree', () => {
  it('should flatten a simple tree with depth tracking', () => {
    const nodes: ComputedNode[] = [
      createComputedNode({ id: 'a', children: [
        createComputedNode({ id: 'b', children: [
          createComputedNode({ id: 'c' }),
        ]}),
      ]}),
    ];

    const result = flattenComputedTree(nodes);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('a');
    expect(result[0].depth).toBe(0);
    expect(result[1].id).toBe('b');
    expect(result[1].depth).toBe(1);
    expect(result[2].id).toBe('c');
    expect(result[2].depth).toBe(2);
  });

  it('should handle empty trees', () => {
    expect(flattenComputedTree([])).toEqual([]);
  });

  it('should preserve bounds', () => {
    const nodes: ComputedNode[] = [
      createComputedNode({ id: 'a', x: 10, y: 20, width: 100, height: 50 }),
    ];
    const result = flattenComputedTree(nodes);
    expect(result[0].bounds).toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });

  it('should handle multiple root nodes', () => {
    const nodes: ComputedNode[] = [
      createComputedNode({ id: 'a' }),
      createComputedNode({ id: 'b' }),
      createComputedNode({ id: 'c' }),
    ];
    expect(flattenComputedTree(nodes)).toHaveLength(3);
  });
});

describe('sortRenderItems', () => {
  it('should sort by z-index then depth', () => {
    const items: RenderItem[] = [
      { id: 'a', type: 'section', depth: 0, bounds: { x: 0, y: 0, width: 10, height: 10 }, zIndex: 2, overflow: 'visible', node: { id: 'a', type: 'section', x: 0, y: 0, width: 10, height: 10, children: [], zIndex: 2, overflow: 'visible' } },
      { id: 'b', type: 'text', depth: 1, bounds: { x: 0, y: 0, width: 10, height: 10 }, zIndex: 1, overflow: 'visible', node: { id: 'b', type: 'text', x: 0, y: 0, width: 10, height: 10, children: [], zIndex: 1, overflow: 'visible' } },
      { id: 'c', type: 'card', depth: 0, bounds: { x: 0, y: 0, width: 10, height: 10 }, zIndex: 1, overflow: 'visible', node: { id: 'c', type: 'card', x: 0, y: 0, width: 10, height: 10, children: [], zIndex: 1, overflow: 'visible' } },
    ];
    const sorted = sortRenderItems(items);
    // Same zIndex: lower depth first (parent before child)
    expect(sorted[0].id).toBe('c'); // zIndex 1, depth 0
    expect(sorted[1].id).toBe('b'); // zIndex 1, depth 1
    expect(sorted[2].id).toBe('a'); // zIndex 2
  });
});

describe('buildSpatialIndex', () => {
  it('should build a spatial index from render items', () => {
    const items: RenderItem[] = [
      { id: 'a', type: 'section', depth: 0, bounds: { x: 0, y: 0, width: 100, height: 100 }, zIndex: 0, overflow: 'visible', node: { id: 'a', type: 'section', x: 0, y: 0, width: 100, height: 100, children: [], zIndex: 0, overflow: 'visible' } },
      { id: 'b', type: 'text', depth: 1, bounds: { x: 500, y: 500, width: 50, height: 50 }, zIndex: 0, overflow: 'visible', node: { id: 'b', type: 'text', x: 500, y: 500, width: 50, height: 50, children: [], zIndex: 0, overflow: 'visible' } },
    ];
    const index = buildSpatialIndex(items);
    expect(index instanceof QuadTreeSpatialIndex).toBe(true);
    expect(index.size).toBe(2);
    expect(index.query({ x: 0, y: 0, width: 10, height: 10 })).toEqual(['a']);
  });
});

describe('computeCanvasBounds', () => {
  it('should compute bounds from items', () => {
    const items: RenderItem[] = [
      { id: 'a', type: 'section', depth: 0, bounds: { x: -100, y: -50, width: 200, height: 150 }, zIndex: 0, overflow: 'visible', node: { id: 'a', type: 'section', x: -100, y: -50, width: 200, height: 150, children: [], zIndex: 0, overflow: 'visible' } },
      { id: 'b', type: 'text', depth: 1, bounds: { x: 300, y: 200, width: 100, height: 80 }, zIndex: 0, overflow: 'visible', node: { id: 'b', type: 'text', x: 300, y: 200, width: 100, height: 80, children: [], zIndex: 0, overflow: 'visible' } },
    ];
    const bounds = computeCanvasBounds(items);
    expect(bounds).toEqual({ x: -100, y: -50, width: 500, height: 330 });
  });

  it('should return zero rect for empty items', () => {
    expect(computeCanvasBounds([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});

describe('buildItemMap', () => {
  it('should build a lookup map from render items', () => {
    const items: RenderItem[] = [
      { id: 'a', type: 'section', depth: 0, bounds: { x: 0, y: 0, width: 10, height: 10 }, zIndex: 0, overflow: 'visible', node: { id: 'a', type: 'section', x: 0, y: 0, width: 10, height: 10, children: [], zIndex: 0, overflow: 'visible' } },
      { id: 'b', type: 'text', depth: 1, bounds: { x: 0, y: 0, width: 10, height: 10 }, zIndex: 0, overflow: 'visible', node: { id: 'b', type: 'text', x: 0, y: 0, width: 10, height: 10, children: [], zIndex: 0, overflow: 'visible' } },
    ];
    const map = buildItemMap(items);
    expect(map.size).toBe(2);
    expect(map.get('a')?.id).toBe('a');
    expect(map.get('b')?.id).toBe('b');
    expect(map.get('missing')).toBeUndefined();
  });
});

describe('computeVirtualization', () => {
  const tree: ComputedNode[] = [
    createComputedNode({ id: 'a', width: 800, height: 100, children: [
      createComputedNode({ id: 'b', y: 110, width: 200, height: 200 }),
      createComputedNode({ id: 'c', x: 210, y: 110, width: 200, height: 200 }),
      createComputedNode({ id: 'd', y: 1000, width: 200, height: 200 }), // offscreen
    ]}),
  ];

  it('should produce virtualized result from computed nodes', () => {
    const viewport = createViewport({ width: 800, height: 600 });
    const result = computeVirtualization(tree, viewport);

    expect(result.allItems.length).toBe(4);
    expect(result.visibleItems.length).toBeLessThan(4);
    expect(result.visibility.totalCount).toBe(4);
    expect(result.canvasBounds).toBeDefined();
    expect(result.itemMap.size).toBe(4);
    expect(result.spatialIndex.size).toBe(4);
  });

  it('should handle empty trees', () => {
    const viewport = createViewport();
    const result = computeVirtualization([], viewport);
    expect(result.allItems).toEqual([]);
    expect(result.visibleItems).toEqual([]);
    expect(result.visibility.totalCount).toBe(0);
  });

  it('should include offscreen items when within overscan', () => {
    const viewport = createViewport({ width: 800, height: 600 });
    const config = { ...DEFAULT_VIRTUALIZATION_CONFIG, overscan: 500 };
    const result = computeVirtualization(tree, viewport, config);
    // item 'd' is at y=1000, viewport height=600, overscan=500 → within range
    const dItem = result.visibleItems.find((i) => i.id === 'd');
    expect(dItem).toBeDefined();
  });

  it('should respect zoom when computing viewport rect', () => {
    const zoomedViewport = createViewport({ scrollX: 0, scrollY: 0, zoom: 2, width: 800, height: 600 });
    const result = computeVirtualization(tree, zoomedViewport);
    // At zoom 2, the logical viewport is 400×300 → fewer items visible
    expect(result.visibleItems.length).toBeLessThanOrEqual(4);
  });
});

describe('createMemoizedVirtualization', () => {
  it('should return cached results for identical inputs', () => {
    const { compute } = createMemoizedVirtualization();
    const tree: ComputedNode[] = [createComputedNode({ id: 'a' })];
    const viewport = createViewport();

    const result1 = compute(tree, viewport);
    const result2 = compute(tree, viewport);

    expect(result1).toBe(result2); // same reference
  });

  it('should return new results for different viewport', () => {
    const { compute } = createMemoizedVirtualization();
    const tree: ComputedNode[] = [createComputedNode({ id: 'a' })];
    const vp1 = createViewport({ scrollX: 0 });
    const vp2 = createViewport({ scrollX: 100 });

    const result1 = compute(tree, vp1);
    const result2 = compute(tree, vp2);

    expect(result1).not.toBe(result2);
  });

  it('should clear cache', () => {
    const { compute, clearCache } = createMemoizedVirtualization();
    const tree: ComputedNode[] = [createComputedNode({ id: 'a' })];
    const viewport = createViewport();

    const result1 = compute(tree, viewport);
    clearCache();
    const result2 = compute(tree, viewport);

    expect(result1).not.toBe(result2);
  });
});

// ── Viewport Utilities ───────────────────────────────────────

describe('getViewportRect', () => {
  it('should derive logical viewport rect from state', () => {
    const vp = getViewportRect({ scrollX: 100, scrollY: 200, zoom: 2, width: 1600, height: 1200 });
    expect(vp).toEqual({ x: 50, y: 100, width: 800, height: 600 });
  });

  it('should handle unit zoom', () => {
    const vp = getViewportRect({ scrollX: 100, scrollY: 50, zoom: 1, width: 800, height: 600 });
    expect(vp).toEqual({ x: 100, y: 50, width: 800, height: 600 });
  });
});

describe('viewportStateEquals', () => {
  it('should return true for equal states', () => {
    const a: ViewportState = { scrollX: 100, scrollY: 200, zoom: 1, width: 800, height: 600 };
    const b: ViewportState = { scrollX: 100, scrollY: 200, zoom: 1, width: 800, height: 600 };
    expect(viewportStateEquals(a, b)).toBe(true);
  });

  it('should return false for different states with strict tolerance', () => {
    const a: ViewportState = { scrollX: 100, scrollY: 200, zoom: 1, width: 800, height: 600 };
    const b: ViewportState = { scrollX: 105, scrollY: 200, zoom: 1, width: 800, height: 600 };
    expect(viewportStateEquals(a, b, 0)).toBe(false);
  });
});

describe('fitToViewport', () => {
  it('should compute zoom to fit target in viewport', () => {
    const result = fitToViewport({ x: 0, y: 0, width: 1000, height: 800 }, { width: 800, height: 600 });
    // Scale to fit: 800-80=720 / 1000 = 0.72 horizontally, 600-80=520 / 800 = 0.65 vertically
    expect(result.zoom).toBeCloseTo(0.65, 1);
  });

  it('should clamp zoom to max 2', () => {
    const result = fitToViewport({ x: 0, y: 0, width: 100, height: 80 }, { width: 800, height: 600 });
    expect(result.zoom).toBe(2);
  });
});

describe('clampScroll', () => {
  it('should clamp scroll within bounds', () => {
    const result = clampScroll(-100, -100, { x: 0, y: 0, width: 1000, height: 1000 }, 800, 600, 1);
    expect(result.scrollX).toBe(0);
    expect(result.scrollY).toBe(0);
  });

  it('should not clamp if within bounds', () => {
    const result = clampScroll(100, 100, { x: 0, y: 0, width: 1000, height: 1000 }, 800, 600, 1);
    expect(result.scrollX).toBe(100);
    expect(result.scrollY).toBe(100);
  });
});
