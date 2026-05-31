import type { Plugin, PluginContext, PluginState, PluginLogger, PluginManifest } from './types';
import type { BuilderEventName, EventHandler } from '@/engine/events/types';
import type { Command, CommandResult } from '@/engine/commands/types';
import { eventBus } from '@/engine/events/bus';
import { commandRegistry, commandBus } from '@/engine/events/init';
import { PluginRegistry } from './registry';

// ── Plugin logger factory ───────────────────────────────────

function createLogger(manifest: PluginManifest): PluginLogger {
  const prefix = `[Plugin:${manifest.id}]`;
  return {
    info: (msg, ...args) => console.info(`${prefix} ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`${prefix} ${msg}`, ...args),
    error: (msg, ...args) => console.error(`${prefix} ${msg}`, ...args),
    debug: (msg, ...args) => console.debug(`${prefix} ${msg}`, ...args),
  };
}

// ── PluginManager ───────────────────────────────────────────

export class PluginManager {
  private registry: PluginRegistry;
  private subscriptions = new Map<string, Array<() => void>>();
  private commandTypes = new Map<string, string>(); // commandType → pluginId
  private _initialized = false;

  constructor(registry: PluginRegistry) {
    this.registry = registry;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  // ── Initialize ───────────────────────────────────────────

  init(): void {
    if (this._initialized) return;
    this._initialized = true;
    console.info('[PluginManager] Initialized');
  }

  // ── Load a single plugin ─────────────────────────────────

  async load(plugin: Plugin): Promise<boolean> {
    const { id } = plugin.manifest;

    // Register first so self-reference doesn't count as missing
    if (!this.registry.has(id)) {
      this.registry.register(plugin);
    }

    // Check dependencies (exclude self)
    const missing = (plugin.manifest.dependencies || []).filter(
      (dep) => !this.registry.has(dep),
    );
    if (missing.length > 0) {
      const error = `Missing dependencies: ${missing.join(', ')}`;
      this.registry.setStatus(id, 'error', error);
      console.error(`[PluginManager] Failed to load "${id}": ${error}`);
      return false;
    }

    this.registry.setStatus(id, 'loading');

    try {
      // Build plugin context
      const context = this.buildContext(plugin);

      // Register events
      if (plugin.events) {
        const unsubs: Array<() => void> = [];
        for (const sub of plugin.events) {
          const unsub = eventBus.on(
            sub.event as BuilderEventName,
            sub.handler as EventHandler,
          );
          unsubs.push(unsub);
        }
        this.subscriptions.set(id, unsubs);
      }

      // Register commands
      if (plugin.commands) {
        for (const cmd of plugin.commands) {
          commandRegistry.register({
            type: cmd.type,
            execute: cmd.execute,
            undo: cmd.undo,
          });
          this.commandTypes.set(cmd.type, id);
        }
      }

      // Call plugin init
      if (plugin.init) {
        await plugin.init(context);
      }

      this.registry.setStatus(id, 'ready');
      console.info(`[PluginManager] Loaded plugin "${plugin.manifest.name}" (${id}) v${plugin.manifest.version}`);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.registry.setStatus(id, 'error', message);
      console.error(`[PluginManager] Error loading plugin "${id}":`, err);
      return false;
    }
  }

  // ── Unload a plugin ──────────────────────────────────────

  async unload(pluginId: string): Promise<boolean> {
    const plugin = this.registry.get(pluginId);
    if (!plugin) return false;

    try {
      // Call plugin destroy
      if (plugin.destroy) {
        await plugin.destroy();
      }

      // Unsubscribe events
      const unsubs = this.subscriptions.get(pluginId);
      if (unsubs) {
        for (const unsub of unsubs) unsub();
        this.subscriptions.delete(pluginId);
      }

      // Unregister commands
      for (const [cmdType, pid] of this.commandTypes.entries()) {
        if (pid === pluginId) {
          commandRegistry.unregister(cmdType);
          this.commandTypes.delete(cmdType);
        }
      }

      this.registry.setStatus(pluginId, 'registered');
      console.info(`[PluginManager] Unloaded plugin "${pluginId}"`);
      return true;
    } catch (err) {
      console.error(`[PluginManager] Error unloading plugin "${pluginId}":`, err);
      return false;
    }
  }

  // ── Load multiple plugins ────────────────────────────────

  async loadAll(plugins: Plugin[]): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    // Sort by dependency order
    const sorted = this.topologicalSort(plugins);

    for (const plugin of sorted) {
      const ok = await this.load(plugin);
      if (ok) success.push(plugin.manifest.id);
      else failed.push(plugin.manifest.id);
    }

    return { success, failed };
  }

  // ── Unload all ───────────────────────────────────────────

  async unloadAll(): Promise<void> {
    const plugins = this.registry.getAll();
    // Unload in reverse dependency order
    const reversed = plugins.reverse();
    for (const plugin of reversed) {
      await this.unload(plugin.manifest.id);
    }
  }

  // ── Reload ───────────────────────────────────────────────

  async reload(pluginId: string): Promise<boolean> {
    await this.unload(pluginId);
    const plugin = this.registry.get(pluginId);
    if (!plugin) return false;
    return this.load(plugin);
  }

  // ── Build plugin context ─────────────────────────────────

  private buildContext(plugin: Plugin): PluginContext {
    const self = this;

    return {
      manifest: plugin.manifest,

      onEvent: (event, handler) => eventBus.on(event, handler),
      emitEvent: (event, payload) => eventBus.emit(event, payload),

      executeCommand: (command: Command) => commandBus.execute(command),

      registerCommand: (handler) => {
        commandRegistry.register({
          type: handler.type,
          execute: handler.execute,
          undo: handler.undo,
        });
        self.commandTypes.set(handler.type, plugin.manifest.id);
      },

      unregisterCommand: (type) => {
        commandRegistry.unregister(type);
        self.commandTypes.delete(type);
      },

      getBuilderStore: () => require('@/stores/useBuilderStore').useBuilderStore,
      getHistoryStore: () => require('@/stores/useHistoryStore').useHistoryStore,
      getDataStore: () => require('@/engine/data/store').useDataStore,

      getPluginState: (pid) => self.registry.getState(pid),
      listPlugins: () => self.registry.getAllStates(),

      logger: createLogger(plugin.manifest),
    };
  }

  // ── Topological sort for dependency ordering ─────────────

  private topologicalSort(plugins: Plugin[]): Plugin[] {
    const visited = new Set<string>();
    const result: Plugin[] = [];
    const pluginMap = new Map(plugins.map((p) => [p.manifest.id, p]));

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const plugin = pluginMap.get(id);
      if (!plugin) return;

      const deps = plugin.manifest.dependencies || [];
      for (const dep of deps) {
        visit(dep);
      }
      result.push(plugin);
    };

    for (const plugin of plugins) {
      visit(plugin.manifest.id);
    }

    return result;
  }

  // ── Access helpers ───────────────────────────────────────

  getRegistry(): PluginRegistry {
    return this.registry;
  }
}
