import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStyleEditor } from '../hooks/useStyleEditor';

const TypographySection: React.FC = () => {
  const { style, updateStyle } = useStyleEditor();

  const fontFamily = style.base?.fontFamily || 'Inter';
  const fontWeight = style.base?.fontWeight || '400';
  const fontSize = style.base?.fontSize || '';
  const lineHeight = style.base?.lineHeight || '';
  const letterSpacing = style.base?.letterSpacing || '';
  const color = style.base?.color || '';
  const textAlign = style.base?.textAlign || 'left';

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-slate-400">Police (Google Fonts)</Label>
        <Select value={fontFamily} onValueChange={(val) => updateStyle({ fontFamily: val })}>
          <SelectTrigger className="h-8 text-xs font-medium" title="Choisir une police"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-[200px]">
            <SelectItem value="Inter">Inter (Défaut UI)</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Open Sans">Open Sans</SelectItem>
            <SelectItem value="Montserrat">Montserrat</SelectItem>
            <SelectItem value="Lato">Lato</SelectItem>
            <SelectItem value="Poppins">Poppins</SelectItem>
            <SelectItem value="Playfair Display">Playfair Display</SelectItem>
            <SelectItem value="Merriweather">Merriweather</SelectItem>
            <SelectItem value="Fira Code">Fira Code</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-400">Poids</Label>
          <Select value={fontWeight} onValueChange={(val) => updateStyle({ fontWeight: val })}>
            <SelectTrigger className="h-8 text-xs" title="Choisir l'épaisseur du texte"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="100">Thin (100)</SelectItem>
              <SelectItem value="300">Light (300)</SelectItem>
              <SelectItem value="400">Regular (400)</SelectItem>
              <SelectItem value="500">Medium (500)</SelectItem>
              <SelectItem value="600">Semi-Bold (600)</SelectItem>
              <SelectItem value="700">Bold (700)</SelectItem>
              <SelectItem value="900">Black (900)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-400">Taille (px)</Label>
          <Input type="number" className="h-8 text-xs" placeholder="16" value={parseInt(fontSize as string) || ''} onChange={(e) => updateStyle({ fontSize: `${e.target.value}px` })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-400">Interligne</Label>
          <Input type="number" step="0.1" className="h-7 text-xs" placeholder="1.5" value={lineHeight as string} onChange={(e) => updateStyle({ lineHeight: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-400">Espacement</Label>
          <Input type="number" step="0.5" className="h-7 text-xs" placeholder="0" value={letterSpacing ? parseFloat(letterSpacing as string) : ''} onChange={(e) => updateStyle({ letterSpacing: `${e.target.value}px` })} />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-slate-400">Couleur Texte</Label>
        <div className="flex gap-2 items-center border p-1 rounded bg-slate-50">
          <Input type="color" className="w-8 h-6 p-0 border-0 rounded cursor-pointer" value={color || '#000000'} onChange={(e) => updateStyle({ color: e.target.value })} title="Choisir la couleur du texte" />
          <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0 font-mono text-slate-600 bg-transparent" value={color} onChange={(e) => updateStyle({ color: e.target.value })} placeholder="#000000" title="Code hexadécimal de la couleur" />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-slate-400">Alignement</Label>
        <div className="flex border rounded overflow-hidden divide-x bg-white">
          {['left', 'center', 'right', 'justify'].map((align) => (
            <button key={align} onClick={() => updateStyle({ textAlign: align as any })} className={`flex-1 h-7 flex items-center justify-center transition-colors ${textAlign === align ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} aria-label="Action">
              {align.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TypographySection;
