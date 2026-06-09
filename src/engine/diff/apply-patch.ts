import type { Block } from '@/types/builder';
import type { Patch } from './types';
import { PatchOp } from './types';

function cloneBlock(block: Block): Block {
  return JSON.parse(JSON.stringify(block));
}

function findNode(blocks: Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findNode(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findParentAndIndex(
  blocks: Block[],
  id: string,
  parentId: string | null,
): { parent: Block[] | null; index: number } | null {
  if (parentId === null) {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx !== -1) return { parent: blocks, index: idx };
    return null;
  }

  const parent = findNode(blocks, parentId);
  if (!parent || !parent.children) return null;
  const idx = parent.children.findIndex(c => c.id === id);
  if (idx !== -1) return { parent: parent.children, index: idx };
  return null;
}

export function applyPatch(blocks: Block[], patch: Patch): Block[] {
  const result = JSON.parse(JSON.stringify(blocks)) as Block[];

  switch (patch.op) {
    case PatchOp.CREATE_NODE: {
      const node = patch.node;
      if (patch.parentId === null) {
        result.splice(patch.index, 0, cloneBlock(node));
      } else {
        const parent = findNode(result, patch.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.splice(patch.index, 0, cloneBlock(node));
        }
      }
      break;
    }

    case PatchOp.DELETE_NODE: {
      const loc = findParentAndIndex(result, patch.nodeId, patch.parentId);
      if (loc && loc.parent) {
        loc.parent.splice(loc.index, 1);
      }
      break;
    }

    case PatchOp.MOVE_NODE: {
      const fromLoc = findParentAndIndex(result, patch.nodeId, patch.fromParentId);
      if (!fromLoc || !fromLoc.parent) break;

      const [moved] = fromLoc.parent.splice(fromLoc.index, 1);

      if (patch.toParentId === null) {
        result.splice(patch.toIndex, 0, moved);
      } else {
        const toParent = findNode(result, patch.toParentId);
        if (toParent) {
          if (!toParent.children) toParent.children = [];
          toParent.children.splice(patch.toIndex, 0, moved);
        }
      }
      break;
    }

    case PatchOp.UPDATE_CONTENT: {
      const node = findNode(result, patch.nodeId);
      if (node) {
        const content = node.content || {} as Record<string, unknown>;
        (content as Record<string, unknown>)[patch.path[0]] = patch.next;
        node.content = content as Block['content'];
      }
      break;
    }

    case PatchOp.UPDATE_STYLE: {
      const node = findNode(result, patch.nodeId);
      if (node) {
        const style = node.style || {} as Record<string, unknown>;
        (style as Record<string, unknown>)[patch.path[0]] = patch.next;
        node.style = style as Block['style'];
      }
      break;
    }

    case PatchOp.UPDATE_ENABLED: {
      const node = findNode(result, patch.nodeId);
      if (node) {
        node.enabled = patch.next;
      }
      break;
    }

    case PatchOp.UPDATE_BINDING: {
      const node = findNode(result, patch.nodeId);
      if (node) {
        node.bindings = patch.next ?? undefined;
      }
      break;
    }

    case PatchOp.UPDATE_ANIMATION: {
      const node = findNode(result, patch.nodeId);
      if (node) {
        const content = node.content || {};
        (content as Record<string, unknown>).animation = patch.next;
        node.content = content;
      }
      break;
    }
  }

  return result;
}

export function applyPatches(blocks: Block[], patches: Patch[]): Block[] {
  return patches.reduce((current, patch) => applyPatch(current, patch), blocks);
}
