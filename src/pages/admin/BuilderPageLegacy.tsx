/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef
} from 'react';

import { useParams } from 'react-router-dom';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { Loader2 } from 'lucide-react';

import { useBuilderStore } from '@/stores/useBuilderStore';

import { BuilderSidebar } from '@/components/builder/BuilderSidebar';
import { BuilderToolbar } from '@/components/builder/BuilderToolbar';
import { BuilderCanvas } from '@/components/builder/BuilderCanvas';
import { BuilderDialogs } from '@/components/builder/BuilderDialogs';
import { BuilderRightPanel } from '@/components/builder/BuilderRightPanel';

import { apiFetch } from '@/lib/api-client';

import { useDebounce } from '@/hooks/useDebounce';
import { useBuilderKeyboardShortcuts } from '@/hooks/useBuilderKeyboardShortcuts';
import { useContentVersioning } from '@/hooks/useContentVersioning';
import { useAnalytics } from '@/hooks/useAnalytics';

import type { Block } from '@/types/builder';
import type { PageDesignOptions, WorkflowStatus } from '@/types/PageSystem';

import { DEFAULT_DESIGN_OPTIONS } from '@/utils/pageLayouts';





/* =========================================================
   TYPES
========================================================= */

type AdminPageResponse = {
  title?: string;
  slug?: string;
  structure_json?: unknown;
  content_blocks?: unknown[];
  content?: string;

  meta_description?: string;
  meta_keywords?: string;
  meta_robots?: string;

  custom_css?: string;
  custom_js?: string;

  design_options?: PageDesignOptions | string;

  is_published?: boolean;
  workflow_status?: WorkflowStatus;
};

type PageDataState = {
  title: string;
  slug: string;

  metaDescription: string;
  metaKeywords: string;
  metaRobots: string;

  customCss: string;
  customJs: string;

  designOptions: PageDesignOptions;

  isPublished: boolean;

  workflowStatus:
    | 'draft'
    | 'review'
    | 'approved'
    | 'published'
    | 'archived';
};





/* =========================================================
   HELPERS
========================================================= */

const createNewBlock = (type: string): Block => ({
  id: crypto.randomUUID(),

  type,

  content: {
    title: `Nouveau ${type}` 
  },

  style: {
    padding: '20px'
  },

  children: []
});

const cloneTemplateBlock = (block: Block): Block => {
  const clone = structuredClone(block);

  clone.id = crypto.randomUUID();

  return clone;
};

const normalizeBlocks = (blocks: Block[]): Block[] => {
  return blocks.map((block) => ({
    ...block,
    id: block.id || crypto.randomUUID(),
    children: normalizeBlocks(block.children || [])
  }));
};





/* =========================================================
   RECURSIVE HELPERS
========================================================= */

type NodeLocation = {
  node: Block;
  parentList: Block[];
  index: number;
};

const findNode = (
  nodes: Block[],
  id: string
): NodeLocation | null => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.id === id) {
      return {
        node,
        parentList: nodes,
        index: i
      };
    }

    if (node.children?.length) {
      const found = findNode(node.children, id);

      if (found) return found;
    }
  }

  return null;
};

const removeNode = (
  nodes: Block[],
  id: string
): Block | null => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.id === id) {
      return nodes.splice(i, 1)[0];
    }

    if (node.children?.length) {
      const removed = removeNode(node.children, id);

      if (removed) return removed;
    }
  }

  return null;
};





/* =========================================================
   MAIN COMPONENT
========================================================= */

const BuilderPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();





  /* =========================================================
     STORE SELECTORS
  ========================================================= */

  const blocks = useBuilderStore((s) => s.blocks);

  const setBlocks = useBuilderStore((s) => s.setBlocks);

  const selectedBlockId = useBuilderStore((s) => s.selectedBlockId);

  const selectBlock = useBuilderStore((s) => s.selectBlock);

  const templates = useBuilderStore((s) => s.templates);

  const loadTemplates = useBuilderStore((s) => s.loadTemplates);

  const deleteTemplate = useBuilderStore((s) => s.deleteTemplate);

  const undo = useBuilderStore((s) => s.undo);

  const redo = useBuilderStore((s) => s.redo);

  const canUndo = useBuilderStore((s) => s.canUndo);

  const canRedo = useBuilderStore((s) => s.canRedo);

  const snapshotHistory = useBuilderStore((s) => s.snapshotHistory);

  const removeBlock = useBuilderStore((s) => s.removeBlock);

  const pageMetadata = useBuilderStore((s) => s.pageMetadata);

  const setPageMetadata = useBuilderStore((s) => s.setPageMetadata);





  /* =========================================================
     HOOKS
  ========================================================= */

  const { createVersion, getVersions, restoreVersion } =
    useContentVersioning();

  const { getPageAnalytics } = useAnalytics();





  /* =========================================================
     STATES
  ========================================================= */

  const [pageData, setPageData] =
    useState<PageDataState | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [viewMode, setViewMode] =
    useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const [showPreview, setShowPreview] =
    useState(false);

  const [previewMode, setPreviewMode] =
    useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const [versionDialogOpen, setVersionDialogOpen] =
    useState(false);

  const [showAnalytics, setShowAnalytics] =
    useState(false);

  const [versionChangeLog, setVersionChangeLog] =
    useState('Sauvegarde manuelle');

  const [analyticsData, setAnalyticsData] =
    useState<any>(null);





  /* =========================================================
     VERSION TRACKING
  ========================================================= */

  const [revision, setRevision] =
    useState(0);

  const [savedRevision, setSavedRevision] =
    useState(0);

  const isDirty =
    revision !== savedRevision;

  const debouncedDirty =
    useDebounce(isDirty, 2500);





  /* =========================================================
     SAVE LOCK
  ========================================================= */

  const saveInProgressRef =
    useRef(false);





  /* =========================================================
     LOAD PAGE
  ========================================================= */

  useEffect(() => {
    const loadPage = async () => {
      if (!pageId) return;

      setIsLoading(true);

      try {
        loadTemplates();

        const page =
          await apiFetch<AdminPageResponse>(
            `/api/admin/pages/${pageId}` 
          );

        setPageData({
          title: page.title || 'Nouvelle page',

          slug: page.slug || '',

          metaDescription:
            page.meta_description || '',

          metaKeywords:
            page.meta_keywords || '',

          metaRobots:
            page.meta_robots || 'index,follow',

          customCss:
            page.custom_css || '',

          customJs:
            page.custom_js || '',

          designOptions:
            typeof page.design_options === 'string'
              ? JSON.parse(page.design_options)
              : page.design_options ||
                DEFAULT_DESIGN_OPTIONS,

          isPublished:
            page.is_published || false,

          workflowStatus:
            page.workflow_status ||
            'draft'
        });

        let parsedBlocks: Block[] = [];

        if (Array.isArray(page.structure_json)) {
          parsedBlocks =
            page.structure_json as Block[];
        }

        parsedBlocks =
          normalizeBlocks(parsedBlocks);

        setBlocks(parsedBlocks);

        setRevision(0);
        setSavedRevision(0);
      } catch (error: any) {
        console.error(error);

        setLoadError(
          error?.message ||
            'Erreur chargement page'
        );

        toast.error(
          'Impossible de charger la page'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [pageId, setBlocks, loadTemplates]);





  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = useCallback(async () => {
    if (!pageId) return;

    if (saveInProgressRef.current) return;

    saveInProgressRef.current = true;

    setIsSaving(true);

    try {
      await apiFetch(
        `/api/admin/pages/${pageId}`,
        {
          method: 'PUT',

          body: JSON.stringify({
            structure_json: blocks,

            title: pageData?.title,

            slug: pageData?.slug,

            meta_description:
              pageData?.metaDescription,

            meta_keywords:
              pageData?.metaKeywords,

            meta_robots:
              pageData?.metaRobots,

            custom_css:
              pageData?.customCss,

            custom_js:
              pageData?.customJs,

            design_options:
              pageData?.designOptions,

            is_published:
              pageData?.isPublished,

            workflow_status:
              pageData?.workflowStatus
          })
        }
      );

      snapshotHistory();

      setSavedRevision(revision);

      toast.success(
        'Page sauvegardée'
      );
    } catch (error) {
      console.error(error);

      toast.error(
        'Erreur sauvegarde'
      );
    } finally {
      setIsSaving(false);

      saveInProgressRef.current = false;
    }
  }, [
    pageId,
    blocks,
    pageData,
    revision,
    snapshotHistory
  ]);





  /* =========================================================
     AUTOSAVE
  ========================================================= */

  useEffect(() => {
    if (
      debouncedDirty &&
      !isLoading
    ) {
      handleSave();
    }
  }, [
    debouncedDirty,
    handleSave,
    isLoading
  ]);





  /* =========================================================
     ANALYTICS
  ========================================================= */

  useEffect(() => {
    if (!pageId) return;

    const loadAnalytics = async () => {
      const analytics =
        await getPageAnalytics(pageId);

      setAnalyticsData(analytics);
    };

    loadAnalytics();
  }, [pageId, getPageAnalytics]);





  /* =========================================================
     PAGE DATA CHANGE
  ========================================================= */

  const handlePageDataChange =
    useCallback(
      (
        changes: Partial<PageDataState>
      ) => {
        setPageData((prev) =>
          prev
            ? {
                ...prev,
                ...changes
              }
            : prev
        );

        setRevision((r) => r + 1);
      },
      []
    );





  /* =========================================================
     DRAG & DROP
  ========================================================= */

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      try {
        const { active, over } = event;

        if (!over) return;

        const activeId =
          String(active.id);

        const overId =
          String(over.id);

        const cloned =
          structuredClone(blocks);





        /* =========================================
           NEW BLOCK
        ========================================= */

        if (
          activeId.startsWith(
            'sidebar-item-'
          )
        ) {
          const type =
            active.data.current?.type;

          if (!type) return;

          const newBlock =
            createNewBlock(type);

          if (
            overId ===
            'canvas-droppable'
          ) {
            cloned.push(newBlock);
          } else {
            const target =
              findNode(
                cloned,
                overId
              );

            if (!target) return;

            if (
              target.node.type ===
              'section'
            ) {
              target.node.children =
                target.node.children ||
                [];

              target.node.children.push(
                newBlock
              );
            } else {
              target.parentList.splice(
                target.index,
                0,
                newBlock
              );
            }
          }

          setBlocks(cloned);

          setRevision((r) => r + 1);

          return;
        }





        /* =========================================
           TEMPLATE
        ========================================= */

        if (
          activeId.startsWith(
            'sidebar-template-'
          )
        ) {
          const template =
            active.data.current?.block;

          if (!template) return;

          const block =
            cloneTemplateBlock(
              template
            );

          cloned.push(block);

          setBlocks(cloned);

          setRevision((r) => r + 1);

          return;
        }





        /* =========================================
           MOVE EXISTING
        ========================================= */

        if (activeId === overId) {
          return;
        }

        const dragged =
          removeNode(
            cloned,
            activeId
          );

        if (!dragged) return;

        const target =
          findNode(
            cloned,
            overId
          );

        if (!target) {
          cloned.push(dragged);

          setBlocks(cloned);

          return;
        }

        if (
          target.node.type ===
          'section'
        ) {
          target.node.children =
            target.node.children ||
            [];

          target.node.children.push(
            dragged
          );
        } else {
          target.parentList.splice(
            target.index,
            0,
            dragged
          );
        }

        setBlocks(cloned);

        setRevision((r) => r + 1);
      } catch (error) {
        console.error(error);

        toast.error(
          'Erreur drag & drop'
        );
      }
    },
    [blocks, setBlocks]
  );





  /* =========================================================
     KEYBOARD SHORTCUTS
  ========================================================= */

  useBuilderKeyboardShortcuts({
    onSave: handleSave,

    onUndo: undo,

    onRedo: redo,

    onDelete: () => {
      if (!selectedBlockId) return;

      removeBlock(selectedBlockId);

      setRevision((r) => r + 1);
    }
  });





  /* =========================================================
     VERSIONS
  ========================================================= */

  const pageVersions = useMemo(() => {
    if (!pageId) return [];

    return getVersions(pageId);
  }, [pageId, getVersions]);

  const handleCreateVersion =
    useCallback(async () => {
      if (!pageId) return;

      await createVersion(
        pageId,
        pageData?.title || 'Page',
        JSON.stringify({
          blocks,
          pageData
        }),
        versionChangeLog
      );

      toast.success(
        'Version créée'
      );

      setVersionDialogOpen(false);
    }, [
      pageId,
      pageData,
      blocks,
      versionChangeLog,
      createVersion
    ]);

  const handleRestoreVersion =
    useCallback(
      async (versionId: string) => {
        const version =
          await restoreVersion(
            versionId
          );

        if (!version) return;

        try {
          const parsed =
            JSON.parse(
              version.content
            );

          setBlocks(parsed.blocks);

          setPageData(
            parsed.pageData
          );

          setRevision(
            (r) => r + 1
          );

          toast.success(
            'Version restaurée'
          );
        } catch (error) {
          console.error(error);

          toast.error(
            'Erreur restauration'
          );
        }
      },
      [restoreVersion, setBlocks]
    );





  /* =========================================================
     VIEW WIDTH
  ========================================================= */

  const widthClass =
    useMemo(() => {
      switch (viewMode) {
        case 'mobile':
          return 'max-w-[375px]';

        case 'tablet':
          return 'max-w-[768px]';

        default:
          return 'max-w-6xl';
      }
    }, [viewMode]);





  /* =========================================================
     DND SENSORS
  ========================================================= */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  );





  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen w-full overflow-hidden bg-slate-100">

        {/* ========================================
            SIDEBAR
        ======================================== */}

        <BuilderSidebar
          templates={templates}
          deleteTemplate={deleteTemplate}
        />





        {/* ========================================
            MAIN
        ======================================== */}

        <main className="flex flex-1 flex-col bg-slate-100">

          <BuilderToolbar
            pageData={pageData}
            pageMetadata={pageMetadata}
            blocks={blocks}

            viewMode={viewMode}

            isDirty={isDirty}
            isSaving={isSaving}
            isLoading={isLoading}

            loadError={loadError}

            canUndo={canUndo}
            canRedo={canRedo}

            undo={undo}
            redo={redo}

            setViewMode={setViewMode}

            handleSave={handleSave}

            setShowPreview={setShowPreview}

            setVersionDialogOpen={
              setVersionDialogOpen
            }

            setShowAnalytics={
              setShowAnalytics
            }
          />





          {/* ========================================
              DIALOGS
          ======================================== */}

          <BuilderDialogs
            showPreview={showPreview}
            setShowPreview={setShowPreview}

            previewMode={previewMode}
            setPreviewMode={setPreviewMode}

            blocks={blocks}

            pageData={pageData}

            versionDialogOpen={
              versionDialogOpen
            }

            setVersionDialogOpen={
              setVersionDialogOpen
            }

            versionChangeLog={
              versionChangeLog
            }

            setVersionChangeLog={
              setVersionChangeLog
            }

            handleCreateVersion={
              handleCreateVersion
            }

            pageVersions={
              pageVersions
            }

            handleRestoreVersion={
              handleRestoreVersion
            }

            showAnalytics={
              showAnalytics
            }

            setShowAnalytics={
              setShowAnalytics
            }

            analyticsData={
              analyticsData
            }
          />





          {/* ========================================
              CANVAS
          ======================================== */}

          <div className="relative flex flex-1 justify-center overflow-auto p-8">

            <BuilderCanvas
              blocks={blocks}
              widthClass={widthClass}
            />

            {(isLoading ||
              loadError) && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90">

                {isLoading ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />

                    <p className="mt-4 text-sm font-semibold text-slate-700">
                      Chargement...
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-red-600">
                      Erreur
                    </p>

                    <p className="mt-2 text-xs text-slate-600">
                      {loadError}
                    </p>

                    <Button
                      size="sm"
                      className="mt-4"
                      onClick={() =>
                        window.location.reload()
                      }
                    >
                      Recharger
                    </Button>
                  </>
                )}

              </div>
            )}

          </div>

        </main>





        {/* ========================================
            RIGHT PANEL
        ======================================== */}

        <BuilderRightPanel
          selectedBlockId={
            selectedBlockId
          }

          pageData={pageData}

          pageMetadata={
            pageMetadata
          }

          blocks={blocks}

          selectBlock={
            selectBlock
          }

          handlePageDataChange={
            handlePageDataChange
          }

          setPageMetadata={
            setPageMetadata
          }
        />

      </div>
    </DndContext>
  );
};

export default React.memo(BuilderPage);