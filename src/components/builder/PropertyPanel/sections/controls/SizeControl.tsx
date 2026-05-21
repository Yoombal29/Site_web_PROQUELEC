import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useStyleEditor } from '../../hooks/useStyleEditor';

type Device = 'base' | 'tablet' | 'mobile';

interface Props {
  device?: Device;
}

const SizeControl: React.FC<Props> = ({ device = 'base' }) => {
  const { style, updateStyle } = useStyleEditor();
  const width = style[device]?.width || '';
  const height = style[device]?.height || '';

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex gap-2 items-center">
        <Label className="text-[10px] uppercase text-slate-400 shrink-0">Width</Label>
        <Input className="h-7 text-xs font-mono w-32" placeholder="ex: 100%, 200px" value={width} onChange={(e) => updateStyle({ width: e.target.value } as any, device)} />
      </div>
      <div className="flex gap-2 items-center">
        <Label className="text-[10px] uppercase text-slate-400 shrink-0">Height</Label>
        <Input className="h-7 text-xs font-mono w-32" placeholder="ex: auto, 100px" value={height} onChange={(e) => updateStyle({ height: e.target.value } as any, device)} />
      </div>
    </div>
  );
};

export default SizeControl;
