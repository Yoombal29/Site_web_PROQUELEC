/**
 * Custom Hook for Builder State Management
 * Provides a simplified interface for builder state operations
 */

import React from 'react';
import { useBuilderStore } from '@/stores/useBuilderStore';
import type { Block, BlockStyle, BlockContent } from '@/types/builder';

export const useBuilderState = () => {
  const store = useBuilderStore();

  return {
    // State
    blocks: store.blocks,
    selectedBlockId: store.selectedBlockId,
    pageMetadata: store.pageMetadata,
    templates: store.templates,
    history: store.history,
    historyIndex: store.historyIndex,

    // Actions
    setBlocks: store.setBlocks,
    addBlock: store.addBlock,
    importBlock: store.importBlock,
    moveBlock: store.moveBlock,
    selectBlock: store.selectBlock,
    setPageMetadata: store.setPageMetadata,

    // Update Actions
    updateBlockStyle: store.updateBlockStyle,
    updateBlockContent: store.updateBlockContent,
    removeBlock: store.removeBlock,

    // History Actions
    undo: store.undo,
    redo: store.redo,
    canUndo: store.canUndo,
    canRedo: store.canRedo,
    snapshotHistory: store.snapshotHistory,

    // Template Actions
    saveTemplate: store.saveTemplate,
    deleteTemplate: store.deleteTemplate,
    loadTemplates: store.loadTemplates
  };
};

/**
 * Hook for getting selected block with its style and content
 */
export const useSelectedBlock = () => {
  const { selectedBlockId, blocks } = useBuilderStore();

  const selectedBlock = React.useMemo(() => {
    if (!selectedBlockId) return null;

    const findBlock = (blocks: Block[]): Block | null => {
      for (const block of blocks) {
        if (block.id === selectedBlockId) return block;
        if (block.children) {
          const found = findBlock(block.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findBlock(blocks);
  }, [selectedBlockId, blocks]);

  return selectedBlock;
};

/**
 * Hook for block operations with automatic history snapshot
 */
export const useBlockOperations = () => {
  const { updateBlockStyle, updateBlockContent, removeBlock, snapshotHistory } = useBuilderStore();

  const updateStyleWithHistory = React.useCallback((id: string, style: Partial<BlockStyle>) => {
    updateBlockStyle(id, style);
    snapshotHistory();
  }, [updateBlockStyle, snapshotHistory]);

  const updateContentWithHistory = React.useCallback((id: string, content: Partial<BlockContent>) => {
    updateBlockContent(id, content);
    snapshotHistory();
  }, [updateBlockContent, snapshotHistory]);

  const removeBlockWithHistory = React.useCallback((id: string) => {
    removeBlock(id);
    snapshotHistory();
  }, [removeBlock, snapshotHistory]);

  return {
    updateStyleWithHistory,
    updateContentWithHistory,
    removeBlockWithHistory
  };
};
