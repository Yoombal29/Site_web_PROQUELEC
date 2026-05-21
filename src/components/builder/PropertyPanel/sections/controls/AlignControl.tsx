import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useStyleEditor } from '../../hooks/useStyleEditor';

type Device = 'base' | 'tablet' | 'mobile';

interface Props {
  device?: Device;
}

const AlignControl: React.FC<Props> = ({ device = 'base' }) => {
  const { style, updateStyle } = useStyleEditor();
  const alignItems = style[device]?.alignItems || '';
  const justifyContent = style[device]?.justifyContent || '';
  const flexDirection = style[device]?.flexDirection || '';

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <Label className="text-[10px] uppercase text-slate-400 shrink-0">Direction</Label>
        <Select onValueChange={(v) => updateStyle({ flexDirection: v } as any, device)}>
          <SelectTrigger className="w-36 h-7 text-xs">
            <SelectValue placeholder={flexDirection || 'row'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="row">row</SelectItem>
            <SelectItem value="column">column</SelectItem>
            <SelectItem value="row-reverse">row-reverse</SelectItem>
            <SelectItem value="column-reverse">column-reverse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 items-center">
        <Label className="text-[10px] uppercase text-slate-400 shrink-0">Align Items</Label>
        <Select onValueChange={(v) => updateStyle({ alignItems: v } as any, device)}>
          <SelectTrigger className="w-36 h-7 text-xs">
            <SelectValue placeholder={alignItems || 'stretch'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stretch">stretch</SelectItem>
            <SelectItem value="flex-start">flex-start</SelectItem>
            <SelectItem value="center">center</SelectItem>
            <SelectItem value="flex-end">flex-end</SelectItem>
            <SelectItem value="baseline">baseline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 items-center">
        <Label className="text-[10px] uppercase text-slate-400 shrink-0">Justify</Label>
        <Select onValueChange={(v) => updateStyle({ justifyContent: v } as any, device)}>
          <SelectTrigger className="w-36 h-7 text-xs">
            <SelectValue placeholder={justifyContent || 'flex-start'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flex-start">flex-start</SelectItem>
            <SelectItem value="center">center</SelectItem>
            <SelectItem value="flex-end">flex-end</SelectItem>
            <SelectItem value="space-between">space-between</SelectItem>
            <SelectItem value="space-around">space-around</SelectItem>
            <SelectItem value="space-evenly">space-evenly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AlignControl;
