import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Plugin, PluginState } from '../types';
import { PluginRegistry } from '../registry';
import { PluginManager } from '../manager';

// ── Mocks ───────────────────────────────────────────────────

vi.mock('@/engine/events/bus', () => ({
  eventBus: {
    on: vi.fn(() => vi.fn()),
    emit: vi.fn(),
  },
}));

vi.mock('@/engine/events/init', () => ({
  commandRegistry: {
    register: vi.fn(),
    unregister: vi.fn(),
    getHandler: vi.fn(),
  },
  commandBus: {
    execute: vi.fn(() => ({ success: true, command: { type: 'mock' } })),
  },
}));

vi.mock('@/stores/useBuilderStore', () => ({
  useBuilderStore: { getState: vi.fn(), setState: vi.fn(), subscribe: vi.fn() },
}));

vi.mock('@/stores/useHistoryStore', () => ({
  useHistoryStore: { getState: vi.fn(), setState: vi.fn() },
}));

vi.mock('@/engine/data/store', () => ({
  useDataStore: { getState: vi.fn(), setState: vi.fn() },
}));

// ── Helpers ─────────────────────────────────────────────────

function createMockPlugin(id: string, overrides: Partial<Plugin> = {}): Plugin {
  return {
    manifest: {
      id,
      name: `Plugin ${id}`,
      version: '1.0.0',
      description: `Test plugin ${id}`,
      author: 'Test',
    },
    init: vi.fn(),
    destroy: vi.fn(),
    events: [],
    commands: [],
    panels: [],
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────

describe('PluginRegistry', () => {
  let registry: PluginRegistry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  it('should register a plugin', () => {
    const plugin = createMockPlugin('test-plugin');
    const state = registry.register(plugin);

    expect(state.status).toBe('registered');
    expect(state.enabled).toBe(true);
    expect(registry.has('test-plugin')).toBe(true);
    expect(registry.size).toBe(1);
  });

  it('should unregister a plugin', () => {
    const plugin = createMockPlugin('test-plugin');
    registry.register(plugin);
    expect(registry.unregister('test-plugin')).toBe(true);
    expect(registry.has('test-plugin')).toBe(false);
    expect(registry.size).toBe(0);
  });

  it('should return false when unregistering unknown plugin', () => {
    expect(registry.unregister('nonexistent')).toBe(false);
  });

  it('should get a plugin by id', () => {
    const plugin = createMockPlugin('test-plugin');
    registry.register(plugin);
    expect(registry.get('test-plugin')?.manifest.id).toBe('test-plugin');
  });

  it('should get plugin state', () => {
    const plugin = createMockPlugin('test-plugin');
    registry.register(plugin);
    const state = registry.getState('test-plugin');
    expect(state?.manifest.id).toBe('test-plugin');
    expect(state?.status).toBe('registered');
  });

  it('should return undefined for unknown plugin state', () => {
    expect(registry.getState('nonexistent')).toBeUndefined();
  });

  it('should list all plugins', () => {
    registry.register(createMockPlugin('a'));
    registry.register(createMockPlugin('b'));
    expect(registry.getAll()).toHaveLength(2);
    expect(registry.getAllStates()).toHaveLength(2);
  });

  it('should update plugin status', () => {
    registry.register(createMockPlugin('test'));
    registry.setStatus('test', 'loading');
    expect(registry.getState('test')?.status).toBe('loading');

    registry.setStatus('test', 'ready');
    expect(registry.getState('test')?.status).toBe('ready');
    expect(registry.getState('test')?.loadedAt).toBeDefined();
  });

  it('should set error status with message', () => {
    registry.register(createMockPlugin('test'));
    registry.setStatus('test', 'error', 'Something went wrong');
    expect(registry.getState('test')?.status).toBe('error');
    expect(registry.getState('test')?.error).toBe('Something went wrong');
  });

  it('should enable/disable plugin', () => {
    registry.register(createMockPlugin('test'));
    registry.setEnabled('test', false);
    expect(registry.getState('test')?.enabled).toBe(false);
    expect(registry.getEnabled()).toHaveLength(0);
  });

  it('should find plugins by status', () => {
    registry.register(createMockPlugin('a'));
    registry.register(createMockPlugin('b'));
    registry.setStatus('b', 'ready');
    const ready = registry.findByStatus('ready');
    expect(ready).toHaveLength(1);
    expect(ready[0].manifest.id).toBe('b');
  });

  it('should detect missing dependencies', () => {
    const plugin = createMockPlugin('dependent', {
      manifest: {
        id: 'dependent',
        name: 'Dependent',
        version: '1.0.0',
        dependencies: ['base-plugin'],
      },
    });
    registry.register(plugin);
    const missing = registry.checkDependencies('dependent');
    expect(missing).toContain('base-plugin');
  });

  it('should resolve dependencies correctly', () => {
    const base = createMockPlugin('base');
    const dep = createMockPlugin('dependent', {
      manifest: {
        id: 'dependent',
        name: 'Dependent',
        version: '1.0.0',
        dependencies: ['base'],
      },
    });
    registry.register(base);
    registry.register(dep);

    const { missing, order } = registry.resolveDependencies('dependent');
    expect(missing).toHaveLength(0);
    expect(order).toContain('base');
    expect(order).toContain('dependent');
    // base should come before dependent
    expect(order.indexOf('base')).toBeLessThan(order.indexOf('dependent'));
  });

  it('should notify subscribers on state change', () => {
    const listener = vi.fn();
    registry.subscribe(listener);

    registry.register(createMockPlugin('test'));
    expect(listener).toHaveBeenCalledTimes(1);

    registry.setStatus('test', 'ready');
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should unsubscribe listener', () => {
    const listener = vi.fn();
    const unsub = registry.subscribe(listener);
    unsub();
    registry.register(createMockPlugin('test'));
    expect(listener).not.toHaveBeenCalled();
  });

  it('should clear all plugins', () => {
    registry.register(createMockPlugin('a'));
    registry.register(createMockPlugin('b'));
    registry.clear();
    expect(registry.size).toBe(0);
  });
});

describe('PluginManager', () => {
  let registry: PluginRegistry;
  let manager: PluginManager;

  beforeEach(() => {
    registry = new PluginRegistry();
    manager = new PluginManager(registry);
    vi.clearAllMocks();
  });

  it('should initialize', () => {
    expect(manager.initialized).toBe(false);
    manager.init();
    expect(manager.initialized).toBe(true);
  });

  it('should load a plugin and set status to ready', async () => {
    const plugin = createMockPlugin('test');
    const result = await manager.load(plugin);
    expect(result).toBe(true);

    const state = registry.getState('test');
    expect(state?.status).toBe('ready');
    expect(state?.loadedAt).toBeDefined();
    expect(plugin.init).toHaveBeenCalledTimes(1);
  });

  it('should call init with plugin context', async () => {
    const initFn = vi.fn();
    const plugin = createMockPlugin('test', { init: initFn });
    await manager.load(plugin);

    expect(initFn).toHaveBeenCalledTimes(1);
    const context = initFn.mock.calls[0][0];
    expect(context.manifest.id).toBe('test');
    expect(context.onEvent).toBeDefined();
    expect(context.emitEvent).toBeDefined();
    expect(context.executeCommand).toBeDefined();
    expect(context.registerCommand).toBeDefined();
    expect(context.logger).toBeDefined();
  });

  it('should report error when plugin init throws', async () => {
    const plugin = createMockPlugin('test', {
      init: async () => { throw new Error('Init failed'); },
    });
    const result = await manager.load(plugin);
    expect(result).toBe(false);

    const state = registry.getState('test');
    expect(state?.status).toBe('error');
    expect(state?.error).toBe('Init failed');
  });

  it('should register event subscriptions on load', async () => {
    const handler = vi.fn();
    const plugin = createMockPlugin('test', {
      events: [
        { event: 'block:created', handler },
        { event: 'block:deleted', handler },
      ],
    });

    const { eventBus } = await import('@/engine/events/bus');
    await manager.load(plugin);

    expect(eventBus.on).toHaveBeenCalledTimes(2);
    expect(eventBus.on).toHaveBeenCalledWith('block:created', handler);
    expect(eventBus.on).toHaveBeenCalledWith('block:deleted', handler);
  });

  it('should register commands on load', async () => {
    const execute = vi.fn();
    const plugin = createMockPlugin('test', {
      commands: [
        { type: 'PLUGIN_COMMAND', execute, undo: vi.fn() },
      ],
    });

    const { commandRegistry: cmdReg } = await import('@/engine/events/init');
    await manager.load(plugin);

    expect(cmdReg.register).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'PLUGIN_COMMAND', execute }),
    );
  });

  it('should unload a plugin and clean up', async () => {
    const destroy = vi.fn();
    const plugin = createMockPlugin('test', { destroy });
    await manager.load(plugin);
    expect(registry.getState('test')?.status).toBe('ready');

    const result = await manager.unload('test');
    expect(result).toBe(true);
    expect(destroy).toHaveBeenCalled();
    expect(registry.getState('test')?.status).toBe('registered');
  });

  it('should fail to load when dependencies are missing', async () => {
    const plugin = createMockPlugin('dependent', {
      manifest: {
        id: 'dependent',
        name: 'Dependent',
        version: '1.0.0',
        dependencies: ['missing-base'],
      },
    });
    const result = await manager.load(plugin);
    expect(result).toBe(false);

    const state = registry.getState('dependent');
    expect(state?.status).toBe('error');
    expect(state?.error).toContain('missing-base');
  });

  it('should load plugins in dependency order', async () => {
    const order: string[] = [];
    const basePlugin = createMockPlugin('base', {
      init: async () => { order.push('base'); },
    });
    const depPlugin = createMockPlugin('dep', {
      manifest: {
        id: 'dep',
        name: 'Dep',
        version: '1.0.0',
        dependencies: ['base'],
      },
      init: async () => { order.push('dep'); },
    });

    await manager.loadAll([depPlugin, basePlugin]);
    expect(order).toEqual(['base', 'dep']);
  });

  it('should reload a plugin', async () => {
    const init = vi.fn();
    const destroy = vi.fn();
    const plugin = createMockPlugin('test', { init, destroy });
    await manager.load(plugin);
    expect(init).toHaveBeenCalledTimes(1);

    await manager.reload('test');
    expect(destroy).toHaveBeenCalled();
    expect(init).toHaveBeenCalledTimes(2);
  });

  it('should unload all plugins', async () => {
    const destroyA = vi.fn();
    const destroyB = vi.fn();
    await manager.load(createMockPlugin('a', { destroy: destroyA }));
    await manager.load(createMockPlugin('b', { destroy: destroyB }));

    await manager.unloadAll();
    expect(destroyA).toHaveBeenCalled();
    expect(destroyB).toHaveBeenCalled();
  });

  it('should provide store access via context', async () => {
    const initFn = vi.fn();
    await manager.load(createMockPlugin('test', { init: initFn }));

    const context = initFn.mock.calls[0][0];
    expect(context.getBuilderStore).toBeDefined();
    expect(context.getHistoryStore).toBeDefined();
    expect(context.getDataStore).toBeDefined();
  });

  it('should allow registering commands via context', async () => {
    const initFn = vi.fn();
    await manager.load(createMockPlugin('test', { init: initFn }));

    const context = initFn.mock.calls[0][0];
    const handler = { type: 'PLUGIN_CMD', execute: vi.fn() };

    const { commandRegistry: cmdReg } = await import('@/engine/events/init');
    context.registerCommand(handler);
    expect(cmdReg.register).toHaveBeenCalledWith(expect.objectContaining({
      type: 'PLUGIN_CMD',
      execute: handler.execute,
    }));
  });
});
