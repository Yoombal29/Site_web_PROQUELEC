import type { DataSource, DataSourceState, ResolvedData } from './types';

export async function fetchApiSource(source: DataSourceState): Promise<DataSourceState> {
  if (source.source.type !== 'api') return source;

  const api = source.source;
  const url = new URL(api.endpoint, window.location.origin);

  if (api.params) {
    Object.entries(api.params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  try {
    const response = await fetch(url.toString(), {
      method: api.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...api.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API ${api.endpoint} returned ${response.status}`);
    }

    const data = await response.json();

    return {
      ...source,
      status: 'ready',
      data: data as ResolvedData,
      error: null,
      lastRefreshed: Date.now(),
    };
  } catch (err) {
    return {
      ...source,
      status: 'error',
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
      lastRefreshed: null,
    };
  }
}

export function getStaticSource(source: DataSourceState): DataSourceState {
  if (source.source.type !== 'static') return source;
  return {
    ...source,
    status: 'ready',
    data: source.source.data as ResolvedData,
    error: null,
    lastRefreshed: Date.now(),
  };
}

export function getContextSource(
  source: DataSourceState,
  context: ResolvedData,
): DataSourceState {
  if (source.source.type !== 'context') return source;
  const path = source.source.path;
  const value = path ? resolveContextPath(path, context) : context;
  return {
    ...source,
    status: 'ready',
    data: value as ResolvedData,
    error: null,
    lastRefreshed: Date.now(),
  };
}

export function resolveContextPath(path: string, context: ResolvedData): unknown {
  const parts = path.split('.');
  let current: unknown = context;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function getRefreshInterval(source: DataSourceState): number | null {
  if (source.source.type === 'api' && source.source.refresh) {
    return source.source.refresh;
  }
  return null;
}
