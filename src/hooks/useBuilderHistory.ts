/**
 * Custom Hook for Builder History Management
 * Provides enhanced history operations with metadata
 */

import React from 'react';
import { useBuilderStore } from '@/stores/useBuilderStore';
import type { Block } from '@/types/builder';

interface HistoryEntry {
  timestamp: number;
  blocks: Block[];
  description?: string;
}

export const useBuilderHistory = () => {
  const {
    history,
    historyIndex,
    undo,
    redo,
    canUndo,
    canRedo,
    snapshotHistory
  } = useBuilderStore();

  const [historyMetadata, setHistoryMetadata] = React.useState<HistoryEntry[]>([]);

  // Enhanced snapshot with metadata
  const snapshotWithMetadata = React.useCallback((description?: string) => {
    snapshotHistory();
    const entry: HistoryEntry = {
      timestamp: Date.now(),
      blocks: history[historyIndex] || [],
      description
    };
    setHistoryMetadata(prev => [...prev, entry]);
  }, [snapshotHistory, history, historyIndex]);

  // Undo with metadata tracking
  const undoWithMetadata = React.useCallback(() => {
    if (canUndo()) {
      undo();
    }
  }, [undo, canUndo]);

  // Redo with metadata tracking
  const redoWithMetadata = React.useCallback(() => {
    if (canRedo()) {
      redo();
    }
  }, [redo, canRedo]);

  // Get history with descriptions
  const getHistoryWithDescriptions = React.useCallback(() => {
    return history.map((blocks, index) => ({
      index,
      blocks,
      timestamp: historyMetadata[index]?.timestamp || Date.now(),
      description: historyMetadata[index]?.description || `Snapshot ${index + 1}`,
      isCurrent: index === historyIndex
    }));
  }, [history, historyIndex, historyMetadata]);

  // Clear history
  const clearHistory = React.useCallback(() => {
    setHistoryMetadata([]);
  }, []);

  return {
    history,
    historyIndex,
    undo: undoWithMetadata,
    redo: redoWithMetadata,
    canUndo,
    canRedo,
    snapshotHistory: snapshotWithMetadata,
    getHistoryWithDescriptions,
    clearHistory,
    historyCount: history.length,
    currentIndex: historyIndex
  };
};

/**
 * Hook for debounced history snapshots
 * Prevents excessive history snapshots during rapid changes
 */
export const useDebouncedHistory = (delay: number = 1000) => {
  const { snapshotHistory } = useBuilderStore();
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const debouncedSnapshot = React.useCallback((description?: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      snapshotHistory();
    }, delay);
  }, [snapshotHistory, delay]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedSnapshot;
};
