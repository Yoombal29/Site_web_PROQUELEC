import type { Block } from '@/types/builder';
import type { DataSource, DataBinding } from '@/engine/data/types';
import { useDataStore } from '@/engine/data/store';

export interface BindingLoadResult {
  registeredSources: number;
  bindingsDetected: number;
  errors: string[];
}

function extractBindings(block: Block, results: BindingLoadResult): void {
  if (block.dataSource) {
    try {
      const store = useDataStore.getState();
      store.registerSource(block.dataSource);
      results.registeredSources++;
    } catch (err) {
      results.errors.push(
        `Failed to register source on block ${block.id}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  if (block.bindings) {
    results.bindingsDetected++;
  }

  if (block.children && block.children.length > 0) {
    for (const child of block.children) {
      extractBindings(child, results);
    }
  }
}

export function loadBlockBindings(blocks: Block[]): BindingLoadResult {
  const result: BindingLoadResult = {
    registeredSources: 0,
    bindingsDetected: 0,
    errors: [],
  };

  for (const block of blocks) {
    extractBindings(block, result);
  }

  return result;
}

export function setBindingContext(context: Record<string, unknown>): void {
  try {
    const store = useDataStore.getState();
    store.setContext(context as Record<string, unknown>);
  } catch (err) {
    console.error('[BindingLoader] Failed to set context:', err);
  }
}
