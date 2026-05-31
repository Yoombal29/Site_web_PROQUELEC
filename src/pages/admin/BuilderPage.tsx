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
import { Zap, FileText, Plus, Search, ExternalLink, Loader2, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

import { GodToolbar } from '@/components/god-builder/GodToolbar';
import { GodToolbox } from '@/components/god-builder/GodToolbox';
import { GodCanvas } from '@/components/god-builder/GodCanvas';
import { GodSettings } from '@/components/god-builder/GodSettings';
import { GodLayers } from '@/components/god-builder/GodLayers';
import { GodTimeline } from '@/components/god-builder/GodTimeline';
import { BuilderErrorBoundary } from '@/components/god-builder/BuilderErrorBoundary';
import { useBrandingStore } from '@/stores/branding.store';

import { CRAFT_RESOLVER as RESOLVER } from '@/components/blocks/craftResolver';

import { GodEditorProvider } from '@/components/god-builder/GodEditorContext';
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

  const filtered = pages.filter(p =>
    (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    draft: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    review: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    approved: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    archived: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  const statusLabels: Record<string, string> = {
    published: 'Publié', draft: 'Brouillon', review: 'En revue',
    approved: 'Approuvé', archived: 'Archivé',
  };

  return (
    <div className="min-h-screen bg-[#0a0a15] flex flex-col items-center justify-center p-8 font-sans">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
          <Zap size={14} />
          {brand.hideGodMode ? brand.builderLabel.toUpperCase() : 'GOD MODE BUILDER'}
        </div>
        <h1 className="text-4xl font-black text-white mb-2">
          Quelle page voulez-vous éditer ?
        </h1>
        <p className="text-slate-500 text-base">
          Sélectionnez une page existante ou créez-en une nouvelle
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-3xl bg-[#12121f] border border-[#252538] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-[#252538] flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une page par titre ou slug..."
              className="w-full bg-[#0d0d1a] border border-[#252538] rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            onClick={() => navigate('/admin?tab=pages')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-indigo-900/20 shrink-0"
          >
            <Plus size={14} />
            Nouvelle page
          </button>
        </div>

        {/* Pages list */}
        <div className="max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#252538 transparent' }}>
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Chargement des pages...</span>
            </div>
          )}

          {error && (
            <div className="m-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {search ? `Aucune page trouvée pour "${search}"` : 'Aucune page disponible'}
              </p>
              <button
                onClick={() => navigate('/admin?tab=pages')}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm underline underline-offset-2 transition-colors"
              >
                Créer la première page →
              </button>
            </div>
          )}

          {!loading && filtered.map(page => (
            <button
              key={page.id}
              onClick={() => navigate(`/admin/builder/${page.slug || page.id}`)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1a1a2a] border-b border-[#1a1a2a] transition-all group text-left"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-200 group-hover:text-white transition-colors truncate">
                    {page.title || 'Sans titre'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">
                    /{page.slug || page.id}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColors[page.workflow_status] || statusColors.draft}`}>
                  {statusLabels[page.workflow_status] || page.workflow_status || 'Brouillon'}
                </span>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#252538] text-[11px] text-slate-600 flex items-center justify-between">
            <span>{filtered.length} page{filtered.length > 1 ? 's' : ''} {search ? 'trouvée' + (filtered.length > 1 ? 's' : '') : 'disponible' + (filtered.length > 1 ? 's' : '')}</span>
            <span className="text-slate-700">Cliquez pour ouvrir dans le builder</span>
          </div>
        )}
      </div>

      {/* Back link */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-6 text-slate-600 hover:text-slate-400 text-sm transition-colors"
      >
        ← Retour au dashboard
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// EDITOR LAYOUT
// ─────────────────────────────────────────────────────────
const BuilderPageContent = () => (
  <>
    <GodToolbar />
    <div className="flex-1 flex overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#1a1a2a' }}>
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
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans" style={{ backgroundColor: '#0d0d1a' }}>
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
