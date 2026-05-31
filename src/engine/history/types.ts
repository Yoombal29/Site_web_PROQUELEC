export interface HistorySnapshot {
  id: string;
  label: string;
  timestamp: number;
  type: 'auto' | 'named' | 'snapshot';
}

export interface HistoryTimelineState {
  snapshots: HistorySnapshot[];
  currentIndex: number;
  isTimelineOpen: boolean;
}

export interface HistoryActions {
  addSnapshot: (label: string, type: HistorySnapshot['type']) => void;
  setCurrentIndex: (index: number) => void;
  toggleTimeline: () => void;
  closeTimeline: () => void;
  clearHistory: () => void;
}

export interface TimelineGroup {
  index: number;
  snapshot: HistorySnapshot;
  isCurrent: boolean;
  isFuture: boolean;
}
