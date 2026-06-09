import { v4 as uuidv4 } from 'uuid';
import type { HistorySnapshot, TimelineGroup } from './types';

export function createSnapshot(label: string, type: HistorySnapshot['type'] = 'auto'): HistorySnapshot {
  return {
    id: uuidv4(),
    label,
    timestamp: Date.now(),
    type,
  };
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) return 'À l\'instant';
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function formatHistoryLabel(index: number, total: number, snapshot: HistorySnapshot): string {
  const step = snapshot.label || `État #${index + 1}`;
  const suffix = index === total - 1 ? ' (actuel)' : index < total - 1 ? '' : '';
  return `${step}${suffix}`;
}

export function buildTimelineGroups(
  snapshots: HistorySnapshot[],
  currentIndex: number,
): TimelineGroup[] {
  return snapshots.map((snapshot, index) => ({
    index,
    snapshot,
    isCurrent: index === currentIndex,
    isFuture: index > currentIndex,
  }));
}

export function getProgressPercent(currentIndex: number, total: number): number {
  if (total <= 1) return 100;
  return (currentIndex / (total - 1)) * 100;
}

// Patch-based history (memory-efficient undo/redo)
export * from './patches';
