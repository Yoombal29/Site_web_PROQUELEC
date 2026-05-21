import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useStyleEditor } from '../../hooks/useStyleEditor';

type Device = 'base' | 'tablet' | 'mobile';

interface Props {
  device?: Device;
}

const GapControl: React.FC<Props> = ({ device = 'base' }) => {
  const { style, updateStyle } = useStyleEditor();
  const gap = style[device]?.gap || '';

  return (
    <div className="flex gap-2 items-center">
      <Label className="text-[10px] uppercase text-slate-400 shrink-0">Gap</Label>
      <Input className="h-7 text-xs font-mono w-28" placeholder="ex: 12px" value={gap} onChange={(e) => updateStyle({ gap: e.target.value } as any, device)} />
    </div>
  );
};

export default GapControl;
