import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { DataSource, DataSourceState, ResolvedData, DataEvent } from './types';
import { fetchApiSource, getStaticSource, getContextSource, getRefreshInterval } from './sources';
import { resolveDeep } from './parse';
import { eventBus } from '@/engine/events/bus';

interface DataBindingsStore {
  sources: Record<string, DataSourceState>;
  context: ResolvedData;
  listeners: Array<(event: DataEvent) => void>;
  refreshTimers: Record<string, ReturnType<typeof setInterval>>;

  registerSource: (source: DataSource) => string;
  removeSource: (id: string) => void;
  getSource: (id: string) => DataSourceState | undefined;
  refreshSource: (id: string) => Promise<void>;

  setContext: (context: ResolvedData) => void;
  updateContext: (path: string, value: unknown) => void;

  resolveBlockData: (blockData: Record<string, unknown>, sourceId?: string) => Record<string, unknown>;

  subscribe: (listener: (event: DataEvent) => void) => () => void;
  emit: (event: DataEvent) => void;

  destroy: () => void;
}

export const useDataStore = create<DataBindingsStore>((set, get) => ({
  sources: {},
  context: {
    page: {},
    user: {},
    project: {},
  },
  listeners: [],
  refreshTimers: {},

  registerSource: (source) => {
    const id = uuidv4();
    const state: DataSourceState = {
      id,
      source,
      status: 'idle',
      data: null,
      error: null,
      lastRefreshed: null,
    };

    set((s) => ({
      sources: { ...s.sources, [id]: state },
    }));

    // Eagerly resolve static/context sources
    if (source.type === 'static') {
      const resolved = getStaticSource(state);
      set((s) => ({
        sources: { ...s.sources, [id]: resolved },
      }));
      get().emit({ type: 'data:loaded', sourceId: id, payload: resolved.data });
    }

    if (source.type === 'context') {
      const resolved = getContextSource(state, get().context);
      set((s) => ({
        sources: { ...s.sources, [id]: resolved },
      }));
      get().emit({ type: 'data:loaded', sourceId: id, payload: resolved.data });
    }

    if (source.type === 'api') {
      // Start refresh interval if configured
      const interval = getRefreshInterval(state);
      if (interval) {
        const timer = setInterval(() => {
          get().refreshSource(id);
        }, interval);
        set((s) => ({
          refreshTimers: { ...s.refreshTimers, [id]: timer },
        }));
      }
    }

    eventBus.emit('data:source:registered', { sourceId: id, source });
    return id;
  },

  removeSource: (id) => {
    const { refreshTimers } = get();
    if (refreshTimers[id]) {
      clearInterval(refreshTimers[id]);
    }
    set((s) => {
      const { [id]: _, ...rest } = s.sources;
      const { [id]: __, ...restTimers } = s.refreshTimers;
      return { sources: rest, refreshTimers: restTimers };
    });
    eventBus.emit('data:source:removed', { sourceId: id });
  },

  getSource: (id) => {
    return get().sources[id];
  },

  refreshSource: async (id) => {
    const source = get().sources[id];
    if (!source || source.source.type !== 'api') return;

    set((s) => ({
      sources: {
        ...s.sources,
        [id]: { ...s.sources[id], status: 'loading' },
      },
    }));

    const result = await fetchApiSource({
      ...source,
      status: 'loading',
    });

    set((s) => ({
      sources: { ...s.sources, [id]: result },
    }));

    if (result.status === 'ready') {
      get().emit({ type: 'data:loaded', sourceId: id, payload: result.data });
      get().emit({ type: 'data:refreshed', sourceId: id, payload: result.data });
    } else {
      get().emit({ type: 'data:error', sourceId: id, payload: result.error });
    }
  },

  setContext: (context) => {
    set({ context });
    // Re-resolve all context sources
    const { sources } = get();
    for (const [id, source] of Object.entries(sources)) {
      if (source.source.type === 'context') {
        const resolved = getContextSource(source, context);
        set((s) => ({
          sources: { ...s.sources, [id]: resolved },
        }));
      }
    }
    eventBus.emit('context:updated', { path: '', value: context });
  },

  updateContext: (path, value) => {
    set((state) => {
      const newContext = { ...state.context };
      const parts = path.split('.');
      let current = newContext;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
          current[parts[i]] = {};
        }
        current = current[parts[i]] as Record<string, unknown>;
      }
      current[parts[parts.length - 1]] = value;
      return { context: newContext };
    });
    eventBus.emit('context:updated', { path, value });
  },

  resolveBlockData: (blockData, sourceId) => {
    if (!sourceId) {
      // No source — just resolve templates against context
      return resolveDeep(blockData, get().context) as Record<string, unknown>;
    }

    const source = get().sources[sourceId];
    if (!source || !source.data) {
      return blockData;
    }

    const mergedData = { ...get().context, ...source.data };
    return resolveDeep(blockData, mergedData) as Record<string, unknown>;
  },

  subscribe: (listener) => {
    set((state) => ({
      listeners: [...state.listeners, listener],
    }));
    return () => {
      set((state) => ({
        listeners: state.listeners.filter((l) => l !== listener),
      }));
    };
  },

  emit: (event) => {
    get().listeners.forEach((l) => l(event));
    // Forward to global event bus
    if (event.type === 'data:loaded') {
      eventBus.emit('data:loaded', { sourceId: event.sourceId!, data: event.payload as ResolvedData | null });
    } else if (event.type === 'data:error') {
      eventBus.emit('data:error', { sourceId: event.sourceId!, error: String(event.payload) });
    } else if (event.type === 'data:refreshed') {
      eventBus.emit('data:refreshed', { sourceId: event.sourceId!, data: event.payload as ResolvedData | null });
    } else if (event.type === 'binding:updated') {
      eventBus.emit('binding:updated', { blockId: '', sourceId: event.sourceId || '', mapping: {} });
    }
  },

  destroy: () => {
    const { refreshTimers } = get();
    Object.values(refreshTimers).forEach(clearInterval);
    set({ sources: {}, refreshTimers: {}, listeners: [] });
  },
}));
