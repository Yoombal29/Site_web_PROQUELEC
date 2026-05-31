export type DataSourceType = 'api' | 'query' | 'static' | 'context';

export interface ApiDataSource {
  type: 'api';
  endpoint: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  params?: Record<string, string>;
  refresh?: number; // Refresh interval in ms
}

export interface QueryDataSource {
  type: 'query';
  key: string;
  params?: Record<string, string>;
}

export interface StaticDataSource {
  type: 'static';
  data: unknown;
}

export interface ContextDataSource {
  type: 'context';
  path: string; // e.g. "page.metadata"
}

export type DataSource = ApiDataSource | QueryDataSource | StaticDataSource | ContextDataSource;

export interface DataBinding {
  sourceId: string;
  mapping: Record<string, string>; // blockProp → dataPath (e.g. "content.title" → "project.name")
}

export interface TemplateExpression {
  original: string;
  paths: string[];
}

export interface BlockBindings {
  dataSource?: DataSource;
  bindings?: DataBinding;
}

export interface ResolvedData {
  [path: string]: unknown;
}

export interface DataSourceState {
  id: string;
  source: DataSource;
  status: 'idle' | 'loading' | 'ready' | 'error';
  data: ResolvedData | null;
  error: string | null;
  lastRefreshed: number | null;
}

export interface DataStoreState {
  sources: Record<string, DataSourceState>;
  context: ResolvedData;
}

export type DataEventType = 'data:loaded' | 'data:error' | 'data:refreshed' | 'binding:updated';

export interface DataEvent {
  type: DataEventType;
  sourceId?: string;
  payload?: unknown;
}
