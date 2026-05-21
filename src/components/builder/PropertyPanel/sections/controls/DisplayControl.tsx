import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useStyleEditor } from '../../hooks/useStyleEditor';

type Device = 'base' | 'tablet' | 'mobile';

interface Props {
  device?: Device;
}

const DisplayControl: React.FC<Props> = ({ device = 'base' }) => {
  const { style, updateStyle } = useStyleEditor();
  const current = style[device]?.display || '';

  return (
    <div className="flex gap-2 items-center">
      <Label className="text-[10px] uppercase text-slate-400 shrink-0">Display</Label>
      <Select onValueChange={(v) => updateStyle({ display: v } as any, device)}>
        <SelectTrigger className="w-36 h-7 text-xs">
          <SelectValue placeholder={current || 'block'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="block">block</SelectItem>
          <SelectItem value="inline-block">inline-block</SelectItem>
          <SelectItem value="flex">flex</SelectItem>
          <SelectItem value="inline-flex">inline-flex</SelectItem>
          <SelectItem value="grid">grid</SelectItem>
          <SelectItem value="none">none</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DisplayControl;
