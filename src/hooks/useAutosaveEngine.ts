import { useEffect, useRef, useCallback } from 'react';
import { getAutosaveEngine, resetAutosaveEngine } from '@/engine/autosave/autosave';
import { useDirtyStore } from '@/engine/autosave/dirty-store';
import { apiFetch } from '@/lib/api-client';
import type { Block } from '@/types/builder';
import type { Patch } from '@/engine/diff/types';

interface UseAutosaveEngineOptions {
  pageId: string | undefined;
  blocks: Block[];
  pageData: Record<string, unknown> | null;
  enabled?: boolean;
}

interface UseAutosaveEngineResult {
  isDirty: boolean;
  saveStatus: ReturnType<typeof useDirtyStore.getState>['saveStatus'];
  flushNow: () => Promise<boolean>;
}

export function useAutosaveEngine({
  pageId,
  blocks,
  pageData,
  enabled = true,
}: UseAutosaveEngineOptions): UseAutosaveEngineResult {
  const isDirty = useDirtyStore((s) => s.isDirty);
  const saveStatus = useDirtyStore((s) => s.saveStatus);

  // Keep latest pageData and blocks in refs to avoid stale closures in onSave
  const pageDataRef = useRef(pageData);
  const blocksRef = useRef(blocks);

  useEffect(() => {
    pageDataRef.current = pageData;
  }, [pageData]);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Seed or re-create the engine whenever pageId changes
  useEffect(() => {
    if (!pageId || !enabled) return;

    const engine = getAutosaveEngine({
      debounceMs: 5000,
      maxRetries: 3,
      validateBeforeSave: false,
      onSave: async (_patches: Patch[]) => {
        // We do a full PUT because the backend expects the full page payload.
        // The patches are used only for change detection.
        try {
          const pd = pageDataRef.current as Record<string, unknown> | null;
          const currentBlocks = blocksRef.current;
          await apiFetch(`/api/admin/pages/${pageId}`, {
            method: 'PUT',
            body: JSON.stringify({
              content_blocks: currentBlocks,
              structure_json: currentBlocks,
              title: pd?.title,
              slug: pd?.slug,
              meta_description: pd?.metaDescription,
              meta_keywords: pd?.metaKeywords,
              meta_robots: pd?.metaRobots,
              custom_css: pd?.customCss,
              custom_js: pd?.customJs,
              design_options: pd?.designOptions,
              is_published: pd?.isPublished,
              workflow_status: pd?.workflowStatus,
            }),
          });
          return true;
        } catch (err) {
          console.error('[AutosaveEngine] Save failed:', err);
          return false;
        }
      },
    });

    // Seed the initial state so the detector knows the baseline
    engine.seed(blocks);

    return () => {
      // Do NOT destroy the global engine on unmount — just let it persist.
      // It will be reset on pageId change below.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, enabled]);

  // Reset engine and dirty state when the page changes
  useEffect(() => {
    return () => {
      if (pageId) {
        resetAutosaveEngine();
      }
    };
  }, [pageId]);

  // Detect changes whenever blocks change
  useEffect(() => {
    if (!pageId || !enabled) return;
    const engine = getAutosaveEngine();
    engine.detect(blocks);
  }, [blocks, pageId, enabled]);

  const flushNow = useCallback(async (): Promise<boolean> => {
    const engine = getAutosaveEngine();
    return engine.flushNow();
  }, []);

  return { isDirty, saveStatus, flushNow };
}
