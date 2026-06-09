import type { Plugin, PluginState, PluginManifest, PluginStatus } from './types';

export class PluginRegistry {
  private states = new Map<string, PluginState>();
  private instances = new Map<string, Plugin>();
  private listeners = new Set<() => void>();

  // ── Registration ──────────────────────────────────────────

  register(plugin: Plugin): PluginState {
    const { id } = plugin.manifest;

    if (this.states.has(id)) {
      console.warn(`[PluginRegistry] Plugin "${id}" is already registered — overwriting`);
    }

    const state: PluginState = {
      manifest: plugin.manifest,
      status: 'registered',
      enabled: true,
    };

    this.states.set(id, state);
    this.instances.set(id, plugin);

    this.notify();
    return state;
  }

  unregister(id: string): boolean {
    const had = this.states.has(id);
    this.states.delete(id);
    this.instances.delete(id);
    if (had) this.notify();
    return had;
  }

  get(id: string): Plugin | undefined {
    return this.instances.get(id);
  }

  getState(id: string): PluginState | undefined {
    return this.states.get(id);
  }

  getAll(): Plugin[] {
    return Array.from(this.instances.values());
  }

  getAllStates(): PluginState[] {
    return Array.from(this.states.values());
  }

  has(id: string): boolean {
    return this.states.has(id);
  }

  // ── State updates ─────────────────────────────────────────

  setStatus(id: string, status: PluginStatus, error?: string): void {
    const state = this.states.get(id);
    if (state) {
      state.status = status;
      if (error) state.error = error;
      if (status === 'ready') state.loadedAt = Date.now();
      this.notify();
    }
  }

  setEnabled(id: string, enabled: boolean): void {
    const state = this.states.get(id);
    if (state) {
      state.enabled = enabled;
      this.notify();
    }
  }

  // ── Dependency resolution ─────────────────────────────────

  resolveDependencies(pluginId: string): { missing: string[]; order: string[] } {
    const missing: string[] = [];
    const order: string[] = [];
    const visited = new Set<string>();

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const plugin = this.instances.get(id);
      if (!plugin) {
        missing.push(id);
        return;
      }

      const deps = plugin.manifest.dependencies || [];
      for (const dep of deps) {
        visit(dep);
      }
      order.push(id);
    };

    visit(pluginId);
    return { missing, order };
  }

  checkDependencies(pluginId: string): string[] {
    return this.resolveDependencies(pluginId).missing;
  }

  // ── Subscription (for UI reactivity) ──────────────────────

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('[PluginRegistry] Listener error:', err);
      }
    }
  }

  // ── Query ─────────────────────────────────────────────────

  findByStatus(status: PluginStatus): PluginState[] {
    return this.getAllStates().filter((s) => s.status === status);
  }

  getEnabled(): PluginState[] {
    return this.getAllStates().filter((s) => s.enabled);
  }

  getReady(): PluginState[] {
    return this.getAllStates().filter((s) => s.status === 'ready');
  }

  // ── Cleanup ───────────────────────────────────────────────

  clear(): void {
    this.states.clear();
    this.instances.clear();
    this.listeners.clear();
  }

  get size(): number {
    return this.states.size;
  }
}
