import type { Block } from '@/types/builder';
import type { Patch } from './types';
import { PatchOp } from './types';
import { hashTree, compareHashes } from './structural-hash';

interface NodeIndex {
  node: Block;
  parentId: string | null;
  index: number;
}

function buildIndex(blocks: Block[], parentId: string | null = null): Map<string, NodeIndex> {
  const index = new Map<string, NodeIndex>();

  function walk(list: Block[], pid: string | null): void {
    list.forEach((node, idx) => {
      index.set(node.id, { node, parentId: pid, index: idx });
      if (node.children && node.children.length > 0) {
        walk(node.children, node.id);
      }
    });
  }

  walk(blocks, parentId);
  return index;
}

function findParent(blocks: Block[], nodeId: string): { parentId: string | null; index: number } | null {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === nodeId) {
      return { parentId: null, index: i };
    }
    if (blocks[i].children) {
      const found = findInChildren(blocks[i].children!, nodeId, blocks[i].id);
      if (found) return found;
    }
  }
  return null;
}

function findInChildren(
  children: Block[],
  nodeId: string,
  parentId: string,
): { parentId: string; index: number } | null {
  for (let i = 0; i < children.length; i++) {
    if (children[i].id === nodeId) {
      return { parentId, index: i };
    }
    if (children[i].children) {
      const found = findInChildren(children[i].children!, nodeId, children[i].id);
      if (found) return found;
    }
  }
  return null;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a === 'object') {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((v, i) => deepEqual(v, b[i]));
    }
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj).sort();
    const bKeys = Object.keys(bObj).sort();
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(k => k in bObj && deepEqual(aObj[k], bObj[k]));
  }
  return false;
}

function detectNodeUpdates(
  oldNode: Block,
  newNode: Block,
  patches: Patch[],
): void {
  if (!deepEqual(oldNode.content, newNode.content)) {
    const oldContent = oldNode.content || {};
    const newContent = newNode.content || {};
    const allKeys = new Set([...Object.keys(oldContent), ...Object.keys(newContent)]);
    for (const key of allKeys) {
      const oldVal = (oldContent as Record<string, unknown>)[key];
      const newVal = (newContent as Record<string, unknown>)[key];
      if (!deepEqual(oldVal, newVal)) {
        patches.push({
          op: PatchOp.UPDATE_CONTENT,
          nodeId: newNode.id,
          path: [key],
          previous: oldVal,
          next: newVal,
        });
      }
    }
  }

  if (!deepEqual(oldNode.style, newNode.style)) {
    const oldStyle = oldNode.style || {};
    const newStyle = newNode.style || {};
    const allKeys = new Set([...Object.keys(oldStyle), ...Object.keys(newStyle)]);
    for (const key of allKeys) {
      const oldVal = (oldStyle as Record<string, unknown>)[key];
      const newVal = (newStyle as Record<string, unknown>)[key];
      if (!deepEqual(oldVal, newVal)) {
        patches.push({
          op: PatchOp.UPDATE_STYLE,
          nodeId: newNode.id,
          path: [key],
          previous: oldVal,
          next: newVal,
        });
      }
    }
  }

  if (oldNode.enabled !== newNode.enabled && newNode.enabled !== undefined) {
    patches.push({
      op: PatchOp.UPDATE_ENABLED,
      nodeId: newNode.id,
      previous: oldNode.enabled ?? true,
      next: newNode.enabled,
    });
  }

  if (!deepEqual(oldNode.bindings, newNode.bindings)) {
    patches.push({
      op: PatchOp.UPDATE_BINDING,
      nodeId: newNode.id,
      previous: oldNode.bindings ?? null,
      next: newNode.bindings ?? null,
    });
  }
}

function detectMoves(
  oldBlocks: Block[],
  newBlocks: Block[],
  patches: Patch[],
  oldParentId: string | null,
  newParentId: string | null,
): void {
  const oldIds = oldBlocks.map(b => b.id);
  const newIds = newBlocks.map(b => b.id);

  const oldIdSet = new Set(oldIds);
  const newIdSet = new Set(newIds);

  const moved: Map<string, { fromIndex: number; fromParent: string | null }> = new Map();

  for (let i = 0; i < oldBlocks.length; i++) {
    if (newIdSet.has(oldBlocks[i].id) && oldIds[i] !== newIds[i]) {
      const newIdx = newIds.indexOf(oldBlocks[i].id);
      if (newIdx !== -1 && newIdx !== i) {
        const fromParent = oldParentId;
        const toParent = newParentId;
        if (fromParent !== toParent || i !== newIdx) {
          moved.set(oldBlocks[i].id, { fromIndex: i, fromParent });
        }
      }
    }
  }

  for (let i = 0; i < newBlocks.length; i++) {
    if (oldIdSet.has(newBlocks[i].id) && oldIds[i] !== newIds[i]) {
      const oldIdx = oldIds.indexOf(newBlocks[i].id);
      if (oldIdx !== -1) {
        const entry = moved.get(newBlocks[i].id);
        if (entry) {
          const actualFromParent = entry.fromParent;
          if (actualFromParent !== newParentId || oldIdx !== i) {
            if (!patches.some(
              p => p.op === PatchOp.MOVE_NODE && (p as import('./types').MoveNodePatch).nodeId === newBlocks[i].id
            )) {
              patches.push({
                op: PatchOp.MOVE_NODE,
                nodeId: newBlocks[i].id,
                fromParentId: actualFromParent,
                toParentId: newParentId,
                fromIndex: oldIdx,
                toIndex: i,
              });
            }
          }
        }
      }
    }
  }

  const oldChildrenMap = new Map(oldBlocks.map(b => [b.id, b]));
  const newChildrenMap = new Map(newBlocks.map(b => [b.id, b]));

  for (const block of newBlocks) {
    const oldChild = oldChildrenMap.get(block.id);
    if (oldChild && oldChild.children && block.children) {
      detectMoves(oldChild.children, block.children, patches, block.id, block.id);
    }
  }
}

export function diffTrees(
  oldBlocks: Block[],
  newBlocks: Block[],
): Patch[] {
  const patches: Patch[] = [];
  const oldIndex = buildIndex(oldBlocks);
  const newIndex = buildIndex(newBlocks);

  const oldIds = new Set(oldIndex.keys());
  const newIds = new Set(newIndex.keys());

  // ── Deleted nodes ──
  for (const id of oldIds) {
    if (!newIds.has(id)) {
      const info = oldIndex.get(id)!;
      // Seulement si le parent n'est pas lui-même supprimé
      if (info.parentId == null || newIds.has(info.parentId)) {
        patches.push({
          op: PatchOp.DELETE_NODE,
          nodeId: id,
          parentId: info.parentId,
        });
      }
    }
  }

  // ── Created nodes ──
  for (const id of newIds) {
    if (!oldIds.has(id)) {
      const info = newIndex.get(id)!;
      // Seulement si le parent n'est pas lui-même créé
      if (info.parentId == null || oldIds.has(info.parentId)) {
        patches.push({
          op: PatchOp.CREATE_NODE,
          node: info.node,
          parentId: info.parentId,
          index: info.index,
        });
      }
    }
  }

  // ── Moved nodes ──
  detectMoves(oldBlocks, newBlocks, patches, null, null);

  // ── Updated nodes ──
  const matchedIds = [...oldIds].filter(id => newIds.has(id));
  for (const id of matchedIds) {
    const oldInfo = oldIndex.get(id)!;
    const newInfo = newIndex.get(id)!;
    detectNodeUpdates(oldInfo.node, newInfo.node, patches);
  }

  return patches;
}

export function diffBlocks(oldBlocks: Block[], newBlocks: Block[]): import('./types').DiffResult {
  const patches = diffTrees(oldBlocks, newBlocks);

  const stats = {
    creates: patches.filter(p => p.op === PatchOp.CREATE_NODE).length,
    deletes: patches.filter(p => p.op === PatchOp.DELETE_NODE).length,
    moves: patches.filter(p => p.op === PatchOp.MOVE_NODE).length,
    updates: patches.filter(p => p.op === PatchOp.UPDATE_CONTENT || p.op === PatchOp.UPDATE_STYLE || p.op === PatchOp.UPDATE_ENABLED).length,
    bindings: patches.filter(p => p.op === PatchOp.UPDATE_BINDING).length,
    animations: patches.filter(p => p.op === PatchOp.UPDATE_ANIMATION).length,
  };

  return { patches, stats };
}
