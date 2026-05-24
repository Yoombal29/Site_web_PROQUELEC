
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBuilderStore } from '@/stores/useBuilderStore';
import type { Block } from '@/types/builder';
import type { DragEndEvent } from '@dnd-kit/core';
import { produce } from 'immer';
import { useBuilderKeyboardShortcuts } from '@/hooks/useBuilderKeyboardShortcuts';

import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
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
import BuilderPageRenderer from '@/components/builder/BuilderPageRenderer';
import PropertyPanel from '@/components/builder/PropertyPanel';
import PageSettingsPanel from '@/components/builder/PageSettingsPanel';
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

      // Recursive helpers (work with draft state)
      const findNode = (nodes: Block[], id: string): { node: Block, parentList: Block[], index: number } | null => {
        const index = nodes.findIndex(n => n.id === id);
        if (index !== -1) return { node: nodes[index], parentList: nodes, index };
        for (const node of nodes) {
          if (node.children) {
            const found = findNode(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const removeNode = (nodes: Block[], id: string): Block | null => {
        const index = nodes.findIndex(n => n.id === id);
        if (index !== -1) return nodes.splice(index, 1)[0];
        for (const node of nodes) {
          if (node.children) {
            const removed = removeNode(node.children, id);
            if (removed) return removed;
          }
        }
        return null;
      };

      // Use Immer for efficient immutable updates
      const newBlocks = produce(blocks, (draft) => {
        // CASE 1: Dropping from Sidebar (New Block/Template)
        if (activeId.startsWith('sidebar-')) {
          let targetList = draft;
          let targetIndex = draft.length;

          if (overId !== 'canvas-droppable') {
            const overNodeInfo = findNode(draft, overId);
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
          const activeNodeInfo = findNode(draft, activeId);
          const overNodeInfo = findNode(draft, overId);

          if (activeNodeInfo && overNodeInfo) {
            // Remove from old location
            const draggedNode = removeNode(draft, activeId);
            if (!draggedNode) return;

            // Find over location again because mutation might have shifted indexes
            const updatedOverNodeInfo = findNode(draft, overId);
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

  return (
    <DndContext onDragEnd={handleDragEnd}>
            <div className="flex h-screen w-full bg-slate-100 overflow-hidden">

                {/* GAUCHE: Bibliothèques */}
                <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0">
                    <div className="h-14 border-b flex items-center px-4 font-semibold text-slate-700 bg-slate-50">
                        <Plus className="w-5 h-5 mr-2 text-blue-600" /> Bibliothèque
                    </div>

                    <Tabs defaultValue="elements" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-2 pt-2 border-b bg-slate-50">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="elements" className="text-xs">Éléments</TabsTrigger>
                                <TabsTrigger value="templates" className="text-xs">Modèles</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="elements" className="flex-1 overflow-y-auto p-4 space-y-2">
                            <div className="uppercase text-[10px] font-bold text-slate-400 mb-2 tracking-wider">Base</div>
                            <DraggableItem type="hero" label="Hero Section" icon={<LayoutTemplate size={16} />} />
                            <DraggableItem type="section" label="Section Vide" icon={<Box size={16} />} />
                            <DraggableItem type="text-block" label="Bloc Texte" icon={<Box size={16} />} />
                            <DraggableItem type="image" label="Image Seule" icon={<Box size={16} />} />
                            <DraggableItem type="html" label="Code HTML" icon={<Box size={16} />} />

                            <div className="uppercase text-[10px] font-bold text-emerald-600 mb-2 mt-5 tracking-wider border-t border-slate-100 pt-4">
                              🏠 Sections Page d'accueil
                            </div>
                            <DraggableItem type="HeroBanner" label="🎞 Carrousel Hero" icon={<LayoutTemplate size={16} />} />
                            <DraggableItem type="AudienceOffers" label="🎯 Offres Audience" icon={<Box size={16} />} />
                            <DraggableItem type="VisionMission" label="🎖 Vision & Mission" icon={<Box size={16} />} />
                            <DraggableItem type="LandingStats" label="📊 Statistiques" icon={<Box size={16} />} />
                            <DraggableItem type="LatestNews" label="📰 Actualités" icon={<Box size={16} />} />
                            <DraggableItem type="PartnerLogos" label="🤝 Partenaires" icon={<Box size={16} />} />
                        </TabsContent>


                        <TabsContent value="templates" className="flex-1 overflow-y-auto p-4 space-y-3">
                            <div className="uppercase text-[10px] font-bold text-slate-400 mb-2 tracking-wider">Mes Modèles</div>
                            {templates.length === 0 &&
              <div className="text-center py-8 text-slate-400 text-xs italic border border-dashed rounded bg-slate-50">
                                    Aucun modèle sauvegardé.<br />
                                    Utilisez le panneau de droite.
                                </div>
              }
                            {templates.map((tpl) =>
              <div key={tpl.id} className="group relative">
                                    <DraggableTemplate template={tpl} />
                                    <button
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {e.stopPropagation();deleteTemplate(tpl.id);}}
                  title="Supprimer le modèle">
                  
                                        <Trash2 size={12} />
                                    </button>
                                </div>
              )}
                        </TabsContent>
                    </Tabs>
                </aside>

                {/* CENTRE: Canvas */}
                <main className="flex-1 flex flex-col relative w-0 bg-slate-100">

                    {/* Toolbar */}
                    <header className="h-14 bg-white border-b grid grid-cols-[auto_1fr_auto] items-center px-4 z-10 w-full shadow-sm shrink-0 gap-4">

                        {/* Left Controls (Undo/Redo) */}
                        <div className="flex items-center gap-2 min-w-fit">
                            <Button variant="ghost" size="icon" className="mr-2 text-slate-400 hover:text-slate-600" title="Retour à la liste" asChild>
                                <a href="/dashboard?tab=pages" title="Retour à la liste des pages">
                                    <ChevronLeft className="w-5 h-5" />
                                </a>
                            </Button>

                            <div className="flex bg-slate-100 rounded p-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={!canUndo()} title="Annuler (Ctrl+Z)">
                                    <Undo className="w-4 h-4 text-slate-600" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={!canRedo()} title="Rétablir (Ctrl+Y)">
                                    <Redo className="w-4 h-4 text-slate-600" />
                                </Button>
                            </div>
                            <span className="h-6 w-px bg-slate-200 mx-2"></span>

                            {/* Device Selector */}
                            <div className="flex bg-slate-100 rounded p-1">
                                <Button variant="ghost" size="icon" className={`h-7 w-7 ${viewMode === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`} onClick={() => setViewMode('desktop')}>
                                    <Monitor className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className={`h-7 w-7 ${viewMode === 'tablet' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`} onClick={() => setViewMode('tablet')}>
                                    <Tablet className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className={`h-7 w-7 ${viewMode === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`} onClick={() => setViewMode('mobile')}>
                                    <Smartphone className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Center Info: Page Title */}
                        <div className="min-w-0 flex flex-col items-center text-center overflow-hidden">
                            {pageData ?
              <>
                                    <h1 className="text-sm font-bold text-slate-800 flex flex-wrap items-center justify-center gap-2 truncate">
                                        <span className="truncate">{pageData.title}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-tighter ${pageData.workflowStatus === 'published' ? 'bg-emerald-50 text-emerald-700' : pageData.workflowStatus === 'review' ? 'bg-amber-50 text-amber-700' : pageData.workflowStatus === 'archived' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                                          {pageData.workflowStatus === 'published' ? 'Publié' : pageData.workflowStatus === 'review' ? 'En relecture' : pageData.workflowStatus === 'archived' ? 'Archivée' : 'Brouillon'}
                                        </span>
                                    </h1>
                                    <p className="text-[10px] text-slate-400 font-mono italic truncate">/{pageData.slug}</p>
                                    <div className="mt-1 flex gap-2 flex-wrap justify-center">
                                        {loadError ? (
                                            <span className="text-[10px] uppercase text-rose-500 tracking-[0.18em] font-semibold">Erreur de chargement</span>
                                        ) : isDirty ? (
                                            <span className="text-[10px] uppercase text-amber-500 tracking-[0.18em] font-semibold">Modifications non sauvegardées</span>
                                        ) : (
                                            <span className="text-[10px] uppercase text-emerald-600 tracking-[0.18em] font-semibold">Synchronisé</span>
                                        )}
                                    </div>
                                </> :

              <div className="h-8 w-32 bg-slate-100 animate-pulse rounded"></div>
              }
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 justify-end min-w-0 overflow-x-auto">
                            {/* Code View Dialog */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="inline-flex text-slate-600">
                                        <Code className="w-4 h-4 mr-2" /> Code
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Code Structure (JSON)</DialogTitle>
                                        <DialogDescription>
                                            Structure brute de la page.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <pre className="bg-slate-950 text-slate-50 p-4 rounded text-xs font-mono overflow-auto max-h-[500px]">
                                        {JSON.stringify(blocks, null, 2)}
                                    </pre>
                                </DialogContent>
                            </Dialog>

                            <Button size="sm" variant="outline" onClick={() => setShowPreview(true)} className="inline-flex text-slate-600">
                                <Eye className="w-4 h-4 mr-2" /> Aperçu
                            </Button>

                            <Button size="sm" variant="outline" onClick={() => setVersionDialogOpen(true)} className="inline-flex text-slate-600">
                                <Code className="w-4 h-4 mr-2" /> Versions
                            </Button>

                            <Button size="sm" variant="outline" onClick={() => setShowAnalytics(true)} className="inline-flex text-slate-600">
                                <Monitor className="w-4 h-4 mr-2" /> Analytics
                            </Button>

                            <Button size="sm" variant="outline" asChild>
                                <Link to="/admin?tab=pages">
                                    Retour au menu
                                </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                                <a href={`/${pageData?.slug || ''}`} target="_blank" rel="noreferrer">
                                    Voir
                                </a>
                            </Button>
                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 min-w-[120px] text-white"
                                onClick={handleSave}
                                disabled={isSaving || isLoading}>
                                {isSaving ?
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</> :
                                    <><Save className="w-4 h-4 mr-2" /> Sauvegarder</>
                                }
                            </Button>
                        </div>
                    </header>

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
                        <DroppableCanvas blocks={blocks} widthClass={getCanvasWidth()} />
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
                <aside className="border-l border-slate-200 flex flex-col shadow-sm z-10 w-[400px] min-w-[400px] bg-white transition-all duration-300 shrink-0">
                    <Tabs value={selectedBlockId ? 'block' : 'page'} className="flex flex-col h-full">
                      <div className="border-b bg-slate-50 px-2 pt-1.5 shrink-0">
                        <TabsList className="w-full grid grid-cols-2 h-9 bg-slate-100/80">
                          <TabsTrigger
                            value="block"
                            onClick={() => { if (!selectedBlockId) selectBlock(null); }}
                            className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                          >
                            <Box className="w-3 h-3" />
                            Bloc
                            {selectedBlockId && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-1"></span>}
                          </TabsTrigger>
                          <TabsTrigger
                            value="page"
                            onClick={() => selectBlock(null)}
                            className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                          >
                            <Globe className="w-3 h-3" />
                            Page
                          </TabsTrigger>
                        </TabsList>
                      </div>
                      <TabsContent value="block" className="flex-1 overflow-hidden mt-0">
                        <PropertyPanel
                          pageSettings={pageData ? {
                            title: pageData.title,
                            slug: pageData.slug,
                            metaDescription: pageData.metaDescription,
                            metaKeywords: pageData.metaKeywords,
                            metaRobots: pageData.metaRobots,
                            customCss: pageData.customCss,
                            customJs: pageData.customJs,
                            isPublished: pageData.isPublished,
                            workflowStatus: pageData.workflowStatus
                          } : undefined}
                          onPageSettingsChange={(changes) => handlePageDataChange(changes as unknown as Partial<PageDataState>)}
                        />
                      </TabsContent>
                      <TabsContent value="page" className="flex-1 overflow-hidden mt-0">
                        <PageSettingsPanel
                          pageSettings={pageData ? {
                            title: pageData.title,
                            slug: pageData.slug,
                            metaDescription: pageData.metaDescription,
                            metaKeywords: pageData.metaKeywords,
                            metaRobots: pageData.metaRobots,
                            customCss: pageData.customCss,
                            customJs: pageData.customJs,
                            designOptions: pageData.designOptions as unknown as Record<string, unknown>,
                            isPublished: pageData.isPublished,
                            workflowStatus: pageData.workflowStatus
                          } : undefined}
                          onPageSettingsChange={(changes) => handlePageDataChange(changes as unknown as Partial<PageDataState>)}
                          pageMetadata={pageMetadata}
                          onPageMetadataChange={setPageMetadata}
                          contentHtml={JSON.stringify(blocks)}
                        />
                      </TabsContent>
                    </Tabs>
                </aside>
            </div>
        </DndContext>);

};

// Composant Draggable Item (Élément de base)
const DraggableItem = ({ type, label, icon }: {type: string;label: string;icon?: React.ReactNode;}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-item-${type}`,
    data: { type }
  });

  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const setRefs = React.useCallback((node: HTMLDivElement | null) => {
    nodeRef.current = node;
    setNodeRef(node);
  }, [setNodeRef]);

  React.useEffect(() => {
    if (nodeRef.current) {
      nodeRef.current.style.transform = transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : '';
    }
  }, [transform]);

  return (
    <div
      ref={setRefs}
      {...listeners}
      {...attributes}
      className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded cursor-grab active:cursor-grabbing flex items-center gap-3 transition-colors shadow-sm select-none">
      
            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-500">
                {icon}
            </div>
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>);

};

// Composant Draggable Template (Modèle Sauvegardé)
const DraggableTemplate = ({ template }: {template: LegacyTemplate;}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-template-${template.id}`,
    data: { block: template.block }
  });

  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const setRefs = React.useCallback((node: HTMLDivElement | null) => {
    nodeRef.current = node;
    setNodeRef(node);
  }, [setNodeRef]);

  React.useEffect(() => {
    if (nodeRef.current) {
      nodeRef.current.style.transform = transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : '';
    }
  }, [transform]);

  return (
    <div
      ref={setRefs}
      {...listeners}
      {...attributes}
      className="p-3 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded cursor-grab active:cursor-grabbing flex flex-col gap-1 transition-colors shadow-sm select-none relative overflow-hidden">
      
            <div className="flex items-center gap-2 mb-1">
                <Box size={14} className="text-purple-500" />
                <span className="text-sm font-bold text-slate-800 truncate pr-4">{template.name}</span>
            </div>
            <span className="text-[10px] text-slate-400 capitalize">{template.block.type} • {new Date(template.createdAt).toLocaleDateString()}</span>
        </div>);

};

// Composant Droppable (Zone Canvas)
const DroppableCanvas = React.memo(({ blocks, widthClass }: { blocks: Block[]; widthClass: string }) => {
  const { isOver, setNodeRef } = useDroppable({ id: 'canvas-droppable' });
  const { selectedBlockId, selectBlock } = useBuilderStore();

  const overClasses = isOver ? 'border-blue-400 shadow-lg' : 'border-slate-200';

  // Memoize block IDs to prevent recalculation on every render
  const sortableItems = useMemo(() => {
    const getAllBlockIds = (nodes: Block[]): string[] => {
      return nodes.reduce((acc, b) => [...acc, b.id, ...getAllBlockIds(b.children || [])], [] as string[]);
    };
    return getAllBlockIds(blocks);
  }, [blocks]);

  return (
    <div
      ref={setNodeRef}
      className={`${widthClass} w-full min-h-[800px] bg-white shadow-xl rounded-sm border-2 ${overClasses} transition-all p-8 shrink-0 click-outside-handler pb-32`}
      onClick={(e) => {
        if (e.target === e.currentTarget && selectedBlockId) {
          selectBlock(null);
        }
      }}>
      
            <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
                {blocks.length > 0 ? <BuilderPageRenderer
          blocks={blocks}
          isEditor={true}
          selectedId={selectedBlockId}
          onSelect={selectBlock} /> :


        <div className="flex flex-col items-center justify-center h-[400px] text-slate-300 border-2 border-dashed border-slate-100 rounded-lg">
                        <MousePointer2 className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-400">La page est vide</p>
                        <p className="text-sm">Glissez un élément ou un modèle depuis la barre latérale.</p>
                    </div>
        }
            </SortableContext>
        </div>);

});

export default BuilderPage;