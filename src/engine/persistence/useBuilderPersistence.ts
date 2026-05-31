import { useCallback } from 'react';
import { apiFetch } from '../../lib/api-client';
import { useValidationRuntime } from '../validation/runtime-validator';
import { eventBus } from '../events/event-bus';
import type { BlockNode } from '../validation/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BuilderSnapshot {
  id: string;
  page_id: string;
  label: string;
  snapshot: unknown;
  snapshot_type: 'manual' | 'auto' | 'publish' | 'ai_generated' | 'collaboration_merge';
  metadata: Record<string, unknown>;
  created_by?: string;
  created_at: string;
}

export interface BuilderTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  preview_image?: string;
  blocks: unknown[];
  layout_tree: unknown[];
  theme_config: Record<string, unknown>;
  animation_config: Record<string, unknown>;
  tags: string[];
  is_system: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface BuilderBinding {
  id: string;
  page_id: string;
  node_id: string;
  source_type: 'api' | 'query' | 'static' | 'context' | 'store';
  source_config: Record<string, unknown>;
  mapping: Record<string, unknown>;
  refresh_interval: number;
  is_active: boolean;
}

export interface BuilderPlugin {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  version: string;
  enabled: boolean;
  config: Record<string, unknown>;
  dependencies: string[];
  load_order: number;
}

export interface BuilderExport {
  id: string;
  page_id: string;
  snapshot_id?: string;
  format: 'react' | 'html' | 'json' | 'pdf';
  output_path?: string;
  output_size?: number;
  content_hash?: string;
  metadata: Record<string, unknown>;
  generated_at: string;
}

export interface BuilderCollaboration {
  page_id: string;
  ydoc_state?: string;
  awareness: Record<string, unknown>;
  last_synced_at?: string;
  connected_peers: number;
}

// ─── Snapshots ───────────────────────────────────────────────────────────────

export function useBuilderSnapshots(pageId: string) {
  const list = useCallback(async () => {
    return apiFetch<BuilderSnapshot[]>(`/api/builder/pages/${pageId}/snapshots`);
  }, [pageId]);

  const get = useCallback(async (snapshotId: string) => {
    return apiFetch<BuilderSnapshot>(`/api/builder/snapshots/${snapshotId}`);
  }, []);

  const create = useCallback(async (data: {
    label: string;
    snapshot: unknown;
    snapshot_type?: string;
    metadata?: Record<string, unknown>;
  }) => {
    return apiFetch<BuilderSnapshot>(`/api/builder/pages/${pageId}/snapshots`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [pageId]);

  const remove = useCallback(async (snapshotId: string) => {
    await apiFetch<void>(`/api/builder/snapshots/${snapshotId}`, { method: 'DELETE' });
  }, []);

  return { list, get, create, remove };
}

// ─── Templates ───────────────────────────────────────────────────────────────

export function useBuilderTemplates() {
  const list = useCallback(async (params?: { category?: string; tags?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.tags) query.set('tags', params.tags);
    const qs = query.toString();
    return apiFetch<BuilderTemplate[]>(`/api/builder/templates${qs ? `?${qs}` : ''}`);
  }, []);

  const get = useCallback(async (templateId: string) => {
    return apiFetch<BuilderTemplate>(`/api/builder/templates/${templateId}`);
  }, []);

  const create = useCallback(async (data: Partial<BuilderTemplate>) => {
    return apiFetch<BuilderTemplate>('/api/builder/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, []);

  const update = useCallback(async (templateId: string, data: Partial<BuilderTemplate>) => {
    return apiFetch<BuilderTemplate>(`/api/builder/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, []);

  const remove = useCallback(async (templateId: string) => {
    await apiFetch<void>(`/api/builder/templates/${templateId}`, { method: 'DELETE' });
  }, []);

  return { list, get, create, update, remove };
}

// ─── Bindings ────────────────────────────────────────────────────────────────

export function useBuilderBindings(pageId: string) {
  const list = useCallback(async () => {
    return apiFetch<BuilderBinding[]>(`/api/builder/pages/${pageId}/bindings`);
  }, [pageId]);

  const create = useCallback(async (data: {
    node_id: string;
    source_type: BuilderBinding['source_type'];
    source_config?: Record<string, unknown>;
    mapping?: Record<string, unknown>;
    refresh_interval?: number;
  }) => {
    return apiFetch<BuilderBinding>(`/api/builder/pages/${pageId}/bindings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [pageId]);

  const update = useCallback(async (bindingId: string, data: Partial<BuilderBinding>) => {
    return apiFetch<BuilderBinding>(`/api/builder/bindings/${bindingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, []);

  const remove = useCallback(async (bindingId: string) => {
    await apiFetch<void>(`/api/builder/bindings/${bindingId}`, { method: 'DELETE' });
  }, []);

  return { list, create, update, remove };
}

// ─── Plugins ─────────────────────────────────────────────────────────────────

export function useBuilderPlugins() {
  const list = useCallback(async (enabled?: boolean) => {
    const qs = enabled !== undefined ? `?enabled=${enabled}` : '';
    return apiFetch<BuilderPlugin[]>(`/api/builder/plugins${qs}`);
  }, []);

  const get = useCallback(async (name: string) => {
    return apiFetch<BuilderPlugin>(`/api/builder/plugins/${name}`);
  }, []);

  const register = useCallback(async (data: Partial<BuilderPlugin>) => {
    return apiFetch<BuilderPlugin>('/api/builder/plugins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, []);

  const toggle = useCallback(async (name: string, enabled: boolean) => {
    return apiFetch<BuilderPlugin>(`/api/builder/plugins/${name}/toggle`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
  }, []);

  return { list, get, register, toggle };
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export function useBuilderExports(pageId: string) {
  const list = useCallback(async () => {
    return apiFetch<BuilderExport[]>(`/api/builder/pages/${pageId}/exports`);
  }, [pageId]);

  const create = useCallback(async (data: {
    format: BuilderExport['format'];
    snapshot_id?: string;
    output_path?: string;
    metadata?: Record<string, unknown>;
  }) => {
    return apiFetch<BuilderExport>(`/api/builder/pages/${pageId}/exports`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [pageId]);

  return { list, create };
}

// ─── Collaboration ───────────────────────────────────────────────────────────

export function useBuilderCollaboration(pageId: string) {
  const get = useCallback(async () => {
    return apiFetch<BuilderCollaboration>(`/api/builder/pages/${pageId}/collaboration`);
  }, [pageId]);

  const update = useCallback(async (data: {
    ydoc_state?: string;
    awareness?: Record<string, unknown>;
  }) => {
    return apiFetch<BuilderCollaboration>(`/api/builder/pages/${pageId}/collaboration`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, [pageId]);

  return { get, update };
}

// ─── Page Builder Fields ─────────────────────────────────────────────────────

export function usePageBuilderFields(pageId: string) {
  const update = useCallback(async (data: {
    layout_tree?: unknown[];
    theme_config?: Record<string, unknown>;
    bindings?: unknown[];
    animation_config?: Record<string, unknown>;
    published_snapshot_id?: string;
  }) => {
    return apiFetch<Record<string, unknown>>(`/api/builder/pages/${pageId}/builder-fields`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, [pageId]);

  return { update };
}
