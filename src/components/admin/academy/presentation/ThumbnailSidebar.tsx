import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Slide {
  id: string;
  type: string;
  title: string;
}

interface ThumbnailSidebarProps {
  isVisible: boolean;
  slides: Slide[];
  currentSlide: number;
  onSelectSlide: (index: number) => void;
}

const getSlideIcon = (type: string) => {
  switch (type) {
    case 'title':return '🎯';
    case 'intro':return '📖';
    case 'section':return '📄';
    case 'examples':return '💡';
    case 'warnings':return '⚠️';
    case 'qcm':return '❓';
    case 'conclusion':return '🎓';
    default:return '📄';
  }
};

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  isVisible,
  slides,
  currentSlide,
  onSelectSlide
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute left-0 top-0 bottom-0 w-48 bg-card/95 backdrop-blur border-r shadow-lg z-20 flex flex-col">
      <div className="p-3 border-b bg-muted/50">
        <p className="text-sm font-medium">Diapositives</p>
        <p className="text-xs text-muted-foreground">{slides.length} au total</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {slides.map((slide, index) =>
          <button
            key={slide.id}
            onClick={() => onSelectSlide(index)}
            className={cn(
              "w-full aspect-video rounded-lg border-2 p-2 text-left transition-all hover:scale-105 hover:shadow-md relative overflow-hidden",
              currentSlide === index ?
              "border-primary bg-primary/10 shadow-md" :
              "border-muted hover:border-primary/50 bg-background"
            )} aria-label="Action">
            
              {/* Slide number badge */}
              <Badge
              variant={currentSlide === index ? "default" : "outline"}
              className="absolute top-1 left-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
              
                {index + 1}
              </Badge>
              
              {/* Slide preview */}
              <div className="pt-5">
                <span className="text-lg">{getSlideIcon(slide.type)}</span>
                <p className="text-xs font-medium line-clamp-2 mt-1">{slide.title}</p>
              </div>

              {/* Current indicator */}
              {currentSlide === index &&
            <div className="absolute right-1 top-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
            }
            </button>
          )}
        </div>
      </ScrollArea>
    </div>);

};