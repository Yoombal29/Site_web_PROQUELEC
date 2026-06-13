import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  Layers,
  Lightbulb,
  Search,
  Zap,
} from 'lucide-react';
import {
  PAGE_ARCHITECTURE_LABELS,
  PAGE_ARCHITECTURE_MATRIX,
  PAGE_ARCHITECTURE_STRATEGY,
  getArchitectureBadgeClass,
  normalizeArchitectureSlug,
  resolvePageArchitecture,
  type PageArchitectureCategory,
} from '@/lib/page-architecture';

type DbPageRow = {
  id: string;
  title?: string;
  slug?: string;
  immutable?: boolean;
  design_options?: { page_type?: string } | null;
};

type Props = {
  dbPages?: DbPageRow[];
  onOpenPage?: (pageId: string) => void;
};

const CATEGORY_FILTERS: { key: PageArchitectureCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'content', label: '🟢 Contenu' },
  { key: 'hybrid', label: '🔵 Hybride' },
  { key: 'functional', label: '🔒 Fonctionnel' },
];

export const PageArchitectureGuide: React.FC<Props> = ({ dbPages = [], onOpenPage }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PageArchitectureCategory | 'all'>('all');
  const [view, setView] = useState<'guide' | 'matrix' | 'cms'>('guide');

  const cmsBySlug = useMemo(() => {
    const map = new Map<string, DbPageRow>();
    for (const p of dbPages) {
      if (p.slug) map.set(normalizeArchitectureSlug(p.slug), p);
    }
    return map;
  }, [dbPages]);

  const matrixRows = useMemo(() => {
    return PAGE_ARCHITECTURE_MATRIX.filter((entry) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        entry.title.toLowerCase().includes(q) ||
        entry.route.toLowerCase().includes(q) ||
        entry.slug.includes(q) ||
        entry.hint.toLowerCase().includes(q);
      const matchesCat = categoryFilter === 'all' || entry.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [search, categoryFilter]);

  const cmsOnlyPages = useMemo(() => {
    const registrySlugs = new Set(
      PAGE_ARCHITECTURE_MATRIX.map((e) => normalizeArchitectureSlug(e.slug)),
    );
    return dbPages.filter((p) => {
      const s = normalizeArchitectureSlug(p.slug || '');
      if (registrySlugs.has(s)) return false;
      const arch = resolvePageArchitecture(s, p);
      if (categoryFilter !== 'all' && arch?.category !== categoryFilter) return false;
      const q = search.toLowerCase();
      if (
        q &&
        !(p.title || '').toLowerCase().includes(q) &&
        !s.includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [dbPages, search, categoryFilter]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* En-tête stratégie */}
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <BookOpen size={12} />
            Guide officiel PROQUELEC
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white mb-2">
            {PAGE_ARCHITECTURE_STRATEGY.title}
          </h2>
          <p className="text-slate-400 text-sm lg:text-base leading-relaxed max-w-3xl">
            {PAGE_ARCHITECTURE_STRATEGY.summary}
          </p>
        </div>

        {/* Cartes stratégie */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(PAGE_ARCHITECTURE_LABELS) as PageArchitectureCategory[]).map((cat) => {
            const meta = PAGE_ARCHITECTURE_LABELS[cat];
            const rule = PAGE_ARCHITECTURE_STRATEGY.rules.find((r) => r.category === cat);
            return (
              <div
                key={cat}
                className="rounded-xl border border-[#252538] bg-[#0d0d1a] p-4 hover:border-[#3a3a5a] transition-colors"
              >
                <p className="text-sm font-bold text-white mb-1">
                  {meta.emoji} {meta.label}
                </p>
                <p className="text-[11px] text-slate-500 mb-3 leading-snug">{meta.short}</p>
                {rule && (
                  <>
                    <p className="text-[10px] text-emerald-400/90 font-medium mb-1">✓ {rule.do}</p>
                    <p className="text-[10px] text-rose-400/80">✗ {rule.dont}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Onglets vue */}
        <div className="flex flex-wrap gap-2 border-b border-[#252538] pb-3">
          {[
            { id: 'guide' as const, label: 'Résumé', icon: Lightbulb },
            { id: 'matrix' as const, label: 'Matrice URLs', icon: Layers },
            { id: 'cms' as const, label: `Pages CMS (${dbPages.length})`, icon: Zap },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                view === id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a1a2a]'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {view === 'guide' && (
          <div className="space-y-4 rounded-xl border border-[#252538] bg-[#12121f] p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-400" />
              Quelle solution retenir ?
            </h3>
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>
                <strong className="text-emerald-400">Nouvelle page marketing</strong> → créez une page
                CMS ici (bouton « Nouvelle page ») et composez avec les{' '}
                <strong className="text-white">Templates PROQUELEC</strong> (Hero premium, services…).
              </p>
              <p>
                <strong className="text-blue-400">Page avec outil intégré</strong> (/outils, /documents…) →
                éditez le <strong className="text-white">contenu autour</strong> en Builder ; le cœur
                reste en TSX.
              </p>
              <p>
                <strong className="text-emerald-400">Toutes les pages contenu</strong> → migrées vers le
                God Builder. Éditez-les dans{' '}
                <button
                  type="button"
                  onClick={() => navigate('/admin/builder')}
                  className="text-indigo-300 underline hover:text-indigo-200"
                >
                  Admin → Builder
                </button>
                . L'ancien système Sections a été supprimé.
              </p>
              <p>
                <strong className="text-slate-400">Login, dashboard, Expert Lab, GED…</strong> → code
                TSX uniquement ; utilisez le bloc{' '}
                <strong className="text-white">FunctionalPageBlock</strong> pour les insérer dans une
                mise en page si besoin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView('matrix')}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              Voir la matrice complète des URLs
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {(view === 'matrix' || view === 'cms') && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filtrer par URL, titre…"
                  className="w-full bg-[#0d0d1a] border border-[#252538] rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {CATEGORY_FILTERS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategoryFilter(key)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg whitespace-nowrap transition ${
                      categoryFilter === key
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-500 hover:bg-[#1a1a2a]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {view === 'matrix' && (
              <div className="rounded-xl border border-[#252538] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#0d0d1a] text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="px-4 py-3 font-bold">URL</th>
                        <th className="px-4 py-3 font-bold">Page</th>
                        <th className="px-4 py-3 font-bold">Type</th>
                        <th className="px-4 py-3 font-bold">Où éditer</th>
                        <th className="px-4 py-3 font-bold hidden lg:table-cell">Note</th>
                        <th className="px-4 py-3 font-bold w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#252538]">
                      {matrixRows.map((entry) => {
                        const cms = cmsBySlug.get(normalizeArchitectureSlug(entry.slug));
                        const resolved = resolvePageArchitecture(entry.slug, cms);
                        const cat = resolved?.category || entry.category;
                        const meta = PAGE_ARCHITECTURE_LABELS[cat];
                        return (
                          <tr key={entry.route} className="bg-[#12121f] hover:bg-[#161624] transition">
                            <td className="px-4 py-3 font-mono text-indigo-300 whitespace-nowrap">
                              {entry.route}
                            </td>
                            <td className="px-4 py-3 text-slate-200 font-medium">{entry.title}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${getArchitectureBadgeClass(cat)}`}
                              >
                                {meta.emoji} {meta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{entry.editor}</td>
                            <td className="px-4 py-3 text-slate-500 hidden lg:table-cell max-w-xs">
                              {entry.hint}
                            </td>
                            <td className="px-4 py-3">
                              {cms && onOpenPage ? (
                                <button
                                  type="button"
                                  onClick={() => onOpenPage(cms.id)}
                                  className="text-indigo-400 hover:text-white font-bold"
                                >
                                  Éditer
                                </button>
                              ) : (
                                <a
                                  href={entry.route}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex text-slate-500 hover:text-white"
                                  title="Voir la page"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {matrixRows.length === 0 && (
                  <p className="text-center py-8 text-slate-500 text-sm">Aucune URL correspondante.</p>
                )}
              </div>
            )}

            {view === 'cms' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-3">
                  Pages présentes en base PostgreSQL — type déduit du registre + métadonnées (
                  <code className="text-slate-400">immutable</code>,{' '}
                  <code className="text-slate-400">page_type</code>).
                </p>
                {[...dbPages]
                  .filter((p) => {
                    const s = normalizeArchitectureSlug(p.slug || '');
                    const arch = resolvePageArchitecture(s, p);
                    if (categoryFilter !== 'all' && arch?.category !== categoryFilter) return false;
                    const q = search.toLowerCase();
                    if (
                      q &&
                      !(p.title || '').toLowerCase().includes(q) &&
                      !s.includes(q)
                    ) {
                      return false;
                    }
                    return true;
                  })
                  .map((p) => {
                    const arch = resolvePageArchitecture(p.slug || '', p);
                    const cat = arch?.category || 'content';
                    const meta = PAGE_ARCHITECTURE_LABELS[cat];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onOpenPage?.(p.id)}
                        className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#252538] bg-[#12121f] hover:border-indigo-500/30 hover:bg-[#161624] transition group"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                            {p.title || 'Sans titre'}
                          </p>
                          <p className="text-xs text-slate-500 font-mono truncate">/{p.slug}</p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-bold ${getArchitectureBadgeClass(cat)}`}
                        >
                          {meta.emoji} {meta.label}
                        </span>
                      </button>
                    );
                  })}
                {cmsOnlyPages.length === 0 && dbPages.length === 0 && (
                  <p className="text-center py-8 text-slate-500 text-sm">Aucune page CMS chargée.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
