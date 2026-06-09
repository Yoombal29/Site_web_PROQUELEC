import type { Plugin, PluginManifest } from '@/engine/plugins/types';
import type { PluginContext } from '@/engine/plugins/types';
import { PluginRegistry } from '@/engine/plugins/registry';
import { PluginManager } from '@/engine/plugins/manager';

let _pluginManager: PluginManager | null = null;

export function setPluginManager(manager: PluginManager): void {
  _pluginManager = manager;
}

function getManager(): PluginManager {
  if (_pluginManager) return _pluginManager;
  const registry = new PluginRegistry();
  const manager = new PluginManager(registry);
  manager.init();
  _pluginManager = manager;
  return manager;
}

export interface PluginLoadResult {
  loaded: string[];
  failed: string[];
  skipped: string[];
}

export async function loadPagePlugins(plugins: Plugin[]): Promise<PluginLoadResult> {
  const manager = getManager();
  const result: PluginLoadResult = { loaded: [], failed: [], skipped: [] };

  for (const plugin of plugins) {
    const id = plugin.manifest?.id;
    if (!id) {
      result.failed.push('unknown (missing manifest.id)');
      continue;
    }

    if (manager['registry']?.has?.(id)) {
      result.skipped.push(id);
      continue;
    }

    try {
      const ok = await manager.load(plugin);
      if (ok) {
        result.loaded.push(id);
      } else {
        result.failed.push(id);
      }
    } catch (err) {
      console.error(`[PluginLoader] Failed to load plugin "${id}":`, err);
      result.failed.push(id);
    }
  }

  return result;
}

export function isPluginLoaded(id: string): boolean {
  return getManager()['registry']?.has?.(id) ?? false;
}
