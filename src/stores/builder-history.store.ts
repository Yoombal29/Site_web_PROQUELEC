import { create } from 'zustand';

interface BuilderHistoryState {
  autosaveStatus: 'saved' | 'saving' | 'dirty' | 'local_draft' | 'error';
  timelineOpen: boolean;
  lastSavedHash: string | null;
  setAutosaveStatus: (status: 'saved' | 'saving' | 'dirty' | 'local_draft' | 'error') => void;
  setTimelineOpen: (open: boolean) => void;
  setLastSavedHash: (hash: string | null) => void;
  resetHistoryState: () => void;
}

export const useBuilderHistoryStore = create<BuilderHistoryState>((set) => ({
  autosaveStatus: 'saved',
  timelineOpen: false,
  lastSavedHash: null,
  setAutosaveStatus: (status) => set({ autosaveStatus: status }),
  setTimelineOpen: (open) => set({ timelineOpen: open }),
  setLastSavedHash: (hash) => set({ lastSavedHash: hash }),
  resetHistoryState: () =>
    set({
      autosaveStatus: 'saved',
      timelineOpen: false,
      lastSavedHash: null,
    }),
}));
