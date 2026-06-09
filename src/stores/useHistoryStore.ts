import { create } from 'zustand';
import type { HistorySnapshot, HistoryTimelineState, HistoryActions } from '@/engine/history/types';
import { createSnapshot } from '@/engine/history';
import { eventBus } from '@/engine/events/bus';

type HistoryStore = HistoryTimelineState & HistoryActions;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  snapshots: [],
  currentIndex: -1,
  isTimelineOpen: false,

  addSnapshot: (label, type) => set((state) => {
    const snapshot = createSnapshot(label, type);
    const newIndex = state.snapshots.length;
    eventBus.emit('history:snapshot:created', {
      snapshot,
      blocksCount: 0,
    });
    return {
      snapshots: [...state.snapshots, snapshot],
      currentIndex: newIndex,
    };
  }),

  setCurrentIndex: (index) => {
    const prev = get().currentIndex;
    set({ currentIndex: index });
    eventBus.emit('history:jump', { fromIndex: prev, toIndex: index });
  },

  toggleTimeline: () => set((state) => ({ isTimelineOpen: !state.isTimelineOpen })),

  closeTimeline: () => set({ isTimelineOpen: false }),

  clearHistory: () => {
    const count = get().snapshots.length;
    set({ snapshots: [], currentIndex: -1 });
    eventBus.emit('history:cleared', { previousCount: count });
  },
}));
