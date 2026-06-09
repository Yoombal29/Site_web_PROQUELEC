import type { Block } from '@/types/builder';
import type { Patch } from '@/engine/diff/types';
import { PatchOp } from '@/engine/diff/types';
import { applyPatches } from '@/engine/diff/apply-patch';

export interface PatchHistoryEntry {
  id: string;
  forward: Patch[];
  inverse: Patch[];
  timestamp: number;
  label: string;
  blocksCount: number;
}

export interface PatchHistoryConfig {
  maxEntries: number;
}

export const DEFAULT_PATCH_CONFIG: PatchHistoryConfig = {
  maxEntries: 50,
};

export interface UndoRedoResult {
  blocks: Block[];
  entry: PatchHistoryEntry;
}

export interface PatchHistorySummary {
  undoCount: number;
  redoCount: number;
  totalEntries: number;
  currentIndex: number;
}

function inversePatches(patches: Patch[], previousBlocks: Block[]): Patch[] {
  const inverses: Patch[] = [];

  for (const patch of patches) {
    switch (patch.op) {
      case PatchOp.CREATE_NODE:
        inverses.push({
          op: PatchOp.DELETE_NODE,
          nodeId: patch.node.id,
          parentId: patch.parentId,
        });
        break;

      case PatchOp.DELETE_NODE: {
        const deleted = findNodeInTree(previousBlocks, patch.nodeId);
        inverses.push({
          op: PatchOp.CREATE_NODE,
          node: deleted || { id: patch.nodeId, type: 'section', content: {}, style: {}, children: [] },
          parentId: patch.parentId,
          index: findIndexInParent(previousBlocks, patch.nodeId, patch.parentId),
        });
        break;
      }

      case PatchOp.MOVE_NODE:
        inverses.push({
          op: PatchOp.MOVE_NODE,
          nodeId: patch.nodeId,
          fromParentId: patch.toParentId,
          toParentId: patch.fromParentId,
          fromIndex: patch.toIndex,
          toIndex: patch.fromIndex,
        });
        break;

      case PatchOp.UPDATE_CONTENT:
        inverses.push({
          op: PatchOp.UPDATE_CONTENT,
          nodeId: patch.nodeId,
          path: patch.path,
          previous: patch.next,
          next: patch.previous,
        });
        break;

      case PatchOp.UPDATE_STYLE:
        inverses.push({
          op: PatchOp.UPDATE_STYLE,
          nodeId: patch.nodeId,
          path: patch.path,
          previous: patch.next,
          next: patch.previous,
        });
        break;

      case PatchOp.UPDATE_ENABLED:
        inverses.push({
          op: PatchOp.UPDATE_ENABLED,
          nodeId: patch.nodeId,
          previous: patch.next,
          next: patch.previous,
        });
        break;

      case PatchOp.UPDATE_BINDING:
        inverses.push({
          op: PatchOp.UPDATE_BINDING,
          nodeId: patch.nodeId,
          previous: patch.next,
          next: patch.previous,
        });
        break;

      case PatchOp.UPDATE_ANIMATION:
        inverses.push({
          op: PatchOp.UPDATE_ANIMATION,
          nodeId: patch.nodeId,
          previous: patch.next,
          next: patch.previous,
        });
        break;
    }
  }

  return inverses;
}

function findNodeInTree(blocks: Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findNodeInTree(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findIndexInParent(blocks: Block[], nodeId: string, parentId: string | null): number {
  if (parentId === null) {
    return blocks.findIndex(b => b.id === nodeId);
  }
  const parent = findNodeInTree(blocks, parentId);
  if (parent?.children) {
    return parent.children.findIndex(c => c.id === nodeId);
  }
  return 0;
}

export class PatchHistory {
  private undoStack: PatchHistoryEntry[] = [];
  private redoStack: PatchHistoryEntry[] = [];
  private config: PatchHistoryConfig;
  private _entryId = 0;

  constructor(config?: Partial<PatchHistoryConfig>) {
    this.config = { ...DEFAULT_PATCH_CONFIG, ...config };
  }

  get undoCount(): number {
    return this.undoStack.length;
  }

  get redoCount(): number {
    return this.redoStack.length;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  record(
    patches: Patch[],
    previousBlocks: Block[],
    label: string = '',
  ): PatchHistoryEntry {
    const inverse = inversePatches(patches, previousBlocks);

    const entry: PatchHistoryEntry = {
      id: `ph_${++this._entryId}`,
      forward: patches,
      inverse,
      timestamp: Date.now(),
      label,
      blocksCount: previousBlocks.length,
    };

    this.undoStack.push(entry);
    this.redoStack = [];

    if (this.undoStack.length > this.config.maxEntries) {
      this.undoStack.shift();
    }

    return entry;
  }

  undo(currentBlocks: Block[]): UndoRedoResult | null {
    if (!this.canUndo) return null;

    const entry = this.undoStack.pop()!;
    const blocks = applyPatches(currentBlocks, entry.inverse);

    this.redoStack.push(entry);

    return { blocks, entry };
  }

  redo(currentBlocks: Block[]): UndoRedoResult | null {
    if (!this.canRedo) return null;

    const entry = this.redoStack.pop()!;
    const blocks = applyPatches(currentBlocks, entry.forward);

    this.undoStack.push(entry);

    return { blocks, entry };
  }

  reset(): void {
    this.undoStack = [];
    this.redoStack = [];
    this._entryId = 0;
  }

  getSummary(): PatchHistorySummary {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      totalEntries: this.undoStack.length + this.redoStack.length,
      currentIndex: this.undoStack.length - 1,
    };
  }

  peekUndo(): PatchHistoryEntry | null {
    return this.undoStack[this.undoStack.length - 1] ?? null;
  }

  peekRedo(): PatchHistoryEntry | null {
    return this.redoStack[this.redoStack.length - 1] ?? null;
  }

  getUndoStack(): readonly PatchHistoryEntry[] {
    return this.undoStack;
  }

  getRedoStack(): readonly PatchHistoryEntry[] {
    return this.redoStack;
  }
}
