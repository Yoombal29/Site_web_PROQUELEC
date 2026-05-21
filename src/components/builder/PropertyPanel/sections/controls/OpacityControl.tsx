import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useStyleEditor } from '../../hooks/useStyleEditor';

const OpacityControl: React.FC = () => {
  const { style, updateStyle } = useStyleEditor();
  const value = style.base?.opacity;

  const handleChange = (v: string) => {
    if (v === '') {
      updateStyle({ opacity: undefined });
      return;
    }
    const n = Number(v);
    if (Number.isNaN(n)) return;
    updateStyle({ opacity: Math.max(0, Math.min(1, n)) });
  };

  return (
    <div className="flex gap-2 items-center">
      <Label className="text-[10px] uppercase text-slate-400 shrink-0">Opacité</Label>
      <Input
        className="h-7 text-xs font-mono w-24"
        type="number"
        step="0.05"
        min={0}
        max={1}
        placeholder="0-1"
        value={value === undefined ? '' : String(value)}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
};

export default OpacityControl;
