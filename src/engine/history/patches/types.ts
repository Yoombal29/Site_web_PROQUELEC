import type { Patch } from 'immer';
import type { Block } from '@/types/builder';

/** A history entry storing Immer patches instead of full snapshots */
export interface PatchEntry {
  id: string;
  patches: Patch[];
  inversePatches: Patch[];
  timestamp: number;
  label: string;
}

/** Configuration for the patch-based history store */
export interface PatchHistoryConfig {
  /** Maximum number of undo steps */
  maxEntries: number;
  /** Emit debug events when true */
  debug: boolean;
}

export const DEFAULT_PATCH_CONFIG: PatchHistoryConfig = {
  maxEntries: 50,
  debug: false,
};

/** Result of an undo/redo operation */
export interface PatchUndoRedoResult {
  blocks: Block[];
  entry: PatchEntry;
}

/** Summary of current patch history state */
export interface PatchHistorySummary {
  entries: number;
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  estimatedMemoryBytes: number;
}
