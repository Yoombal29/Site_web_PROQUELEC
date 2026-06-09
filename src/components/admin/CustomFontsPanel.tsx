import React, { useState, useEffect } from 'react';
import { useFontsStore, GOOGLE_FONTS_LIST, injectActiveFonts, type CustomFont } from '@/stores/fonts.store';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';

export function CustomFontsPanel() {
  const fonts = useFontsStore((s) => s.fonts);
  const addFont = useFontsStore((s) => s.addFont);
  const removeFont = useFontsStore((s) => s.removeFont);
  const toggleFont = useFontsStore((s) => s.toggleFont);
  const [tab, setTab] = useState<'google' | 'custom'>('google');

  useEffect(() => {
    injectActiveFonts(fonts);
  }, [fonts]);

  const addGoogleFont = (name: string, weights: number[]) => {
    const exists = fonts.find((f) => f.name === name);
    if (exists) {
      toast.info(`"${name}" est déjà dans la liste`);
      return;
    }
    addFont({ name, type: 'google', weights, active: true });
    toast.success(`Police "${name}" ajoutée`);
  };

  const addCustomFont = () => {
    const name = window.prompt('Nom de la police :');
    if (!name) return;
    const url = window.prompt('URL du fichier WOFF2 :');
    if (!url) return;
    addFont({ name, type: 'custom', url, weights: [400], active: true });
    toast.success(`Police "${name}" ajoutée`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Polices personnalisées</h2>
            <p className="text-sm text-slate-500">Ajoutez des polices Google Fonts ou vos propres fichiers.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-4">
          {(['google', 'custom'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t === 'google' ? '🔤 Google Fonts' : '📁 Polices personnalisées'}
            </button>
          ))}
        </div>

        {/* Google Fonts */}
        {tab === 'google' && (
          <div className="grid grid-cols-3 gap-3">
            {GOOGLE_FONTS_LIST.map((gf) => {
              const isActive = fonts.find((f) => f.name === gf.name)?.active;
              const isAdded = fonts.some((f) => f.name === gf.name);
              return (
                <div key={gf.name} className={`p-3 rounded-lg border transition-all ${isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200 hover:border-indigo-200'}`}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{gf.name}</p>
                      <p className="text-[10px] text-slate-500">{gf.weights.map((w) => `${w}`).join(', ')}</p>
                    </div>
                    {isAdded ? (
                      <button onClick={() => toggleFont(fonts.find((f) => f.name === gf.name)!.id)}
                        className={`p-1.5 rounded-md transition-colors ${isActive ? 'text-indigo-600 bg-indigo-100' : 'text-slate-400 hover:bg-slate-200'}`}
                        title={isActive ? 'Désactiver' : 'Activer'}>
                        {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    ) : (
                      <button onClick={() => addGoogleFont(gf.name, gf.weights)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Ajouter">
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1" style={{ fontFamily: gf.name }}>The quick brown fox jumps over the lazy dog.</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Fonts */}
        {tab === 'custom' && (
          <div>
            <button onClick={addCustomFont}
              className="mb-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus size={14} /> Ajouter une police personnalisée
            </button>
            {fonts.filter((f) => f.type === 'custom').length === 0 ? (
              <p className="text-sm text-slate-400 italic">Aucune police personnalisée. Cliquez sur le bouton pour en ajouter une.</p>
            ) : (
              <div className="space-y-2">
                {fonts.filter((f) => f.type === 'custom').map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{f.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{f.url}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toggleFont(f.id)}
                        className={`p-1.5 rounded-md transition-colors ${f.active ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {f.active ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={() => { removeFont(f.id); toast.success(`"${f.name}" supprimée`); }}
                        className="p-1.5 rounded-md text-red-400 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active fonts preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-3">Polices actives ({fonts.filter((f) => f.active).length})</h3>
        {fonts.filter((f) => f.active).length === 0 ? (
          <p className="text-sm text-slate-400 italic">Aucune police active. Activez-en une depuis l'onglet Google Fonts ou personnalisée.</p>
        ) : (
          <div className="space-y-3">
            {fonts.filter((f) => f.active).map((f) => (
              <div key={f.id}>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">{f.name}</p>
                <p className="text-lg" style={{ fontFamily: f.name }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
