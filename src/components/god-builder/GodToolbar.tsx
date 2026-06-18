import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import type { OnMount } from '@monaco-editor/react';
import { useEditor } from '@craftjs/core';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Monitor,
  Smartphone,
  Tablet,
  Undo2,
  Redo2,
  Code2,
  Save,
  ChevronLeft,
  Eye,
  EyeOff,
  Copy,
  Keyboard,
  Layers,
  Zap,
  Sparkles,
  Download,
  Upload,
  History,
  Loader2,
  FileJson,
} from 'lucide-react';
import { useGodEditor } from './GodEditorContext';
import { getAuthToken } from '@/lib/api-client';
import { useBrandingStore } from '@/stores/branding.store';
const LazyTemplateManagerDialog = lazy(() => import('./TemplateManagerDialog').then(m => ({ default: m.TemplateManagerDialog })));
import { useBuilderHistoryStore } from '@/stores/builder-history.store';
import { useBuilderPermissions } from '@/hooks/useBuilderPermissions';
import { createHtmlCraftStructure } from '@/lib/craft-html-structure';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PqComponentCatalogItem } from '@/data/pqComponentCatalog';
import type { PqTemplate } from '@/data/pqTemplates';

const LazyMonacoEditor = lazy(() => import('@monaco-editor/react'));

type CraftQueryLike = {
  serialize: () => unknown;
};

type CraftNodeType = string | { resolvedName?: string };
type HtmlBlockProps = Record<string, unknown> & { html?: string };
type MonacoEditorInstance = Parameters<OnMount>[0];

export const GodToolbar = () => {
  const { actions, query, canUndo, canRedo, isEnabled, htmlNodeId, htmlValue } = useEditor(
    (state, query) => {
      let foundId: string | null = null;
      let foundHtml = '';

      Object.entries(state.nodes).forEach(([id, node]) => {
        const nodeType = node.data.type as CraftNodeType | undefined;
        const resolvedName =
          typeof nodeType === 'object' && nodeType !== null ? nodeType.resolvedName || '' : '';
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
    },
  );

  const { savePage, isSaving, pageData } = useGodEditor();
  const { autosaveStatus, timelineOpen, setTimelineOpen } = useBuilderHistoryStore();
  const { config: brand } = useBrandingStore();
  const navigate = useNavigate();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // ── Permissions builder ──
  const {
    canPublish,
    canManageTemplates,
    isGodMode,
    canEditContent,
    isLoading: permsLoading,
  } = useBuilderPermissions();

  const [htmlDialogOpen, setHtmlDialogOpen] = useState(false);
  const [globalHtml, setGlobalHtml] = useState(htmlValue);
  const [pqTemplates, setPqTemplates] = useState<PqTemplate[]>([]);
  const [pqTemplatesLoading, setPqTemplatesLoading] = useState(false);
  const [selectedPqTemplateId, setSelectedPqTemplateId] = useState('');
  const [pqComponents, setPqComponents] = useState<PqComponentCatalogItem[]>([]);
  const [pqComponentsLoading, setPqComponentsLoading] = useState(false);
  const [selectedPqComponentId, setSelectedPqComponentId] = useState('');
  const globalEditorRef = useRef<MonacoEditorInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const selectedPqTemplate = pqTemplates.find((template) => template.id === selectedPqTemplateId);
  const selectedPqComponent = pqComponents.find(
    (component) => component.id === selectedPqComponentId,
  );

  // Sync state when dialog opens
  useEffect(() => {
    if (htmlDialogOpen) {
      // Si la page a déjà un HtmlBlock, utiliser son HTML
      // Sinon, sérialiser TOUS les blocs en HTML complet
      if (htmlNodeId) {
        setGlobalHtml(htmlValue);
      } else {
        // Générer le HTML complet à partir de tous les blocs de la page
        const fullHtml = generateFullPageHtml(query);
        setGlobalHtml(fullHtml);
      }
    }
  }, [htmlDialogOpen, htmlNodeId, htmlValue, query]);

  useEffect(() => {
    if (!htmlDialogOpen || pqTemplates.length > 0 || pqTemplatesLoading) return;

    setPqTemplatesLoading(true);
    import('@/data/pqTemplates')
      .then((module) => setPqTemplates(module.pqTemplates))
      .catch((error) => {
        console.error('Erreur chargement modèles PROQUELEC:', error);
        toast.error('Impossible de charger les modèles PROQUELEC.');
      })
      .finally(() => setPqTemplatesLoading(false));
  }, [htmlDialogOpen, pqTemplates.length, pqTemplatesLoading]);

  useEffect(() => {
    if (!htmlDialogOpen || pqComponents.length > 0 || pqComponentsLoading) return;

    setPqComponentsLoading(true);
    import('@/data/pqComponentCatalog')
      .then((module) => setPqComponents(module.pqComponentCatalog))
      .catch((error) => {
        console.error('Erreur chargement composants PROQUELEC:', error);
        toast.error('Impossible de charger les composants PROQUELEC.');
      })
      .finally(() => setPqComponentsLoading(false));
  }, [htmlDialogOpen, pqComponents.length, pqComponentsLoading]);

  /**
   * Génère le HTML complet de la page à partir des blocs Craft.js
   */
  const generateFullPageHtml = (q: CraftQueryLike): string => {
    try {
      const serialized = q.serialize();
      return `<div class="proquelec-page-content">
  <!-- Page construite avec le Builder PROQUELEC -->
  <!-- Structure Craft.js stockée en base de données -->
  ${JSON.stringify(serialized, null, 2)}
</div>`;
    } catch (e) {
      return '<div class="proquelec-page-content">\n  <p>Contenu de la page (mode HTML).</p>\n</div>';
    }
  };

  const handleSaveHtml = () => {
    // Si un bloc HtmlBlock existe déjà, le mettre à jour
    if (htmlNodeId) {
      actions.setProp(htmlNodeId, (props: HtmlBlockProps) => {
        props.html = globalHtml;
      });
      toast.success('Code HTML mis à jour.');
    } else {
      // Sinon, remplacer TOUTE la page par une structure HTML normalisée.
      // Le HtmlBlock reste dans un conteneur canvas pour conserver le drag/drop.
      try {
        actions.deserialize(createHtmlCraftStructure(globalHtml));
      } catch (e) {
        console.error('Erreur création structure HtmlBlock:', e);
        toast.error('Impossible de convertir la page en HTML.');
        return;
      }
      toast.success('Page convertie en HTML. Tous les blocs ont été remplacés.');
    }
    setHtmlDialogOpen(false);
  };

  const handleGlobalEditorDidMount: OnMount = (editor) => {
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

  const handleInsertPqTemplate = () => {
    if (!selectedPqTemplate) {
      toast.warning('Choisissez un modèle PROQUELEC à insérer.');
      return;
    }

    setGlobalHtml(selectedPqTemplate.html);
    toast.success(`Modèle "${selectedPqTemplate.name}" chargé. Cliquez sur Appliquer pour enregistrer.`);
  };

  const insertHtmlAtCursor = (html: string) => {
    const editor = globalEditorRef.current;
    const snippet = `\n${html.trim()}\n`;

    if (!editor) {
      setGlobalHtml((current) => `${current.trimEnd()}\n${snippet}`);
      return;
    }

    const selection = editor.getSelection();
    if (!selection) {
      setGlobalHtml((current) => `${current.trimEnd()}\n${snippet}`);
      return;
    }

    editor.executeEdits('insert-pq-component', [
      {
        range: selection,
        text: snippet,
        forceMoveMarkers: true,
      },
    ]);
    setGlobalHtml(editor.getValue());
    editor.focus();
  };

  const handleInsertPqComponent = () => {
    if (!selectedPqComponent) {
      toast.warning('Choisissez un composant PROQUELEC à insérer.');
      return;
    }

    insertHtmlAtCursor(selectedPqComponent.html);
    toast.success(`Composant "${selectedPqComponent.name}" inséré.`);
  };

  const handleSave = async () => {
    const name = window.prompt(
      'Nommer cette version historique (laisser vide pour publication simple) :',
    );
    if (name === null) return;
    await savePage(name.trim() || undefined);
  };

  // Quick save (Ctrl+S) without version prompt
  const handleQuickSave = useCallback(async () => {
    await savePage(undefined);
    const slug = pageData?.slug;
    const pageUrl = slug ? `/${slug}?t=${Date.now()}` : '/';
    toast.success(
      <div className="flex items-center gap-3">
        <span>Page sauvegardée !</span>
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition font-medium"
        >
          Voir la page →
        </a>
      </div>,
      { duration: 5000 },
    );
  }, [pageData?.slug, savePage]);

  // Quick upload file
  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    for (const f of Array.from(files)) formData.append('file', f);
    try {
      await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: formData,
      });
      toast.success(`${files.length} fichier(s) uploadé(s)`);
    } catch {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const togglePreview = useCallback(() => {
    actions.setOptions((options) => {
      options.enabled = !options.enabled;
    });
  }, [actions]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;

      if (e.key === 's' && (e.ctrlKey || e.metaKey) && !isTyping) {
        e.preventDefault();
        handleQuickSave();
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey && !isTyping) {
        e.preventDefault();
        if (canUndo) actions.history.undo();
      }
      if (
        (e.key === 'y' && (e.ctrlKey || e.metaKey)) ||
        (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        if (!isTyping) {
          e.preventDefault();
          if (canRedo) actions.history.redo();
        }
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
        actions.selectNode();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions, canRedo, canUndo, handleQuickSave, setTimelineOpen, timelineOpen, togglePreview]);

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
          onClick={() => navigate('/admin/builder')}
          className="p-2 hover:bg-[#252538] rounded-lg transition-colors text-slate-400 hover:text-white shrink-0"
          aria-label="Retourner à la liste des pages"
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
          {(
            [
              { key: 'desktop', Icon: Monitor, label: 'Desktop (Ctrl+1)' },
              { key: 'tablet', Icon: Tablet, label: 'Tablet (Ctrl+2)' },
              { key: 'mobile', Icon: Smartphone, label: 'Mobile (Ctrl+3)' },
            ] as const
          ).map(({ key, Icon, label }) => (
            <button
              key={key}
              onClick={() => changeViewport(key)}
              className={`p-1.5 rounded transition-all ${
                device === key
                  ? 'bg-[#252538] text-white shadow-inner'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a1a2a]'
              }`}
              aria-label={`Passer en vue ${key}`}
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
          aria-label={isEnabled ? 'Passer en mode aperçu' : 'Revenir en mode édition'}
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
            aria-label="Annuler la dernière action"
            title="Annuler (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            disabled={!canRedo}
            onClick={() => actions.history.redo()}
            className="p-1.5 text-slate-400 hover:text-white rounded disabled:opacity-25 transition-colors"
            aria-label="Rétablir la dernière action annulée"
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
          aria-label={
            timelineOpen ? 'Masquer la timeline des versions' : 'Afficher la timeline des versions'
          }
          title="Timeline des versions historiques (Ctrl+H)"
        >
          <History size={14} />
        </button>

        {/* Keyboard shortcuts hint */}
        <button
          className="p-2 text-slate-500 hover:text-slate-300 hover:bg-[#252538] rounded-lg transition-colors"
          aria-label="Afficher les raccourcis clavier du builder"
          title="Raccourcis: Ctrl+S Publier | Ctrl+H Timeline | Ctrl+Z Annuler | Ctrl+P Aperçu | Escape Désélectionner"
        >
          <Keyboard size={14} />
        </button>

        {/* Export JSON — God Mode seulement */}
        {isGodMode && (
          <button
            onClick={handleExport}
            className="p-2 text-slate-500 hover:text-slate-300 hover:bg-[#252538] rounded-lg transition-colors"
            aria-label="Exporter la structure JSON de la page"
            title="Exporter JSON (God Mode)"
          >
            <Code2 size={14} />
          </button>
        )}

        {/* Template Manager — canManageTemplates seulement */}
        {canManageTemplates && (
          <button
            onClick={() => setTemplateDialogOpen(true)}
            className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-[#252538] rounded-lg transition-colors"
            aria-label="Ouvrir le gestionnaire de templates"
            title="Gestionnaire de templates"
          >
            <FileJson size={14} className="text-indigo-400" />
          </button>
        )}

        {/* Quick access to Builder config — God Mode seulement */}
        {isGodMode && (
          <button
            onClick={() => navigate('/admin/builder/config')}
            className="p-2 text-slate-500 hover:text-slate-300 hover:bg-[#252538] rounded-lg transition-colors"
            aria-label="Ouvrir la configuration du builder"
            title="Configuration Builder (God Mode)"
          >
            <FileJson size={14} className="text-emerald-400" />
          </button>
        )}

        {/* HTML Editor Dialog (Global) */}
        <Dialog open={htmlDialogOpen} onOpenChange={setHtmlDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-[#252538] rounded-lg transition-colors"
              aria-label="Éditer le HTML global de la page"
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
                <DialogDescription className="text-xs text-slate-500 mt-1">
                  Modifiez le code HTML de la page.
                  {htmlNodeId
                    ? 'Le bloc HtmlBlock existant sera mis à jour.'
                    : '⚠️ Tous les blocs seront remplacés par ce code HTML.'}
                </DialogDescription>
                {!htmlNodeId && (
                  <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-[11px] text-amber-300 font-medium">
                      ⚠️ Mode HTML : Cette action va supprimer tous les blocs du Builder et les
                      remplacer par un seul bloc HTML. Vous ne pourrez plus éditer chaque bloc
                      individuellement.
                    </p>
                  </div>
                )}
              </div>
            </DialogHeader>

            <div className="mt-4 rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Layers size={15} className="shrink-0 text-indigo-300" />
                  <select
                    value={selectedPqTemplateId}
                    onChange={(event) => setSelectedPqTemplateId(event.target.value)}
                    className="min-h-10 w-full rounded-lg border border-[#252538] bg-[#07070a] px-3 text-xs font-semibold text-slate-200 outline-none focus:border-indigo-400"
                    aria-label="Choisir un modèle PROQUELEC"
                  >
                    <option value="">
                      {pqTemplatesLoading ? 'Chargement des modèles...' : 'Modèles PROQUELEC officiels'}
                    </option>
                    {pqTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} · {template.category}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleInsertPqTemplate}
                  disabled={!selectedPqTemplate}
                  className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
                >
                  Insérer modèle
                </Button>
              </div>
              {selectedPqTemplate && (
                <p className="mt-2 text-[11px] leading-5 text-indigo-100/80">
                  {selectedPqTemplate.description}
                </p>
              )}

              <div className="mt-3 flex flex-col gap-3 border-t border-indigo-400/15 pt-3 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Sparkles size={15} className="shrink-0 text-amber-300" />
                  <select
                    value={selectedPqComponentId}
                    onChange={(event) => setSelectedPqComponentId(event.target.value)}
                    className="min-h-10 w-full rounded-lg border border-[#252538] bg-[#07070a] px-3 text-xs font-semibold text-slate-200 outline-none focus:border-amber-300"
                    aria-label="Choisir un composant PROQUELEC"
                  >
                    <option value="">
                      {pqComponentsLoading
                        ? 'Chargement des composants...'
                        : 'Composants PROQUELEC officiels'}
                    </option>
                    {pqComponents.map((component) => (
                      <option key={component.id} value={component.id}>
                        {component.name} · {component.category}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleInsertPqComponent}
                  disabled={!selectedPqComponent}
                  className="bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40"
                >
                  Insérer composant
                </Button>
              </div>
              {selectedPqComponent && (
                <p className="mt-2 text-[11px] leading-5 text-amber-100/85">
                  {selectedPqComponent.description} Classes :{' '}
                  {selectedPqComponent.classes.join(', ')}
                </p>
              )}
            </div>

            <div className="flex-1 min-h-0 bg-[#07070a] border border-[#252538] rounded-lg overflow-hidden mt-4 relative">
              <Suspense
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-[#07070a]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2 mr-3" />
                    <span>Chargement de Monaco Editor...</span>
                  </div>
                }
              >
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGlobalFormat}
                  className="border-[#252538] bg-[#161624] text-slate-300 hover:text-white hover:bg-[#252538] flex items-center gap-1.5 font-semibold"
                >
                  <Sparkles size={13} className="text-indigo-400" />
                  Beautifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGlobalExport}
                  className="border-[#252538] bg-[#161624] text-slate-300 hover:text-white hover:bg-[#252538] flex items-center gap-1.5 font-semibold"
                >
                  <Download size={13} className="text-emerald-400" />
                  Exporter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGlobalImport}
                  className="border-[#252538] bg-[#161624] text-slate-300 hover:text-white hover:bg-[#252538] flex items-center gap-1.5 font-semibold"
                >
                  <Upload size={13} className="text-amber-400" />
                  Importer
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setHtmlDialogOpen(false)}
                  className="border-[#252538] bg-transparent text-slate-400 hover:text-white hover:bg-[#161624]"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSaveHtml}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-6"
                >
                  Appliquer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="w-px h-5 bg-[#252538] mx-1" />

        {/* Bouton Sauvegarder — canPublish requis */}
        {canPublish ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleQuickSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/20 shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sauvegarder (Ctrl+S)"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
            <div className="relative group">
              <button
                className="px-2 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/20 transition-all"
                aria-label="Ouvrir les options de sauvegarde"
                title="Options de sauvegarde"
              >
                ▾
              </button>
              <div className="absolute right-0 top-full mt-1 bg-[#12121f] border border-[#252538] rounded-xl shadow-2xl py-2 min-w-[220px] hidden group-hover:block z-50">
                <button
                  onClick={handleSave}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#1a1a2a] hover:text-white transition flex items-center gap-2"
                >
                  <Save size={12} className="text-indigo-400" />
                  Sauvegarder comme version...
                </button>
                <button
                  onClick={togglePreview}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#1a1a2a] hover:text-white transition flex items-center gap-2"
                >
                  <Eye size={12} className="text-emerald-400" />
                  {isEnabled ? 'Mode aperçu' : 'Mode édition'}
                </button>
                <button
                  onClick={() => setTimelineOpen(!timelineOpen)}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-[#1a1a2a] hover:text-white transition flex items-center gap-2"
                >
                  <History size={12} className="text-amber-400" />
                  {timelineOpen ? 'Masquer la timeline' : 'Afficher la timeline'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Badge lecture seule si pas de droit de publication */
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700/40 text-slate-400 border border-slate-600/30 cursor-not-allowed"
            title="Vous n'avez pas le droit de publier cette page. Contactez l'administrateur."
          >
            <Eye size={13} />
            Lecture seule
          </span>
        )}
      </div>

      {/* Quick upload button */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleQuickUpload}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 transition-all disabled:opacity-50"
        title="Uploader un fichier"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        <span className="hidden md:inline">{uploading ? 'Upload...' : 'Upload'}</span>
      </button>

      <Suspense fallback={null}><LazyTemplateManagerDialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen} /></Suspense>
    </div>
  );
};
