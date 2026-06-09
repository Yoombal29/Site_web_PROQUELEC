import type { Block, BlockStyle } from '@/types/builder';
import type { ValidationReport } from '@/engine/validation/types';

// ── Publish options ───────────────────────────────────────────

export interface PublishOptions {
  /** Strip editor-only metadata (selection state, dirty flags, etc.) */
  stripEditorMetadata?: boolean;
  /** Strip disabled blocks from published output */
  stripDisabledBlocks?: boolean;
  /** Inline animation CSS into compiled output */
  inlineAnimationCSS?: boolean;
  /** Optimize bindings (resolve static values, remove editor-only) */
  optimizeBindings?: boolean;
  /** Compile layout tree into computed node map */
  compileLayout?: boolean;
  /** Extract and deduplicate assets */
  extractAssets?: boolean;
  /** Generate minimal public runtime (no history, no plugins meta, no dirty state) */
  minimalRuntime?: boolean;
  /** Maximum depth allowed before warning */
  maxDepth?: number;
}

export const DEFAULT_PUBLISH_OPTIONS: Required<PublishOptions> = {
  stripEditorMetadata: true,
  stripDisabledBlocks: true,
  inlineAnimationCSS: true,
  optimizeBindings: true,
  compileLayout: true,
  extractAssets: true,
  minimalRuntime: true,
  maxDepth: 10,
};

// ── Compiled block (stripped for public) ─────────────────────

export interface CompiledBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  style?: Partial<BlockStyle>;
  children?: CompiledBlock[];
  /** Compiled animation CSS class names */
  animationClasses?: string[];
  /** Resolved static bindings (for SSR/static generation) */
  resolvedBindings?: Record<string, unknown>;
  /** Computed layout position */
  computedLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
  };
}

// ── Extracted asset ───────────────────────────────────────────

export interface ExtractedAsset {
  type: 'image' | 'video' | 'font' | 'icon' | 'script';
  url: string;
  blockId: string;
  field: string;
  priority: 'critical' | 'high' | 'low';
}

// ── Compiled runtime (public) ─────────────────────────────────

export interface CompiledRuntime {
  /** Schema version at time of publish */
  schemaVersion: number;
  /** Compiled block tree */
  blocks: CompiledBlock[];
  /** Inlined animation CSS */
  animationCSS?: string;
  /** Extracted assets for preloading */
  assets?: ExtractedAsset[];
  /** Compile stats */
  stats: {
    originalBlockCount: number;
    compiledBlockCount: number;
    strippedCount: number;
    assetCount: number;
    compileDurationMs: number;
  };
}

// ── Publish snapshot ─────────────────────────────────────────

export interface PublishSnapshot {
  id: string;
  pageId: string | number;
  /** The compiled public runtime */
  compiled: CompiledRuntime;
  /** Validation report at publish time */
  validation: ValidationReport;
  /** Publish timestamp */
  publishedAt: number;
  /** Who/what triggered publish */
  publishedBy: string;
  /** Structural hash of draft at publish time */
  draftHash: string;
  /** Incremental: which block IDs changed since last publish */
  changedBlockIds?: string[];
}

// ── Publish result ───────────────────────────────────────────

export type PublishStatus = 'success' | 'validation_failed' | 'compile_error';

export interface PublishResult {
  status: PublishStatus;
  snapshot?: PublishSnapshot;
  validation: ValidationReport;
  errors: string[];
  warnings: string[];
  durationMs: number;
}

// ── Pipeline stage ───────────────────────────────────────────

export type PipelineStage =
  | 'idle'
  | 'validating'
  | 'compiling'
  | 'extracting_assets'
  | 'compiling_layout'
  | 'compiling_animations'
  | 'optimizing_bindings'
  | 'packaging'
  | 'done'
  | 'error';

export interface PipelineProgress {
  stage: PipelineStage;
  message: string;
  progress: number; // 0–100
}
