import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { BlockStyle } from '@/types/builder';

interface AdvancedLayoutSectionProps {
  style: BlockStyle;
  onChange: (style: Partial<BlockStyle>) => void;
}

export const AdvancedLayoutSection: React.FC<AdvancedLayoutSectionProps> = ({ style, onChange }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Position</h4>

      <div className="space-y-1.5">
        <Label className="text-xs">Position</Label>
        <Select
          value={style.position || 'relative'}
          onValueChange={(v) => onChange({ position: v as BlockStyle['position'] })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relative" className="text-xs">Relative</SelectItem>
            <SelectItem value="absolute" className="text-xs">Absolute</SelectItem>
            <SelectItem value="fixed" className="text-xs">Fixed</SelectItem>
            <SelectItem value="sticky" className="text-xs">Sticky</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Top</Label>
          <Input
            value={style.marginTop || ''}
            onChange={(e) => onChange({ marginTop: e.target.value })}
            placeholder="auto"
            className="h-7 text-xs font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Right</Label>
          <Input
            value={style.marginRight || ''}
            onChange={(e) => onChange({ marginRight: e.target.value })}
            placeholder="auto"
            className="h-7 text-xs font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Bottom</Label>
          <Input
            value={style.marginBottom || ''}
            onChange={(e) => onChange({ marginBottom: e.target.value })}
            placeholder="auto"
            className="h-7 text-xs font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Left</Label>
          <Input
            value={style.marginLeft || ''}
            onChange={(e) => onChange({ marginLeft: e.target.value })}
            placeholder="auto"
            className="h-7 text-xs font-mono"
          />
        </div>
      </div>

      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">Auto Layout</h4>

      <div className="space-y-1.5">
        <Label className="text-xs">Direction</Label>
        <Select
          value={style.flexDirection || 'row'}
          onValueChange={(v) => onChange({ flexDirection: v as 'row' | 'column', display: 'flex' })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="row" className="text-xs">Horizontal</SelectItem>
            <SelectItem value="column" className="text-xs">Vertical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Wrap</Label>
        <Switch
          checked={style.flexWrap === 'wrap'}
          onCheckedChange={(v) => onChange({ flexWrap: v ? 'wrap' : 'nowrap', display: 'flex' })}
        />
      </div>

      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">Avancé</h4>

      <div className="space-y-1.5">
        <Label className="text-xs">Z-Index</Label>
        <Input
          type="number"
          value={style.zIndex ?? ''}
          onChange={(e) => onChange({ zIndex: e.target.value ? parseInt(e.target.value) : undefined })}
          placeholder="auto"
          className="h-7 text-xs font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Overflow</Label>
        <Select
          value={style.overflow || 'visible'}
          onValueChange={(v) => onChange({ overflow: v as BlockStyle['overflow'] })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visible" className="text-xs">Visible</SelectItem>
            <SelectItem value="hidden" className="text-xs">Hidden</SelectItem>
            <SelectItem value="auto" className="text-xs">Auto</SelectItem>
            <SelectItem value="scroll" className="text-xs">Scroll</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Aspect Ratio</Label>
        <Input
          value={style.aspectRatio || ''}
          onChange={(e) => onChange({ aspectRatio: e.target.value })}
          placeholder="16/9"
          className="h-7 text-xs font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Transform</Label>
        <Input
          value={style.transform || ''}
          onChange={(e) => onChange({ transform: e.target.value })}
          placeholder="rotate(0deg)"
          className="h-7 text-xs font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Transition</Label>
        <Input
          value={style.transition || ''}
          onChange={(e) => onChange({ transition: e.target.value })}
          placeholder="all 0.3s ease"
          className="h-7 text-xs font-mono"
        />
      </div>
    </div>
  );
};
