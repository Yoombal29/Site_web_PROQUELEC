import type { Block } from '@/types/builder';
import type { HydrationContext, HydrationReport, HydrationOptions, HydrationStats } from './types';
import { CURRENT_SCHEMA_VERSION } from './types';
import { validateRuntime, type ValidationMode } from '@/engine/validation/runtime-validator';
import { normalizeBlocksTree, type NormalizationResult } from './normalize';
import { applyMigrations } from './migrations';
import { loadPagePlugins } from './plugin-loader';
import { loadBlockBindings, setBindingContext } from './binding-loader';
import { loadBlockAnimations } from './animation-loader';
import { computePageLayout } from './layout-loader';
import { setStatus, setHydrationMetrics, setHydrationError } from './runtime-loader';
import { eventBus } from '@/engine/events/bus';

function makeStats(): HydrationStats {
  return {
    startedAt: Date.now(),
    totalBlocks: 0,
    totalPlugins: 0,
    totalBindings: 0,
  };
}

export async function hydratePage(
  doc: Record<string, unknown>,
  options: HydrationOptions = {},
): Promise<HydrationReport> {
  const stats = makeStats();
  const report: HydrationReport = {
    status: 'loading',
    valid: false,
    validationReport: null,
    stats,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    document: null,
  };

  setStatus('loading');

  try {
    // ── Step 1: Parse document ──────────────────────────────
    const contentBlocks = ((doc as Record<string, unknown>).content_blocks ||
      (doc as Record<string, unknown>).blocks ||
      []) as unknown[];
    const schemaVersion = ((doc as Record<string, unknown>).schemaVersion as number) || 0;
    const pageMetadata = ((doc as Record<string, unknown>).pageMetadata ||
      {}) as Record<string, unknown>;
    const themeConfig = (doc as Record<string, unknown>).theme_config as Record<string, unknown> | undefined;

    stats.totalBlocks = contentBlocks.length;

    // ── Step 2: Validation ──────────────────────────────────
    if (options.runValidation !== false) {
      setStatus('validating');
      const validationMode: ValidationMode = (options.validationMode as ValidationMode) || 'save';
      const validationReport = validateRuntime(
        {
          blocks: contentBlocks,
          themeConfig,
        },
        { mode: validationMode },
      );

      report.validationReport = validationReport;

      if (!validationReport.valid && validationMode === 'save') {
        report.status = 'error';
        report.valid = false;
        report.error = `Validation failed: ${validationReport.errors.length} error(s)`;
        report.stats.validatedAt = Date.now();
        setHydrationError(report.error);
        eventBus.emit('validation:failed', {
          mode: validationMode,
          errors: validationReport.errors,
          warnings: validationReport.warnings,
        });
        return report;
      }

      stats.validatedAt = Date.now();
    }

    // ── Step 3: Normalization ───────────────────────────────
    setStatus('normalizing');
    const normalizationResult: NormalizationResult = normalizeBlocksTree(contentBlocks);
    const normalizedBlocks = normalizationResult.blocks;

    stats.normalizedAt = Date.now();

    // ── Step 4: Migration ───────────────────────────────────
    setStatus('migrating');
    let migratedDoc: Record<string, unknown> = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      content_blocks: normalizedBlocks,
      pageMetadata,
      theme_config: themeConfig,
    };

    if (schemaVersion < CURRENT_SCHEMA_VERSION) {
      migratedDoc = applyMigrations(migratedDoc, schemaVersion);
    }

    stats.migratedAt = Date.now();

    const blocks = migratedDoc.content_blocks as Block[];
    const context: HydrationContext = {
      blocks,
      pageMetadata: pageMetadata as Record<string, unknown>,
      themeConfig,
      document: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        content_blocks: blocks,
        theme_config: themeConfig,
        pageMetadata: pageMetadata as Record<string, unknown>,
      },
    };

    // ── Step 5: Plugin loading ──────────────────────────────
    if (!options.skipPlugins) {
      setStatus('plugins');
      const pagePlugins = (doc.plugins || []) as Record<string, unknown>[];
      const pluginResult = await loadPagePlugins(pagePlugins as never[]);
      stats.totalPlugins = pluginResult.loaded.length;
    }

    // ── Step 6: Binding loading ─────────────────────────────
    if (!options.skipBindings) {
      setStatus('bindings');
      const bindingResult = loadBlockBindings(blocks);
      stats.totalBindings = bindingResult.registeredSources + bindingResult.bindingsDetected;
      if (pageMetadata && typeof pageMetadata === 'object') {
        setBindingContext({ page: pageMetadata as Record<string, unknown>, user: {}, project: {} });
      }
    }

    // ── Step 7: Animation loading ───────────────────────────
    if (!options.skipAnimations) {
      setStatus('animations');
      const animationResult = loadBlockAnimations(blocks);
    }

    // ── Step 8: Layout computation ──────────────────────────
    if (!options.skipLayout) {
      setStatus('layout');
      const layoutResult = computePageLayout(blocks);
    }

    // ── Step 9: Emit ready ──────────────────────────────────
    report.status = 'ready';
    report.valid = true;
    report.document = context.document;
    report.stats.hydratedAt = Date.now();

    setStatus('ready');
    setHydrationMetrics({
      totalBlocks: stats.totalBlocks,
      totalPlugins: stats.totalPlugins,
      totalBindings: stats.totalBindings,
      hydrationTimeMs: report.stats.hydratedAt - report.stats.startedAt,
    });

    eventBus.emit('runtime:ready', {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      blocksCount: blocks.length,
      hydrationTimeMs: report.stats.hydratedAt - report.stats.startedAt,
    });

    return report;

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    report.status = 'error';
    report.valid = false;
    report.error = message;

    setStatus('error');
    setHydrationError(message);

    eventBus.emit('runtime:error', {
      message,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    });

    return report;
  }
}
