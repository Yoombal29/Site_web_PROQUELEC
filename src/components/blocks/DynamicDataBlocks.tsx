import React, { useState, useEffect } from 'react';
import { useNode, Element } from '@craftjs/core';
import { getUniversalStyles } from './ProquelecBlocks';
import { useDynamicDataStore } from '../../stores/dynamic-data.store';
import { resolveDynamicContent } from '../../lib/dynamic-data/resolver';
import { useBuilderStore } from '../../stores/useBuilderStore';

// ── DynamicDataProvider (wraps editor, injects resolved ds context) ──
export const DynamicContextProvider = ({ children }: { children: React.ReactNode }) => {
  const sources = useDynamicDataStore((s) => s.sources);
  const fetchSource = useDynamicDataStore((s) => s.fetchSource);
  const cache = useDynamicDataStore((s) => s.cache);
  const [resolved, setResolved] = useState<Record<string, any>>({});

  useEffect(() => {
    const load = async () => {
      const result: Record<string, any> = {};
      for (const src of sources) {
        if (src.type === 'api') {
          const data = await fetchSource(src.id);
          if (data) result[src.name] = data;
        } else if (src.type === 'static') {
          result[src.name] = src.data;
        } else if (src.type === 'query') {
          if (typeof window !== 'undefined') {
            const params = Object.fromEntries(new URLSearchParams(window.location.search));
            result[src.name] = params;
          }
        }
      }
      setResolved(result);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [sources.length, cache]);

  return <>{children}</>;
};

// ── 1. DynamicTextBlock ──
export const DynamicTextBlock = (props: any) => {
  const { expression = '{{ global.siteName }}', fallback = '', tag = 'div', fontSize = 16, color = '#0f172a', fontWeight = 400 } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const sources = useDynamicDataStore((s) => s.sources);
  const cache = useDynamicDataStore((s) => s.cache);
  const page = useBuilderStore((s: any) => s.pageData);
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    // Build dynamic context from data sources
    const ds: Record<string, any> = {};
    for (const src of sources) {
      const cached = cache[src.id];
      if (cached) ds[src.name] = cached.data;
    }
    const context = {
      global: { siteName: 'PROQUELEC Sénégal', contactEmail: 'proquelec@proquelec.sn', contactPhone: '+221 33 848 68 55' },
      ds,
      page: page || {},
      cart: { count: 0, total: '0', items: [], subtotal: '0', currency: '€' },
    };
    const resolved = resolveDynamicContent(expression, context);
    setValue(resolved || fallback);
  }, [expression, sources, cache, page]);

  const Tag = tag as keyof JSX.IntrinsicElements;
  return (
    <Tag ref={(r: any) => { if (r) connect(drag(r)); }} style={{ fontSize, color, fontWeight, margin: 0, ...u.style }} className={'proquelec-builder-node ' + u.className}>
      {value}
    </Tag>
  );
};
// ── Dynamic Data Source Selector (shared UI) ──
const DataSourceSelector = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const sources = useDynamicDataStore((s) => s.sources);
  const cache = useDynamicDataStore((s) => s.cache);
  const [expanded, setExpanded] = useState(false);

  const globalTokens = [
    { label: 'Nom du site', token: '{{ global.siteName }}' },
    { label: 'Email contact', token: '{{ global.contactEmail }}' },
    { label: 'Téléphone', token: '{{ global.contactPhone }}' },
  ];
  const pageTokens = [
    { label: 'Titre de la page', token: '{{ page.title }}' },
    { label: 'Slug', token: '{{ page.slug }}' },
  ];
  const cartTokens = [
    { label: 'Nombre d\'articles', token: '{{ cart.count }}' },
    { label: 'Sous-total', token: '{{ cart.subtotal }}' },
    { label: 'Devise', token: '{{ cart.currency }}' },
  ];

  const sourceTokens = sources.map((src) => {
    const cached = cache[src.id];
    const paths = cached?.data ? extractPaths(cached.data, src.name) : [`{{ ds.${src.name} }}`];
    return { name: src.name, paths };
  });

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Expression</label>
      <div className="relative">
        <input value={value} onChange={(e: any) => onChange(e.target.value)}
          onFocus={() => setExpanded(true)} onBlur={() => setTimeout(() => setExpanded(false), 200)}
          placeholder="Ex: {{ ds.products.0.name }}" className="w-full bg-[#0d0d1a] border border-[#252538] rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono" />
        {expanded && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#1a1a2a] border border-[#252538] rounded-lg max-h-48 overflow-y-auto shadow-2xl custom-scrollbar">
            <div className="p-1.5 space-y-1">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-1">Globaux</div>
              {globalTokens.map((t) => (
                <button key={t.token} onMouseDown={(e) => { e.preventDefault(); onChange(t.token); }}
                  className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-[#252538] hover:text-white transition-colors font-mono">
                  {t.token} <span className="text-slate-500 ml-1 font-sans">— {t.label}</span>
                </button>
              ))}
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-2">Page</div>
              {pageTokens.map((t) => (
                <button key={t.token} onMouseDown={(e) => { e.preventDefault(); onChange(t.token); }}
                  className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-[#252538] hover:text-white transition-colors font-mono">
                  {t.token} <span className="text-slate-500 ml-1 font-sans">— {t.label}</span>
                </button>
              ))}
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-2">Panier</div>
              {cartTokens.map((t) => (
                <button key={t.token} onMouseDown={(e) => { e.preventDefault(); onChange(t.token); }}
                  className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-[#252538] hover:text-white transition-colors font-mono">
                  {t.token} <span className="text-slate-500 ml-1 font-sans">— {t.label}</span>
                </button>
              ))}
              {sourceTokens.length > 0 && sourceTokens.some(s => s.paths.length > 0) && (
                <><div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-2">Sources de données</div>
                {sourceTokens.map((src) => src.paths.map((path) => (
                  <button key={path} onMouseDown={(e) => { e.preventDefault(); onChange(path); }}
                    className="w-full text-left px-2 py-1.5 rounded text-xs text-emerald-300 hover:bg-[#252538] hover:text-white transition-colors font-mono">
                    {path}
                  </button>
                )))}</>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Extract paths from a data object for autocomplete
function extractPaths(obj: any, prefix: string, maxDepth = 3, currentDepth = 0): string[] {
  if (currentDepth > maxDepth) return [];
  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object') {
      return extractPaths(obj[0], `${prefix}.0`, maxDepth, currentDepth + 1);
    }
    return [`{{ ${prefix} }}`];
  }
  if (obj && typeof obj === 'object') {
    const result: string[] = [`{{ ${prefix} }}`];
    for (const key of Object.keys(obj)) {
      const childPaths = extractPaths(obj[key], `${prefix}.${key}`, maxDepth, currentDepth + 1);
      result.push(...childPaths);
    }
    return result;
  }
  return [`{{ ${prefix} }}`];
}

const DynamicTextSettings = () => {
  const { actions: { setProp }, expression, tag, fontSize, color, fontWeight, fallback } = useNode((n: any) => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <DataSourceSelector value={expression} onChange={(v: any) => setProp((p: any) => p.expression = v)} />
      <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Valeur par défaut</label>
        <input value={fallback} onChange={(e: any) => setProp((p: any) => p.fallback = e.target.value)}
          className="w-full bg-[#0d0d1a] border border-[#252538] rounded px-2.5 py-1.5 text-xs text-slate-200" /></div>
      <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Balise HTML</label>
        <select value={tag} onChange={(e: any) => setProp((p: any) => p.tag = e.target.value)}
          className="w-full bg-[#0d0d1a] border border-[#252538] rounded px-2.5 py-1.5 text-xs text-slate-200">
          {['div', 'span', 'h1', 'h2', 'h3', 'h4', 'p', 'label'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select></div>
      <div className="flex gap-2"><div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Taille</label>
        <input type="number" value={fontSize} onChange={(e: any) => setProp((p: any) => p.fontSize = parseInt(e.target.value))}
          className="w-full bg-[#0d0d1a] border border-[#252538] rounded px-2.5 py-1.5 text-xs text-slate-200" /></div>
        <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Poids</label>
          <select value={fontWeight} onChange={(e: any) => setProp((p: any) => p.fontWeight = parseInt(e.target.value))}
            className="w-full bg-[#0d0d1a] border border-[#252538] rounded px-2.5 py-1.5 text-xs text-slate-200">
            {[300, 400, 500, 600, 700, 800, 900].map((w) => <option key={w} value={w}>{w}</option>)}
          </select></div></div>
      <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Couleur</label>
        <input type="color" value={color} onChange={(e: any) => setProp((p: any) => p.color = e.target.value)}
          className="w-full h-8 rounded cursor-pointer" /></div>
    </div>
  );
};
DynamicTextBlock.craft = {
  displayName: 'Texte Dynamique',
  props: { expression: '{{ global.siteName }}', fallback: '', tag: 'div', fontSize: 16, color: '#0f172a', fontWeight: 400 },
  related: { settings: DynamicTextSettings },
};

// ── 2. DynamicRepeaterBlock ──
export const DynamicRepeaterBlock = (props: any) => {
  const { expression = '{{ ds.products }}', template = '<div>{item.name} - {item.price}</div>' } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const sources = useDynamicDataStore((s) => s.sources);
  const cache = useDynamicDataStore((s) => s.cache);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // Resolve expression to get array
    const parts = expression.replace('{{', '').replace('}}', '').trim().split('.');
    if (parts.length < 2) return;
    const ns = parts[0];
    const key = parts.slice(1).join('.');
    if (ns === 'ds') {
      for (const src of sources) {
        const cached = cache[src.id];
        if (cached) {
          const val = key.split('.').reduce((o: any, k: string) => o?.[k], cached.data);
          if (Array.isArray(val)) { setItems(val); return; }
        }
      }
    }
    setItems([]);
  }, [expression, sources, cache]);

  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ ...u.style }} className={'proquelec-builder-node space-y-3 ' + u.className}>
      {items.length === 0 && <div className="text-xs text-slate-500 italic p-4 text-center">Aucune donnée — configurez la source dans Données {`>`} Sources</div>}
      {items.map((item: any, i: number) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
          {item.image && <img src={item.image} alt="" className="w-12 h-12 rounded object-cover" />}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">{item.name || item.title || `Élément ${i + 1}`}</div>
            {item.price !== undefined && <div className="text-xs text-slate-500">{item.price} €</div>}
            {item.description && <div className="text-xs text-slate-400 truncate">{item.description}</div>}
            {item.email && <div className="text-xs text-slate-400">{item.email}</div>}
            {item.role && <div className="text-xs text-slate-400">{item.role}</div>}
          </div>
          <div className="text-[10px] text-slate-400 font-mono bg-white px-2 py-0.5 rounded border">#{i + 1}</div>
        </div>
      ))}
    </div>
  );
};
const DynamicRepeaterSettings = () => {
  const { actions: { setProp }, expression } = useNode((n: any) => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <DataSourceSelector value={expression} onChange={(v: any) => setProp((p: any) => p.expression = v)} />
      <p className="text-[10px] text-slate-500 italic">Sélectionnez une source contenant un tableau d'éléments (ex: produits, équipe, témoignages).</p>
    </div>
  );
};

DynamicRepeaterBlock.craft = {
  displayName: 'Liste Dynamique',
  props: { expression: '{{ ds.products }}' },
  related: { settings: DynamicRepeaterSettings },
};

// ── 3. DynamicImageBlock ──
export const DynamicImageBlock = (props: any) => {
  const { expression = '{{ ds.featured_image }}', fallback = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Image', alt = 'Dynamic', width = 400, height = 300 } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const sources = useDynamicDataStore((s) => s.sources);
  const cache = useDynamicDataStore((s) => s.cache);
  const [src, setSrc] = useState(fallback);

  useEffect(() => {
    const ds: Record<string, any> = {};
    for (const src of sources) {
      const cached = cache[src.id];
      if (cached) ds[src.name] = cached.data;
    }
    const context = { ds };
    const resolved = resolveDynamicContent(expression, context);
    setSrc(resolved || fallback);
  }, [expression, sources, cache]);

  return (
    <img ref={(r: any) => { if (r) connect(drag(r)); }} src={src} alt={alt}
      style={{ width, height, objectFit: 'cover', borderRadius: 8, ...u.style }}
      className={'proquelec-builder-node ' + u.className} />
  );
};
const DynamicImageSettings = () => {
  const { actions: { setProp }, expression, alt, width, height, fallback } = useNode((n: any) => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <DataSourceSelector value={expression} onChange={(v: any) => setProp((p: any) => p.expression = v)} />
      <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Texte alternatif</label>
        <input value={alt} onChange={(e: any) => setProp((p: any) => p.alt = e.target.value)}
          className="w-full bg-[#0d0d1a] border border-[#252538] rounded px-2.5 py-1.5 text-xs text-slate-200" /></div>
      <div className="flex gap-2">
        <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Largeur</label>
          <input type="number" value={width} onChange={(e: any) => setProp((p: any) => p.width = parseInt(e.target.value))}
            className="w-full bg-[#0d0d1a] border border-[#252538] rounded px-2.5 py-1.5 text-xs text-slate-200" /></div>
        <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hauteur</label>
          <input type="number" value={height} onChange={(e: any) => setProp((p: any) => p.height = parseInt(e.target.value))}
            className="w-full bg-[#0d0d1a] border border-[#252538] rounded px-2.5 py-1.5 text-xs text-slate-200" /></div>
      </div>
      <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Image par défaut (URL)</label>
        <input value={fallback} onChange={(e: any) => setProp((p: any) => p.fallback = e.target.value)}
          className="w-full bg-[#0d0d1a] border border-[#252538] rounded px-2.5 py-1.5 text-xs text-slate-200" /></div>
    </div>
  );
};

DynamicImageBlock.craft = {
  displayName: 'Image Dynamique',
  props: { expression: '{{ ds.featured_image }}', fallback: 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Image', alt: 'Dynamic', width: 400, height: 300 },
  related: { settings: DynamicImageSettings },
};

// ── 4. DataSourceConfigBlock ──
export const DataSourceConfigBlock = (props: any) => {
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const sources = useDynamicDataStore((s) => s.sources);
  const addSource = useDynamicDataStore((s) => s.addSource);
  const removeSource = useDynamicDataStore((s) => s.removeSource);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'api' as 'api' | 'static' | 'query', endpoint: '', data: '' });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const payload: any = { name: form.name.trim(), type: form.type };
    if (form.type === 'api') payload.endpoint = form.endpoint;
    if (form.type === 'static') {
      try { payload.data = JSON.parse(form.data); } catch { payload.data = form.data; }
    }
    addSource(payload);
    setForm({ name: '', type: 'api', endpoint: '', data: '' });
    setShowForm(false);
  };

  const handleFetch = async (source: any) => {
    const store = useDynamicDataStore.getState();
    await store.fetchSource(source.id);
  };

  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', ...u.style }} className={'proquelec-builder-node ' + u.className}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sources de données</h4>
        <button onClick={() => setShowForm(!showForm)}
          className="text-[10px] px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors">
          {showForm ? 'Annuler' : '+ Source'}
        </button>
      </div>

      {showForm && (
        <div className="space-y-2 mb-3 p-3 bg-white rounded border border-[#e2e8f0]">
          <input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })}
            placeholder="Nom (ex: products)" className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-xs" />
          <select value={form.type} onChange={(e: any) => setForm({ ...form, type: e.target.value })}
            className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-xs">
            <option value="api">API REST</option>
            <option value="static">Données statiques (JSON)</option>
            <option value="query">Paramètres d'URL</option>
          </select>
          {form.type === 'api' && (
            <input value={form.endpoint} onChange={(e: any) => setForm({ ...form, endpoint: e.target.value })}
              placeholder="https://api.example.com/products" className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-xs font-mono" />
          )}
          {form.type === 'static' && (
            <textarea value={form.data} onChange={(e: any) => setForm({ ...form, data: e.target.value })}
              placeholder='[{"name":"Produit 1","price":49}]' rows={3}
              className="w-full border border-[#e2e8f0] rounded px-2 py-1.5 text-xs font-mono" />
          )}
          <button onClick={handleAdd} disabled={!form.name.trim()}
            className="w-full text-[10px] px-3 py-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:opacity-50 transition-colors">
            Ajouter
          </button>
        </div>
      )}

      {sources.length === 0 && !showForm && (
        <p className="text-[10px] text-slate-400 text-center py-4">Aucune source. Ajoutez une API REST, des données statiques ou des paramètres d'URL.</p>
      )}

      <div className="space-y-1.5">
        {sources.map((src) => (
          <div key={src.id} className="flex items-center justify-between p-2 bg-white rounded border border-[#e2e8f0] group">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-700 truncate">{src.name}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{src.type === 'api' ? src.endpoint : src.type}</div>
            </div>
            <div className="flex gap-1 shrink-0 ml-2">
              {src.type === 'api' && (
                <button onClick={() => handleFetch(src)}
                  className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-indigo-50 transition-colors" title="Rafraîchir">
                  ↻
                </button>
              )}
              <button onClick={() => removeSource(src.id)}
                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-50 transition-colors" title="Supprimer">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Utilisez <code className="bg-slate-200 px-1 rounded text-[9px]">{'{{ ds.nom_source }}'}</code> pour référencer vos données. Ex: <code className="bg-slate-200 px-1 rounded text-[9px]">{'{{ ds.products.0.name }}'}</code>
        </p>
      </div>
    </div>
  );
};
DataSourceConfigBlock.craft = {
  displayName: 'Sources de Données',
  props: {},
  related: { settings: () => null },
};
