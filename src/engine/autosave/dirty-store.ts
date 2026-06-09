import { create } from 'zustand';
import type { Patch, ChangeSet } from '@/engine/diff/types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'retrying';

export interface PendingSave {
  patches: Patch[];
  timestamp: number;
  retryCount: number;
}

export interface DirtyState {
  isDirty: boolean;
  pendingPatches: Patch[];
  pendingCount: number;
  lastSavedAt: number | null;
  lastModifiedAt: number | null;
  lastError: string | null;
  saveStatus: SaveStatus;
  failedPatches: Patch[];
  unsavedChangeCount: number;

  markDirty: (patches: Patch[]) => void;
  markSaving: () => void;
  markSaved: () => void;
  markError: (error: string) => void;
  markRetrying: () => void;
  clearDirty: () => void;
  reset: () => void;
}

export const useDirtyStore = create<DirtyState>((set, get) => ({
  isDirty: false,
  pendingPatches: [],
  pendingCount: 0,
  lastSavedAt: null,
  lastModifiedAt: null,
  lastError: null,
  saveStatus: 'idle',
  failedPatches: [],
  unsavedChangeCount: 0,

  markDirty: (patches: Patch[]) => {
    set((s) => ({
      isDirty: true,
      pendingPatches: [...s.pendingPatches, ...patches],
      pendingCount: s.pendingCount + patches.length,
      lastModifiedAt: Date.now(),
      unsavedChangeCount: s.unsavedChangeCount + patches.length,
    }));
  },

  markSaving: () => {
    set({ saveStatus: 'saving' });
  },

  markSaved: () => {
    set({
      isDirty: false,
      saveStatus: 'saved',
      lastSavedAt: Date.now(),
      pendingPatches: [],
      pendingCount: 0,
      lastError: null,
      unsavedChangeCount: 0,
    });
  },

  markError: (error: string) => {
    set((s) => ({
      saveStatus: 'error',
      lastError: error,
      failedPatches: [...s.failedPatches, ...s.pendingPatches],
    }));
  },

  markRetrying: () => {
    set({ saveStatus: 'retrying' });
  },

  clearDirty: () => {
    set({
      isDirty: false,
      pendingPatches: [],
      pendingCount: 0,
      unsavedChangeCount: 0,
    });
  },

  reset: () => {
    set({
      isDirty: false,
      pendingPatches: [],
      pendingCount: 0,
      lastSavedAt: null,
      lastModifiedAt: null,
      lastError: null,
      saveStatus: 'idle',
      failedPatches: [],
      unsavedChangeCount: 0,
    });
  },
}));
