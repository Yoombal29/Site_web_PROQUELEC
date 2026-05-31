import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DataSourceConfig {
  id: string;
  name: string;
  type: 'api' | 'static' | 'query';
  endpoint?: string;
  headers?: Record<string, string>;
  refreshInterval?: number;
  data?: any;
  transform?: string;
}

interface DynamicDataState {
  sources: DataSourceConfig[];
  cache: Record<string, { data: any; expiresAt: number }>;
  addSource: (source: Omit<DataSourceConfig, 'id'>) => void;
  removeSource: (id: string) => void;
  updateSource: (id: string, updates: Partial<DataSourceConfig>) => void;
  setCache: (sourceId: string, data: any) => void;
  getCached: (sourceId: string) => any;
  fetchSource: (sourceId: string) => Promise<any>;
  clearCache: () => void;
}

export const useDynamicDataStore = create<DynamicDataState>()(
  persist(
    (set, get) => ({
      sources: [],
      cache: {},
      addSource: (source) => set((s) => ({
        sources: [...s.sources, { ...source, id: 'ds_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4) }],
      })),
      removeSource: (id) => set((s) => ({
        sources: s.sources.filter((src) => src.id !== id),
      })),
      updateSource: (id, updates) => set((s) => ({
        sources: s.sources.map((src) => src.id === id ? { ...src, ...updates } : src),
      })),
      setCache: (sourceId, data) => set((s) => {
        const cfg = s.sources.find((src) => src.id === sourceId);
        return {
          cache: { ...s.cache, [sourceId]: { data, expiresAt: Date.now() + (cfg?.refreshInterval || 0) } },
        };
      }),
      getCached: (sourceId) => {
        const entry = get().cache[sourceId];
        if (!entry) return null;
        if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) return null;
        return entry.data;
      },
      fetchSource: async (sourceId) => {
        const source = get().sources.find((src) => src.id === sourceId);
        if (!source || source.type !== 'api') return null;
        const cached = get().getCached(sourceId);
        if (cached !== null) return cached;
        try {
          const res = await fetch(source.endpoint || '', {
            headers: { 'Accept': 'application/json', ...(source.headers || {}) },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          get().setCache(sourceId, data);
          return data;
        } catch (err: any) {
          console.error(`[DynamicData] fetch error for ${source.name}:`, err);
          return null;
        }
      },
      clearCache: () => set({ cache: {} }),
    }),
    { name: 'proquelec-dynamic-data', partialize: (state) => ({ sources: state.sources }) }
  )
);
