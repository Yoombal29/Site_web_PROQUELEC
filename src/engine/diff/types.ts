import type { Block, BlockStyle, BlockContent } from '@/types/builder';

// ── Patch operation types ─────────────────────────────────────

export const enum PatchOp {
  CREATE_NODE = 'CREATE_NODE',
  DELETE_NODE = 'DELETE_NODE',
  MOVE_NODE = 'MOVE_NODE',
  UPDATE_PROPS = 'UPDATE_PROPS',
  UPDATE_STYLE = 'UPDATE_STYLE',
  UPDATE_CONTENT = 'UPDATE_CONTENT',
  UPDATE_BINDING = 'UPDATE_BINDING',
  UPDATE_ANIMATION = 'UPDATE_ANIMATION',
  UPDATE_LAYOUT = 'UPDATE_LAYOUT',
  UPDATE_ENABLED = 'UPDATE_ENABLED',
}

// ── Patches ───────────────────────────────────────────────────

export interface CreateNodePatch {
  op: PatchOp.CREATE_NODE;
  node: Block;
  parentId: string | null;
  index: number;
}

export interface DeleteNodePatch {
  op: PatchOp.DELETE_NODE;
  nodeId: string;
  parentId: string | null;
}

export interface MoveNodePatch {
  op: PatchOp.MOVE_NODE;
  nodeId: string;
  fromParentId: string | null;
  toParentId: string | null;
  fromIndex: number;
  toIndex: number;
}

export interface UpdatePropsPatch {
  op: PatchOp.UPDATE_PROPS;
  nodeId: string;
  previous: Record<string, unknown>;
  next: Record<string, unknown>;
}

export interface UpdateStylePatch {
  op: PatchOp.UPDATE_STYLE;
  nodeId: string;
  path: string[];
  previous: unknown;
  next: unknown;
}

export interface UpdateContentPatch {
  op: PatchOp.UPDATE_CONTENT;
  nodeId: string;
  path: string[];
  previous: unknown;
  next: unknown;
}

export interface UpdateBindingPatch {
  op: PatchOp.UPDATE_BINDING;
  nodeId: string;
  previous: import('@/engine/data/types').DataBinding | null;
  next: import('@/engine/data/types').DataBinding | null;
}

export interface UpdateAnimationPatch {
  op: PatchOp.UPDATE_ANIMATION;
  nodeId: string;
  previous: Record<string, unknown> | null;
  next: Record<string, unknown> | null;
}

export interface UpdateLayoutPatch {
  op: PatchOp.UPDATE_LAYOUT;
  nodeId: string;
  previous: Record<string, unknown>;
  next: Record<string, unknown>;
}

export interface UpdateEnabledPatch {
  op: PatchOp.UPDATE_ENABLED;
  nodeId: string;
  previous: boolean;
  next: boolean;
}

export type Patch =
  | CreateNodePatch
  | DeleteNodePatch
  | MoveNodePatch
  | UpdatePropsPatch
  | UpdateStylePatch
  | UpdateContentPatch
  | UpdateBindingPatch
  | UpdateAnimationPatch
  | UpdateLayoutPatch
  | UpdateEnabledPatch;

// ── Change set ────────────────────────────────────────────────

export interface ChangeSet {
  patches: Patch[];
  timestamp: number;
  source: string;
  metadata?: Record<string, unknown>;
}

// ── Diff result ───────────────────────────────────────────────

export interface DiffResult {
  patches: Patch[];
  stats: {
    creates: number;
    deletes: number;
    moves: number;
    updates: number;
    bindings: number;
    animations: number;
  };
}

// ── Conflict ──────────────────────────────────────────────────

export interface Conflict {
  patchA: Patch;
  patchB: Patch;
  type: ConflictType;
  description: string;
  resolution?: 'keep_a' | 'keep_b' | 'skip_both' | 'merge';
}

export const enum ConflictType {
  SAME_NODE_DELETE_AND_UPDATE = 'SAME_NODE_DELETE_AND_UPDATE',
  SAME_NODE_MOVE_AND_UPDATE = 'SAME_NODE_MOVE_AND_UPDATE',
  SAME_NODE_DOUBLE_MOVE = 'SAME_NODE_DOUBLE_MOVE',
  SAME_PROP_CONFLICT = 'SAME_PROP_CONFLICT',
  PARENT_DELETED = 'PARENT_DELETED',
}

export interface MergeResult {
  patches: Patch[];
  conflicts: Conflict[];
  resolved: boolean;
}

// ── Node identity ─────────────────────────────────────────────

export interface StructuralHash {
  id: string;
  hash: string;
  children: StructuralHash[];
}
