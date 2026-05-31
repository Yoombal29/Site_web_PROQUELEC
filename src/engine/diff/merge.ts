import type { Patch, MergeResult, Conflict } from './types';
import { PatchOp, ConflictType } from './types';

function patchesById(patches: Patch[]): Map<string, Patch[]> {
  const map = new Map<string, Patch[]>();
  for (const p of patches) {
    const id = 'nodeId' in p ? p.nodeId : '';
    if (!map.has(id)) map.set(id, []);
    map.get(id)!.push(p);
  }
  return map;
}

function isDeletePatch(p: Patch): boolean {
  return p.op === PatchOp.DELETE_NODE;
}

function isUpdatePatch(p: Patch): boolean {
  return p.op === PatchOp.UPDATE_CONTENT || p.op === PatchOp.UPDATE_STYLE || p.op === PatchOp.UPDATE_ENABLED;
}

function isMovePatch(p: Patch): boolean {
  return p.op === PatchOp.MOVE_NODE;
}

export function mergePatches(base: Patch[], incoming: Patch[]): MergeResult {
  const conflicts: Conflict[] = [];
  const applied = new Set<string>();
  const resolved: Patch[] = [];

  const baseById = patchesById(base);
  const incomingById = patchesById(incoming);

  const allIds = new Set([...baseById.keys(), ...incomingById.keys()]);

  for (const id of allIds) {
    const basePs = baseById.get(id) || [];
    const incomingPs = incomingById.get(id) || [];

    const hasBaseDelete = basePs.some(isDeletePatch);
    const hasIncomingDelete = incomingPs.some(isDeletePatch);
    const hasBaseMove = basePs.some(isMovePatch);
    const hasIncomingMove = incomingPs.some(isMovePatch);
    const hasBaseUpdate = basePs.some(isUpdatePatch);
    const hasIncomingUpdate = incomingPs.some(isUpdatePatch);

    // ── Both sides deleted ──
    if (hasBaseDelete && hasIncomingDelete) {
      conflicts.push({
        patchA: basePs.find(isDeletePatch)!,
        patchB: incomingPs.find(isDeletePatch)!,
        type: ConflictType.SAME_NODE_DELETE_AND_UPDATE,
        description: `Node ${id} deleted by both`,
        resolution: 'keep_a',
      });
      resolved.push(basePs.find(isDeletePatch)!);
      applied.add(id);
      continue;
    }

    // ── One deleted, other updated ──
    if ((hasBaseDelete && hasIncomingUpdate) || (hasIncomingDelete && hasBaseUpdate)) {
      const deletePatch = hasBaseDelete ? basePs.find(isDeletePatch)! : incomingPs.find(isDeletePatch)!;
      const updatePatch = hasBaseDelete ? incomingPs.find(isUpdatePatch)! : basePs.find(isUpdatePatch)!;

      conflicts.push({
        patchA: deletePatch,
        patchB: updatePatch,
        type: ConflictType.SAME_NODE_DELETE_AND_UPDATE,
        description: `Node ${id} deleted by one, updated by other`,
        resolution: 'keep_a',
      });
      resolved.push(deletePatch);
      applied.add(id);
      continue;
    }

    // ── Both moved ──
    if (hasBaseMove && hasIncomingMove) {
      const moveA = basePs.find(isMovePatch)! as import('./types').MoveNodePatch;
      const moveB = incomingPs.find(isMovePatch)! as import('./types').MoveNodePatch;
      const sameTarget = moveA.toParentId === moveB.toParentId && moveA.toIndex === moveB.toIndex;

      if (!sameTarget) {
        conflicts.push({
          patchA: moveA,
          patchB: moveB,
          type: ConflictType.SAME_NODE_DOUBLE_MOVE,
          description: `Node ${id} moved to different positions`,
          resolution: 'keep_a',
        });
        resolved.push(moveA);
      } else {
        resolved.push(moveA);
      }
      applied.add(id);
      continue;
    }

    // ── Standard merge: take both sides ──
    for (const p of [...basePs, ...incomingPs]) {
      const key = `${p.op}:${'nodeId' in p ? p.nodeId : ''}:${'path' in p ? (p.path || []).join('.') : ''}`;
      if (!applied.has(key)) {
        resolved.push(p);
        applied.add(key);
      }
    }
  }

  return {
    patches: resolved,
    conflicts,
    resolved: conflicts.length === 0,
  };
}
