import type { Block, BlockStyle } from '@/types/builder';
import type { ComputedNode, LayoutEngineConfig, Breakpoint } from '@/engine/layout/types';
import { computeNodeLayout, computeFullLayout } from '@/engine/layout/engine';
import { computeAutoLayout } from '@/engine/layout/auto-layout';
import { LayoutCache } from './cache';
import { DirtyTracker } from './tracker';
import type { IncrementalLayoutResult, IncrementalLayoutConfig } from './types';
import { DEFAULT_INCREMENTAL_CONFIG } from './types';

/**
 * Compute the full layout, using caching and dirty tracking when possible.
 *
 * - First call: full recompute, builds cache
 * - Subsequent calls with dirty set: only recompute dirty subtrees + ancestors
 * - Subsequent calls without dirty: return cached result
 */
export function incrementalFullLayout(
  blocks: Block[],
  config: LayoutEngineConfig,
  cache: LayoutCache,
  tracker: DirtyTracker,
  incConfig: IncrementalLayoutConfig = DEFAULT_INCREMENTAL_CONFIG,
): IncrementalLayoutResult {
  const startTime = performance.now();
  let recomputedIds: string[] = [];
  let wasFullRecompute = false;

  // If cache is empty or config changed, do a full recompute
  if (cache.isEmpty || !cache.isCompatible(config)) {
    const computedNodes = computeFullLayout(blocks, config);
    cache.build(blocks, config);
    // Populate cache with computed results
    for (const node of flattenNodeTree(computedNodes)) {
      cache.set(node.id, node);
    }
    tracker.flush();
    wasFullRecompute = true;
    recomputedIds = cache.getRootNodeIds() as unknown as string[];
    const elapsedMs = Math.round(performance.now() - startTime);
    return { computedNodes, recomputedIds, wasFullRecompute: true, elapsedMs };
  }

  // No dirty nodes → return cached result
  if (!tracker.hasDirty) {
    const computedNodes = cache.toComputedNodes();
    const elapsedMs = Math.round(performance.now() - startTime);
    return { computedNodes, recomputedIds: [], wasFullRecompute: false, elapsedMs };
  }

  // Collect all affected IDs (dirty + ancestors)
  const affectedIds = tracker.collectAffectedIds(blocks);
  const dirtyIds = tracker.getDirtyIds();

  // Safety: if too many nodes are affected, fall back to full recompute
  if (affectedIds.length > incConfig.maxDirtySubtree) {
    const computedNodes = computeFullLayout(blocks, config);
    cache.build(blocks, config);
    for (const node of flattenNodeTree(computedNodes)) {
      cache.set(node.id, node);
    }
    tracker.flush();
    wasFullRecompute = true;
    recomputedIds = cache.getRootNodeIds() as unknown as string[];
    const elapsedMs = Math.round(performance.now() - startTime);
    return { computedNodes, recomputedIds: [], wasFullRecompute: true, elapsedMs };
  }

  // Incremental recompute: recompute each affected node's subtree
  const recomputedSet = new Set<string>();

  // 1. Update blocks that changed and index new children
  for (const id of dirtyIds) {
    const block = cache.getBlock(id);
    if (!block) continue;
    const updatedBlock = findBlockById(blocks, id) ?? block;
    cache.updateBlock(updatedBlock);
    // Index any new children that aren't in cache yet
    indexNewDescendants(updatedBlock, cache);
  }

  // 2. Recompute affected nodes bottom-up (deepest first)
  const recomputeOrder = topoSortByDepth(affectedIds, cache);

  for (const id of recomputeOrder) {
    const block = cache.getBlock(id);
    if (!block) continue;

    // Recompute only if the block is dirty or an ancestor of a dirty block
    if (dirtyIds.includes(id)) {
      // Full recompute of this block's subtree
      recomputeNodeSubtree(block, config, cache);
      recomputedSet.add(id);
    } else {
      // Ancestor: recompute only this node (children already recomputed)
      recomputeSingleNode(block, config, cache);
      recomputedSet.add(id);
    }
  }

  // 3. Rebuild auto-layout for parents of dirty nodes
  for (const dirtyId of dirtyIds) {
    const path = findBlockPath(blocks, dirtyId);
    for (let i = path.length - 1; i >= 0; i--) {
      const pid = path[i];
      const pBlock = cache.getBlock(pid);
      if (pBlock && pBlock.children && pBlock.children.length > 0) {
        // Check if this parent has auto-layout
        const pNode = cache.get(pid);
        if (pNode && pNode.children.length > 0) {
          repositionAutoLayoutChildren(pid, pBlock, config, cache);
          recomputedSet.add(pid);
        }
      }
    }
  }

  tracker.flush();

  const computedNodes = cache.toComputedNodes();
  recomputedIds = Array.from(recomputedSet);
  const elapsedMs = Math.round(performance.now() - startTime);

  return { computedNodes, recomputedIds, wasFullRecompute: false, elapsedMs };
}

/** Topological sort: deepest nodes first (children before parents) */
function topoSortByDepth(ids: string[], cache: LayoutCache): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  function dfs(id: string): void {
    if (visited.has(id)) return;
    visited.add(id);
    const node = cache.get(id);
    if (node?.children) {
      for (const child of node.children) {
        dfs(child.id);
      }
    }
    result.push(id);
  }

  for (const id of ids) {
    dfs(id);
  }
  return result;
}

/** Recompute a single block's subtree and update cache */
function recomputeNodeSubtree(
  block: Block,
  config: LayoutEngineConfig,
  cache: LayoutCache,
): ComputedNode {
  const node = computeNodeLayout(block, config);
  cache.set(block.id, node);
  for (const child of node.children) {
    const childBlock = cache.getBlock(child.id);
    if (childBlock) {
      cache.set(child.id, child);
    }
  }
  return node;
}

/** Recompute only the current node (children unchanged) */
function recomputeSingleNode(
  block: Block,
  config: LayoutEngineConfig,
  cache: LayoutCache,
): ComputedNode {
  const children = block.children?.map((c) => cache.get(c.id)).filter((n): n is ComputedNode => n !== undefined) ?? [];

  const node = computeNodeLayout(
    { ...block, children: block.children },
    config,
  );

  // Replace children in the result with cached children (to preserve x/y from auto-layout)
  if (children.length > 0) {
    node.children = children;
  }

  cache.set(block.id, node);
  return node;
}

/** Re-run auto-layout positioning for a parent's children */
function repositionAutoLayoutChildren(
  parentId: string,
  parentBlock: Block,
  config: LayoutEngineConfig,
  cache: LayoutCache,
): void {
  const parentNode = cache.get(parentId);
  if (!parentNode) return;

  const children = parentBlock.children
    ?.map((c) => {
      const cn = cache.get(c.id);
      if (!cn) return null;
      // Recompute child with parent's container dims
      const block = cache.getBlock(c.id);
      if (!block) return null;
      const childNode = computeNodeLayout(block, {
        ...config,
        containerWidth: parentNode.width,
        containerHeight: parentNode.height,
      });
      return childNode;
    })
    .filter((n): n is ComputedNode => n !== null) ?? [];

  // Recompute parent with updated children
  const style = parentBlock.style || {};
  if (style.display === 'flex') {
    const autoLayout = {
      direction: style.flexDirection === 'column' ? 'vertical' as const : 'horizontal' as const,
      padding: {
        top: style.paddingTop || style.padding || '0',
        right: style.paddingRight || style.padding || '0',
        bottom: style.paddingBottom || style.padding || '0',
        left: style.paddingLeft || style.padding || '0',
      },
      gap: style.gap || '0',
      horizontalAlign: (style.justifyContent || 'start') as any,
      verticalAlign: (style.alignItems || 'start') as any,
      wrap: style.flexWrap === 'wrap' || false,
    };

    const result = computeAutoLayout({
      children,
      autoLayout,
      containerWidth: parentNode.width,
      containerHeight: parentNode.height,
    });

    parentNode.width = result.width;
    parentNode.height = result.height;
    parentNode.children = result.children;

    for (const child of result.children) {
      cache.set(child.id, child);
    }
  }

  cache.set(parentId, parentNode);
}

/** Find a block by ID in the block tree */
function findBlockById(blocks: Block[], id: string): Block | undefined {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlockById(block.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

/** Find path from root to a target block */
function findBlockPath(blocks: Block[], targetId: string, path: string[] = []): string[] {
  for (const block of blocks) {
    if (block.id === targetId) {
      return [...path, block.id];
    }
    if (block.children) {
      const found = findBlockPath(block.children, targetId, [...path, block.id]);
      if (found.length > 0) return found;
    }
  }
  return [];
}

/** Recursively index new blocks under `block` that aren't already cached */
function indexNewDescendants(block: Block, cache: LayoutCache): void {
  if (!block.children) return;
  for (const child of block.children) {
    if (!cache.getBlock(child.id)) {
      cache.updateBlock(child);
    }
    indexNewDescendants(child, cache);
  }
}

/** Flatten a tree of ComputedNodes into a list (depth-first) */
function flattenNodeTree(nodes: ComputedNode[], result: ComputedNode[] = []): ComputedNode[] {
  for (const node of nodes) {
    result.push(node);
    if (node.children) {
      flattenNodeTree(node.children, result);
    }
  }
  return result;
}
