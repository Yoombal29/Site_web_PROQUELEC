/**
 * BuilderPage.tsx — GOD MODE
 * Éditeur de page centralisé et unifié basé sur Craft.js.
 *
 * Si pageId est absent → affiche un écran de sélection de page.
 * Si pageId est présent → ouvre l'éditeur directement.
 */
import React, { useEffect, useState } from 'react';
import { Editor } from '@craftjs/core';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Zap,
  FileText,
  Plus,
  Search,
  ExternalLink,
  Loader2,
  ChevronRight,
  Menu,
  X,
  Copy,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';

import { GodToolbar } from '@/components/god-builder/GodToolbar';
import { GodToolbox } from '@/components/god-builder/GodToolbox';
import { GodCanvas } from '@/components/god-builder/GodCanvas';
import { GodSettings } from '@/components/god-builder/GodSettings';
import { GodLayers } from '@/components/god-builder/GodLayers';
import { GodTimeline } from '@/components/god-builder/GodTimeline';
import { BuilderErrorBoundary } from '@/components/god-builder/BuilderErrorBoundary';
import { useBrandingStore } from '@/stores/branding.store';

import { CRAFT_RESOLVER as RESOLVER } from '@/components/blocks/craftResolver';

import { GodEditorProvider, useGodEditor } from '@/components/god-builder/GodEditorContext';
import { DynamicContextProvider } from '@/components/blocks/DynamicDataBlocks';

// ─────────────────────────────────────────────────────────
// PAGE SELECTOR SCREEN (shown when no pageId in URL)
// ─────────────────────────────────────────────────────────
const PageSelectorScreen = () => {
  const navigate = useNavigate();
  const { config: brand } = useBrandingStore();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [pageTypeFilter, setPageTypeFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<any[]>('/api/admin/pages');
        setPages(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e.message || 'Impossible de charger les pages');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Charger les templates disponibles
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await apiFetch<any[]>('/api/builder/templates');
        setTemplates(Array.isArray(data) ? data : []);
      } catch {
        // Pas de templates disponibles
      }
    };
    loadTemplates();
  }, []);

  // Créer une nouvelle page
  const createPage = async (template?: any) => {
    setCreating(true);
    try {
      const title = `Nouvelle page ${new Date().toLocaleDateString('fr-FR')}`;
      const slug = `nouvelle-page-${Date.now()}`;

      const body: any = {
        title,
        slug,
        content_raw: '',
        is_published: false,
        status: 'draft',
        workflow_status: 'draft',
      };

      // Si un template est sélectionné, l'utiliser comme structure de base
      if (template?.structure) {
        const structure =
          typeof template.structure === 'string'
            ? JSON.parse(template.structure)
            : template.structure;
        body.structure_json = structure;
        body.theme_config = template.theme_config;
      }

      const newPage = await apiFetch<any>('/api/pages', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setShowNewDialog(false);
      navigate(`/admin/builder/${newPage.id}`);
    } catch (e: any) {
      console.error('Erreur création page:', e);
      setError(e.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  // Dupliquer une page
  const duplicatePage = async (page: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newTitle = `${page.title || 'Sans titre'} (copie)`;
      const newSlug = `${page.slug || 'page'}-copie-${Date.now()}`;

      await apiFetch<any>('/api/pages', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug,
          content_raw: page.content_raw || '',
          content_blocks: page.content_blocks,
          structure_json: page.structure_json,
          design_options: page.design_options,
          theme_config: page.theme_config,
          is_published: false,
          status: 'draft',
          workflow_status: 'draft',
        }),
      });

      // Recharger la liste
      const data = await apiFetch<any[]>('/api/admin/pages');
      setPages(Array.isArray(data) ? data : []);
      toast.success(`Page dupliquée : ${newTitle}`);
    } catch (err) {
      console.error('Erreur duplication:', err);
      toast.error('Erreur lors de la duplication');
    }
  };

  const filtered = pages.filter((p) => {
    // Search filter
    const matchesSearch =
      (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.slug || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    // Type filter
    if (pageTypeFilter === 'all') return true;
    if (pageTypeFilter === 'content') return !p.immutable;
    if (pageTypeFilter === 'functional')
      return p.immutable === true && p.design_options?.page_type !== 'hybrid';
    if (pageTypeFilter === 'hybrid') return p.design_options?.page_type === 'hybrid';
    return true;
  });

  const statusColors: Record<string, string> = {
    published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    draft: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    review: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    approved: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    archived: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  const statusLabels: Record<string, string> = {
    published: 'Publié',
    draft: 'Brouillon',
    review: 'En revue',
    approved: 'Approuvé',
    archived: 'Archivé',
  };

  return (
    <>
      <div className="min-h-screen bg-[#0a0a15] flex flex-col">
        {/* Header */}
        <div className="bg-[#12121f] border-b border-[#252538] px-6 py-4 sticky top-0 z-40">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-[#252538] rounded-lg transition text-slate-300"
                title="Basculer le menu"
              >
                <Menu size={20} />
              </button>
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                  <Zap size={12} />
                  {brand.hideGodMode ? brand.builderLabel : 'BUILDER'}
                </div>
                <h1 className="text-2xl font-bold text-white mt-1">Studio de Création</h1>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-slate-300 hover:text-white transition text-sm"
            >
              ← Admin
            </button>
          </div>
        </div>

        {/* Layout with Sidebar */}
        <div className="flex flex-1 overflow-hidden gap-4 p-4">
          {/* Sidebar - Pages List */}
          {sidebarOpen && (
            <div className="w-80 bg-[#12121f] border border-[#252538] rounded-xl flex flex-col overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b border-[#252538]">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full bg-[#0d0d1a] border border-[#252538] rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="px-4 py-3 border-b border-[#252538] flex gap-1">
                {[
                  { key: 'all', label: 'Tous' },
                  { key: 'content', label: '🟢 Contenu', check: (p) => !p.immutable },
                  {
                    key: 'functional',
                    label: '🔒 Fonctionnel',
                    check: (p) => p.immutable === true && p.design_options?.page_type !== 'hybrid',
                  },
                  {
                    key: 'hybrid',
                    label: '🔵 Hybride',
                    check: (p) => p.design_options?.page_type === 'hybrid',
                  },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setPageTypeFilter(key)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition whitespace-nowrap ${
                      pageTypeFilter === key
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a1a2a]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Pages List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {loading && (
                  <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Chargement...</span>
                  </div>
                )}

                {error && (
                  <div className="m-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
                    ⚠️ Erreur: {error}
                  </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    <FileText size={20} className="mx-auto mb-2 opacity-30" />
                    {search ? `Aucune page trouvée` : 'Aucune page'}
                  </div>
                )}

                {!loading &&
                  filtered.map((page) => (
                    <div
                      key={page.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        // Pages fonctionnelles et hybrides : ouvrir dans le Builder
                        navigate(`/admin/builder/${page.id}`);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/admin/builder/${page.id}`);
                        }
                      }}
                      className="w-full text-left px-4 py-3 border-b border-[#252538] hover:bg-[#16161f] transition flex items-center justify-between group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-200 text-sm font-medium truncate group-hover:text-white">
                          {page.title || 'Sans titre'}
                        </p>
                        <p className="text-slate-500 text-xs truncate">/{page.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Action buttons - visible on hover */}
                        <div className="hidden group-hover:flex items-center gap-1 mr-1">
                          <a
                            href={`/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-[#252538] transition"
                            title="Voir la page (nouvel onglet)"
                          >
                            <ExternalLink size={12} />
                          </a>
                          <button
                            onClick={(e) => duplicatePage(page, e)}
                            className="p-1.5 rounded text-slate-500 hover:text-emerald-400 hover:bg-[#252538] transition"
                            title="Dupliquer cette page"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        {page.design_options?.page_type === 'hybrid' && (
                          <span className="text-xs px-2 py-1 rounded-full whitespace-nowrap bg-blue-500/15 text-blue-400 border border-blue-500/20">
                            🔵 Hybride
                          </span>
                        )}
                        {page.immutable === true && page.design_options?.page_type !== 'hybrid' && (
                          <span className="text-xs px-2 py-1 rounded-full whitespace-nowrap bg-amber-500/15 text-amber-400 border border-amber-500/20">
                            🔒 Fonctionnel
                          </span>
                        )}
                        {page.status && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusColors[page.status] || ''}`}
                          >
                            {statusLabels[page.status] || page.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* New Page Button */}
              <div className="p-4 border-t border-[#252538]">
                <button
                  onClick={() => setShowNewDialog(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-indigo-900/20"
                >
                  <Plus size={14} />
                  Nouvelle page
                </button>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 bg-[#12121f] border border-[#252538] rounded-xl p-8 flex flex-col items-center justify-center">
            <div className="text-center max-w-2xl">
              <div className="mb-6">
                <FileText size={48} className="mx-auto opacity-40 text-slate-500" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3">Sélectionnez une page</h2>
              <p className="text-slate-400 mb-8">
                {filtered.length === 0
                  ? search
                    ? `Aucune page ne correspond à "${search}"`
                    : 'Aucune page disponible. Créez-en une pour commencer!'
                  : `Sélectionnez une page dans la liste pour l'éditer`}
              </p>
              <button
                onClick={() => setShowNewDialog(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-900/20"
              >
                <Plus size={18} />
                Créer une nouvelle page
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── New Page Dialog ── */}
      {showNewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#12121f] border border-[#252538] rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#252538]">
              <div>
                <h2 className="text-xl font-bold text-white">Créer une nouvelle page</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choisissez un template ou partez d'une page vierge
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewDialog(false)}
                className="p-2 hover:bg-[#252538] rounded-lg text-slate-500 hover:text-white transition"
                aria-label="Fermer la fenêtre de création de page"
                title="Fermer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Page vierge
                </h3>
                <button
                  onClick={() => createPage()}
                  disabled={creating}
                  className="w-full p-4 border-2 border-dashed border-[#252538] hover:border-indigo-500/50 rounded-xl text-left transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a1a2a] rounded-xl flex items-center justify-center group-hover:bg-indigo-500/10 transition">
                      <FileText className="w-6 h-6 text-slate-400 group-hover:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-300 group-hover:text-white">
                        Page vierge
                      </p>
                      <p className="text-xs text-slate-600">
                        Canvas vide, vous choisissez les blocs
                      </p>
                    </div>
                  </div>
                </button>
              </div>
              {templates.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Templates premium ({templates.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => createPage(tpl)}
                        disabled={creating}
                        className="p-4 bg-[#1a1a2a] border border-[#252538] hover:border-indigo-500/50 rounded-xl text-left transition group"
                      >
                        <div className="text-2xl mb-2">🎨</div>
                        <p className="text-sm font-bold text-slate-200 group-hover:text-white mb-1">
                          {tpl.name}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">{tpl.description}</p>
                        {tpl.category && (
                          <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">
                            {tpl.category}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {creating && (
                <div className="flex items-center justify-center gap-2 mt-4 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Création de la page...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
// EDITOR LAYOUT
// ─────────────────────────────────────────────────────────
// BUILDER CONTENT (with loading state handling)
// ─────────────────────────────────────────────────────────
const BuilderPageContent = () => {
  try {
    const { isLoading, error } = useGodEditor();

    if (isLoading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#0d0d1a]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-300 text-sm">Chargement de l'éditeur...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#0d0d1a]">
          <div className="max-w-md bg-red-900/30 border border-red-600 rounded-lg p-6 text-center">
            <p className="text-red-200 font-semibold mb-2">Erreur de chargement</p>
            <p className="text-red-100 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }
  } catch (err: any) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0d0d1a]">
        <div className="max-w-md bg-yellow-900/30 border border-yellow-600 rounded-lg p-6 text-center">
          <p className="text-yellow-200 font-semibold mb-2">Erreur d'initialisation du builder</p>
          <p className="text-yellow-100 text-sm mb-4 font-mono break-words">
            {err?.message || 'Erreur inconnue'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <GodToolbar />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden bg-[#1a1a2a]">
          <div className="flex flex-1 overflow-hidden">
            <GodToolbox />
          </div>
          <GodLayers />
        </div>
        <BuilderErrorBoundary>
          <GodCanvas />
        </BuilderErrorBoundary>
        <GodSettings />
        <GodTimeline />
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────
const BuilderPage = () => {
  const { pageId } = useParams<{ pageId: string }>();

  // No pageId → show page selection screen
  if (!pageId) {
    return <PageSelectorScreen />;
  }

  // pageId present → open editor
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans bg-[#0d0d1a]">
      <button
        onClick={() => (window.location.pathname = '/admin/builder/config')}
        title="Ouvrir configuration Builder"
        className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md shadow-lg hover:bg-indigo-500 transition"
      >
        Config Builder
      </button>
      <Editor resolver={RESOLVER}>
        <GodEditorProvider pageId={pageId}>
          <DynamicContextProvider>
            <BuilderPageContent />
          </DynamicContextProvider>
        </GodEditorProvider>
      </Editor>

      <style>{`
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #3f3f5a #1a1a2a; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a2a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f5a; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #5a5a7d; }
        /* Style des blocs HtmlBlock dans le canvas */
        [data-htmlblock] {
          margin-bottom: 2px;
        }
        [data-htmlblock].craft-selected {
          outline: 2px solid rgba(99, 102, 241, 0.8);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default BuilderPage;
