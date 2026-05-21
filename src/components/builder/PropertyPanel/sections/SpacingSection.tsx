import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStyleEditor } from '../hooks/useStyleEditor';

const SpacingSection: React.FC = () => {
  const { style, updateStyle } = useStyleEditor();
  const [advanced, setAdvanced] = useState(false);

  const margin = style.base?.margin || '';
  const padding = style.base?.padding || '';
  const gap = style.base?.gap || '';

  return (
    <div>
      <div className="pb-6 pt-2 flex justify-center">
        <div className="relative w-full max-w-[240px] h-36 bg-slate-50 border border-slate-200 rounded flex items-center justify-center p-8 shadow-sm">
          <span className="absolute top-1 left-2 text-[9px] text-slate-400 bg-slate-100 px-1 rounded uppercase tracking-wider font-semibold">Margin</span>

          <div className="relative w-full h-full bg-white border border-dashed border-blue-200 flex items-center justify-center rounded">
            <span className="absolute top-1 left-2 text-[9px] text-blue-300 uppercase tracking-wider font-semibold">Padding</span>
            <div className="w-12 h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[8px] text-slate-400">Content</div>
          </div>
        </div>
      </div>

      <div className="pb-4 pt-0 space-y-3">
        <div className="flex gap-2 items-center">
          <Label className="text-[10px] uppercase text-slate-400 shrink-0">Margin</Label>
          <Input className="h-7 text-xs font-mono" placeholder="ex: 20px 0" value={margin} onChange={(e) => updateStyle({ margin: e.target.value })} />
        </div>

        <div className="flex gap-2 items-center">
          <Label className="text-[10px] uppercase text-slate-400 shrink-0">Padding</Label>
          <Input className="h-7 text-xs font-mono" placeholder="ex: 20px 0" value={padding} onChange={(e) => updateStyle({ padding: e.target.value })} />
        </div>

        <div className="flex gap-2 items-center">
          <Label className="text-[10px] uppercase text-slate-400 shrink-0">Gap</Label>
          <Input className="h-7 text-xs font-mono" placeholder="ex: 12px" value={gap} onChange={(e) => updateStyle({ gap: e.target.value })} />
        </div>

        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setAdvanced((s) => !s)}>{advanced ? 'Masquer avancé' : 'Mode avancé'}</Button>
          <div className="text-[10px] text-slate-400">Utilisez le mode avancé pour modifier les côtés individuellement.</div>
        </div>

        {advanced && (
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="margin-top" value={style.base?.marginTop || ''} onChange={(e) => updateStyle({ marginTop: e.target.value })} />
            <Input placeholder="margin-bottom" value={style.base?.marginBottom || ''} onChange={(e) => updateStyle({ marginBottom: e.target.value })} />
            <Input placeholder="margin-left" value={style.base?.marginLeft || ''} onChange={(e) => updateStyle({ marginLeft: e.target.value })} />
            <Input placeholder="margin-right" value={style.base?.marginRight || ''} onChange={(e) => updateStyle({ marginRight: e.target.value })} />

            <Input placeholder="padding-top" value={style.base?.paddingTop || ''} onChange={(e) => updateStyle({ paddingTop: e.target.value })} />
            <Input placeholder="padding-bottom" value={style.base?.paddingBottom || ''} onChange={(e) => updateStyle({ paddingBottom: e.target.value })} />
            <Input placeholder="padding-left" value={style.base?.paddingLeft || ''} onChange={(e) => updateStyle({ paddingLeft: e.target.value })} />
            <Input placeholder="padding-right" value={style.base?.paddingRight || ''} onChange={(e) => updateStyle({ paddingRight: e.target.value })} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SpacingSection;
