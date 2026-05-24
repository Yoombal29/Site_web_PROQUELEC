
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBuilderStore } from '@/stores/useBuilderStore';
import type { Block } from '@/types/builder';
import type { DragEndEvent } from '@dnd-kit/core';
import { produce } from 'immer';
import { useBuilderKeyboardShortcuts } from '@/hooks/useBuilderKeyboardShortcuts';
import { useDebounce } from '@/hooks/useDebounce';

import { DndContext, useDraggable, useDroppable, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import {
  Plus, LayoutTemplate, Box, Trash2, Save, Loader2, MousePointer2,
  Monitor, Tablet, Smartphone, Undo, Redo, Code, ChevronLeft, Eye, Globe } from
'lucide-react';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove } from
'@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BuilderPageRenderer from '@/components/builder/BuilderPageRenderer';
import PropertyPanel from '@/components/builder/PropertyPanel';
import PageSettingsPanel from '@/components/builder/PageSettingsPanel';
import { BuilderToolbar } from '@/components/builder/BuilderToolbar';
import { BuilderSidebar } from '@/components/builder/BuilderSidebar';
import { BuilderCanvas } from '@/components/builder/BuilderCanvas';
import { BuilderRightPanel } from '@/components/builder/BuilderRightPanel';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from
"@/components/ui/dialog";
import { useContentVersioning } from '@/hooks/useContentVersioning';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { PageDesignOptions, WorkflowStatus } from '@/types/PageSystem';
import { DEFAULT_DESIGN_OPTIONS } from '@/utils/pageLayouts';

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

type LegacyContentBlock = {
  id?: string;
  type?: string;
  data?: Record<string, unknown>;
};

type LegacyTemplate = {
  id: string;
  name: string;
  createdAt: number;
  block: Block;
};

const normalizeLegacyText = (value: unknown): string => typeof value === 'string' ? value : '';

const normalizeLegacyLink = (value: unknown): string => typeof value === 'string' ? value : '';

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
  workflowStatus: 'draft' | 'review' | 'approved' | 'published' | 'archived';
};

const BuilderPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const {
    blocks,
    setBlocks,
    addBlock,
    importBlock,
    selectedBlockId,
    selectBlock,
    templates,
    loadTemplates,
    deleteTemplate,
    undo,
    redo,
    canUndo,
    canRedo,
    snapshotHistory,
    pageMetadata,
    setPageMetadata,
    removeBlock
  } = useBuilderStore();

  const { createVersion, getVersions, restoreVersion } = useContentVersioning();
  const { getPageAnalytics } = useAnalytics();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [versionChangeLog, setVersionChangeLog] = useState('Sauvegarde manuelle du builder');
  const [analyticsData, setAnalyticsData] = useState<{ views: number; uniqueVisitors: number; avgTime: string; bounceRate: string } | null>(null);
  const [pageData, setPageData] = useState<PageDataState | null>(null);

  // Track if there are unsaved changes (lightweight version counter instead of deep JSON.stringify)
  const [savedBlocksVersion, setSavedBlocksVersion] = useState(0);
  const [blocksVersion, setBlocksVersion] = useState(0);
  const [savedPageDataVersion, setSavedPageDataVersion] = useState(0);
  const [pageDataVersion, setPageDataVersion] = useState(0);

  // isDirty is true when block version or page data version differs from saved
  const isDirty = blocksVersion !== savedBlocksVersion || pageDataVersion !== savedPageDataVersion;

  // Increment blocksVersion each time blocks change (skip during initial load)
  const isLoadingRef = React.useRef(true);
  
  // Version tracking is now handled directly in mutations (setBlocks, addBlock, etc.)
  // This expensive deep comparison has been removed per performance audit

  // Mark loading complete after first render with blocks
  useEffect(() => {
    if (!isLoading) {
      // Use a small delay to avoid counting the initial setBlocks as a dirty change
      const t = setTimeout(() => { isLoadingRef.current = false; }, 100);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  const handlePageDataChange = useCallback((changes: Partial<PageDataState>) => {
    setPageData((current) => current ? { ...current, ...changes } : current);
    setPageDataVersion((v) => v + 1);
  }, []);

  // 1. Initial Load
  useEffect(() => {
    const loadPage = async () => {
      loadTemplates();
      setLoadError(null);

      if (!pageId) {
        setLoadError('Aucun identifiant de page fourni.');
        setBlocks([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        let adminPage: AdminPageResponse | null = null;
        try {
          adminPage = await apiFetch<AdminPageResponse>(`/api/admin/pages/${pageId}`);
        } catch (error: unknown) {
          try {
            const siteConfig = await apiFetch<{ pages: { id: string; slug: string }[] }>('/api/site-config');
            const matchedPage = siteConfig.pages.find((page) => page.id === pageId || page.slug === pageId);
            if (matchedPage?.slug) {
              adminPage = await apiFetch<AdminPageResponse>(`/api/pages/slug/${matchedPage.slug}`);
            }
          } catch {
            // Best-effort fallback; continue to final error handling below.
          }
          if (!adminPage) {
            throw error;
          }
        }

        if (!adminPage) {
          setLoadError('Page introuvable.');
          setBlocks([]);
          return;
        }

        setPageData({
          title: adminPage.title || `Page ${pageId}`,
          slug: adminPage.slug || pageId,
          metaDescription: adminPage.meta_description || '',
          metaKeywords: adminPage.meta_keywords || '',
          metaRobots: adminPage.meta_robots || 'index,follow',
          customCss: adminPage.custom_css || '',
          customJs: adminPage.custom_js || '',
          designOptions: typeof adminPage.design_options === 'string'
            ? JSON.parse(adminPage.design_options)
            : adminPage.design_options || DEFAULT_DESIGN_OPTIONS,
          isPublished: adminPage.is_published || false,
          workflowStatus: adminPage.workflow_status || (adminPage.is_published ? 'published' : 'draft')
        });

        let availableBlocks: Block[] = [];

        if (Array.isArray(adminPage.structure_json)) {
          availableBlocks = adminPage.structure_json as Block[];
        } else if (typeof adminPage.structure_json === 'string' && adminPage.structure_json.trim().length > 0) {
          try {
            availableBlocks = JSON.parse(adminPage.structure_json) as Block[];
          } catch (parseError) {
            console.warn('Impossible de parser structure_json:', parseError);
          }
        }

        if (!availableBlocks || availableBlocks.length === 0) {
          if (Array.isArray(adminPage.content_blocks) && adminPage.content_blocks.length > 0) {
            availableBlocks = adminPage.content_blocks.map((b: LegacyContentBlock) => ({
              id: b?.id || `legacy-${Math.random().toString(36).slice(2, 9)}`,
              type: b?.type === 'text' ? 'text-block' : b?.type || 'section',
              content: {
                title: normalizeLegacyText(b?.data?.title),
                subtitle: normalizeLegacyText(b?.data?.subtitle),
                text: normalizeLegacyText(b?.data?.text || b?.data?.cta_text),
                html: normalizeLegacyText(b?.data?.content),
                src: normalizeLegacyLink(b?.data?.url),
                href: normalizeLegacyLink(b?.data?.cta_link || b?.data?.href),
                caption: normalizeLegacyText(b?.data?.caption)
              },
              style: typeof b?.data?.background_image === 'string' ? {
                backgroundImage: `url(${b.data.background_image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#ffffff'
              } : {}
            }));
            toast.info('Anciens blocs importés automatiquement.');
          } else if (adminPage.content && typeof adminPage.content === 'string' && adminPage.content.trim().length > 0) {
            availableBlocks = [{
              id: `legacy-html-${Date.now()}`,
              type: 'html',
              content: { html: adminPage.content },
              style: { padding: '20px' }
            }];
            toast.info('Contenu HTML existant importé.');
          }
        }

          setBlocks(availableBlocks || []);
        // Reset version counters on load (no unsaved changes)
        setSavedBlocksVersion(0);
        setBlocksVersion(0);
        setSavedPageDataVersion(0);
        setPageDataVersion(0);
      } catch (error: unknown) {
        console.error('Erreur chargement du builder:', error);
        const errorStatus = (error as unknown as { status?: number }).status;
        if (errorStatus === 401) {
          setLoadError('Accès refusé. Veuillez vous connecter pour utiliser le builder.');
        } else {
          setLoadError((error as Error)?.message || 'Impossible de charger la page. Vérifiez la connexion ou l’identifiant.');
        }
        setBlocks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [pageId, setBlocks, loadTemplates]);

  // 2. Save Page
  const handleSave = useCallback(async () => {
    if (!pageId) {
      toast.error('Impossible de sauvegarder : identifiant de page manquant.');
      return;
    }

    setIsSaving(true);
    try {
      await apiFetch(`/api/admin/pages/${pageId}`, {
        method: 'PUT',
        body: JSON.stringify({
          structure_json: blocks,
          title: pageData?.title,
          slug: pageData?.slug,
          meta_keywords: pageData?.metaKeywords,
          meta_robots: pageData?.metaRobots,
          custom_css: pageData?.customCss,
          custom_js: pageData?.customJs,
          design_options: pageData?.designOptions,
          is_published: pageData?.isPublished,
          workflow_status: pageData?.workflowStatus,
          // Extended CMS metadata
          excerpt: pageMetadata.excerpt,
          meta_description: pageMetadata.meta_description || pageData?.metaDescription,
          featured_image: pageMetadata.featured_image,
          language_code: pageMetadata.language_code,
          publish_date: pageMetadata.publish_date,
          unpublish_date: pageMetadata.unpublish_date,
          author: pageMetadata.author,
          reading_time: pageMetadata.reading_time,
          categories: pageMetadata.categories,
          tags: pageMetadata.tags,
          template: pageMetadata.template,
          show_hero: pageMetadata.show_hero,
          show_footer: pageMetadata.show_footer,
          header_html: pageMetadata.header_html,
          footer_html: pageMetadata.footer_html,
          // Hero
          hero_title: pageMetadata.hero_title,
          hero_subtitle: pageMetadata.hero_subtitle,
          hero_background_image: pageMetadata.hero_background_image,
          hero_cta_text: pageMetadata.hero_cta_text,
          hero_cta_link: pageMetadata.hero_cta_link
        })
      });
      if (pageData) {
        // After save, snapshot history and sync version counters so isDirty becomes false
        snapshotHistory();
        setSavedBlocksVersion(blocksVersion);
        setSavedPageDataVersion(pageDataVersion);
      }
      toast.success('Page sauvegardée avec succès !');
    } catch (error) {
      console.error('Erreur sauvegarde du builder:', error);
      toast.error('Erreur lors de la sauvegarde. Réessayez plus tard.');
    } finally {
      setIsSaving(false);
    }
  }, [blocks, pageId, pageData, snapshotHistory, blocksVersion, pageDataVersion]);

  // Auto-save with debounce (3 seconds)
  const debouncedIsDirty = useDebounce(isDirty, 3000);
  
  useEffect(() => {
    if (debouncedIsDirty && pageId && !isLoading) {
      handleSave();
    }
  }, [debouncedIsDirty, pageId, isLoading, handleSave]);

  const pageVersions = useMemo(() => {
    return pageId ? getVersions(pageId) : [];
  }, [getVersions, pageId]);

  useEffect(() => {
    if (!pageId) return;

    const loadAnalytics = async () => {
      const analytics = await getPageAnalytics(pageId);
      setAnalyticsData(analytics);
    };

    loadAnalytics();
  }, [pageId, getPageAnalytics]);

  const handleCreateVersion = useCallback(async () => {
    if (!pageId || !pageData) {
      toast.error('Impossible de créer une version sans données de page.');
      return;
    }

    await createVersion(pageId, pageData.title, JSON.stringify({ blocks, pageData }), versionChangeLog || 'Sauvegarde manuelle du builder');
    setVersionDialogOpen(false);
    toast.success('Version créée pour cette page.');
  }, [pageId, pageData, blocks, createVersion, versionChangeLog]);

  const handleRestoreVersion = useCallback(async (versionId: string) => {
    const version = await restoreVersion(versionId);
    if (!version) {
      toast.error('Version introuvable.');
      return;
    }

    try {
      const payload = JSON.parse(version.content);
      if (payload.blocks) {
        setBlocks(payload.blocks);
      }
      if (payload.pageData) {
        setPageData(payload.pageData);
      }
      toast.success(`Version ${version.version} restaurée.`);
    } catch (restoreError) {
      console.error('Erreur restauration version:', restoreError);
      toast.error('Impossible de restaurer cette version.');
    }
  }, [restoreVersion, setBlocks]);

  // 3. Drag End Handler (optimized with useCallback)
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    try {
      const { active, over } = event;

      if (!over) return;

      const activeId = active.id.toString();
      const overId = over.id.toString();

      // Pre-compute block map for O(1) lookups instead of O(n) recursive searches
      const buildBlockMap = (nodes: Block[], parentId: string | null = null): Map<string, { node: Block, parentList: Block[], index: number, parentId: string | null }> => {
        const map = new Map();
        
        const processNode = (nodeList: Block[], currentParentId: string | null) => {
          nodeList.forEach((node, index) => {
            map.set(node.id, {
              node,
              parentList: nodeList,
              index,
              parentId: currentParentId
            });
            
            if (node.children && node.children.length > 0) {
              processNode(node.children, node.id);
            }
          });
        };
        
        processNode(nodes, parentId);
        return map;
      };

      const blockMap = buildBlockMap(blocks);
      
      const getNode = (id: string) => blockMap.get(id);
      const removeNodeFromMap = (id: string): Block | null => {
        const info = getNode(id);
        if (!info) return null;
        
        info.parentList.splice(info.index, 1);
        return info.node;
      };

      // Use Immer for efficient immutable updates
      const newBlocks = produce(blocks, (draft) => {
        // Rebuild map for draft state
        const draftMap = buildBlockMap(draft);
        const getDraftNode = (id: string) => draftMap.get(id);

        // CASE 1: Dropping from Sidebar (New Block/Template)
        if (activeId.startsWith('sidebar-')) {
          let targetList = draft;
          let targetIndex = draft.length;

          if (overId !== 'canvas-droppable') {
            const overNodeInfo = getDraftNode(overId);
            if (overNodeInfo) {
              // If hovering over an empty section, drop inside it
              if (overNodeInfo.node.type === 'section' && (!overNodeInfo.node.children || overNodeInfo.node.children.length === 0)) {
                 if (!overNodeInfo.node.children) overNodeInfo.node.children = [];
                 targetList = overNodeInfo.node.children;
                 targetIndex = 0;
              } else {
                 // Otherwise drop as sibling
                 targetList = overNodeInfo.parentList;
                 targetIndex = overNodeInfo.index;
              }
            }
          }

          if (activeId.startsWith('sidebar-item-')) {
            const type = active.data.current?.type;
            if (type) {
              const newBlock: Block = {
                id: crypto.randomUUID(),
                type,
                content: { title: `Nouveau ${type}` },
                style: { padding: '20px' },
                children: []
              };
              targetList.splice(targetIndex, 0, newBlock);
            }
          } else if (activeId.startsWith('sidebar-template-')) {
            const templateBlock = active.data.current?.block;
            if (templateBlock) {
               const clone = JSON.parse(JSON.stringify(templateBlock));
               clone.id = crypto.randomUUID();
               targetList.splice(targetIndex, 0, clone);
            }
          }
        }
        // CASE 2: Reordering Existing Blocks
        else if (activeId !== overId) {
          const activeNodeInfo = getDraftNode(activeId);
          const overNodeInfo = getDraftNode(overId);

          if (activeNodeInfo && overNodeInfo) {
            // Remove from old location
            const draggedNode = removeNodeFromMap(activeId);
            if (!draggedNode) return;

            // Find over location again because mutation might have shifted indexes
            const updatedOverNodeInfo = getDraftNode(overId);
            if (updatedOverNodeInfo) {
              // If dropping into an empty section
              if (updatedOverNodeInfo.node.type === 'section' && (!updatedOverNodeInfo.node.children || updatedOverNodeInfo.node.children.length === 0)) {
                if (!updatedOverNodeInfo.node.children) updatedOverNodeInfo.node.children = [];
                updatedOverNodeInfo.node.children.push(draggedNode);
              } else {
                // Drop as sibling
                let targetIndex = updatedOverNodeInfo.index;
                // If dragging down in the same list, adjust index
                if (activeNodeInfo.parentList === updatedOverNodeInfo.parentList && activeNodeInfo.index < updatedOverNodeInfo.index) {
                  targetIndex = updatedOverNodeInfo.index; // already shifted by removeNode
                }
                updatedOverNodeInfo.parentList.splice(targetIndex, 0, draggedNode);
              }
            } else {
               // fallback to root
               draft.push(draggedNode);
            }
          }
        }
      });

      setBlocks(newBlocks);
      setBlocksVersion(v => v + 1);
    } catch (error) {
      console.error('Erreur lors du drag & drop:', error);
      toast.error('Erreur lors du déplacement du bloc');
    }
  }, [blocks, setBlocks]);

  // Helper for View Mode Width (optimized with useCallback)
  const getCanvasWidth = useCallback(() => {
    switch (viewMode) {
      case 'mobile':return 'max-w-[375px]';
      case 'tablet':return 'max-w-[768px]';
      default:return 'max-w-6xl';
    }
  }, [viewMode]);

  // Keyboard shortcuts
  useBuilderKeyboardShortcuts({
    onSave: handleSave,
    onUndo: undo,
    onRedo: redo,
    onDelete: () => selectedBlockId && removeBlock(selectedBlockId)
  });

  // Add sensors for smoother drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex h-screen w-full bg-slate-100 overflow-hidden">

                {/* GAUCHE: Bibliothèques */}
                <BuilderSidebar
                  templates={templates}
                  deleteTemplate={deleteTemplate}
                />

                {/* CENTRE: Canvas */}
                <main className="flex-1 flex flex-col relative w-0 bg-slate-100">

                    {/* Toolbar */}
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
                      setVersionDialogOpen={setVersionDialogOpen}
                      setShowAnalytics={setShowAnalytics}
                    />

                    <Dialog open={showPreview} onOpenChange={setShowPreview}>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
                        <DialogHeader>
                          <DialogTitle>Aperçu de la page</DialogTitle>
                          <DialogDescription>Visualisez le rendu final de la page sans les contrôles du builder.</DialogDescription>
                        </DialogHeader>
                        <div className="p-4 border-b bg-slate-50 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">Mode aperçu</span>
                            <span className="text-xs text-slate-500">{pageData?.title || 'Page'}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant={previewMode === 'desktop' ? 'default' : 'outline'} onClick={() => setPreviewMode('desktop')}>
                              <Monitor className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant={previewMode === 'tablet' ? 'default' : 'outline'} onClick={() => setPreviewMode('tablet')}>
                              <Tablet className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant={previewMode === 'mobile' ? 'default' : 'outline'} onClick={() => setPreviewMode('mobile')}>
                              <Smartphone className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-slate-200 p-4 overflow-auto h-[calc(90vh-120px)]">
                          <div className={`mx-auto bg-white shadow rounded overflow-hidden ${previewMode === 'desktop' ? 'max-w-4xl' : previewMode === 'tablet' ? 'max-w-md' : 'max-w-sm'}`}>
                            <BuilderPageRenderer blocks={blocks} isEditor={false} className="min-h-[75vh]" />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Historique des versions</DialogTitle>
                          <DialogDescription>Gérez les sauvegardes manuelles de cette page.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-50 rounded border border-slate-200">
                            <label htmlFor="version-change-log" className="block text-xs uppercase text-slate-400 mb-2">Description de la version</label>
                            <input
                              id="version-change-log"
                              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                              value={versionChangeLog}
                              onChange={(e) => setVersionChangeLog(e.target.value)}
                            />
                            <div className="mt-3 text-right">
                              <Button size="sm" onClick={handleCreateVersion} className="min-w-[140px]">
                                Créer une version
                              </Button>
                            </div>
                          </div>

                          {pageVersions.length === 0 ? (
                            <div className="text-sm text-slate-500">Aucune version enregistrée pour cette page.</div>
                          ) : (
                            <div className="space-y-3">
                              {pageVersions.map((version) => (
                                <div key={version.id} className="p-4 rounded border border-slate-200 bg-white flex flex-col gap-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="text-sm font-semibold">Version {version.version}</div>
                                      <div className="text-[11px] text-slate-500">{version.title}</div>
                                    </div>
                                    <div className="text-[11px] text-slate-400">{new Date(version.timestamp).toLocaleString()}</div>
                                  </div>
                                  <div className="text-[12px] text-slate-600">{version.changeLog}</div>
                                  <div className="flex flex-wrap gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleRestoreVersion(version.id)}>
                                      Restaurer
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
                      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Analytics de page</DialogTitle>
                          <DialogDescription>Vue sur les performances et l’engagement de cette page.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded border border-slate-200 bg-slate-50">
                              <div className="text-xs uppercase text-slate-400">Vues</div>
                              <div className="text-3xl font-semibold text-slate-900">{analyticsData?.views ?? '—'}</div>
                            </div>
                            <div className="p-4 rounded border border-slate-200 bg-slate-50">
                              <div className="text-xs uppercase text-slate-400">Visiteurs uniques</div>
                              <div className="text-3xl font-semibold text-slate-900">{analyticsData?.uniqueVisitors ?? '—'}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded border border-slate-200 bg-slate-50">
                              <div className="text-xs uppercase text-slate-400">Temps moyen</div>
                              <div className="text-2xl font-semibold text-slate-900">{analyticsData?.avgTime ?? '—'}</div>
                            </div>
                            <div className="p-4 rounded border border-slate-200 bg-slate-50">
                              <div className="text-xs uppercase text-slate-400">Taux de rebond</div>
                              <div className="text-2xl font-semibold text-slate-900">{analyticsData?.bounceRate ?? '—'}</div>
                            </div>
                          </div>
                          <div className="text-sm text-slate-500">Les données affichées sont basées sur des analytics agrégés et la correspondance de page.</div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Zone de Drop (Canvas) */}
                    <div className="flex-1 overflow-auto p-8 relative bg-slate-100/50 custom-scrollbar flex justify-center">
                        <BuilderCanvas blocks={blocks} widthClass={getCanvasWidth()} />
                        {(isLoading || loadError) && (
                          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-white/90 text-center p-6">
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                                  <p className="mt-4 text-slate-700 text-sm font-semibold">Chargement du builder...</p>
                                  <p className="text-[11px] text-slate-500 max-w-xs mt-2">Patientez pendant que la page et ses blocs sont prêts à l’édition.</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-rose-600 text-sm font-semibold">Erreur de chargement</p>
                                  <p className="mt-2 text-slate-600 text-[12px] max-w-sm">{loadError}</p>
                                  <Button size="sm" className="mt-4" onClick={() => window.location.reload()}>Recharger</Button>
                                </>
                              )}
                          </div>
                        )}
                    </div>
                </main>

                {/* DROITE: Propriétés */}
                <BuilderRightPanel
                  selectedBlockId={selectedBlockId}
                  pageData={pageData}
                  pageMetadata={pageMetadata}
                  blocks={blocks}
                  selectBlock={selectBlock}
                  handlePageDataChange={handlePageDataChange}
                  setPageMetadata={setPageMetadata}
                />
            </div>
        </DndContext>);

};

export default BuilderPage;