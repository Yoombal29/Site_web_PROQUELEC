
import React from 'react';
import { useBuilderStore } from '@/stores/useBuilderStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Trash2, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Maximize, Box, Layers, Image as ImageIcon, Move, Save,
  PlusCircle, MinusCircle, Settings2, Sparkles, RefreshCcw, Monitor, Smartphone } from
'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from
"@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger } from
"@/components/ui/accordion";

const PropertyPanel: React.FC = () => {
  const {
    selectedBlockId, blocks, updateBlockContent, updateBlockStyle, removeBlock, saveTemplate
  } = useBuilderStore();

  // -- Récursivité pour trouver le bloc --
  const findBlock = (id: string, searchBlocks: unknown[]): unknown => {
    for (const b of searchBlocks) {
      if (b.id === id) return b;
      if (b.children) {
        const found = findBlock(id, b.children);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedBlock = selectedBlockId ? findBlock(selectedBlockId, blocks) : null;

  // -- Handlers --
  const handleContentChange = (key: string, value: string) => updateBlockContent(selectedBlockId!, { [key]: value });
  const handleStyleChange = (key: string, value: unknown) => updateBlockStyle(selectedBlockId!, { [key]: value });

  // --- Helper Components for Advanced Editing ---

  // 1. ADVANCED GRADIENT EDITOR Component
  const GradientControl = () => {
    const bg = selectedBlock.style?.backgroundImage || '';
    const isGradient = bg.includes('gradient');

    // Simple default if not a gradient
    const defaultGradient = {
      type: 'linear-gradient',
      angle: 135,
      stops: [
      { color: '#3b82f6', pos: 0 },
      { color: '#9333ea', pos: 100 }]

    };

    // Minimal Parser (Simplified for UI consistency)
    const parseGradient = (str: string) => {
      try {
        if (!str.includes('gradient')) return defaultGradient;
        const type = str.includes('radial') ? 'radial-gradient' : 'linear-gradient';

        // Extract angle
        let angle = 135;
        const angleMatch = str.match(/(\d+)deg/);
        if (angleMatch) angle = parseInt(angleMatch[1]);

        // Extract stops
        const stops: {color: string;pos: number;}[] = [];
        const stopMatches = str.match(/(#[a-fA-F0-0]{3,6}|rgba?\([^)]+\))\s+(\d+)%/g);
        if (stopMatches) {
          stopMatches.forEach((m) => {
            const parts = m.split(/\s+/);
            stops.push({ color: parts[0], pos: parseInt(parts[1]) });
          });
        } else {
          return defaultGradient;
        }

        return { type, angle, stops };
      } catch (e) {
        return defaultGradient;
      }
    };

    const current = parseGradient(bg);

    const updateGradient = (newData: unknown) => {
      const stopsStr = newData.stops.map((s: unknown) => `${s.color} ${s.pos}%`).join(', ');
      const gradientStr = newData.type === 'linear-gradient' ?
      `linear-gradient(${newData.angle}deg, ${stopsStr})` :
      `radial-gradient(circle, ${stopsStr})`;
      handleStyleChange('backgroundImage', gradientStr);
    };

    return (
      <div className="space-y-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="h-16 w-full rounded-md shadow-inner border border-white/20" style={{ backgroundImage: bg || 'none' }}></div>

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
                        {current.stops.map((stop, idx) =>
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
            )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => updateGradient({ ...current, type: 'linear-gradient' })}>Linéaire</Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => updateGradient({ ...current, type: 'radial-gradient' })}>Radial</Button>
                </div>
            </div>);

  };

  // 2. ADVANCED SHADOW EDITOR Component
  const ShadowControl = () => {
    const shadow = selectedBlock.style?.boxShadow || '0px 0px 0px 0px rgba(0,0,0,0)';

    // Simple shadow parser
    const parseShadow = (str: string) => {
      if (str === 'none') return { x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 0 };

      // Extract numbers and color
      const nums = str.match(/-?\d+px/g)?.map((n) => parseInt(n)) || [0, 0, 0, 0];
      const colorMatch = str.match(/rgba?\([^)]+\)|#[a-fA-F0-9]{3,6}/);
      const color = colorMatch ? colorMatch[0] : '#000000';

      return {
        x: nums[0] || 0,
        y: nums[1] || 0,
        blur: nums[2] || 0,
        spread: nums[3] || 0,
        color: color.includes('rgba') ? '#000000' : color, // Simplify for UI
        opacity: color.includes('rgba') ? Math.round(parseFloat(color.split(',')[3]) * 100) : 100
      };
    };

    const current = parseShadow(shadow);

    const updateShadow = (data: unknown) => {
      const rgba = data.color.startsWith('#') ?
      `rgba(${parseInt(data.color.slice(1, 3), 16)}, ${parseInt(data.color.slice(3, 5), 16)}, ${parseInt(data.color.slice(5, 7), 16)}, ${data.opacity / 100})` :
      data.color;
      const str = `${data.x}px ${data.y}px ${data.blur}px ${data.spread}px ${rgba}`;
      handleStyleChange('boxShadow', str);
    };

    return (
      <div className="space-y-3 animation-fade-in">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="space-y-1">
                        <Label className="text-[9px] uppercase text-slate-400">Position X</Label>
                        <div className="flex items-center gap-2">
                            <Slider value={[current.x]} min={-50} max={50} onValueChange={(v) => updateShadow({ ...current, x: v[0] })} className="flex-1" />
                            <span className="text-[9px] w-6 text-right">{current.x}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[9px] uppercase text-slate-400">Position Y</Label>
                        <div className="flex items-center gap-2">
                            <Slider value={[current.y]} min={-50} max={50} onValueChange={(v) => updateShadow({ ...current, y: v[0] })} className="flex-1" />
                            <span className="text-[9px] w-6 text-right">{current.y}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[9px] uppercase text-slate-400">Flou (Blur)</Label>
                        <div className="flex items-center gap-2">
                            <Slider value={[current.blur]} min={0} max={100} onValueChange={(v) => updateShadow({ ...current, blur: v[0] })} className="flex-1" />
                            <span className="text-[9px] w-6 text-right">{current.blur}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[9px] uppercase text-slate-400">Extension</Label>
                        <div className="flex items-center gap-2">
                            <Slider value={[current.spread]} min={-20} max={50} onValueChange={(v) => updateShadow({ ...current, spread: v[0] })} className="flex-1" />
                            <span className="text-[9px] w-6 text-right">{current.spread}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <div className="space-y-1 shrink-0">
                        <Label className="text-[9px] uppercase text-slate-400">Couleur</Label>
                        <Input type="color" className="w-8 h-8 p-0 border-0 rounded cursor-pointer" value={current.color} onChange={(e) => updateShadow({ ...current, color: e.target.value })} />
                    </div>
                    <div className="space-y-1 flex-1">
                        <Label className="text-[9px] uppercase text-slate-400">Intensité</Label>
                        <Slider value={[current.opacity]} max={100} onValueChange={(v) => updateShadow({ ...current, opacity: v[0] })} />
                    </div>
                </div>
            </div>);

  };

  if (!selectedBlock) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50 p-10 text-center">
                <Box className="w-16 h-16 mb-6 opacity-20" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Aucun élément sélectionné</h3>
                <p className="text-sm">Cliquez sur un élément dans le constructeur à gauche pour modifier ses propriétés, ou sélectionnez la page pour les réglages globaux.</p>
            </div>);

  }

  return (
    <div className="flex flex-col h-full bg-white text-sm">
            {/* Header */}
            <div className="h-14 border-b flex items-center justify-between px-4 font-bold text-slate-800 bg-white sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></span>
                    <span className="uppercase tracking-widest text-xs">{selectedBlock.type}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-2">#{selectedBlock.id.substring(0, 6)}</span>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50" onClick={() => {
            const name = window.prompt("Nom du modèle :", selectedBlock.content.title || "Mon Bloc");
            if (name) {
              saveTemplate(selectedBlock, name);
              // Simple alert or toast could be added here
            }
          }} title="Sauvegarder en Modèle">
                        <Save className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeBlock(selectedBlockId!)} title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="style" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 border-b bg-slate-50/50">
                    <TabsList className="w-full justify-start h-10 bg-transparent p-0 gap-6">
                        <TabsTrigger value="style" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 font-medium">Style</TabsTrigger>
                        <TabsTrigger value="content" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 font-medium">Contenu</TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 font-medium">Avancé</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* --- STYLE TAB --- */}
                    <TabsContent value="style" className="mt-0 p-0">
                        <Accordion type="multiple" defaultValue={["layout", "spacing", "typography", "background", "borders"]} className="w-full">

                            {/* 1. Layout & Size (PRO Flexbox Editor) */}
                            <AccordionItem value="layout" className="border-b px-4">
                                <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Disposition</AccordionTrigger>
                                <AccordionContent className="space-y-4 pb-4">
                                    {/* Display Mode */}
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase text-slate-400">Mode d'affichage</Label>
                                        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-md">
                                            {['block', 'flex', 'grid', 'inline-block'].map((d) =>
                      <button
                        key={d}
                        title={d}
                        className={`h-7 rounded text-[10px] uppercase font-medium transition-all ${selectedBlock.style?.display === d ? 'bg-white shadow-sm text-blue-600 ring-1 ring-blue-100' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => handleStyleChange('display', d)}>
                        
                                                    {d === 'inline-block' ? 'Inline' : d}
                                                </button>
                      )}
                                        </div>
                                    </div>

                                    {/* FLEXBOX CONTROLS (Only visible if Flex) */}
                                    {selectedBlock.style?.display === 'flex' &&
                  <div className="p-3 bg-blue-50/50 rounded-md border border-blue-100 space-y-3 animation-fade-in">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[9px] uppercase text-blue-500 font-bold">Flexbox Settings</Label>
                                                <Layers className="w-3 h-3 text-blue-400" />
                                            </div>

                                            {/* Direction */}
                                            <div className="space-y-1">
                                                <Label className="text-[9px] text-slate-400">Direction</Label>
                                                <div className="flex bg-white rounded border overflow-hidden">
                                                    <button onClick={() => handleStyleChange('flexDirection', 'row')} className={`flex-1 h-6 flex items-center justify-center ${selectedBlock.style?.flexDirection === 'row' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-50'}`} title="Ligne (Row)"><Move className="w-3 h-3 transform rotate-0" /></button>
                                                    <button onClick={() => handleStyleChange('flexDirection', 'column')} className={`flex-1 h-6 flex items-center justify-center ${selectedBlock.style?.flexDirection === 'column' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-50'}`} title="Colonne (Column)"><Move className="w-3 h-3 transform rotate-90" /></button>
                                                </div>
                                            </div>

                                            {/* Justify Content (Main Axis) */}
                                            <div className="space-y-1">
                                                <Label className="text-[9px] text-slate-400">Alignement Principal (Justify)</Label>
                                                <div className="grid grid-cols-5 bg-white rounded border overflow-hidden">
                                                    {[
                        { val: 'flex-start', icon: AlignLeft, label: 'Start' },
                        { val: 'center', icon: AlignCenter, label: 'Center' },
                        { val: 'flex-end', icon: AlignRight, label: 'End' },
                        { val: 'space-between', icon: AlignJustify, label: 'Between' },
                        { val: 'space-around', icon: Box, label: 'Around' }].
                        map((opt) =>
                        <button
                          key={opt.val}
                          onClick={() => handleStyleChange('justifyContent', opt.val)}
                          className={`h-6 flex items-center justify-center ${selectedBlock.style?.justifyContent === opt.val ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-50'}`}
                          title={opt.label}>
                          
                                                            <opt.icon className="w-3 h-3" />
                                                        </button>
                        )}
                                                </div>
                                            </div>

                                            {/* Align Items (Cross Axis) */}
                                            <div className="space-y-1">
                                                <Label className="text-[9px] text-slate-400">Alignement Secondaire (Align)</Label>
                                                <div className="grid grid-cols-4 bg-white rounded border overflow-hidden">
                                                    {[
                        { val: 'stretch', icon: Maximize, label: 'Stretch' },
                        { val: 'flex-start', icon: AlignLeft, label: 'Start' },
                        { val: 'center', icon: AlignCenter, label: 'Center' },
                        { val: 'flex-end', icon: AlignRight, label: 'End' }].
                        map((opt) =>
                        <button
                          key={opt.val}
                          onClick={() => handleStyleChange('alignItems', opt.val)}
                          className={`h-6 flex items-center justify-center ${selectedBlock.style?.alignItems === opt.val ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-50'}`}
                          title={opt.label}>
                          
                                                            <opt.icon className={`w-3 h-3 ${opt.val === 'stretch' ? '' : 'transform rotate-90'}`} />
                                                        </button>
                        )}
                                                </div>
                                            </div>

                                            {/* Gap */}
                                            <div className="flex items-center gap-2">
                                                <Label className="text-[9px] text-slate-400 w-8">Gap</Label>
                                                <Input className="h-6 text-xs bg-white" placeholder="ex: 16px" value={selectedBlock.style?.gap || ''} onChange={(e) => handleStyleChange('gap', e.target.value)} />
                                            </div>
                                        </div>
                  }

                                    {/* Dimensions */}
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400">Largeur</Label>
                                            <div className="flex items-center border rounded bg-white group hover:border-blue-400 focus-within:border-blue-500 transition-colors">
                                                <span className="pl-2 text-[10px] text-slate-400">W</span>
                                                <Input className="border-0 h-7 text-xs px-2 focus-visible:ring-0" placeholder="auto" value={selectedBlock.style?.width || ''} onChange={(e) => handleStyleChange('width', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400">Hauteur</Label>
                                            <div className="flex items-center border rounded bg-white group hover:border-blue-400 focus-within:border-blue-500 transition-colors">
                                                <span className="pl-2 text-[10px] text-slate-400">H</span>
                                                <Input className="border-0 h-7 text-xs px-2 focus-visible:ring-0" placeholder="auto" value={selectedBlock.style?.height || ''} onChange={(e) => handleStyleChange('height', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-slate-400">Max-Width (Centrage)</Label>
                                        <div className="flex gap-2">
                                            <Input className="h-8 text-xs flex-1" placeholder="ex: 1200px" value={selectedBlock.style?.maxWidth || ''} onChange={(e) => handleStyleChange('maxWidth', e.target.value)} />
                                            <Button
                        variant="outline" size="sm" className="h-8 text-[10px]"
                        onClick={() => {
                          // Quick Auto Margin Center Preset
                          handleStyleChange('marginLeft', 'auto');
                          handleStyleChange('marginRight', 'auto');
                          handleStyleChange('width', '100%');
                          if (!selectedBlock.style?.maxWidth) handleStyleChange('maxWidth', '1280px');
                        }}
                        title="Centrer le bloc horizontalement">
                        
                                                Centrer
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 2. Spacing (Visual Box Model) */}
                            <AccordionItem value="spacing" className="border-b px-4">
                                <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Espacement</AccordionTrigger>
                                <AccordionContent className="pb-6 pt-2 flex justify-center">
                                    {/* Visual Box Model Editor Logic */}
                                    <div className="relative w-full max-w-[240px] h-36 bg-slate-50 border border-slate-200 rounded flex items-center justify-center p-8 shadow-sm">
                                        <span className="absolute top-1 left-2 text-[9px] text-slate-400 bg-slate-100 px-1 rounded uppercase tracking-wider font-semibold">Margin</span>
                                        {/* Margin Inputs */}
                                        <input className="absolute top-2 w-10 text-center text-[10px] bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded shadow-sm" placeholder="-" value={selectedBlock.style?.marginTop || ''} onChange={(e) => handleStyleChange('marginTop', e.target.value)} />
                                        <input className="absolute bottom-2 w-10 text-center text-[10px] bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded shadow-sm" placeholder="-" value={selectedBlock.style?.marginBottom || ''} onChange={(e) => handleStyleChange('marginBottom', e.target.value)} />
                                        <input className="absolute left-1 w-8 text-center text-[10px] bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded shadow-sm" placeholder="-" value={selectedBlock.style?.marginLeft || ''} onChange={(e) => handleStyleChange('marginLeft', e.target.value)} />
                                        <input className="absolute right-1 w-8 text-center text-[10px] bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded shadow-sm" placeholder="-" value={selectedBlock.style?.marginRight || ''} onChange={(e) => handleStyleChange('marginRight', e.target.value)} />

                                        {/* Padding Box */}
                                        <div className="relative w-full h-full bg-white border border-dashed border-blue-200 flex items-center justify-center rounded">
                                            <span className="absolute top-1 left-2 text-[9px] text-blue-300 uppercase tracking-wider font-semibold">Padding</span>
                                            <input className="absolute top-4 w-10 text-center text-[10px] bg-slate-50 border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded" placeholder="-" value={selectedBlock.style?.paddingTop || ''} onChange={(e) => handleStyleChange('paddingTop', e.target.value)} />
                                            <input className="absolute bottom-4 w-10 text-center text-[10px] bg-slate-50 border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded" placeholder="-" value={selectedBlock.style?.paddingBottom || ''} onChange={(e) => handleStyleChange('paddingBottom', e.target.value)} />
                                            <input className="absolute left-2 w-6 text-center text-[10px] bg-slate-50 border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded" placeholder="-" value={selectedBlock.style?.paddingLeft || ''} onChange={(e) => handleStyleChange('paddingLeft', e.target.value)} />
                                            <input className="absolute right-2 w-6 text-center text-[10px] bg-slate-50 border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded" placeholder="-" value={selectedBlock.style?.paddingRight || ''} onChange={(e) => handleStyleChange('paddingRight', e.target.value)} />

                                            <div className="w-12 h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[8px] text-slate-400">Content</div>
                                        </div>
                                    </div>
                                </AccordionContent>
                                <AccordionContent className="pb-4 pt-0">
                                    <div className="flex gap-2 items-center">
                                        <Label className="text-[10px] uppercase text-slate-400 shrink-0">Padding Global</Label>
                                        <Input className="h-7 text-xs font-mono" placeholder="ex: 20px" value={selectedBlock.style?.padding || ''} onChange={(e) => handleStyleChange('padding', e.target.value)} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 3. Typography (Google Fonts & PRO Controls) */}
                            <AccordionItem value="typography" className="border-b px-4">
                                <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Typographie</AccordionTrigger>
                                <AccordionContent className="space-y-4 pb-4">
                                    <div className="space-y-3">
                                        {/* Font Family */}
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400">Police (Google Fonts)</Label>
                                            <Select value={selectedBlock.style?.fontFamily || 'Inter'} onValueChange={(val) => handleStyleChange('fontFamily', val)}>
                                                <SelectTrigger className="h-8 text-xs font-medium" title="Choisir une police"><SelectValue /></SelectTrigger>
                                                <SelectContent className="max-h-[200px]">
                                                    <SelectItem value="Inter" className="font-['Inter']">Inter (Défaut UI)</SelectItem>
                                                    <SelectItem value="Roboto" className="font-['Roboto']">Roboto</SelectItem>
                                                    <SelectItem value="Open Sans" className="font-['Open Sans']">Open Sans</SelectItem>
                                                    <SelectItem value="Montserrat" className="font-['Montserrat']">Montserrat</SelectItem>
                                                    <SelectItem value="Lato" className="font-['Lato']">Lato</SelectItem>
                                                    <SelectItem value="Poppins" className="font-['Poppins']">Poppins</SelectItem>
                                                    <SelectItem value="Playfair Display" className="font-['Playfair_Display']">Playfair Display (Serif)</SelectItem>
                                                    <SelectItem value="Merriweather" className="font-['Merriweather']">Merriweather (Serif)</SelectItem>
                                                    <SelectItem value="Fira Code" className="font-['Fira_Code']">Fira Code (Mono)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Weight & Size */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-slate-400">Poids</Label>
                                                <Select value={selectedBlock.style?.fontWeight || '400'} onValueChange={(val) => handleStyleChange('fontWeight', val)}>
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
                                                <Input type="number" className="h-8 text-xs" placeholder="16" value={parseInt(selectedBlock.style?.fontSize as string) || ''} onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line Height & Spacing */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400">Interligne</Label>
                                            <Input type="number" step="0.1" className="h-7 text-xs" placeholder="1.5" value={selectedBlock.style?.lineHeight || ''} onChange={(e) => handleStyleChange('lineHeight', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400">Espacement</Label>
                                            <Input type="number" step="0.5" className="h-7 text-xs" placeholder="0" value={selectedBlock.style?.letterSpacing ? parseFloat(selectedBlock.style.letterSpacing as string) : ''} onChange={(e) => handleStyleChange('letterSpacing', `${e.target.value}px`)} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-slate-400">Couleur Texte</Label>
                                        <div className="flex gap-2 items-center border p-1 rounded bg-slate-50">
                                            <Input type="color" className="w-8 h-6 p-0 border-0 rounded cursor-pointer" value={selectedBlock.style?.color || '#000000'} onChange={(e) => handleStyleChange('color', e.target.value)} title="Choisir la couleur du texte" />
                                            <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0 font-mono text-slate-600 bg-transparent" value={selectedBlock.style?.color || ''} onChange={(e) => handleStyleChange('color', e.target.value)} placeholder="#000000" title="Code hexadécimal de la couleur" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-slate-400">Alignement</Label>
                                        <div className="flex border rounded overflow-hidden divide-x bg-white">
                                            {['left', 'center', 'right', 'justify'].map((align) =>
                      <button key={align} onClick={() => handleStyleChange('textAlign', align)} className={`flex-1 h-7 flex items-center justify-center transition-colors ${selectedBlock.style?.textAlign === align ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} aria-label="Action">
                                                    {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                                                    {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                                                    {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                                                    {align === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                                                </button>
                      )}
                                        </div>
                                    </div>

                                    {/* Text Transform shortcuts */}
                                    <div className="flex gap-1 pt-2">
                                        {['uppercase', 'lowercase', 'capitalize', 'none'].map((t) =>
                    <button
                      key={t}
                      className={`text-[9px] px-2 py-1 rounded border ${selectedBlock.style?.textTransform === t ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-500 border-slate-200 hover:border-slate-300'}`}
                      onClick={() => handleStyleChange('textTransform', t)} aria-label="Action">
                      
                                                {t === 'none' ? 'Normal' : t.charAt(0).toUpperCase() + t.slice(1)}
                                            </button>
                    )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 4. Backgrounds (Advanced Gradient Support V2) */}
                            <AccordionItem value="background" className="border-b px-4">
                                <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Arrière-plan</AccordionTrigger>
                                <AccordionContent className="space-y-4 pb-4">
                                    <Tabs defaultValue="solid" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 h-8 mb-2">
                                            <TabsTrigger value="solid" className="text-[10px] h-6">Uni</TabsTrigger>
                                            <TabsTrigger value="gradient" className="text-[10px] h-6">Dégradé</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="solid" className="space-y-4 mt-0">
                                            <div className="flex gap-2 items-center border p-1 rounded">
                                                <div className="w-6 h-6 rounded border bg-chess-pattern relative overflow-hidden">
                                                    <div className="absolute inset-0" style={{ backgroundColor: selectedBlock.style?.backgroundColor }}></div>
                                                    <Input type="color" title="Choisir la couleur de fond" className="absolute inset-0 opacity-0 cursor-pointer" value={selectedBlock.style?.backgroundColor || '#ffffff'} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} />
                                                </div>
                                                <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0 font-mono text-slate-600" value={selectedBlock.style?.backgroundColor || ''} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} placeholder="transparent" />
                                            </div>

                                            <div className="space-y-2 pt-2 border-t border-dashed">
                                                <Label className="text-[10px] uppercase text-slate-400 flex items-center gap-2"><Sparkles className="w-3 h-3 text-blue-500" /> Effets Glassmorphism</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button variant="outline" size="sm" className="h-7 text-[9px]" onClick={() => {
                            handleStyleChange('backgroundColor', 'rgba(255, 255, 255, 0.1)');
                            handleStyleChange('backdropFilter', 'blur(10px)');
                            handleStyleChange('borderColor', 'rgba(255, 255, 255, 0.2)');
                            handleStyleChange('borderWidth', '1px');
                          }}>Glass Light</Button>
                                                    <Button variant="outline" size="sm" className="h-7 text-[9px]" onClick={() => {
                            handleStyleChange('backgroundColor', 'rgba(0, 0, 0, 0.2)');
                            handleStyleChange('backdropFilter', 'blur(12px)');
                            handleStyleChange('borderColor', 'rgba(255, 255, 255, 0.1)');
                            handleStyleChange('borderWidth', '1px');
                          }}>Glass Dark</Button>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="gradient" className="space-y-3 mt-0">
                                            <GradientControl />

                                            <div className="grid grid-cols-2 gap-2 mt-4">
                                                <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => handleStyleChange('backgroundImage', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')}>
                                                    <RefreshCcw className="w-3 h-3 mr-2" /> Soft Blue
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => handleStyleChange('backgroundImage', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)')}>
                                                    <RefreshCcw className="w-3 h-3 mr-2" /> Sunset
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => handleStyleChange('backgroundImage', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)')}>
                                                    <RefreshCcw className="w-3 h-3 mr-2" /> Mint
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => handleStyleChange('backgroundImage', 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)')}>
                                                    <RefreshCcw className="w-3 h-3 mr-2" /> Ocean
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="space-y-1 pt-2 border-t border-dashed">
                                        <Label className="text-[10px] uppercase text-slate-400">Image de fond (URL)</Label>
                                        <div className="flex gap-2">
                                            <Input className="h-7 text-xs" placeholder="https://..." value={selectedBlock.style?.backgroundImage ? selectedBlock.style.backgroundImage.replace('url(', '').replace(')', '') : ''} onChange={(e) => {
                        if (e.target.value.includes('gradient')) handleStyleChange('backgroundImage', e.target.value);else
                        handleStyleChange('backgroundImage', `url(${e.target.value})`);
                      }} />
                                            <Button variant="outline" size="icon" className="h-7 w-7 shrink-0"><ImageIcon className="w-3 h-3" /></Button>
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            <select className="h-6 text-[10px] border rounded bg-white px-1 w-1/2" onChange={(e) => handleStyleChange('backgroundSize', e.target.value)} title="Taille de l'arrière-plan">
                                                <option value="cover">Cover (Remplir)</option>
                                                <option value="contain">Contain (Ajuster)</option>
                                                <option value="auto">Auto</option>
                                            </select>
                                            <select className="h-6 text-[10px] border rounded bg-white px-1 w-1/2" onChange={(e) => handleStyleChange('backgroundPosition', e.target.value)} title="Position de l'arrière-plan">
                                                <option value="center">Centre</option>
                                                <option value="top">Haut</option>
                                                <option value="bottom">Bas</option>
                                            </select>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 5. Borders & Effects (Advanced Shadow) */}
                            <AccordionItem value="borders" className="border-b px-4">
                                <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Bordures & Effets</AccordionTrigger>
                                <AccordionContent className="space-y-4 pb-4">

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase text-slate-400">Coins (Radius)</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center border rounded bg-white px-2 h-7">
                                                    <span className="text-[9px] text-slate-300 mr-2">TL</span>
                                                    <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0" placeholder="0" value={parseInt(selectedBlock.style?.borderTopLeftRadius as string) || ''} onChange={(e) => handleStyleChange('borderTopLeftRadius', `${e.target.value}px`)} />
                                                </div>
                                                <div className="flex items-center border rounded bg-white px-2 h-7">
                                                    <span className="text-[9px] text-slate-300 mr-2">TR</span>
                                                    <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0" placeholder="0" value={parseInt(selectedBlock.style?.borderTopRightRadius as string) || ''} onChange={(e) => handleStyleChange('borderTopRightRadius', `${e.target.value}px`)} />
                                                </div>
                                                <div className="flex items-center border rounded bg-white px-2 h-7">
                                                    <span className="text-[9px] text-slate-300 mr-2">BL</span>
                                                    <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0" placeholder="0" value={parseInt(selectedBlock.style?.borderBottomLeftRadius as string) || ''} onChange={(e) => handleStyleChange('borderBottomLeftRadius', `${e.target.value}px`)} />
                                                </div>
                                                <div className="flex items-center border rounded bg-white px-2 h-7">
                                                    <span className="text-[9px] text-slate-300 mr-2">BR</span>
                                                    <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0" placeholder="0" value={parseInt(selectedBlock.style?.borderBottomRightRadius as string) || ''} onChange={(e) => handleStyleChange('borderBottomRightRadius', `${e.target.value}px`)} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Input className="h-7 text-[10px]" placeholder="Global (ex: 12px)" value={selectedBlock.style?.borderRadius || ''} onChange={(e) => handleStyleChange('borderRadius', e.target.value)} />
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                          const r = selectedBlock.style?.borderRadius || '0px';
                          handleStyleChange('borderTopLeftRadius', r);
                          handleStyleChange('borderTopRightRadius', r);
                          handleStyleChange('borderBottomLeftRadius', r);
                          handleStyleChange('borderBottomRightRadius', r);
                        }} title="Appliquer à tous les coins"><RefreshCcw size={10} /></Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-slate-400">Épaisseur</Label>
                                                <div className="flex items-center border rounded bg-white">
                                                    <Input className="border-0 h-7 text-xs px-2 focus-visible:ring-0" placeholder="0" value={parseInt(selectedBlock.style?.borderWidth as string) || ''} onChange={(e) => handleStyleChange('borderWidth', `${e.target.value}px`)} />
                                                    <span className="text-[10px] text-slate-400 pr-2">px</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-slate-400">Style</Label>
                                                <select className="h-7 w-full text-xs border rounded bg-white" value={selectedBlock.style?.borderStyle || 'solid'} onChange={(e) => handleStyleChange('borderStyle', e.target.value)} title="Style de bordure">
                                                    <option value="none">Aucun</option>
                                                    <option value="solid">Trait plein</option>
                                                    <option value="dashed">Pointillés</option>
                                                    <option value="dotted">Points</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-slate-400">Couleur Bordure</Label>
                                        <div className="flex gap-2 items-center border p-1 rounded">
                                            <Input type="color" className="w-6 h-6 p-0 border-0 rounded cursor-pointer" value={selectedBlock.style?.borderColor || '#e2e8f0'} onChange={(e) => handleStyleChange('borderColor', e.target.value)} title="Choisir la couleur de la bordure" />
                                            <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0 font-mono text-slate-600" value={selectedBlock.style?.borderColor || ''} onChange={(e) => handleStyleChange('borderColor', e.target.value)} title="Code hexadécimal de la bordure" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2 border-t border-dashed">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] uppercase text-slate-400">Ombre (Box Shadow)</Label>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-red-500" onClick={() => handleStyleChange('boxShadow', 'none')} title="Retirer l'ombre"><Trash2 size={10} /></Button>
                                                <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-blue-500" onClick={() => handleStyleChange('boxShadow', '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)')} title="Ombre Douce"><Sparkles size={10} /></Button>
                                            </div>
                                        </div>

                                        <ShadowControl />

                                        <div className="relative group">
                                            <Input
                        className="h-7 text-[10px] font-mono text-slate-400 bg-slate-50 group-hover:text-slate-800 transition-colors"
                        placeholder="Valeur CSS brute..."
                        value={selectedBlock.style?.boxShadow || ''}
                        onChange={(e) => handleStyleChange('boxShadow', e.target.value)} />
                      
                                            <div className="absolute right-2 top-1.5 opacity-0 group-hover:opacity-100"><Settings2 size={10} className="text-slate-300" /></div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-slate-400">Opacité</Label>
                                        <div className="flex items-center gap-2">
                                            <Slider
                        value={[(selectedBlock.style?.opacity !== undefined ? Number(selectedBlock.style.opacity) : 1) * 100]}
                        max={100}
                        step={1}
                        className="flex-1"
                        onValueChange={(val) => handleStyleChange('opacity', val[0] / 100)} />
                      
                                            <span className="text-[10px] w-8 text-right font-mono">
                                                {Math.round((selectedBlock.style?.opacity !== undefined ? Number(selectedBlock.style.opacity) : 1) * 100)}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-dashed">
                                        <Label className="text-[10px] uppercase text-slate-400">Transitions & Hover</Label>
                                        <div className="flex gap-2">
                                            <Input className="h-7 text-[10px] font-mono flex-1" placeholder="transition (ex: all 0.3s)" value={selectedBlock.style?.transition || ''} onChange={(e) => handleStyleChange('transition', e.target.value)} />
                                            <Button variant="outline" size="sm" className="h-7 text-[9px]" onClick={() => handleStyleChange('transition', 'all 0.3s ease-in-out')}>Appliquer 0.3s</Button>
                                        </div>
                                        <p className="text-[9px] text-slate-400">Le hover scale/opacity sera bientôt configurable visuellement.</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 6. Advanced Custom CSS */}
                            <AccordionItem value="custom-css" className="border-b px-4">
                                <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">CSS Personnalisé</AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <Textarea
                    className="font-mono text-[10px] min-h-[100px] bg-slate-900 text-blue-300"
                    placeholder=".ma-classe { ... }"
                    value={selectedBlock.style?.customCss || ''}
                    onChange={(e) => handleStyleChange('customCss', e.target.value)} />
                  
                                    <p className="text-[9px] text-slate-400 mt-2 italic">Note: Le CSS sera injecté directement sur l'élément.</p>
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                    </TabsContent>

                    {/* --- CONTENT TAB --- */}
                    <TabsContent value="content" className="mt-0 p-4 space-y-6">
                        {/* 1. Common Fields */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500">Titre</Label>
                                <Input value={selectedBlock.content.title || ''} onChange={(e) => handleContentChange('title', e.target.value)} placeholder="Titre principal..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500">Contenu Texte</Label>
                                <Textarea value={selectedBlock.content.subtitle || selectedBlock.content.text || ''} onChange={(e) => handleContentChange('subtitle', e.target.value)} placeholder="Votre contenu ici..." className="min-h-[120px]" />
                            </div>
                        </div>

                        {/* 2. HTML Block Special */}
                        {selectedBlock.type === 'html' &&
            <div className="space-y-2 pt-4 border-t border-dashed">
                                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2"><Box className="w-3 h-3" /> Éditeur HTML</h3>
                                <Textarea value={selectedBlock.content.html || ''} onChange={(e) => handleContentChange('html', e.target.value)} placeholder="<div>...</div>" className="font-mono text-xs min-h-[400px] bg-slate-900 text-green-400 p-4" />
                            </div>
            }

                        {/* 3. Image/Link Defaults */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500">Lien / URL</Label>
                                <Input value={selectedBlock.content.href || ''} onChange={(e) => handleContentChange('href', e.target.value)} placeholder="/contact ou https://..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500">Source Image</Label>
                                <div className="flex gap-2">
                                    <Input value={selectedBlock.content.src || ''} onChange={(e) => handleContentChange('src', e.target.value)} placeholder="https://..." className="flex-1" />
                                    <Button size="icon" variant="outline"><ImageIcon className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* --- SETTINGS TAB --- */}
                    <TabsContent value="settings" className="mt-0 p-4 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500">ID HTML</Label>
                                <Input value={selectedBlock.style?.id || ''} onChange={(e) => handleStyleChange('id', e.target.value)} placeholder="mon-ancre" className="font-mono text-xs" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500">Classes CSS</Label>
                                <Input value={selectedBlock.style?.className || ''} onChange={(e) => handleStyleChange('className', e.target.value)} placeholder="p-4 bg-white shadow..." className="font-mono text-xs" />
                                <p className="text-[10px] text-slate-400">Ajouter des classes Tailwind additionnelles.</p>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-dashed">
                                <Label className="text-xs font-semibold uppercase text-slate-500">Visibilité Réactive</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 rounded border bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs">Afficher sur Desktop</span>
                                        </div>
                                        <input
                      type="checkbox"
                      id="vis-desktop"
                      title="Toggle visibilité desktop"
                      checked={!selectedBlock.style?.className?.includes('hidden')}
                      onChange={(e) => {
                        let cls = selectedBlock.style?.className || '';
                        if (e.target.checked) cls = cls.replace('hidden', '').trim();else
                        cls = `${cls} hidden`.trim();
                        handleStyleChange('className', cls);
                      }} />
                    
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded border bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs">Cacher sur Mobile</span>
                                        </div>
                                        <input
                      type="checkbox"
                      id="vis-mobile"
                      title="Toggle visibilité mobile"
                      checked={selectedBlock.style?.className?.includes('max-md:hidden')}
                      onChange={(e) => {
                        let cls = selectedBlock.style?.className || '';
                        if (e.target.checked) cls = `${cls} max-md:hidden`.trim();else
                        cls = cls.replace('max-md:hidden', '').trim();
                        handleStyleChange('className', cls);
                      }} />
                    
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                </div>
            </Tabs>
        </div>);

};

export default PropertyPanel;