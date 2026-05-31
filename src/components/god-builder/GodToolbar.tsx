import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useEditor } from '@craftjs/core';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Monitor, Smartphone, Tablet, Undo2, Redo2, Code2, Save,
  ChevronLeft, Eye, EyeOff, Copy, Keyboard, Layers, Zap, Sparkles,
  Download, Upload, History, Loader2, FileJson
} from 'lucide-react';
import { useGodEditor } from './GodEditorContext';
import { useBrandingStore } from '@/stores/branding.store';
import { TemplateManagerDialog } from './TemplateManagerDialog';
import { useBuilderHistoryStore } from '@/stores/builder-history.store';
import { HtmlBlock } from '@/components/blocks/ProquelecBlocks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const LazyMonacoEditor = lazy(() => import('@monaco-editor/react'));

export const GodToolbar = () => {
  const { actions, query, canUndo, canRedo, isEnabled, htmlNodeId, htmlValue } = useEditor((state, query) => {
    let foundId: string | null = null;
    let foundHtml = '';

    Object.entries(state.nodes).forEach(([id, node]) => {
      const resolvedName = (node.data.type as any)?.resolvedName || '';
      if (resolvedName === 'HtmlBlock') {
        foundId = id;
        foundHtml = node.data.props.html || '';
      }
    });

    return {
      canUndo: query.history.canUndo(),
      canRedo: query.history.canRedo(),
      isEnabled: state.options.enabled,
      htmlNodeId: foundId,
      htmlValue: foundHtml,
    };
  });

  const { savePage, isSaving, pageData } = useGodEditor();
  const { autosaveStatus, timelineOpen, setTimelineOpen } = useBuilderHistoryStore();
  const { config: brand } = useBrandingStore();
  const navigate = useNavigate();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const [htmlDialogOpen, setHtmlDialogOpen] = useState(false);
  const [globalHtml, setGlobalHtml] = useState(htmlValue);
  const globalEditorRef = useRef<any>(null);

  // Sync state when dialog opens
  useEffect(() => {
    if (htmlDialogOpen) {
      setGlobalHtml(htmlValue);
    }
  }, [htmlDialogOpen, htmlValue]);

  const handleSaveHtml = () => {
    if (htmlNodeId) {
      actions.setProp(htmlNodeId, (props: any) => {
        props.html = globalHtml;
      });
      toast.success('Code HTML de la page mis à jour.');
    } else {
      try {
        const htmlNode = query.createNode(
          React.createElement(HtmlBlock, { html: globalHtml })
        );
        actions.add(htmlNode, 'ROOT');
        toast.success('Bloc HTML créé et ajouté au conteneur principal.');
      } catch (err) {
        console.error('Erreur lors de la création du bloc HTML:', err);
        toast.error('Impossible de créer le bloc HTML.');
      }
    }
    setHtmlDialogOpen(false);
  };

  const handleGlobalEditorDidMount = (editor: any) => {
    globalEditorRef.current = editor;
  };

  const handleGlobalFormat = () => {
    if (globalEditorRef.current) {
      globalEditorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleGlobalExport = () => {
    navigator.clipboard.writeText(globalHtml);
    toast.info('Code HTML copié dans le presse-papier');
  };

  const handleGlobalImport = () => {
    const input = prompt('Collez votre code HTML ici pour écraser le contenu actuel :');
    if (input !== null) {
      setGlobalHtml(input);
      toast.success('Code HTML importé localement. Cliquez sur Appliquer pour enregistrer.');
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;

      if (e.key === 's' && (e.ctrlKey || e.metaKey) && !isTyping) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey && !isTyping) {
        e.preventDefault();
        if (canUndo) actions.history.undo();
      }
      if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        if (!isTyping) { e.preventDefault(); if (canRedo) actions.history.redo(); }
      }
      if (e.key === 'p' && (e.ctrlKey || e.metaKey) && !isTyping) {
        e.preventDefault();
        togglePreview();
      }
      if (e.key === 'h' && (e.ctrlKey || e.metaKey) && !isTyping) {
        e.preventDefault();
        setTimelineOpen(!timelineOpen);
      }
      if (e.key === 'Escape' && !isTyping) {
        actions.selectNode(undefined as any);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [canUndo, canRedo, isEnabled, timelineOpen]);

  const handleSave = async () => {
    const name = window.prompt("Nommer cette version historique (laisser vide pour publication simple) :");
    if (name === null) return; // User cancelled
    await savePage(name.trim() || undefined);
  };

  const togglePreview = () => {
    actions.setOptions(options => { options.enabled = !options.enabled; });
  };

  const handleExport = () => {
    const json = query.serialize();
    navigator.clipboard.writeText(JSON.stringify(JSON.parse(json), null, 2));
    toast.info('📋 JSON copié dans le presse-papier');
  };

  const changeViewport = (vp: 'desktop' | 'tablet' | 'mobile') => {
    setDevice(vp);
    window.dispatchEvent(new CustomEvent('god-viewport-change', { detail: vp }));
  };

  // Status Indicator Badge Component
  const StatusBadge = () => {
    switch (autosaveStatus) {
      case 'saving':
        return (
          <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold uppercase animate-pulse flex items-center gap-1.5 shrink-0">
            <Loader2 size={10} className="animate-spin" />
            Sauvegarde...
          </span>
        );
      case 'local_draft':
        return (
          <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 font-bold uppercase flex items-center gap-1.5 shrink-0">
            <Loader2 size={10} className="animate-spin" />
            Brouillon local
          </span>
        );
      case 'dirty':
        return (
          <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            Modifications en cours...
          </span>
        );
      case 'error':
        return (
          <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-bold flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
            Non sauvegardé
          </span>
        );
      case 'saved':
      default:
        return (
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            Sauvegardé
          </span>
        );
    }
  };

  return (
    <div className="w-full h-14 bg-[#12121f] border-b border-[#252538] flex items-center justify-between px-3 text-white shadow-lg z-50 shrink-0">

      {/* LEFT: Navigation & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate('/admin?tab=pages')}
          className="p-2 hover:bg-[#252538] rounded-lg transition-colors text-slate-400 hover:text-white shrink-0"
          title="Retour aux pages"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Zap size={13} className="text-amber-400 shrink-0" />
              <h1 className="font-black text-sm bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 truncate">
                {brand.brandName}
              </h1>
            </div>
            <StatusBadge />
          </div>
          <span className="text-[9px] text-slate-500 font-mono tracking-widest truncate">
            {pageData?.title || 'Chargement...'}
          </span>
        </div>
      </div>

      {/* CENTER: Viewport + Preview */}
      <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
        {/* Viewport */}
        <div className="flex items-center bg-[#0d0d1a] rounded-lg p-1 border border-[#252538]">
          {([
            { key: 'desktop', Icon: Monitor, label: 'Desktop (Ctrl+1)' },
            { key: 'tablet', Icon: Tablet, label: 'Tablet (Ctrl+2)' },
            { key: 'mobile', Icon: Smartphone, label: 'Mobile (Ctrl+3)' },
          ] as const).map(({ key, Icon, label }) => (
            <button
              key={key}
              onClick={() => changeViewport(key)}
              className={`p-1.5 rounded transition-all ${device === key
                ? 'bg-[#252538] text-white shadow-inner'
                : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a1a2a]'}`}
              title={label}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>

        {/* Preview toggle */}
        <button
          onClick={togglePreview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            !isEnabled
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
              : 'bg-[#0d0d1a] text-slate-400 border-[#252538] hover:bg-[#1a1a2a] hover:text-white'
          }`}
          title="Aperçu (Ctrl+P)"
        >
          {isEnabled ? <Eye size={13} /> : <EyeOff size={13} />}
          {isEnabled ? 'Aperçu' : 'Édition'}
        </button>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Undo/Redo */}
        <div className="flex items-center bg-[#0d0d1a] rounded-lg p-1 border border-[#252538]">
          <button
            disabled={!canUndo}
            onClick={() => actions.history.undo()}
            className="p-1.5 text-slate-400 hover:text-white rounded disabled:opacity-25 transition-colors"
            title="Annuler (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            disabled={!canRedo}
            onClick={() => actions.history.redo()}
            className="p-1.5 text-slate-400 hover:text-white rounded disabled:opacity-25 transition-colors"
            title="Rétablir (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Revision Timeline Toggle */}
        <button
          onClick={() => setTimelineOpen(!timelineOpen)}
          className={`p-2 rounded-lg transition-colors ${
            timelineOpen
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
              : 'text-slate-500 hover:text-slate-300 hover:bg-[#252538] border border-transparent'
          }`}
          title="Timeline des versions historiques (Ctrl+H)"
        >
          <History size={14} />
        </button>

        {/* Keyboard shortcuts hint */}
        <button
          className="p-2 text-slate-500 hover:text-slate-300 hover:bg-[#252538] rounded-lg transition-colors"
          title="Raccourcis: Ctrl+S Publier | Ctrl+H Timeline | Ctrl+Z Annuler | Ctrl+P Aperçu | Escape Désélectionner"
        >
          <Keyboard size={14} />
        </button>

        {/* Export JSON */}
        <button
          onClick={handleExport}
          className="p-2 text-slate-500 hover:text-slate-300 hover:bg-[#252538] rounded-lg transition-colors"
          title="Exporter JSON"
        >
          <Code2 size={14} />
        </button>

        {/* Template Manager */}
        <button
          onClick={() => setTemplateDialogOpen(true)}
          className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-[#252538] rounded-lg transition-colors"
          title="Gestionnaire de templates"
        >
          <FileJson size={14} className="text-indigo-400" />
        </button>

        {/* HTML Editor Dialog (Global) */}
        <Dialog open={htmlDialogOpen} onOpenChange={setHtmlDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-[#252538] rounded-lg transition-colors"
              title="Éditer le HTML de la page"
            >
              <Code2 size={14} className="text-indigo-400" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-[92vw] h-[88vh] bg-[#0c0c14] border border-[#252538] text-white flex flex-col p-6 rounded-xl shadow-2xl">
            <DialogHeader className="flex flex-row items-center justify-between border-b border-[#252538] pb-3">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  <Code2 size={20} className="text-indigo-400" />
                  Éditeur HTML Global
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-1">Modifiez le contenu HTML complet de la page. Les modifications sont appliquées au bloc HtmlBlock principal.</p>
              </div>
            </DialogHeader>

            <div className="flex-1 min-h-0 bg-[#07070a] border border-[#252538] rounded-lg overflow-hidden mt-4 relative">
              <Suspense fallback={
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-[#07070a]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2 mr-3" />
                  <span>Chargement de Monaco Editor...</span>
                </div>
              }>
                <LazyMonacoEditor
                  height="100%"
                  language="html"
                  theme="vs-dark"
                  value={globalHtml}
                  onChange={(val) => setGlobalHtml(val || '')}
                  onMount={handleGlobalEditorDidMount}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 13,
                    wordWrap: 'on',
                    automaticLayout: true,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </Suspense>
            </div>

            <div className="flex items-center justify-between border-t border-[#252538] pt-4 mt-4 shrink-0">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleGlobalFormat} className="border-[#252538] bg-[#161624] text-slate-300 hover:text-white hover:bg-[#252538] flex items-center gap-1.5 font-semibold">
                  <Sparkles size={13} className="text-indigo-400" />
                  Beautifier
                </Button>
                <Button variant="outline" size="sm" onClick={handleGlobalExport} className="border-[#252538] bg-[#161624] text-slate-300 hover:text-white hover:bg-[#252538] flex items-center gap-1.5 font-semibold">
                  <Download size={13} className="text-emerald-400" />
                  Exporter
                </Button>
                <Button variant="outline" size="sm" onClick={handleGlobalImport} className="border-[#252538] bg-[#161624] text-slate-300 hover:text-white hover:bg-[#252538] flex items-center gap-1.5 font-semibold">
                  <Upload size={13} className="text-amber-400" />
                  Importer
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setHtmlDialogOpen(false)} className="border-[#252538] bg-transparent text-slate-400 hover:text-white hover:bg-[#161624]">
                  Annuler
                </Button>
                <Button onClick={handleSaveHtml} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-6">
                  Appliquer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="w-px h-5 bg-[#252538] mx-1" />

        {/* Manual Publish/Save version button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/20 shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={14} />
          )}
          <span>{isSaving ? 'Publication...' : 'Publier'}</span>
        </button>
      </div>
      <TemplateManagerDialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen} />
    </div>
  );
};
