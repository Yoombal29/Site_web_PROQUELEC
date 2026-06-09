import type { Block } from '@/types/builder';
import type { Patch, DiffResult, ChangeSet } from './types';
import { diffBlocks } from './tree-diff';
import { applyPatches } from './apply-patch';
import { mergePatches } from './merge';
import { ChangeDetector } from './change-detector';

export { diffBlocks, applyPatches, mergePatches, ChangeDetector };

export type { Patch, DiffResult, ChangeSet };

let _globalDetector: ChangeDetector | null = null;

export function getGlobalDetector(): ChangeDetector {
  if (!_globalDetector) {
    _globalDetector = new ChangeDetector();
  }
  return _globalDetector;
}

export function computeDiff(oldBlocks: Block[], newBlocks: Block[]): DiffResult {
  return diffBlocks(oldBlocks, newBlocks);
}

export function computePatch(oldBlocks: Block[], newBlocks: Block[]): Patch[] {
  return diffBlocks(oldBlocks, newBlocks).patches;
}

export function applyDiff(blocks: Block[], patches: Patch[]): Block[] {
  return applyPatches(blocks, patches);
}

export function mergeDiffs(
  basePatches: Patch[],
  incomingPatches: Patch[],
) {
  return mergePatches(basePatches, incomingPatches);
}
