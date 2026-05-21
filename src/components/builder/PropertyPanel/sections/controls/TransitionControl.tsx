import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useStyleEditor } from '../../hooks/useStyleEditor';

const easings = ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'];
const properties = ['all', 'opacity', 'transform', 'background-color', 'color', 'opacity, transform'];

const TransitionControl: React.FC = () => {
  const { style, updateStyle } = useStyleEditor();
  const transition = (style.base?.transition as any) || {};
  const duration = transition.duration || '';
  const easing = transition.easing || 'ease';
  const property = transition.property || 'all';

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <Label className="text-[10px] uppercase text-slate-400 shrink-0">Durée</Label>
        <Input className="h-7 text-xs font-mono w-28" placeholder="ex: 300ms" value={duration} onChange={(e) => updateStyle({ transition: { ...transition, duration: e.target.value } })} />
      </div>

      <div className="flex gap-2 items-center">
        <Label className="text-[10px] uppercase text-slate-400 shrink-0">Easing</Label>
        <Select onValueChange={(v) => updateStyle({ transition: { ...transition, easing: v } })}>
          <SelectTrigger className="w-36 h-7 text-xs">
            <SelectValue placeholder={easing} />
          </SelectTrigger>
          <SelectContent>
            {easings.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 items-center">
        <Label className="text-[10px] uppercase text-slate-400 shrink-0">Propriété</Label>
        <Select onValueChange={(v) => updateStyle({ transition: { ...transition, property: v } })}>
          <SelectTrigger className="w-40 h-7 text-xs">
            <SelectValue placeholder={property} />
          </SelectTrigger>
          <SelectContent>
            {properties.map((prop) => (
              <SelectItem key={prop} value={prop}>{prop}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TransitionControl;
