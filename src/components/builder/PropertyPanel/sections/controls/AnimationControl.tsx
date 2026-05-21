import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useStyleEditor } from '@/components/builder/PropertyPanel/hooks/useStyleEditor';

const presets = {
  none: null,
  fade: { transition: { duration: '300ms', easing: 'ease', property: 'opacity' }, transform: undefined, willChange: 'opacity' },
  'slide-up': { transition: { duration: '400ms', easing: 'cubic-bezier(.2,.9,.2,1)', property: 'opacity, transform' }, transform: 'translateY(0px)', willChange: 'opacity, transform' },
};

export const AnimationControl: React.FC = () => {
  const { style, updateStyle } = useStyleEditor();
  const currentStyle = style.base || {};
  const transition = (currentStyle.transition as any) || {};
  const transform = (currentStyle.transform as string) || '';
  const willChange = (currentStyle.willChange as string) || '';
  const reduceMotion = Boolean(currentStyle.reduceMotion);

  const applyPreset = (key: keyof typeof presets) => {
    const p = presets[key];
    if (!p) {
      updateStyle({ transition: undefined, transform: undefined, willChange: undefined } as any);
      return;
    }
    updateStyle({ transition: p.transition, transform: p.transform, willChange: p.willChange } as any);
  };

  const toggleReduceMotion = (checked: boolean) => {
    updateStyle({ reduceMotion: checked } as any);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <button className="btn" onClick={() => applyPreset('none')}>Aucun</button>
        <button className="btn" onClick={() => applyPreset('fade')}>Fade</button>
        <button className="btn" onClick={() => applyPreset('slide-up')}>Slide-up</button>
      </div>
      <div className="grid gap-2">
        <div className="flex gap-2 items-center">
          <Label className="text-[10px] uppercase text-slate-400 shrink-0">Transform</Label>
          <Input className="h-7 text-xs w-full" placeholder="translateY(10px)" value={transform} onChange={(e) => updateStyle({ transform: e.target.value } as any)} />
        </div>
        <div className="flex gap-2 items-center">
          <Label className="text-[10px] uppercase text-slate-400 shrink-0">Will Change</Label>
          <Input className="h-7 text-xs w-full" placeholder="opacity, transform" value={willChange} onChange={(e) => updateStyle({ willChange: e.target.value } as any)} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input id="reduceMotionToggle" type="checkbox" checked={reduceMotion} onChange={(e) => toggleReduceMotion(e.target.checked)} className="h-4 w-4 text-slate-700" />
        <label htmlFor="reduceMotionToggle" className="text-sm text-slate-500">Respect reduced motion</label>
      </div>
    </div>
  );
};

export default AnimationControl;
