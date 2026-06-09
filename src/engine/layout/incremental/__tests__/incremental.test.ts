import { describe, it, expect, beforeEach } from 'vitest';
import type { Block } from '@/types/builder';
import type { ComputedNode, LayoutEngineConfig } from '@/engine/layout/types';
import { DirtyTracker } from '../tracker';
import { LayoutCache } from '../cache';
import { incrementalFullLayout } from '../engine';
import { computeNodeLayout, computeFullLayout } from '@/engine/layout/engine';

function makeBlock(id: string, overrides: Partial<Block> = {}): Block {
  return {
    id,
    type: 'section',
    content: { title: `Block ${id}` },
    style: { padding: '20px' },
    children: [],
    ...overrides,
  };
}

function makeBlockTree(): Block[] {
  return [
    {
      ...makeBlock('root-a', { type: 'hero', style: { padding: '40px', display: 'flex', flexDirection: 'column' as const } }),
      children: [
        makeBlock('child-a1', { style: { width: '200px', height: '100px' } }),
        makeBlock('child-a2', { style: { width: '200px', height: '100px' } }),
        {
          ...makeBlock('child-a3', { style: { display: 'flex', flexDirection: 'row' as const, gap: '10px' } }),
          children: [
            makeBlock('grandchild-a3-1', { style: { width: '50px', height: '50px' } }),
            makeBlock('grandchild-a3-2', { style: { width: '50px', height: '50px' } }),
          ],
        },
      ],
    },
    makeBlock('root-b', { type: 'section', style: { padding: '20px', width: '100%', height: '200px' } }),
  ];
}

const testConfig: LayoutEngineConfig = {
  containerWidth: 1200,
  containerHeight: 800,
  breakpoint: 'desktop',
};

describe('DirtyTracker', () => {
  let tracker: DirtyTracker;

  beforeEach(() => {
    tracker = new DirtyTracker();
  });

  it('should start clean', () => {
    expect(tracker.hasDirty).toBe(false);
    expect(tracker.size).toBe(0);
    expect(tracker.getDirtyIds()).toEqual([]);
  });

  it('should mark a block as dirty', () => {
    tracker.mark('block-1', 'style');
    expect(tracker.hasDirty).toBe(true);
    expect(tracker.size).toBe(1);
    expect(tracker.isDirty('block-1')).toBe(true);
    expect(tracker.getReason('block-1')).toBe('style');
  });

  it('should mark with default reason', () => {
    tracker.mark('block-1');
    expect(tracker.getReason('block-1')).toBe('style');
  });

  it('should mark many blocks at once', () => {
    tracker.markMany(['a', 'b', 'c'], 'added');
    expect(tracker.size).toBe(3);
    expect(tracker.isDirty('a')).toBe(true);
    expect(tracker.isDirty('b')).toBe(true);
    expect(tracker.isDirty('c')).toBe(true);
  });

  it('should keep the first reason when marked multiple times', () => {
    tracker.mark('block-1', 'style');
    tracker.mark('block-1', 'content');
    expect(tracker.getReason('block-1')).toBe('style');
  });

  it('should clear a specific block', () => {
    tracker.mark('block-1');
    tracker.mark('block-2');
    tracker.clear('block-1');
    expect(tracker.isDirty('block-1')).toBe(false);
    expect(tracker.isDirty('block-2')).toBe(true);
  });

  it('should flush all dirty flags', () => {
    tracker.markMany(['a', 'b', 'c']);
    tracker.flush();
    expect(tracker.hasDirty).toBe(false);
    expect(tracker.size).toBe(0);
  });

  it('should collect ancestors of dirty blocks', () => {
    const blocks = makeBlockTree();
    // Mark grandchild as dirty
    tracker.mark('grandchild-a3-1', 'style');

    const ancestors = tracker.collectAncestors(blocks);
    expect(ancestors).toContain('child-a3');
    expect(ancestors).toContain('root-a');
    // Should NOT include the dirty node itself
    expect(ancestors).not.toContain('grandchild-a3-1');
  });

  it('should collect affected ids (dirty + ancestors)', () => {
    const blocks = makeBlockTree();
    tracker.mark('grandchild-a3-1', 'style');

    const affected = tracker.collectAffectedIds(blocks);
    expect(affected).toContain('grandchild-a3-1');
    expect(affected).toContain('child-a3');
    expect(affected).toContain('root-a');
  });

  it('should return empty path for non-existent block', () => {
    const blocks = makeBlockTree();
    const result = (tracker as any).findPath(blocks, 'non-existent');
    expect(result).toEqual([]);
  });
});

describe('LayoutCache', () => {
  let cache: LayoutCache;

  beforeEach(() => {
    cache = new LayoutCache();
  });

  it('should start empty', () => {
    expect(cache.isEmpty).toBe(true);
    expect(cache.size).toBe(0);
  });

  it('should build from block tree', () => {
    const blocks = makeBlockTree();
    cache.build(blocks, testConfig);
    expect(cache.isEmpty).toBe(false);
    expect(cache.size).toBe(0); // index only, no computed nodes
    expect(cache.getRootNodeIds()).toEqual(['root-a', 'root-b']);
    expect(cache.getBlock('root-a')).toBeDefined();
    expect(cache.getBlock('grandchild-a3-2')).toBeDefined();
  });

  it('should store and retrieve computed nodes', () => {
    const node: ComputedNode = {
      id: 'test', type: 'section',
      x: 0, y: 0, width: 100, height: 100,
      children: [], zIndex: 0, overflow: 'visible',
    };
    cache.set('test', node);
    expect(cache.has('test')).toBe(true);
    expect(cache.get('test')).toBe(node);
  });

  it('should remove nodes', () => {
    const node: ComputedNode = {
      id: 'test', type: 'section',
      x: 0, y: 0, width: 100, height: 100,
      children: [], zIndex: 0, overflow: 'visible',
    };
    cache.set('test', node);
    cache.remove('test');
    expect(cache.has('test')).toBe(false);
  });

  it('should clear all entries', () => {
    const blocks = makeBlockTree();
    cache.build(blocks, testConfig);
    cache.clear();
    expect(cache.isEmpty).toBe(true);
    expect(cache.size).toBe(0);
  });

  it('should check config compatibility', () => {
    const blocks = makeBlockTree();
    cache.build(blocks, testConfig);
    expect(cache.isCompatible(testConfig)).toBe(true);

    const differentConfig: LayoutEngineConfig = {
      containerWidth: 768,
      containerHeight: 600,
      breakpoint: 'tablet',
    };
    expect(cache.isCompatible(differentConfig)).toBe(false);
  });

  it('should update block references', () => {
    const blocks = makeBlockTree();
    cache.build(blocks, testConfig);

    const updated = { ...cache.getBlock('root-a')!, style: { ...cache.getBlock('root-a')!.style, padding: '80px' } };
    cache.updateBlock(updated);

    expect(cache.getBlock('root-a')!.style?.padding).toBe('80px');
  });

  it('should be compatible with same config after build', () => {
    const blocks = makeBlockTree();
    cache.build(blocks, testConfig);
    expect(cache.isCompatible({ containerWidth: 1200, containerHeight: 800, breakpoint: 'desktop' })).toBe(true);
  });
});

describe('incrementalFullLayout', () => {
  let cache: LayoutCache;
  let tracker: DirtyTracker;

  beforeEach(() => {
    cache = new LayoutCache();
    tracker = new DirtyTracker();
  });

  it('should do full recompute on first call', () => {
    const blocks = makeBlockTree();
    const result = incrementalFullLayout(blocks, testConfig, cache, tracker);

    expect(result.wasFullRecompute).toBe(true);
    expect(result.computedNodes).toHaveLength(2);
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(cache.isEmpty).toBe(false);
  });

  it('should return cached result when no dirty nodes', () => {
    const blocks = makeBlockTree();
    incrementalFullLayout(blocks, testConfig, cache, tracker);

    const result = incrementalFullLayout(blocks, testConfig, cache, tracker);
    expect(result.wasFullRecompute).toBe(false);
    expect(result.recomputedIds).toHaveLength(0);
    expect(result.computedNodes).toHaveLength(2);
  });

  it('should recompute dirty nodes incrementally', () => {
    const blocks = makeBlockTree();
    incrementalFullLayout(blocks, testConfig, cache, tracker);

    // Mark a node dirty
    tracker.mark('grandchild-a3-1', 'style');
    const result = incrementalFullLayout(blocks, testConfig, cache, tracker);

    expect(result.wasFullRecompute).toBe(false);
    expect(result.recomputedIds.length).toBeGreaterThan(0);
  });

  it('should do full recompute if config changed', () => {
    const blocks = makeBlockTree();
    incrementalFullLayout(blocks, testConfig, cache, tracker);

    const tabletConfig: LayoutEngineConfig = {
      containerWidth: 768,
      containerHeight: 600,
      breakpoint: 'tablet',
    };
    const result = incrementalFullLayout(blocks, tabletConfig, cache, tracker);

    expect(result.wasFullRecompute).toBe(true);
  });

  it('should produce valid ComputedNode structures', () => {
    const blocks = makeBlockTree();
    const result = incrementalFullLayout(blocks, testConfig, cache, tracker);

    for (const node of result.computedNodes) {
      expect(node.id).toBeDefined();
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
      expect(typeof node.width).toBe('number');
      expect(typeof node.height).toBe('number');
      expect(Array.isArray(node.children)).toBe(true);
    }
  });

  it('should handle empty blocks', () => {
    const result = incrementalFullLayout([], testConfig, cache, tracker);
    expect(result.computedNodes).toEqual([]);
    expect(result.wasFullRecompute).toBe(true);
  });

  it('should respect maxDirtySubtree by falling back to full recompute', () => {
    const blocks = makeBlockTree();
    incrementalFullLayout(blocks, testConfig, cache, tracker);

    // Mark ALL nodes as dirty
    tracker.markMany(['root-a', 'child-a1', 'child-a2', 'child-a3', 'grandchild-a3-1', 'grandchild-a3-2', 'root-b']);

    const result = incrementalFullLayout(blocks, testConfig, cache, tracker, {
      enabled: true,
      maxDirtySubtree: 1, // Very low threshold
      debug: false,
    });

    expect(result.wasFullRecompute).toBe(true);
  });

  it('should return same geometric results as full recompute', () => {
    const blocks = makeBlockTree();

    // Full recompute (baseline)
    const baseline = computeFullLayout(blocks, testConfig);

    // Incremental with cache
    const result = incrementalFullLayout(blocks, testConfig, cache, tracker);

    function compareNodeTrees(baseline: ComputedNode[], result: ComputedNode[]): void {
      expect(result.length).toBe(baseline.length);
      for (let i = 0; i < baseline.length; i++) {
        expect(result[i].id).toBe(baseline[i].id);
        expect(result[i].x).toBe(baseline[i].x);
        expect(result[i].y).toBe(baseline[i].y);
        expect(result[i].width).toBe(baseline[i].width);
        expect(result[i].height).toBe(baseline[i].height);
        if (baseline[i].children && result[i].children) {
          compareNodeTrees(baseline[i].children, result[i].children);
        }
      }
    }

    compareNodeTrees(baseline, result.computedNodes);
  });

  it('should handle blocks with no style', () => {
    const blocks: Block[] = [
      { id: 'minimal', type: 'text', content: { text: 'hello' }, children: [] },
    ];
    const result = incrementalFullLayout(blocks, testConfig, cache, tracker);
    expect(result.computedNodes).toHaveLength(1);
    expect(result.computedNodes[0].width).toBeGreaterThan(0);
  });
});

describe('end-to-end incremental updates', () => {
  it('should correctly update after style change', () => {
    const cache = new LayoutCache();
    const tracker = new DirtyTracker();
    const blocks = makeBlockTree();

    // First layout
    const initial = incrementalFullLayout(blocks, testConfig, cache, tracker);
    const initialWidth = initial.computedNodes[0].width;

    // Modify root-a style (wider padding)
    const modifiedBlocks: Block[] = [
      {
        ...blocks[0],
        style: { ...blocks[0].style, padding: '100px' },
      },
      blocks[1],
    ];

    tracker.mark('root-a', 'style');
    const updated = incrementalFullLayout(modifiedBlocks, testConfig, cache, tracker);

    expect(updated.wasFullRecompute).toBe(false);
    // Width may differ due to increased padding
    expect(updated.computedNodes[0].width).not.toBe(initialWidth);
  });

  it('should correctly update after adding a child', () => {
    const cache = new LayoutCache();
    const tracker = new DirtyTracker();
    const blocks = makeBlockTree();

    incrementalFullLayout(blocks, testConfig, cache, tracker);

    // Add a child to root-a
    const newChild = makeBlock('new-child', { style: { width: '100px', height: '50px' } });
    const modifiedBlocks: Block[] = [
      {
        ...blocks[0],
        children: [...(blocks[0].children || []), newChild],
      },
      blocks[1],
    ];

    tracker.mark('root-a', 'children');
    const updated = incrementalFullLayout(modifiedBlocks, testConfig, cache, tracker);

    expect(updated.wasFullRecompute).toBe(false);
    const rootANode = findNodeById(updated.computedNodes, 'root-a');
    expect(rootANode).toBeDefined();
    expect(rootANode!.children).toHaveLength(4); // 3 original + 1 new
  });

  it('should correctly update after removing a child', () => {
    const cache = new LayoutCache();
    const tracker = new DirtyTracker();
    const blocks = makeBlockTree();

    incrementalFullLayout(blocks, testConfig, cache, tracker);

    // Remove child-a1
    const modifiedBlocks: Block[] = [
      {
        ...blocks[0],
        children: (blocks[0].children || []).filter((c) => c.id !== 'child-a1'),
      },
      blocks[1],
    ];

    cache.remove('child-a1');
    tracker.mark('root-a', 'children');
    const updated = incrementalFullLayout(modifiedBlocks, testConfig, cache, tracker);

    expect(updated.wasFullRecompute).toBe(false);
    const rootANode = findNodeById(updated.computedNodes, 'root-a');
    expect(rootANode!.children).toHaveLength(2); // 3 original - 1 removed
  });
});

function findNodeById(nodes: ComputedNode[], id: string): ComputedNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}
