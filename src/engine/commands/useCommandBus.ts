import { useCallback } from 'react';
import { commandBus } from '@/engine/events/init';
import type { BuilderCommand, CommandResult } from './types';

export function useCommandBus(): {
  execute: (command: BuilderCommand) => CommandResult;
  undo: () => CommandResult | null;
  redo: () => CommandResult | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
} {
  return {
    execute: useCallback((command: BuilderCommand) => commandBus.execute(command), []),
    undo: useCallback(() => commandBus.undo(), []),
    redo: useCallback(() => commandBus.redo(), []),
    canUndo: useCallback(() => commandBus.canUndo(), []),
    canRedo: useCallback(() => commandBus.canRedo(), []),
  };
}
