import type { Block, BlockStyle, BlockContent } from '@/types/builder';
import type { DataSource, ResolvedData } from '@/engine/data/types';
import type { Breakpoint, ComputedNode } from '@/engine/layout/types';
import type { HistorySnapshot } from '@/engine/history/types';

// ── Payload types ────────────────────────────────────────────

export interface BlockCreatedPayload {
  block: Block;
  parentId?: string;
  index?: number;
}

export interface BlockUpdatedPayload {
  id: string;
  path: 'style' | 'content';
  previous: Partial<BlockStyle> | Partial<BlockContent>;
  next: Partial<BlockStyle> | Partial<BlockContent>;
}

export interface BlockDeletedPayload {
  id: string;
  block: Block;
  parentId?: string;
  index?: number;
}

export interface BlockMovedPayload {
  activeId: string;
  overId: string;
  previousIndex: number;
  newIndex: number;
}

export interface BlockSelectedPayload {
  id: string | null;
  previousId: string | null;
}

export interface BlockImportedPayload {
  block: Block;
  parentId?: string;
  index?: number;
}

export interface PageMetadataUpdatedPayload {
  previous: Record<string, unknown>;
  next: Record<string, unknown>;
}

export interface HistorySnapshotCreatedPayload {
  snapshot: HistorySnapshot;
  blocksCount: number;
}

export interface HistoryUndoRedoPayload {
  fromIndex: number;
  toIndex: number;
}

export interface HistoryJumpPayload {
  fromIndex: number;
  toIndex: number;
}

export interface HistoryClearedPayload {
  previousCount: number;
}

export interface ExportStartedPayload {
  format: 'react' | 'html' | 'json';
  blocksCount: number;
  enhanced: boolean;
}

export interface ExportCompletedPayload {
  format: 'react' | 'html' | 'json';
  output: string;
  size: number;
}

export interface ExportErrorPayload {
  format: string;
  error: string;
}

export interface AIGenerationStartedPayload {
  prompt: string;
  mode: string;
}

export interface AIGenerationCompletedPayload {
  prompt: string;
  blocks: number;
}

export interface AIGenerationErrorPayload {
  prompt: string;
  error: string;
}

export interface DataSourceRegisteredPayload {
  sourceId: string;
  source: DataSource;
}

export interface DataSourceRemovedPayload {
  sourceId: string;
}

export interface DataLoadedPayload {
  sourceId: string;
  data: ResolvedData | null;
}

export interface DataErrorPayload {
  sourceId: string;
  error: string;
}

export interface DataRefreshedPayload {
  sourceId: string;
  data: ResolvedData | null;
}

export interface BindingUpdatedPayload {
  blockId: string;
  sourceId: string;
  mapping: Record<string, string>;
}

export interface ContextUpdatedPayload {
  path: string;
  value: unknown;
}

export interface LayoutChangedPayload {
  blocks: Block[];
  computedNodes: ComputedNode[];
}

export interface BreakpointChangedPayload {
  previous: Breakpoint;
  next: Breakpoint;
  width: number;
}

export interface TemplateSavedPayload {
  name: string;
  blocksCount: number;
}

export interface TemplateDeletedPayload {
  id: string;
  name: string;
}

export interface StateChangedPayload {
  action: string;
  timestamp: number;
}

export interface ErrorPayload {
  source: string;
  message: string;
  error?: unknown;
}

export interface ValidationFailedPayload {
  mode: string;
  errors: import('@/engine/validation/types').ValidationIssue[];
  warnings?: import('@/engine/validation/types').ValidationIssue[];
}

export interface ValidationPassedPayload {
  mode: string;
  warnings: import('@/engine/validation/types').ValidationIssue[];
}

export interface RuntimeReadyPayload {
  schemaVersion: number;
  blocksCount: number;
  hydrationTimeMs: number;
}

export interface RuntimeErrorPayload {
  message: string;
  schemaVersion?: number;
  blocksCount?: number;
}

export interface SaveStartedPayload {
  patchesCount: number;
  timestamp: number;
}

export interface SaveCompletedPayload {
  patchesCount: number;
  timestamp: number;
  durationMs?: number;
}

export interface SaveFailedPayload {
  patchesCount: number;
  retryCount: number;
  error: string;
}

// ── Event map ────────────────────────────────────────────────

export interface BuilderEventMap {
  'block:created': BlockCreatedPayload;
  'block:updated': BlockUpdatedPayload;
  'block:deleted': BlockDeletedPayload;
  'block:moved': BlockMovedPayload;
  'block:selected': BlockSelectedPayload;
  'block:imported': BlockImportedPayload;

  'page:metadata:updated': PageMetadataUpdatedPayload;

  'history:snapshot:created': HistorySnapshotCreatedPayload;
  'history:undo': HistoryUndoRedoPayload;
  'history:redo': HistoryUndoRedoPayload;
  'history:jump': HistoryJumpPayload;
  'history:cleared': HistoryClearedPayload;

  'export:started': ExportStartedPayload;
  'export:completed': ExportCompletedPayload;
  'export:error': ExportErrorPayload;

  'ai:generation:started': AIGenerationStartedPayload;
  'ai:generation:completed': AIGenerationCompletedPayload;
  'ai:generation:error': AIGenerationErrorPayload;

  'data:source:registered': DataSourceRegisteredPayload;
  'data:source:removed': DataSourceRemovedPayload;
  'data:loaded': DataLoadedPayload;
  'data:error': DataErrorPayload;
  'data:refreshed': DataRefreshedPayload;
  'binding:updated': BindingUpdatedPayload;
  'context:updated': ContextUpdatedPayload;

  'layout:changed': LayoutChangedPayload;
  'breakpoint:changed': BreakpointChangedPayload;

  'template:saved': TemplateSavedPayload;
  'template:deleted': TemplateDeletedPayload;

  'state:changed': StateChangedPayload;
  'error': ErrorPayload;

  'validation:failed': ValidationFailedPayload;
  'validation:passed': ValidationPassedPayload;

  'runtime:ready': RuntimeReadyPayload;
  'runtime:error': RuntimeErrorPayload;

  'save:started': SaveStartedPayload;
  'save:completed': SaveCompletedPayload;
  'save:failed': SaveFailedPayload;
}

export type BuilderEventName = keyof BuilderEventMap;

export type BuilderEventPayload<E extends BuilderEventName> = BuilderEventMap[E];

// ── Event Bus types ──────────────────────────────────────────

export type EventHandler<E extends BuilderEventName = BuilderEventName> = (
  payload: BuilderEventMap[E],
  eventName: E,
) => void;

export interface EventSubscription {
  unsubscribe: () => void;
}

export interface EventMiddleware {
  (eventName: BuilderEventName, payload: unknown, next: () => void): void;
}

export type WildcardHandler = (
  payload: BuilderEventMap[BuilderEventName],
  eventName: BuilderEventName,
) => void;
