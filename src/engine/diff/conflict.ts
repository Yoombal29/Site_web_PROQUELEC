import type { Conflict, Patch } from './types';
import { ConflictType } from './types';

export function hasConflicts(conflicts: Conflict[]): boolean {
  return conflicts.length > 0;
}

export function autoResolveConflicts(conflicts: Conflict[]): {
  resolved: Conflict[];
  unresolved: Conflict[];
} {
  const resolved: Conflict[] = [];
  const unresolved: Conflict[] = [];

  for (const conflict of conflicts) {
    switch (conflict.resolution) {
      case 'keep_a':
      case 'skip_both':
        resolved.push({ ...conflict, resolution: conflict.resolution });
        break;
      case 'merge':
        try {
          resolved.push({ ...conflict, resolution: 'keep_a' });
        } catch {
          unresolved.push(conflict);
        }
        break;
      default:
        unresolved.push(conflict);
    }
  }

  return { resolved, unresolved };
}

export function applyConflictResolution(
  patches: Patch[],
  conflicts: Conflict[],
): Patch[] {
  const deleteIds = new Set<string>();
  const skipOps = new Set<string>();

  for (const conflict of conflicts) {
    if (conflict.resolution === 'keep_a') {
      const bId = 'nodeId' in conflict.patchB ? conflict.patchB.nodeId : '';
      skipOps.add(`${conflict.patchB.op}:${bId}`);
    }
    if (conflict.resolution === 'skip_both') {
      const aId = 'nodeId' in conflict.patchA ? conflict.patchA.nodeId : '';
      const bId = 'nodeId' in conflict.patchB ? conflict.patchB.nodeId : '';
      skipOps.add(`${conflict.patchA.op}:${aId}`);
      skipOps.add(`${conflict.patchB.op}:${bId}`);
    }
    if (
      conflict.type === ConflictType.SAME_NODE_DELETE_AND_UPDATE &&
      conflict.resolution === 'keep_a'
    ) {
      const deletePatch = 'op' in conflict.patchA && conflict.patchA.op === 'DELETE_NODE'
        ? conflict.patchA
        : conflict.patchB;
      const dId = 'nodeId' in deletePatch ? deletePatch.nodeId : '';
      deleteIds.add(dId);
    }
  }

  return patches.filter(p => {
    const id = 'nodeId' in p ? p.nodeId : '';
    const key = `${p.op}:${id}`;
    if (skipOps.has(key)) return false;
    if (deleteIds.has(id) && (isUpdateOp(p) || isMoveOp(p))) return false;
    return true;
  });
}

function isUpdateOp(p: Patch): boolean {
  return p.op === 'UPDATE_CONTENT' || p.op === 'UPDATE_STYLE' || p.op === 'UPDATE_ENABLED' || p.op === 'UPDATE_BINDING';
}

function isMoveOp(p: Patch): boolean {
  return p.op === 'MOVE_NODE';
}
