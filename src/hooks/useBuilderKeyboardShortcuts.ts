/**
 * Builder Keyboard Shortcuts Hook
 * Provides keyboard shortcuts for common builder actions
 */

import { useEffect } from 'react';
import { useBuilderStore } from '@/stores/useBuilderStore';

interface UseBuilderKeyboardShortcutsProps {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
}

export const useBuilderKeyboardShortcuts = ({
  onSave,
  onUndo,
  onRedo,
  onDelete
}: UseBuilderKeyboardShortcutsProps) => {
  const { undo, redo, canUndo, canRedo, removeBlock, selectedBlockId } = useBuilderStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + S: Save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        onSave?.();
      }

      // Ctrl/Cmd + Z: Undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canUndo()) {
          onUndo?.();
          undo();
        }
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if (
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')
      ) {
        event.preventDefault();
        if (canRedo()) {
          onRedo?.();
          redo();
        }
      }

      // Delete or Backspace: Remove selected block
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedBlockId) {
        event.preventDefault();
        onDelete?.();
        removeBlock(selectedBlockId);
      }

      // Escape: Deselect block
      if (event.key === 'Escape' && selectedBlockId) {
        event.preventDefault();
        // Deselect logic would go here
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onUndo, onRedo, onDelete, undo, redo, canUndo, canRedo, removeBlock, selectedBlockId]);
};
