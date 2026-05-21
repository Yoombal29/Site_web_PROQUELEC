import React from 'react';
import { Label } from '@/components/ui/label';
import ShadowControl from '../controls/ShadowControl';
import OpacityControl from './controls/OpacityControl';
import BlurControl from './controls/BlurControl';
import TransitionControl from './controls/TransitionControl';
import AnimationControl from './controls/AnimationControl';
import { useStyleEditor } from '../hooks/useStyleEditor';

const EffectsSection: React.FC = () => {
  const { style, updateStyle } = useStyleEditor();

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[10px] uppercase text-slate-400">Ombre</Label>
        <div className="mt-2">
          <ShadowControl value={style.base?.boxShadow as string} onChange={(v) => updateStyle({ boxShadow: v })} />
        </div>
      </div>

      <div>
        <OpacityControl />
      </div>

      <div>
        <BlurControl />
      </div>

      <div>
        <Label className="text-[10px] uppercase text-slate-400">Transition</Label>
        <div className="mt-2">
          <TransitionControl />
        </div>
      </div>

      <div>
        <Label className="text-[10px] uppercase text-slate-400">Animation légère</Label>
        <div className="mt-2">
          <AnimationControl />
        </div>
      </div>
    </div>
  );
};

export default EffectsSection;
