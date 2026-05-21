import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle } from 'lucide-react';

type GradientType = 'linear-gradient' | 'radial-gradient';
interface GradientStop { color: string; pos: number; }
interface ParsedGradient { type: GradientType; angle: number; stops: GradientStop[]; }

const defaultGradient: ParsedGradient = {
  type: 'linear-gradient',
  angle: 135,
  stops: [
    { color: '#3b82f6', pos: 0 },
    { color: '#9333ea', pos: 100 }
  ]
};

const parseGradient = (str: string): ParsedGradient => {
  if (!str || !str.includes('gradient')) return defaultGradient;
  const type: GradientType = str.includes('radial') ? 'radial-gradient' : 'linear-gradient';

  let angle = 135;
  const angleMatch = str.match(/(\d+)deg/);
  if (angleMatch) angle = parseInt(angleMatch[1], 10);

  const stops: GradientStop[] = [];
  const stopMatches = str.match(/(#[a-fA-F0-9]{3,6}|rgba?\([^)]+\))\s*(\d+)%/g);
  if (stopMatches) {
    stopMatches.forEach((match) => {
      const parts = match.trim().split(/\s+/);
      const posPart = parts[parts.length - 1];
      const colorPart = parts.slice(0, parts.length - 1).join(' ');
      stops.push({ color: colorPart, pos: parseInt(posPart, 10) });
    });
  } else {
    return defaultGradient;
  }

  return { type, angle, stops };
};

const buildGradient = (gradient: ParsedGradient) => {
  const stopsStr = gradient.stops.map((stop) => `${stop.color} ${stop.pos}%`).join(', ');
  return gradient.type === 'linear-gradient'
    ? `linear-gradient(${gradient.angle}deg, ${stopsStr})`
    : `radial-gradient(circle, ${stopsStr})`;
};

interface Props { value?: string; onChange: (v: string) => void }

const GradientControl: React.FC<Props> = ({ value, onChange }) => {
  const current = React.useMemo(() => parseGradient(value || ''), [value]);

  const updateGradient = (newData: ParsedGradient) => onChange(buildGradient(newData));

  return (
    <div className="space-y-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="h-16 w-full rounded-md shadow-inner border border-white/20" style={{ backgroundImage: value || 'none' }} />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1 flex-1">
          <Label className="text-[9px] uppercase text-slate-400">Angle</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[current.angle]}
              max={360}
              onValueChange={(val) => updateGradient({ ...current, angle: val[0] })}
              className="flex-1" />
            <span className="text-[10px] w-8 font-mono">{current.angle}°</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[9px] uppercase text-slate-400">Color Stops</Label>
          <Button variant="ghost" size="icon" className="h-4 w-4 text-blue-600" onClick={() => {
            const newStops = [...current.stops, { color: '#ffffff', pos: 100 }];
            updateGradient({ ...current, stops: newStops });
          }}>
            <PlusCircle size={14} />
          </Button>
        </div>

        <div className="space-y-2">
          {current.stops.map((stop, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white p-1 rounded border">
              <Input
                type="color"
                className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                value={stop.color.startsWith('#') ? stop.color : '#ffffff'}
                title="Choisir la couleur du dégradé"
                onChange={(e) => {
                  const newStops = [...current.stops];
                  newStops[idx].color = e.target.value;
                  updateGradient({ ...current, stops: newStops });
                }} />
              <Slider
                value={[stop.pos]}
                max={100}
                onValueChange={(val) => {
                  const newStops = [...current.stops];
                  newStops[idx].pos = val[0];
                  updateGradient({ ...current, stops: newStops });
                }}
                className="flex-1" />
              <span className="text-[9px] w-6 font-mono">{stop.pos}%</span>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-300 hover:text-red-500" onClick={() => {
                if (current.stops.length <= 2) return;
                const newStops = current.stops.filter((_, i) => i !== idx);
                updateGradient({ ...current, stops: newStops });
              }}>
                <MinusCircle size={12} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
        <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => updateGradient({ ...current, type: 'linear-gradient' })}>Linéaire</Button>
        <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => updateGradient({ ...current, type: 'radial-gradient' })}>Radial</Button>
      </div>
    </div>
  );
};

export default GradientControl;
