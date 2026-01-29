import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Search, Play, Download, Eye, Grid, List, Filter,
  Info, Maximize2, X, ChevronRight, ChevronLeft, Zap, ShieldCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Hotspot {
  x: number;
  y: number;
  title: string;
  content: string;
}

interface MediaItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail_url?: string;
  type: 'photo' | 'video';
  category: string;
  tags: string[];
  hotspots?: Hotspot[];
  created_at: string;
  size: number;
}

export function PhotoVideoGallery() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data) setItems(data);
      setLoading(false);
    };
    fetchGallery();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="h-96 flex items-center justify-center"><Zap className="animate-pulse text-proqblue h-12 w-12" /></div>;

  return (
    <div className="space-y-12 py-10">
      {/* Header Immersif */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-proqblue to-proqblue-dark p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 opacity-10 scale-150 rotate-12">
          <Zap size={300} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-0">Expérience Immersive</Badge>
          <h2 className="text-5xl font-black mb-4 tracking-tight">Showroom Technique</h2>
          <p className="text-xl text-blue-100/80 leading-relaxed font-medium">
            Explorez nos réalisations sous un nouvel angle. Cliquez sur les points interactifs
            pour apprendre les secrets de nos installations conformes aux normes.
          </p>
        </div>
      </div>

      {/* Barre de Filtres Premium */}
      <div className="flex flex-col md:flex-row gap-6 items-center sticky top-24 z-20 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-proqblue transition-colors" />
          <Input
            className="pl-12 h-14 bg-gray-50/50 border-gray-100 rounded-xl focus:ring-2 focus:ring-proqblue/20 text-lg"
            placeholder="Rechercher une installation, un projet..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['all', 'formations', 'projets', 'installations'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-lg text-sm font-bold capitalize transition-all ${selectedCategory === cat ? 'bg-white text-proqblue shadow-md' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              {cat === 'all' ? 'Tout' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grille Inspirée du Luxe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            className="group relative cursor-pointer"
            onClick={() => setSelectedItem(item)}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-gray-100 shadow-xl transition-all duration-700 group-hover:-translate-y-4 group-hover:shadow-2xl">
              <img
                src={item.url}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />

              {/* Overlay Gradient Animé */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Contenu Overlay */}
              <div className="absolute bottom-0 left-0 p-10 w-full text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <Badge className="mb-3 bg-proqblue text-white border-0">{item.category}</Badge>
                <h3 className="text-3xl font-black mb-2 leading-tight">{item.title}</h3>
                <div className="flex items-center gap-2 text-blue-200/80 font-semibold group-hover:text-white transition-colors">
                  <span>En savoir plus</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Badges Flottants */}
              {item.type === 'video' && (
                <div className="absolute top-6 left-6 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white">
                  <Play fill="currentColor" size={24} />
                </div>
              )}
              {item.hotspots && item.hotspots.length > 0 && (
                <div className="absolute top-6 right-6 px-4 py-2 bg-green-500/90 backdrop-blur-md rounded-full text-white text-xs font-black tracking-widest uppercase flex items-center gap-2 border border-white/20">
                  <Info size={14} /> {item.hotspots.length} Point(s) Éducatif(s)
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Visionneuse Immersive (Modal) */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300">
          {/* Background Glassmorphism */}
          <div
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl"
            onClick={() => setSelectedItem(null)}
          />

          <div className="relative w-full max-w-7xl h-full flex flex-col md:flex-row gap-10 bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(35,118,223,0.3)]">

            {/* Zone Média */}
            <div className="relative flex-[1.5] bg-black overflow-hidden group/media select-none shadow-inner">
              {selectedItem.type === 'photo' ? (
                <img src={selectedItem.url} className="w-full h-full object-contain" />
              ) : (
                <video src={selectedItem.url} controls className="w-full h-full" autoPlay />
              )}

              {/* Hotspots Interactifs */}
              <TooltipProvider>
                {selectedItem.hotspots?.map((hs, i) => (
                  <div
                    key={i}
                    className="absolute group/hotspot cursor-help"
                    style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                  >
                    <Tooltip open={activeHotspot === i}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveHotspot(activeHotspot === i ? null : i); }}
                          className={`w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center transition-all duration-500 ${activeHotspot === i ? 'bg-proqblue ring-8 ring-proqblue/30 scale-125' : 'bg-white/80 scale-100 hover:scale-110'
                            }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-current animate-ping absolute opacity-40" />
                          <div className={`transition-colors duration-300 ${activeHotspot === i ? 'text-white' : 'text-proqblue'}`}>
                            <Zap size={14} fill="currentColor" />
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="p-6 max-w-sm bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl"
                        onPointerDownOutside={() => setActiveHotspot(null)}
                      >
                        <h4 className="font-black text-proqblue text-xl mb-2 flex items-center gap-2">
                          <ShieldCheck className="text-green-500" />
                          {hs.title}
                        </h4>
                        <p className="text-slate-600 leading-relaxed font-medium">{hs.content}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </TooltipProvider>

              {/* Aide immersive */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/40 backdrop-blur-xl rounded-full text-white/60 text-sm font-medium border border-white/10 pointer-events-none opacity-0 group-hover/media:opacity-100 transition-opacity">
                Survolez l'image pour découvrir les secrets techniques
              </div>
            </div>

            {/* Zone Infos Sidebord */}
            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <Badge className="bg-proqblue/10 text-proqblue border-0 h-8 px-4 font-bold uppercase tracking-wider">{selectedItem.category}</Badge>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                >
                  <X />
                </button>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1]">{selectedItem.title}</h2>
              <p className="text-blue-100/60 text-xl leading-relaxed font-medium mb-12">
                {selectedItem.description}
              </p>

              <div className="space-y-10">
                <div>
                  <h4 className="text-white/40 uppercase tracking-widest text-xs font-black mb-4">Tags Techniques</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags?.map(tag => (
                      <Badge key={tag} className="bg-white/5 text-white/70 hover:bg-white/10 border-white/10 py-2 px-4 rounded-xl cursor-default transition-colors">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedItem.hotspots && selectedItem.hotspots.length > 0 && (
                  <div className="p-8 bg-proqblue rounded-[2rem] text-white shadow-2xl shadow-proqblue/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white/20 p-3 rounded-2xl"><Brain size={24} /></div>
                      <h4 className="text-2xl font-black italic">Focus Éducatif</h4>
                    </div>
                    <p className="text-blue-50/80 font-medium leading-relaxed">
                      Cette installation illustre parfaitement la norme NFC 15-100. Cliquez sur les points éclair pour en savoir plus.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-12">
                <Button
                  className="w-full h-16 rounded-[1.25rem] bg-white text-proqblue hover:bg-blue-50 text-xl font-black shadow-xl"
                  onClick={() => { /* Social share or similar */ }}
                >
                  <Download className="mr-3" /> Télécharger le Cas Technique
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

function Brain({ size }: { size: number }) {
  return <Info size={size} />;
}
