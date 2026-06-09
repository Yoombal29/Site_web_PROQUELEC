import type { BuilderEventName, BuilderEventMap, EventHandler } from '@/engine/events/types';
import type { Command, CommandHandler, CommandResult } from '@/engine/commands/types';

// ── Plugin manifest ─────────────────────────────────────────

export interface PluginManifest {
  /** Unique plugin ID (e.g. "analytics", "seo") */
  id: string;
  /** Display name */
  name: string;
  /** Semver version */
  version: string;
  /** Short description */
  description?: string;
  /** Author */
  author?: string;
  /** Plugin dependencies (IDs) */
  dependencies?: string[];
  /** URL for docs/issues */
  homepage?: string;
  /** License identifier */
  license?: string;
}

// ── Plugin capabilities ─────────────────────────────────────

export interface PluginEventSubscription {
  event: BuilderEventName | string;
  handler: EventHandler<any>;
}

export interface PluginCommandHandler {
  type: string;
  execute: (command: Command) => void;
  undo?: (command: Command) => void;
}

export interface PluginPanelRegistration {
  /** Panel ID (e.g. "seo-panel") */
  id: string;
  /** Display label */
  label: string;
  /** Icon name (lucide icon) */
  icon?: string;
  /** Position in the UI */
  position: 'sidebar' | 'right-panel' | 'toolbar' | 'modal' | 'tab';
  /** React component path (for dynamic import) or component reference */
  component: string | (() => Promise<{ default: React.ComponentType<any> }>);
  /** Optional ordering weight */
  weight?: number;
}

export interface PluginToolbarAction {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  /** Keyboard shortcut (e.g. "Alt+A") */
  shortcut?: string;
  /** Show only when condition is met */
  when?: 'always' | 'block-selected' | 'page-editing';
}

// ── Main Plugin interface ───────────────────────────────────

export interface Plugin {
  /** Static manifest */
  manifest: PluginManifest;

  // ── Lifecycle ────────────────────────────────────────────
  /** Called when plugin is loaded */
  init?: (context: PluginContext) => void | Promise<void>;
  /** Called when plugin is unloaded */
  destroy?: () => void | Promise<void>;

  // ── Declarative registrations ────────────────────────────
  /** Events to subscribe to */
  events?: PluginEventSubscription[];
  /** Commands to register */
  commands?: PluginCommandHandler[];
  /** UI panels to add */
  panels?: PluginPanelRegistration[];
  /** Toolbar actions to add */
  toolbarActions?: PluginToolbarAction[];
}

// ── Plugin state ────────────────────────────────────────────

export type PluginStatus = 'registered' | 'loading' | 'ready' | 'error' | 'disabled';

export interface PluginState {
  manifest: PluginManifest;
  status: PluginStatus;
  error?: string;
  /** Whether the plugin is allowed to run */
  enabled: boolean;
  /** Timestamps */
  loadedAt?: number;
}

// ── Plugin context (passed to init) ─────────────────────────

export interface PluginContext {
  /** Plugin's own manifest */
  manifest: PluginManifest;

  // ── Event Bus API ────────────────────────────────────────
  onEvent: <E extends BuilderEventName>(
    event: E,
    handler: EventHandler<E>,
  ) => () => void;
  emitEvent: <E extends BuilderEventName>(
    event: E,
    payload: BuilderEventMap[E],
  ) => void;

  // ── Command Bus API ──────────────────────────────────────
  executeCommand: (command: Command) => CommandResult;
  registerCommand: (handler: PluginCommandHandler) => void;
  unregisterCommand: (type: string) => void;

  // ── Store access ─────────────────────────────────────────
  getBuilderStore: () => typeof import('@/stores/useBuilderStore').useBuilderStore;
  getHistoryStore: () => typeof import('@/stores/useHistoryStore').useHistoryStore;
  getDataStore: () => typeof import('@/engine/data/store').useDataStore;

  // ── Plugin management ────────────────────────────────────
  getPluginState: (pluginId: string) => PluginState | undefined;
  listPlugins: () => PluginState[];

  // ── Utilities ────────────────────────────────────────────
  logger: PluginLogger;
}

export interface PluginLogger {
  info: (msg: string, ...args: unknown[]) => void;
  warn: (msg: string, ...args: unknown[]) => void;
  error: (msg: string, ...args: unknown[]) => void;
  debug: (msg: string, ...args: unknown[]) => void;
}

// ── Plugin registry state ───────────────────────────────────

export interface PluginRegistryState {
  plugins: Map<string, PluginState>;
  instances: Map<string, Plugin>;
  /** Callbacks for UI updates */
  listeners: Array<() => void>;
}
