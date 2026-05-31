import React, { useState, useMemo, useCallback } from 'react';
import { useEditor } from '@craftjs/core';
import { useDynamicDataStore } from '../../stores/dynamic-data.store';
import { generateAllTemplates, getTemplateStats, type GeneratedSite } from '../../lib/generator/engine';
import { INDUSTRIES } from '../../lib/generator/industries';
import { THEMES } from '../../lib/generator/themes';
import { ArrowLeft, ArrowRight, Download, Search, Filter, Grid3X3, List, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export const TemplateMarketplace = () => {
  const { connectors } = useEditor();
  const [templates] = useState(() => generateAllTemplates());
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [themeFamily, setThemeFamily] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedSite, setSelectedSite] = useState<GeneratedSite | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const perPage = 24;

  const stats = useMemo(() => getTemplateStats(), []);

  const filtered = useMemo(() => {
    let list = templates.sites;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    if (industryFilter !== 'all') list = list.filter((s) => s.industry === industryFilter);
    if (themeFamily !== 'all') {
      const familyIds = THEMES.filter((t) => t.family === themeFamily).map((t) => t.id);
      list = list.filter((s) => familyIds.includes(s.themeId));
    }
    if (categoryFilter !== 'all') {
      const catPages = templates.pages.filter((p) => p.category === categoryFilter).map((p) => p.siteName);
      list = list.filter((s) => catPages.includes(s.name));
    }
    return list;
  }, [templates, search, industryFilter, themeFamily, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const allCategories = useMemo(() => {
    const cats = new Set(templates.pages.map((p) => p.category));
    return Array.from(cats);
  }, [templates]);

  const handleImport = useCallback((site: GeneratedSite) => {
    site.pages.forEach((sp) => {
      try {
        const el = sp.factory();
        connectors.create(document.createElement('div'), el);
      } catch (err) {
        console.error('Import error:', err);
      }
    });
    toast.success('Site "' + site.name + '" importé (' + site.pages.length + ' pages)');
  }, [connectors]);

  const handleImportPage = useCallback((page: any) => {
    try {
      const el = page.factory();
      connectors.create(document.createElement('div'), el);
      toast.success('Section "' + page.name + '" importée');
    } catch (err) {
      console.error('Import error:', err);
    }
  }, [connectors]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a14] text-slate-200">
      {/* Header stats */}
      <div className="px-4 py-3 border-b border-[#252538] bg-[#0d0d1a] shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Marketplace de Templates</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">{stats.totalSites} sites · {stats.totalPages} pages · {stats.themes} thèmes · {stats.industries} secteurs</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('grid')} className={'p-1.5 rounded ' + (viewMode === 'grid' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-600 hover:text-slate-400')}><Grid3X3 size={14} /></button>
            <button onClick={() => setViewMode('list')} className={'p-1.5 rounded ' + (viewMode === 'list' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-600 hover:text-slate-400')}><List size={14} /></button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <div className="relative flex-1 min-w-[160px] max-w-[260px]">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            <input type="text" value={search} onChange={(e: any) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher un template..." className="w-full bg-[#12121f] border border-[#252538] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500" />
          </div>
          <select value={industryFilter} onChange={(e: any) => { setIndustryFilter(e.target.value); setPage(1); }}
            className="bg-[#12121f] border border-[#252538] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500">
            <option value="all">Tous secteurs</option>
            {INDUSTRIES.map((ind) => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
          </select>
          <select value={themeFamily} onChange={(e: any) => { setThemeFamily(e.target.value); setPage(1); }}
            className="bg-[#12121f] border border-[#252538] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500">
            <option value="all">Tous thèmes</option>
            {Array.from(new Set(THEMES.map((t) => t.family))).map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e: any) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-[#12121f] border border-[#252538] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500">
            <option value="all">Toutes catégories</option>
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {selectedSite ? (
          // Detail view
          <div>
            <button onClick={() => setSelectedSite(null)} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mb-4">
              <ArrowLeft size={12} /> Retour aux templates
            </button>
            <div className="bg-[#12121f] rounded-xl border border-[#252538] p-4 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedSite.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedSite.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full">{INDUSTRIES.find((i) => i.id === selectedSite.industry)?.name || selectedSite.industry}</span>
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">{selectedSite.theme}</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">{selectedSite.pageCount} pages</span>
                  </div>
                </div>
                <button onClick={() => handleImport(selectedSite)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-colors">
                  <Download size={12} /> Importer le site
                </button>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pages du site ({selectedSite.pages.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedSite.pages.map((sp, i) => (
                <div key={i} className="bg-[#12121f] border border-[#252538] rounded-lg p-3 hover:border-indigo-500/40 transition-colors group">
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#1e1e30] to-[#0d0d1a] rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-2xl text-slate-600">◻</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 truncate">{sp.name}</span>
                    <button onClick={() => handleImportPage(sp)}
                      className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-1">
                      +</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid view
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {paginated.map((site) => (
                <div key={site.id} onClick={() => setSelectedSite(site)}
                  className="bg-[#12121f] border border-[#252538] rounded-xl p-3 hover:border-indigo-500/50 hover:bg-[#1a1a2a] transition-all cursor-pointer group">
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#1e1e30] via-[#15152a] to-[#0d0d1a] rounded-lg mb-2.5 flex items-center justify-center border border-[#252538] overflow-hidden relative">
                    <div className="absolute inset-0 opacity-30">
                      <div className="w-full h-2 bg-slate-700/50 mt-3 mx-3 rounded" style={{ width: '60%' }} />
                      <div className="w-full h-1.5 bg-slate-700/30 mt-2 mx-3 rounded" style={{ width: '40%' }} />
                      <div className="grid grid-cols-3 gap-1 mt-3 mx-3">
                        {[1, 2, 3].map((j) => <div key={j} className="h-6 bg-slate-700/20 rounded" />)}
                      </div>
                    </div>
                    <span className="text-lg text-slate-600 z-10">◻◻</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors">{site.name}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] text-slate-600">{site.pageCount} pages</span>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full truncate">{site.theme}</span>
                  </div>
                </div>
              ))}
            </div>

            {paginated.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 text-slate-700">🔍</div>
                <p className="text-sm text-slate-500">Aucun template trouvé</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded bg-[#1a1a2a] border border-[#252538] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                  <ArrowLeft size={14} /></button>
                <span className="text-xs text-slate-500">Page {page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded bg-[#1a1a2a] border border-[#252538] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                  <ArrowRight size={14} /></button>
              </div>
            )}
          </div>
        ) : (
          // List view
          <div className="space-y-1">
            {paginated.map((site) => (
              <div key={site.id} onClick={() => setSelectedSite(site)}
                className="flex items-center gap-3 p-3 bg-[#12121f] border border-[#252538] rounded-lg hover:border-indigo-500/40 hover:bg-[#1a1a2a] transition-all cursor-pointer group">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1e1e30] to-[#0d0d1a] rounded-lg border border-[#252538] flex items-center justify-center shrink-0">
                  <span className="text-sm text-slate-500">◻</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">{site.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{site.description}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[10px]">
                  <span className="text-slate-600">{site.pageCount}p</span>
                  <span className="bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">{site.theme}</span>
                  <button onClick={(e: any) => { e.stopPropagation(); handleImport(site); }}
                    className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded hover:bg-indigo-500/20 transition-colors opacity-0 group-hover:opacity-100">
                    <Download size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
