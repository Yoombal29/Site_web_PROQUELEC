import { useRuntimeStore } from '@/engine/runtime/store';
import type { HydrationStatus } from './types';

let _hydrationInitCalled = false;

export function initRuntimeStatus(): void {
  if (_hydrationInitCalled) return;
  _hydrationInitCalled = true;

  useRuntimeStore.getState().setHydrationStatus?.('idle');
  console.info('[RuntimeLoader] Runtime status machine initialized');
}

export function setStatus(status: HydrationStatus): void {
  const store = useRuntimeStore.getState();
  if (store.setHydrationStatus) {
    store.setHydrationStatus(status);
  }
}

export function setHydrationMetrics(metrics: { totalBlocks: number; totalPlugins: number; totalBindings: number; hydrationTimeMs: number }): void {
  const store = useRuntimeStore.getState();
  if (store.setHydrationMetrics) {
    store.setHydrationMetrics(metrics);
  }
}

export function setHydrationError(error: string): void {
  const store = useRuntimeStore.getState();
  if (store.setHydrationError) {
    store.setHydrationError(error);
  }
}
