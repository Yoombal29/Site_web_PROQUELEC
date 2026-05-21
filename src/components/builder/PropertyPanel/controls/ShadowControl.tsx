import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface ParsedShadow {
  x: number; y: number; blur: number; spread: number; color: string; opacity: number;
}

const parseShadow = (str: string): ParsedShadow => {
  if (!str || str === 'none') return { x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 0 };

  const nums = str.match(/-?\d+px/g)?.map((n) => parseInt(n, 10)) || [0, 0, 0, 0];
  const colorMatch = str.match(/rgba?\([^)]+\)|#[a-fA-F0-9]{3,6}/);
  const color = colorMatch ? colorMatch[0] : '#000000';
  const opacity = color.startsWith('rgba')
    ? Math.round(parseFloat(color.split(',')[3]) * 100)
    : 100;
  const normalizedColor = color.startsWith('rgba')
    ? (() => {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return '#000000';
        const [, r, g, b] = match;
        return `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
      })()
    : color;

  return {
    x: nums[0] || 0,
    y: nums[1] || 0,
    blur: nums[2] || 0,
    spread: nums[3] || 0,
    color: normalizedColor,
    opacity
  };
};

const buildShadow = (shadow: ParsedShadow) => {
  const rgba = shadow.color.startsWith('#')
    ? `rgba(${parseInt(shadow.color.slice(1, 3), 16)}, ${parseInt(shadow.color.slice(3, 5), 16)}, ${parseInt(shadow.color.slice(5, 7), 16)}, ${shadow.opacity / 100})`
    : shadow.color;
  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${rgba}`;
};

interface Props { value?: string; onChange: (v: string) => void }

const ShadowControl: React.FC<Props> = ({ value, onChange }) => {
  const current = React.useMemo(() => parseShadow(value || ''), [value]);
  const updateShadow = (data: ParsedShadow) => onChange(buildShadow(data));

  return (
    <div className="space-y-3 animation-fade-in">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="space-y-1">
          <Label className="text-[9px] uppercase text-slate-400">Position X</Label>
          <div className="flex items-center gap-2">
            <Slider value={[current.x]} min={-50} max={50} onValueChange={(v) => updateShadow({ ...current, x: v[0] })} className="flex-1" />
            <span className="text-[9px] w-6 text-right">{current.x}</span>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[9px] uppercase text-slate-400">Position Y</Label>
          <div className="flex items-center gap-2">
            <Slider value={[current.y]} min={-50} max={50} onValueChange={(v) => updateShadow({ ...current, y: v[0] })} className="flex-1" />
            <span className="text-[9px] w-6 text-right">{current.y}</span>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[9px] uppercase text-slate-400">Flou (Blur)</Label>
          <div className="flex items-center gap-2">
            <Slider value={[current.blur]} min={0} max={100} onValueChange={(v) => updateShadow({ ...current, blur: v[0] })} className="flex-1" />
            <span className="text-[9px] w-6 text-right">{current.blur}</span>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[9px] uppercase text-slate-400">Extension</Label>
          <div className="flex items-center gap-2">
            <Slider value={[current.spread]} min={-20} max={50} onValueChange={(v) => updateShadow({ ...current, spread: v[0] })} className="flex-1" />
            <span className="text-[9px] w-6 text-right">{current.spread}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <div className="space-y-1 shrink-0">
          <Label className="text-[9px] uppercase text-slate-400">Couleur</Label>
          <Input type="color" className="w-8 h-8 p-0 border-0 rounded cursor-pointer" value={current.color} onChange={(e) => updateShadow({ ...current, color: e.target.value })} />
        </div>
        <div className="space-y-1 flex-1">
          <Label className="text-[9px] uppercase text-slate-400">Intensité</Label>
          <Slider value={[current.opacity]} max={100} onValueChange={(v) => updateShadow({ ...current, opacity: v[0] })} />
        </div>
      </div>
    </div>
  );
};

export default ShadowControl;
