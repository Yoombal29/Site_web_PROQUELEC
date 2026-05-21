import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useStyleEditor } from '../../hooks/useStyleEditor';

type Device = 'base' | 'tablet' | 'mobile';

interface Props {
  device?: Device;
}

const WrapControl: React.FC<Props> = ({ device = 'base' }) => {
  const { style, updateStyle } = useStyleEditor();
  const flexWrap = style[device]?.flexWrap || '';

  return (
    <div className="flex gap-2 items-center">
      <Label className="text-[10px] uppercase text-slate-400 shrink-0">Wrap</Label>
      <Select onValueChange={(v) => updateStyle({ flexWrap: v } as any, device)}>
        <SelectTrigger className="w-36 h-7 text-xs">
          <SelectValue placeholder={flexWrap || 'nowrap'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nowrap">nowrap</SelectItem>
          <SelectItem value="wrap">wrap</SelectItem>
          <SelectItem value="wrap-reverse">wrap-reverse</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default WrapControl;
