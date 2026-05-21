import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useStyleEditor } from '../../hooks/useStyleEditor';

type Device = 'base' | 'tablet' | 'mobile';

interface Props {
  device?: Device;
}

const GridColumnsControl: React.FC<Props> = ({ device = 'base' }) => {
  const { style, updateStyle } = useStyleEditor();
  const value = (style[device] as any)?.gridTemplateColumns || '';

  return (
    <div className="flex gap-2 items-center">
      <Label className="text-[10px] uppercase text-slate-400 shrink-0">Grid Columns</Label>
      <Input className="h-7 text-xs font-mono w-52" placeholder="ex: repeat(3, 1fr)" value={value} onChange={(e) => updateStyle({ gridTemplateColumns: e.target.value } as any, device)} />
    </div>
  );
};

export default GridColumnsControl;
