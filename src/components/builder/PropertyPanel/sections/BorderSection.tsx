import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCcw, Settings2, Sparkles } from 'lucide-react';
import ShadowControl from '../controls/ShadowControl';
import { useStyleEditor } from '../hooks/useStyleEditor';

const BorderSection: React.FC = () => {
  const { style, updateStyle, toggleClass } = useStyleEditor();

  const borderRadius = style.base?.borderRadius || '';
  const borderWidth = style.base?.borderWidth || '';
  const borderColor = style.base?.borderColor || '';
  const borderStyle = style.base?.borderStyle || 'solid';

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-slate-400">Coins (Radius)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center border rounded bg-white px-2 h-7">
              <span className="text-[9px] text-slate-300 mr-2">TL</span>
              <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0" placeholder="0" value={parseInt(style.base?.borderTopLeftRadius as string) || ''} onChange={(e) => updateStyle({ borderTopLeftRadius: `${e.target.value}px` })} />
            </div>
            <div className="flex items-center border rounded bg-white px-2 h-7">
              <span className="text-[9px] text-slate-300 mr-2">TR</span>
              <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0" placeholder="0" value={parseInt(style.base?.borderTopRightRadius as string) || ''} onChange={(e) => updateStyle({ borderTopRightRadius: `${e.target.value}px` })} />
            </div>
            <div className="flex items-center border rounded bg-white px-2 h-7">
              <span className="text-[9px] text-slate-300 mr-2">BL</span>
              <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0" placeholder="0" value={parseInt(style.base?.borderBottomLeftRadius as string) || ''} onChange={(e) => updateStyle({ borderBottomLeftRadius: `${e.target.value}px` })} />
            </div>
            <div className="flex items-center border rounded bg-white px-2 h-7">
              <span className="text-[9px] text-slate-300 mr-2">BR</span>
              <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0" placeholder="0" value={parseInt(style.base?.borderBottomRightRadius as string) || ''} onChange={(e) => updateStyle({ borderBottomRightRadius: `${e.target.value}px` })} />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Input className="h-7 text-[10px]" placeholder="Global (ex: 12px)" value={borderRadius} onChange={(e) => updateStyle({ borderRadius: e.target.value })} />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
              const r = borderRadius || '0px';
              updateStyle({ borderTopLeftRadius: r, borderTopRightRadius: r, borderBottomLeftRadius: r, borderBottomRightRadius: r });
            }} title="Appliquer à tous les coins"><RefreshCcw size={10} /></Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase text-slate-400">Épaisseur</Label>
            <div className="flex items-center border rounded bg-white">
              <Input className="border-0 h-7 text-xs px-2 focus-visible:ring-0" placeholder="0" value={parseInt(borderWidth as string) || ''} onChange={(e) => updateStyle({ borderWidth: `${e.target.value}px` })} />
              <span className="text-[10px] text-slate-400 pr-2">px</span>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase text-slate-400">Style</Label>
            <select className="h-7 w-full text-xs border rounded bg-white" value={borderStyle} onChange={(e) => updateStyle({ borderStyle: e.target.value })} title="Style de bordure">
              <option value="none">Aucun</option>
              <option value="solid">Trait plein</option>
              <option value="dashed">Pointillés</option>
              <option value="dotted">Points</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-400">Couleur Bordure</Label>
          <div className="flex gap-2 items-center border p-1 rounded">
            <Input type="color" className="w-6 h-6 p-0 border-0 rounded cursor-pointer" value={borderColor || '#e2e8f0'} onChange={(e) => updateStyle({ borderColor: e.target.value })} title="Choisir la couleur de la bordure" />
            <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0 font-mono text-slate-600" value={borderColor || ''} onChange={(e) => updateStyle({ borderColor: e.target.value })} title="Code hexadécimal de la bordure" />
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-dashed">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase text-slate-400">Ombre (Box Shadow)</Label>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-red-500" onClick={() => updateStyle({ boxShadow: 'none' })} title="Retirer l'ombre"><Trash2 size={10} /></Button>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-blue-500" onClick={() => updateStyle({ boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' })} title="Ombre Douce"><Sparkles size={10} /></Button>
            </div>
          </div>

          <ShadowControl value={style.base?.boxShadow as string} onChange={(v) => updateStyle({ boxShadow: v })} />

          <div className="relative group">
            <Input className="h-7 text-[10px] font-mono text-slate-400 bg-slate-50 group-hover:text-slate-800 transition-colors" placeholder="Valeur CSS brute..." value={style.base?.boxShadow as string || ''} onChange={(e) => updateStyle({ boxShadow: e.target.value })} />
            <div className="absolute right-2 top-1.5 opacity-0 group-hover:opacity-100"><Settings2 size={10} className="text-slate-300" /></div>
          </div>
        </div>

      </div>
    </>
  );
};

export default BorderSection;
