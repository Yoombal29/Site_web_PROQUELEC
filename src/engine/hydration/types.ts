import type { Block, PageMetadata } from '@/types/builder';
import type { ValidationReport } from '@/engine/validation/types';
import type { AnimationRegistryState } from '@/engine/animation/types';
import type { Plugin, PluginContext } from '@/engine/plugins/types';

export const CURRENT_SCHEMA_VERSION = 1;

export interface RuntimeDocument {
  schemaVersion: number;
  content_blocks: Block[];
  layout_tree?: Record<string, unknown>;
  theme_config?: Record<string, unknown>;
  bindings?: Record<string, unknown>;
  animation_config?: Record<string, unknown>;
  pageMetadata?: Partial<PageMetadata>;
}

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

export interface HydrationStats {
  startedAt: number;
  validatedAt?: number;
  normalizedAt?: number;
  migratedAt?: number;
  hydratedAt?: number;
  totalBlocks: number;
  totalPlugins: number;
  totalBindings: number;
}

export interface HydrationReport {
  status: HydrationStatus;
  valid: boolean;
  validationReport: ValidationReport | null;
  stats: HydrationStats;
  error?: string;
  schemaVersion: number;
  document: RuntimeDocument | null;
}

export interface HydrationContext {
  blocks: Block[];
  pageMetadata: Partial<PageMetadata>;
  themeConfig?: Record<string, unknown>;
  plugins?: Plugin[];
  document: RuntimeDocument;
}

export type HydrationMiddleware = (
  context: HydrationContext,
  next: () => HydrationContext | Promise<HydrationContext>,
) => HydrationContext | Promise<HydrationContext>;

export interface HydrationOptions {
  schemaVersion?: number;
  runValidation?: boolean;
  validationMode?: 'save' | 'publish' | 'full';
  skipPlugins?: boolean;
  skipBindings?: boolean;
  skipAnimations?: boolean;
  skipLayout?: boolean;
}
