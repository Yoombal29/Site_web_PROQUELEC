import React, { useCallback, useRef } from 'react';
import { useBuilderStore } from '@/stores/useBuilderStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { Clock, Undo, Redo, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buildTimelineGroups, formatTimestamp, getProgressPercent } from '@/engine/history';

interface HistoryTimelineProps {
  className?: string;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ className }) => {
  const { history, historyIndex, undo, redo, snapshotHistory } = useBuilderStore();
  const {
    snapshots,
    currentIndex,
    isTimelineOpen,
    addSnapshot,
    setCurrentIndex,
    closeTimeline,
  } = useHistoryStore();

  const totalSteps = history.length;
  const progress = getProgressPercent(historyIndex, totalSteps);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const targetIndex = parseInt(e.target.value, 10);
    const currentHistoryIndex = useBuilderStore.getState().historyIndex;

    if (targetIndex > currentHistoryIndex) {
      // Need to redo to reach target
      const diff = targetIndex - currentHistoryIndex;
      for (let i = 0; i < diff; i++) {
        useBuilderStore.getState().redo();
      }
    } else if (targetIndex < currentHistoryIndex) {
      // Need to undo to reach target
      const diff = currentHistoryIndex - targetIndex;
      for (let i = 0; i < diff; i++) {
        useBuilderStore.getState().undo();
      }
    }
    setCurrentIndex(targetIndex);
  }, [setCurrentIndex]);

  const handleSnapshot = useCallback(() => {
    const label = `Snapshot #${snapshots.length + 1}`;
    snapshotHistory();
    addSnapshot(label, 'named');
  }, [snapshots.length, snapshotHistory, addSnapshot]);

  const groups = buildTimelineGroups(snapshots, currentIndex);

  if (!isTimelineOpen) return null;

  return (
    <div className={cn('border-t bg-white px-4 py-3', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Historique</span>
          <span className="text-[10px] text-slate-400">
            {historyIndex + 1} / {totalSteps}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Annuler"
          >
            <Undo className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={redo}
            disabled={historyIndex >= totalSteps - 1}
            title="Rétablir"
          >
            <Redo className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleSnapshot}
            title="Enregistrer un snapshot nommé"
          >
            <Camera className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={closeTimeline}
            title="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Timeline slider */}
      <div className="relative px-1">
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps - 1, 0)}
          value={historyIndex}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow"
          style={{
            background: `linear-gradient(to right, #2563eb ${progress}%, #e2e8f0 ${progress}%)`,
          }}
        />

        {/* Named snapshots markers */}
        <div className="flex justify-between mt-1">
          {groups.map((group) => (
            <div
              key={group.snapshot.id}
              className={cn(
                'flex flex-col items-center transition-all',
                group.isFuture && 'opacity-40'
              )}
              style={{
                position: 'absolute',
                left: `${(group.index / Math.max(totalSteps - 1, 1)) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {group.snapshot.type === 'named' && (
                <div
                  className={cn(
                    'w-2 h-2 rounded-full border mt-0.5 cursor-pointer',
                    group.isCurrent
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-amber-400 border-amber-500'
                  )}
                  title={group.snapshot.label}
                  onClick={() => handleSliderChange({
                    target: { value: String(group.index) },
                  } as any)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Named snapshots list */}
      {groups.filter(g => g.snapshot.type === 'named').length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {groups
            .filter(g => g.snapshot.type === 'named')
            .reverse()
            .slice(0, 5)
            .map((group) => (
              <button
                key={group.snapshot.id}
                onClick={() => handleSliderChange({
                  target: { value: String(group.index) },
                } as any)}
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full border transition-all',
                  group.isCurrent
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                )}
              >
                {group.snapshot.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
