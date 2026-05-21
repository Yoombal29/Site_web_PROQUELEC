import React from 'react';
import { StickyNote, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';


interface SpeakerNotesProps {
  isVisible: boolean;
  currentSlideTitle: string;
  nextSlideTitle?: string;
  notes: string;
  onToggle: () => void;
}

export const SpeakerNotes: React.FC<SpeakerNotesProps> = ({
  isVisible,
  currentSlideTitle,
  nextSlideTitle,
  notes,
  onToggle
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-card border-t shadow-lg z-30 transition-transform">
      <div className="flex items-stretch h-48">
        {/* Current slide info */}
        <div className="w-64 border-r p-4 flex flex-col">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <StickyNote className="w-4 h-4" />
            Diapositive actuelle
          </div>
          <div className="flex-1">
            <p className="font-semibold line-clamp-2">{currentSlideTitle}</p>
          </div>
          {nextSlideTitle &&
          <div className="pt-3 border-t">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ChevronRight className="w-3 h-3" />
                Suivante: {nextSlideTitle}
              </div>
            </div>
          }
        </div>

        {/* Notes */}
        <div className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="prose prose-sm dark:prose-invert">
              {notes ?
              <p>{notes}</p> :

              <p className="text-muted-foreground italic">
                  Aucune note pour cette diapositive. 
                  Les notes du présentateur apparaîtront ici.
                </p>
              }
            </div>
          </ScrollArea>
        </div>

        {/* Timer and controls */}
        <div className="w-48 border-l p-4 flex flex-col items-center justify-center bg-muted/30">
          <div className="text-3xl font-mono font-bold">
            {/* Timer will be passed from parent */}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Durée estimée: 2-3 min/slide
          </div>
        </div>
      </div>
    </div>);

};