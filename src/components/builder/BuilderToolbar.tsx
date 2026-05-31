import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Undo, Redo, Monitor, Tablet, Smartphone, Code, Eye, Save, Loader2,
  ChevronLeft, Sparkles, FileCode, Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import type { Block } from '@/types/builder';

interface BuilderToolbarProps {
  pageData: any;
  pageMetadata: any;
  blocks: Block[];
  viewMode: 'desktop' | 'tablet' | 'mobile';
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  loadError: boolean | null | string;
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  setViewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  handleSave: () => void;
  setShowPreview: (show: boolean) => void;
  setVersionDialogOpen: (open: boolean) => void;
  setShowAnalytics: (show: boolean) => void;
  setShowAIGeneration: (show: boolean) => void;
  setShowExport: (show: boolean) => void;
  showTimeline?: boolean;
  setShowTimeline?: (show: boolean) => void;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  pageData,
  pageMetadata,
  blocks,
  viewMode,
  isDirty,
  isSaving,
  isLoading,
  loadError,
  canUndo,
  canRedo,
  undo,
  redo,
  setViewMode,
  handleSave,
  setShowPreview,
  setVersionDialogOpen,
  setShowAnalytics,
  setShowAIGeneration,
  setShowExport,
  showTimeline,
  setShowTimeline,
}) => {
  return (
    <header className="h-14 bg-white border-b grid grid-cols-[auto_1fr_auto] items-center px-4 z-10 w-full shadow-sm shrink-0 gap-4">
      {/* Left Controls (Undo/Redo) */}
      <div className="flex items-center gap-2 min-w-fit">
        <Button variant="ghost" size="icon" className="mr-2 text-slate-400 hover:text-slate-600" title="Retour à la liste" asChild>
          <a href="/dashboard?tab=pages" title="Retour à la liste des pages">
            <ChevronLeft className="w-5 h-5" />
          </a>
        </Button>

        <div className="flex bg-slate-100 rounded p-1">
          <Button data-testid="undo-button" variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={!canUndo()} title="Annuler (Ctrl+Z)">
            <Undo className="w-4 h-4 text-slate-600" />
          </Button>
          <Button data-testid="redo-button" variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={!canRedo()} title="Rétablir (Ctrl+Y)">
            <Redo className="w-4 h-4 text-slate-600" />
          </Button>
          {setShowTimeline && (
            <Button variant="ghost" size="icon" className={`h-7 w-7 ${showTimeline ? 'bg-white shadow text-blue-600' : ''}`} onClick={() => setShowTimeline(!showTimeline)} title="Historique">
              <Clock className="w-4 h-4" />
            </Button>
          )}
        </div>
        <span className="h-6 w-px bg-slate-200 mx-2"></span>

        {/* Device Selector */}
        <div className="flex bg-slate-100 rounded p-1">
          <Button data-testid="view-desktop" variant="ghost" size="icon" className={`h-7 w-7 ${viewMode === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`} onClick={() => setViewMode('desktop')}>
            <Monitor className="w-4 h-4" />
          </Button>
          <Button data-testid="view-tablet" variant="ghost" size="icon" className={`h-7 w-7 ${viewMode === 'tablet' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`} onClick={() => setViewMode('tablet')}>
            <Tablet className="w-4 h-4" />
          </Button>
          <Button data-testid="view-mobile" variant="ghost" size="icon" className={`h-7 w-7 ${viewMode === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`} onClick={() => setViewMode('mobile')}>
            <Smartphone className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Center Info: Page Title */}
      <div className="min-w-0 flex flex-col items-center text-center overflow-hidden">
        {pageData ? (
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
          </>
        ) : (
          <div className="h-8 w-32 bg-slate-100 animate-pulse rounded"></div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 justify-end min-w-0 overflow-x-auto">
        <Button size="sm" variant="outline" onClick={() => setShowAIGeneration(true)} className="inline-flex text-violet-600 border-violet-200 hover:bg-violet-50">
          <Sparkles className="w-4 h-4 mr-2" /> IA
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowExport(true)} className="inline-flex text-emerald-600 border-emerald-200 hover:bg-emerald-50">
          <FileCode className="w-4 h-4 mr-2" /> Export
        </Button>

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
          data-testid="save-button"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 min-w-[120px] text-white"
          onClick={handleSave}
          disabled={isSaving || isLoading}>
          {isSaving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Sauvegarder</>
          )}
        </Button>
      </div>
    </header>
  );
};
