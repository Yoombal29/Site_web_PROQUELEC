import React, { useEffect, useRef, useState } from 'react';
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/white.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Presentation, Sparkles, Plus, Trash2 } from 'lucide-react';

interface Slide {
  id: string;
  content: string;
  background?: string;
}

interface PresentationEditorProps {
  presentationId?: string;
  initialSlides?: Slide[];
  onSave?: (slides: Slide[]) => void;
}

export function PresentationEditor({ presentationId, initialSlides, onSave }: PresentationEditorProps) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides || [
  {
    id: '1',
    content: `
        <h1>Présentation Projet Électrique</h1>
        <h3>PROQUELEC</h3>
        <p>Client: [NOM DU CLIENT]</p>
      `,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: '2',
    content: `
        <h2>Contexte du Projet</h2>
        <ul>
          <li>Objectif: Installation électrique complète</li>
          <li>Norme: NF C 15-100</li>
          <li>Budget: XX €</li>
          <li>Délai: XX semaines</li>
        </ul>
      `
  },
  {
    id: '3',
    content: `
        <h2>Schéma Technique</h2>
        <ul>
          <li>Tableau général</li>
          <li>Circuits spécialisés</li>
          <li>Protection différentielle</li>
        </ul>
      `
  },
  {
    id: '4',
    content: `
        <h2>Merci !</h2>
        <p>Contact: contact@proquelec.fr</p>
      `,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }]
  );

  const deckRef = useRef<unknown>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    if (revealRef.current && !deckRef.current) {
      const deck = new Reveal(revealRef.current, {
        embedded: true,
        controls: true,
        progress: true,
        center: true,
        transition: 'slide',
        hash: false
      });

      deck.initialize().then(() => {
        if (isMounted) {
          deckRef.current = deck;
        } else {
          deck.destroy(); // Cancel if unmounted during init
        }
      }).catch((err) => {
        console.error("Reveal.js initialization failed:", err);
      });
    }

    return () => {
      isMounted = false;
      // Only destroy if it was fully initialized and assigned
      if (deckRef.current) {
        try {
          deckRef.current.destroy();
        } catch (e) {
          console.warn("Reveal.js destroy failed:", e);
        }
        deckRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Only sync if the deck is initialized and ready
    if (deckRef.current) {
      try {
        deckRef.current.sync();
        deckRef.current.layout(); // Force layout update
      } catch (error) {
        console.warn("Reveal.js sync warning:", error);
      }
    }
  }, [slides]);

  const handleSave = () => {
    if (onSave) {
      onSave(slides);
    }
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      content: `
        <h2>Nouvelle Slide</h2>
        <p>Contenu ici...</p>
      `
    };
    setSlides([...slides, newSlide]);
  };

  const deleteSlide = (id: string) => {
    if (slides.length > 1) {
      setSlides(slides.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-white">
                        <Presentation className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Éditeur de Présentation</h3>
                        <p className="text-xs text-gray-600">PROQUELEC Office - Slides professionnelles</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        IA disponible
                    </Badge>
                    <Button onClick={addSlide} variant="outline" className="gap-2" title="Ajouter une nouvelle diapositive">
                        <Plus className="h-4 w-4" />
                        Ajouter Slide
                    </Button>
                    <Button onClick={handleSave} className="gap-2 bg-orange-600 hover:bg-orange-700">
                        <Save className="h-4 w-4" />
                        Sauvegarder
                    </Button>
                </div>
            </div>

            {/* Presentation */}
            <div className="flex-1 overflow-hidden bg-black">
                <div ref={revealRef} className="reveal">
                    <div className="slides">
                        {slides.map((slide) =>
            <section
              key={slide.id}
              data-background={slide.background || '#ffffff'}
              dangerouslySetInnerHTML={{ __html: slide.content }} />

            )}
                    </div>
                </div>
            </div>

            {/* Slide Thumbnails */}
            <div className="flex items-center gap-2 p-4 border-t border-gray-200 bg-gray-50 overflow-x-auto">
                <style dangerouslySetInnerHTML={{
          __html: slides.map((slide, idx) => `
                    .presentation-slide-preview-${idx} { background: ${slide.background || '#ffffff'}; }
                `).join('\n')
        }} />
                {slides.map((slide, index) =>
        <div
          key={slide.id}
          className="relative flex-shrink-0 w-32 h-20 border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-orange-500 transition-colors"
          onClick={() => deckRef.current?.slide(index)}>
          
                        <div
            className={`w-full h-full flex items-center justify-center text-xs p-2 presentation-slide-preview-${index}`}>
            
                            <span className="font-bold">{index + 1}</span>
                        </div>
                        {slides.length > 1 &&
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteSlide(slide.id);
            }}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
            title="Supprimer la diapositive">
            
                                <Trash2 className="h-3 w-3" />
                            </button>
          }
                    </div>
        )}
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
                <div className="flex items-center gap-4">
                    <span>{slides.length} slides</span>
                    <span>Thème: PROQUELEC Professional</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-green-600">● Sauvegarde automatique activée</span>
                </div>
            </div>
        </div>);

}