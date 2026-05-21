import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useStyleEditor } from '../../hooks/useStyleEditor';

const BlurControl: React.FC = () => {
  const { style, updateStyle } = useStyleEditor();
  const value = style.base?.backdropBlur || '';

  return (
    <div className="flex gap-2 items-center">
      <Label className="text-[10px] uppercase text-slate-400 shrink-0">Backdrop Blur</Label>
      <Input
        className="h-7 text-xs font-mono w-32"
        placeholder="ex: 4px or none"
        value={value}
        onChange={(e) => updateStyle({ backdropBlur: e.target.value })}
      />
    </div>
  );
};

export default BlurControl;
