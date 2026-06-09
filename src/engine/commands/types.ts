import type { Block, BlockStyle, BlockContent } from '@/types/builder';

// ── Command definitions ──────────────────────────────────────

export interface Command<P = unknown> {
  type: string;
  payload: P;
  timestamp: number;
  /** Optional label for history display */
  label?: string;
  /** If true, this command won't be added to history */
  silent?: boolean;
}

// ── Specific command types ───────────────────────────────────

export type CreateNodeCommand = Command<{
  blockType: string;
  parentId?: string;
  index?: number;
  content?: Partial<BlockContent>;
  style?: Partial<BlockStyle>;
}>;

export type UpdateNodeCommand = Command<{
  id: string;
  path: 'style' | 'content';
  value: Partial<BlockStyle> | Partial<BlockContent>;
}>;

export type DeleteNodeCommand = Command<{
  id: string;
}>;

export type MoveNodeCommand = Command<{
  activeId: string;
  overId: string;
}>;

export type SelectNodeCommand = Command<{
  id: string | null;
}>;

export type ImportNodeCommand = Command<{
  block: Block;
  parentId?: string;
  index?: number;
}>;

export type SetPageMetadataCommand = Command<{
  metadata: Record<string, unknown>;
}>;

export type SnapshotHistoryCommand = Command<{
  label?: string;
}>;

export type UndoCommand = Command<Record<string, never>>;
export type RedoCommand = Command<Record<string, never>>;

// ── Command union ────────────────────────────────────────────

export type BuilderCommand =
  | CreateNodeCommand
  | UpdateNodeCommand
  | DeleteNodeCommand
  | MoveNodeCommand
  | SelectNodeCommand
  | ImportNodeCommand
  | SetPageMetadataCommand
  | SnapshotHistoryCommand
  | UndoCommand
  | RedoCommand;

// ── Handler ──────────────────────────────────────────────────

export interface CommandHandler<C extends Command = Command> {
  type: string;
  execute: (command: C) => void;
  undo?: (command: C) => void;
}

export interface CommandResult {
  success: boolean;
  command: Command;
  error?: string;
}

export interface CommandBusState {
  history: Command[];
  historyIndex: number;
  maxHistory: number;
}
