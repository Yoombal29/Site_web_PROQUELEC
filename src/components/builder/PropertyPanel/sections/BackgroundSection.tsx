import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GradientControl from '../controls/GradientControl';
import { Sparkles, RefreshCcw, Image as ImageIcon } from 'lucide-react';
import { useStyleEditor } from '../hooks/useStyleEditor';

const BackgroundSection: React.FC = () => {
  const { style, updateStyle } = useStyleEditor();

  const bgColor = (style.base?.backgroundColor as string) || '';
  const bgImage = (style.base?.backgroundImage as string) || '';

  const bgInputValue = bgImage
    ? (bgImage.includes('gradient') ? bgImage : bgImage.replace(/^url\(|\)$/g, ''))
    : '';

  return (
    <>
      <Tabs defaultValue="solid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8 mb-2">
          <TabsTrigger value="solid" className="text-[10px] h-6">Uni</TabsTrigger>
          <TabsTrigger value="gradient" className="text-[10px] h-6">Dégradé</TabsTrigger>
        </TabsList>

        <TabsContent value="solid" className="space-y-4 mt-0">
          <div className="flex gap-2 items-center border p-1 rounded">
            <div className="w-6 h-6 rounded border bg-chess-pattern relative overflow-hidden">
              <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
              <Input type="color" title="Choisir la couleur de fond" className="absolute inset-0 opacity-0 cursor-pointer" value={bgColor || '#ffffff'} onChange={(e) => updateStyle({ backgroundColor: e.target.value })} />
            </div>
            <Input className="border-0 h-6 text-xs p-0 focus-visible:ring-0 font-mono text-slate-600" value={bgColor} onChange={(e) => updateStyle({ backgroundColor: e.target.value })} placeholder="transparent" />
          </div>

          <div className="space-y-2 pt-2 border-t border-dashed">
            <Label className="text-[10px] uppercase text-slate-400 flex items-center gap-2"><Sparkles className="w-3 h-3 text-blue-500" /> Effets Glassmorphism</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-7 text-[9px]" onClick={() => updateStyle({ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255, 255, 255, 0.2)', borderWidth: '1px' })}>Glass Light</Button>
              <Button variant="outline" size="sm" className="h-7 text-[9px]" onClick={() => updateStyle({ backgroundColor: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: '1px' })}>Glass Dark</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gradient" className="space-y-3 mt-0">
          <GradientControl value={bgImage} onChange={(v) => updateStyle({ backgroundImage: v })} />

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => updateStyle({ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' })}>
              <RefreshCcw className="w-3 h-3 mr-2" /> Soft Blue
            </Button>
            <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => updateStyle({ backgroundImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' })}>
              <RefreshCcw className="w-3 h-3 mr-2" /> Sunset
            </Button>
            <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => updateStyle({ backgroundImage: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' })}>
              <RefreshCcw className="w-3 h-3 mr-2" /> Mint
            </Button>
            <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => updateStyle({ backgroundImage: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)' })}>
              <RefreshCcw className="w-3 h-3 mr-2" /> Ocean
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-1 pt-2 border-t border-dashed">
        <Label className="text-[10px] uppercase text-slate-400">Image de fond (URL)</Label>
        <div className="flex gap-2">
          <Input className="h-7 text-xs" placeholder="https://..." value={bgInputValue} onChange={(e) => {
            const v = e.target.value;
            if (v.includes('gradient')) updateStyle({ backgroundImage: v });
            else updateStyle({ backgroundImage: `url(${v})` });
          }} />
          <Button variant="outline" size="icon" className="h-7 w-7 shrink-0"><ImageIcon className="w-3 h-3" /></Button>
        </div>
        <div className="flex gap-2 mt-1">
          <select className="h-6 text-[10px] border rounded bg-white px-1 w-1/2" onChange={(e) => updateStyle({ backgroundSize: e.target.value })} title="Taille de l'arrière-plan" value={style.base?.backgroundSize || 'cover'}>
            <option value="cover">Cover (Remplir)</option>
            <option value="contain">Contain (Ajuster)</option>
            <option value="auto">Auto</option>
          </select>
          <select className="h-6 text-[10px] border rounded bg-white px-1 w-1/2" onChange={(e) => updateStyle({ backgroundPosition: e.target.value })} title="Position de l'arrière-plan" value={style.base?.backgroundPosition || 'center'}>
            <option value="center">Centre</option>
            <option value="top">Haut</option>
            <option value="bottom">Bas</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default BackgroundSection;
