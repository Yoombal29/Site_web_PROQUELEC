
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBuilderStore } from '@/stores/useBuilderStore';
import type { Block } from '@/types/builder';
import type { DragEndEvent } from '@dnd-kit/core';

import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import {
  Plus, LayoutTemplate, Box, Trash2, Save, Loader2, MousePointer2,
  Monitor, Tablet, Smartphone, Undo, Redo, Code, ChevronLeft } from
'lucide-react';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove } from
'@dnd-kit/sortable';
import BuilderPageRenderer from '@/components/builder/BuilderPageRenderer';
import PropertyPanel from '@/components/builder/PropertyPanel';
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
    canRedo
  } = useBuilderStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [pageInfo, setPageInfo] = useState<{ title: string; slug: string } | null>(null);
  const [initialBlocks, setInitialBlocks] = useState<Block[]>([]);

  const isDirty = useMemo(() => JSON.stringify(blocks) !== JSON.stringify(initialBlocks), [blocks, initialBlocks]);

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
        const adminPage = await apiFetch<{ title?: string; slug?: string; structure_json?: unknown; content_blocks?: unknown[]; content?: string }>(`/api/admin/pages/${pageId}`);

        if (!adminPage) {
          setLoadError('Page introuvable.');
          setBlocks([]);
          return;
        }

        setPageInfo({ title: adminPage.title || `Page ${pageId}`, slug: adminPage.slug || pageId });

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
            availableBlocks = adminPage.content_blocks.map((b: any) => ({
              id: b?.id || `legacy-${Math.random().toString(36).slice(2, 9)}`,
              type: b?.type === 'text' ? 'text-block' : b?.type || 'section',
              content: {
                title: b?.data?.title,
                subtitle: b?.data?.subtitle,
                text: b?.data?.text || b?.data?.cta_text,
                html: b?.data?.content,
                src: b?.data?.url,
                href: b?.data?.cta_link || b?.data?.href,
                caption: b?.data?.caption
              },
              style: b?.data?.background_image ? {
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
        setInitialBlocks(availableBlocks || []);
      } catch (error: unknown) {
        console.error('Erreur chargement du builder:', error);
        if ((error as any)?.status === 401) {
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
        body: JSON.stringify({ structure_json: blocks })
      });
      setInitialBlocks(blocks);
      toast.success('Page sauvegardée avec succès !');
    } catch (error) {
      console.error('Erreur sauvegarde du builder:', error);
      toast.error('Erreur lors de la sauvegarde. Réessayez plus tard.');
    } finally {
      setIsSaving(false);
    }
  }, [blocks, pageId]);

  // 3. Drag End Handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // CASE 1: Dropping from Sidebar (New Block/Template)
    if (activeId.startsWith('sidebar-')) {
      let index = blocks.length; // Default: end

      if (overId !== 'canvas-droppable') {
        // If dropped over a specific block, insert before it
        const overIndex = blocks.findIndex((b) => b.id === overId);
        if (overIndex !== -1) index = overIndex;
      }

      if (activeId.startsWith('sidebar-item-')) {
        const type = active.data.current?.type;
        if (type) addBlock(type, undefined, index);
      } else if (activeId.startsWith('sidebar-template-')) {
        const templateBlock = active.data.current?.block;
        if (templateBlock) importBlock(templateBlock, undefined, index);
      }
    }
    // CASE 2: Reordering Existing Blocks
    else if (activeId !== overId) {
      const oldIndex = blocks.findIndex((b) => b.id === activeId);
      const newIndex = blocks.findIndex((b) => b.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = arrayMove(blocks, oldIndex, newIndex);
        setBlocks(newBlocks);
      }
    }
  };

  // Helper for View Mode Width
  const getCanvasWidth = () => {
    switch (viewMode) {
      case 'mobile':return 'max-w-[375px]';
      case 'tablet':return 'max-w-[768px]';
      default:return 'max-w-6xl';
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
            <div className="flex h-screen w-full bg-slate-100 overflow-hidden">

                {/* GAUCHE: Bibliothèques */}
                <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0">
                    <div className="h-14 border-b flex items-center px-4 font-bold text-slate-700 bg-white">
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
                    <header className="h-14 bg-white border-b flex items-center justify-between px-4 z-10 w-full shadow-sm shrink-0">

                        {/* Left Controls (Undo/Redo) */}
                        <div className="flex items-center gap-2">
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
                        <div className="flex flex-col items-center">
                            {pageInfo ?
              <>
                                    <h1 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        {pageInfo.title}
                                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] uppercase font-bold tracking-tighter">Edition</span>
                                    </h1>
                                    <p className="text-[10px] text-slate-400 font-mono italic">/{pageInfo.slug}</p>
                                    <div className="mt-1 flex gap-2">
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
                        <div className="flex gap-2">
                            {/* Code View Dialog */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="hidden xl:flex text-slate-500">
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

                            <Button size="sm" variant="outline" asChild>
                                <Link to="/admin?tab=pages">
                                    Retour au menu
                                </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                                <a href={`/${pageInfo?.slug || ''}`} target="_blank" rel="noreferrer">
                                    Voir
                                </a>
                            </Button>
                            <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                onClick={handleSave}
                disabled={isSaving || isLoading}>
                
                                {isSaving ?
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</> :

                <><Save className="w-4 h-4 mr-2" /> Sauvegarder</>
                }
                            </Button>
                        </div>
                    </header>

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
                    <PropertyPanel />
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

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
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
const DraggableTemplate = ({ template }: {template: unknown;}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-template-${template.id}`,
    data: { block: template.block }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
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
const DroppableCanvas = ({ blocks, widthClass }: { blocks: Block[]; widthClass: string }) => {
  const { isOver, setNodeRef } = useDroppable({ id: 'canvas-droppable' });
  const { selectedBlockId, selectBlock } = useBuilderStore();

  const style = {
    borderColor: isOver ? '#3b82f6' : '#e2e8f0',
    transition: 'all 0.3s ease-in-out'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${widthClass} w-full min-h-[800px] bg-white shadow-xl rounded-sm border-2 transition-all p-8 shrink-0 click-outside-handler pb-32`}
      onClick={(e) => {
        if (e.target === e.currentTarget && selectedBlockId) {
          selectBlock(null);
        }
      }}>
      
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
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

};

export default BuilderPage;