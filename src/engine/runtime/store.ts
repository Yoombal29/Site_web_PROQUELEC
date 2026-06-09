import { create } from 'zustand';

export type HydrationStatus =
  | 'idle'
  | 'loading'
  | 'validating'
  | 'normalizing'
  | 'migrating'
  | 'hydrating'
  | 'plugins'
  | 'bindings'
  | 'animations'
  | 'layout'
  | 'ready'
  | 'error';

export interface HydrationMetrics {
  totalBlocks: number;
  totalPlugins: number;
  totalBindings: number;
  hydrationTimeMs: number;
}

export interface RuntimeCapability {
  available: boolean;
  mode: 'real' | 'mock' | 'unavailable';
  maturity: 'experimental' | 'beta' | 'stable' | 'certified';
  warning: string | null;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  owner: string;
  description: string;
}

export interface RuntimeState {
  environment: string;
  mockMode: boolean;
  capabilities: Record<string, RuntimeCapability>;
  featureFlags: FeatureFlag[];
  status: 'ok' | 'degraded' | 'unknown';
  loaded: boolean;

  hydrationStatus: HydrationStatus;
  hydrationMetrics: HydrationMetrics | null;
  hydrationError: string | null;

  load: () => Promise<void>;
  getCapability: (name: string) => RuntimeCapability | undefined;
  isFeatureEnabled: (name: string) => boolean;
  setHydrationStatus: (status: HydrationStatus) => void;
  setHydrationMetrics: (metrics: HydrationMetrics) => void;
  setHydrationError: (error: string) => void;
}

export const useRuntimeStore = create<RuntimeState>((set, get) => ({
  environment: 'development',
  mockMode: true,
  capabilities: {},
  featureFlags: [],
  status: 'unknown',
  loaded: false,

  hydrationStatus: 'idle',
  hydrationMetrics: null,
  hydrationError: null,

  load: async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3010';
      const res = await fetch(`${apiUrl}/api/health`);
      const data = await res.json();

      const capabilitiesMap: Record<string, RuntimeCapability> = {};
      for (const cap of (data.capabilities || [])) {
        capabilitiesMap[cap.key] = {
          available: cap.available,
          mode: cap.mode,
          maturity: cap.maturity,
          warning: cap.warning,
        };
      }

      set({
        environment: data.environment || 'development',
        mockMode: data.mockMode ?? true,
        capabilities: capabilitiesMap,
        featureFlags: data.featureFlags || [],
        status: data.status || 'unknown',
        loaded: true,
      });
    } catch {
      set({
        environment: 'development',
        mockMode: true,
        capabilities: {},
        featureFlags: [],
        status: 'unknown',
        loaded: true,
      });
    }
  },

  getCapability: (name: string) => {
    return get().capabilities[name];
  },

  isFeatureEnabled: (name: string) => {
    const flag = get().featureFlags.find((f) => f.key === name);
    return flag?.enabled ?? false;
  },

  setHydrationStatus: (status: HydrationStatus) => {
    set({ hydrationStatus: status });
  },

  setHydrationMetrics: (metrics: HydrationMetrics) => {
    set({ hydrationMetrics: metrics });
  },

  setHydrationError: (error: string) => {
    set({ hydrationError: error });
  },
}));
