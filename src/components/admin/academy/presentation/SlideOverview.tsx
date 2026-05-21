import React, { useState } from 'react';
import { Grid3X3, X, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { cn } from '@/lib/utils';

interface Slide {
  id: string;
  type: string;
  title: string;
  content: string;
}

interface SlideOverviewProps {
  slides: Slide[];
  currentSlide: number;
  onSelectSlide: (index: number) => void;
  onClose: () => void;
}

const slideTypeLabels: Record<string, string> = {
  title: 'Titre',
  intro: 'Introduction',
  section: 'Section',
  examples: 'Exemples',
  warnings: 'Attention',
  qcm: 'Question',
  conclusion: 'Conclusion'
};

const slideTypeColors: Record<string, string> = {
  title: 'bg-primary text-primary-foreground',
  intro: 'bg-blue-500 text-white',
  section: 'bg-green-500 text-white',
  examples: 'bg-amber-500 text-white',
  warnings: 'bg-red-500 text-white',
  qcm: 'bg-purple-500 text-white',
  conclusion: 'bg-indigo-500 text-white'
};

export const SlideOverview: React.FC<SlideOverviewProps> = ({
  slides,
  currentSlide,
  onSelectSlide,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredSlides = slides.filter((slide, index) => {
    const matchesSearch = slide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    slide.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || slide.type === filterType;
    return matchesSearch && matchesType;
  });

  const slideTypes = Array.from(new Set(slides.map((s) => s.type)));

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Grid3X3 className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-semibold">Vue d'ensemble</h2>
            <p className="text-sm text-muted-foreground">
              {slides.length} diapositives • {filteredSlides.length} affichées
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9" />
            
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {slideTypes.map((type) =>
              <SelectItem key={type} value={type}>
                  {slideTypeLabels[type] || type}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredSlides.map((slide, displayIndex) => {
            const originalIndex = slides.findIndex((s) => s.id === slide.id);

            return (
              <button
                key={slide.id}
                onClick={() => onSelectSlide(originalIndex)}
                className={cn(
                  "aspect-video rounded-lg border-2 p-3 text-left transition-all hover:scale-105 hover:shadow-lg relative overflow-hidden group",
                  currentSlide === originalIndex ?
                  "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2" :
                  "border-muted hover:border-primary/50 bg-card"
                )} aria-label="Action">
                
                {/* Slide number */}
                <Badge
                  variant={currentSlide === originalIndex ? "default" : "secondary"}
                  className="absolute top-2 left-2">
                  
                  {originalIndex + 1}
                </Badge>

                {/* Type badge */}
                <Badge
                  className={cn(
                    "absolute top-2 right-2 text-xs",
                    slideTypeColors[slide.type] || "bg-muted"
                  )}>
                  
                  {slideTypeLabels[slide.type] || slide.type}
                </Badge>

                {/* Content preview */}
                <div className="pt-8 h-full flex flex-col">
                  <p className="font-medium text-sm line-clamp-2 mb-2">{slide.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3 flex-1">
                    {slide.content.slice(0, 100)}...
                  </p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Aller à la diapositive
                  </span>
                </div>

                {/* Current indicator */}
                {currentSlide === originalIndex &&
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                }
              </button>);

          })}
        </div>

        {filteredSlides.length === 0 &&
        <div className="text-center py-12 text-muted-foreground">
            <p>Aucune diapositive ne correspond à votre recherche.</p>
          </div>
        }
      </ScrollArea>

      {/* Footer with keyboard shortcuts */}
      <div className="border-t p-3 bg-muted/50 flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <span><kbd className="px-2 py-1 bg-background rounded border">Entrée</kbd> Sélectionner</span>
        <span><kbd className="px-2 py-1 bg-background rounded border">Échap</kbd> Fermer</span>
        <span><kbd className="px-2 py-1 bg-background rounded border">↑↓←→</kbd> Naviguer</span>
      </div>
    </div>);

};