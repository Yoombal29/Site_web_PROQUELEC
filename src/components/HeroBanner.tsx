
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useHomeSlides } from "@/hooks/useHomeData";

interface HeroBannerProps {
  slides?: unknown[];
  parallax?: boolean;
  autoplayInterval?: number;
  styles?: React.CSSProperties;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  slides: propSlides,
  parallax = true,
  autoplayInterval = 8000,
  styles
}) => {
  const { data: dbSlides, isLoading } = useHomeSlides();
  const slides = propSlides || dbSlides;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoplayInterval);

    return () => {
      clearInterval(interval);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect, autoplayInterval]);

  if (isLoading && !propSlides) {
    return (
      <div className="h-[700px] md:h-[900px] bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>);

  }

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden bg-slate-950"
      ref={emblaRef}
      style={{
        '--hero-color': styles?.color || 'inherit',
        '--hero-font-size': styles?.fontSize || 'inherit',
        '--hero-text-align': styles?.textAlign || 'left',
        '--hero-align-items': styles?.textAlign === 'center' ? 'center' : styles?.textAlign === 'right' ? 'flex-end' : 'flex-start',
        ...styles
      } as React.CSSProperties}>
      
      <div className="flex">
        {slides.map((slide, index) =>
        <div key={slide.id || index} className="relative flex-[0_0_100%] min-h-[700px] md:min-h-[900px] flex items-center justify-center text-white">
            <div className="absolute inset-0 overflow-hidden">
              <style dangerouslySetInnerHTML={{
              __html: `
                .slide-bg-${index} { background-image: url(${slide.background_url}); }
              ` }} />
              <div
              className={`absolute inset-0 bg-cover bg-center transition-transform ${parallax ? 'ease-out' : 'duration-500'} ${selectedIndex === index ? parallax ? 'scale-100' : 'scale-100' : parallax ? 'scale-125' : 'scale-100'} slide-bg-${index}`}
              style={parallax ? { transitionDuration: '8000ms' } : undefined}>
            </div>

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent"></div>
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
            </div>

            <div className={`relative z-10 container mx-auto px-6 py-20 flex flex-col items-[var(--hero-align-items)] text-[var(--hero-text-align)]`}>
              <div className={`max-w-4xl flex flex-col items-[var(--hero-align-items)]`}>
                <div className={`transition-all duration-700 delay-100 ${selectedIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <span className="inline-flex items-center gap-2 bg-orange-600/90 text-white font-bold rounded-full px-5 py-2 mb-8 text-xs sm:text-sm tracking-[0.2em] uppercase backdrop-blur-md border border-orange-400/30 shadow-2xl">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    {slide.badge}
                  </span>
                </div>

                <h1
                style={{ color: 'var(--hero-color)', fontSize: 'var(--hero-font-size)' }}
                className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1] tracking-tight transition-all duration-1000 delay-300 ${selectedIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                
                  {slide.title.split(' ').map((word: string, i: number) =>
                <span key={i} className={!styles?.color && i >= 3 ? "text-orange-500" : ""}>
                      {word}{' '}
                    </span>
                )}
                </h1>

                <div className={`transition-all duration-1000 delay-500 ${selectedIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} w-full`}>
                  <p
                  style={{ color: 'var(--hero-color)' }}
                  className={`text-2xl sm:text-3xl md:text-4xl mb-8 font-light text-slate-300 italic flex items-center gap-4 ${styles?.textAlign === 'center' ? 'justify-center' : styles?.textAlign === 'right' ? 'justify-end' : ''}`}>
                  
                    {styles?.textAlign !== 'right' && <span className="h-px w-12 bg-orange-500"></span>}
                    {slide.subtitle}
                    {styles?.textAlign !== 'left' && <span className="h-px w-12 bg-orange-500"></span>}
                  </p>
                </div>

                <div className={`transition-all duration-1000 delay-700 ${selectedIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <p
                  style={{ color: 'var(--hero-color)' }}
                  className={`text-xl md:text-2xl max-w-2xl mb-12 opacity-80 leading-relaxed font-light text-slate-100 ${styles?.textAlign === 'center' ? 'border-none px-4' : styles?.textAlign === 'right' ? 'border-r-2 border-l-0 border-orange-500/30 pr-6 pl-0' : 'border-l-2 border-orange-500/30 pl-6'}`}>
                  
                    {slide.description}
                  </p>
                </div>

                <div className={`flex flex-col sm:flex-row gap-6 transition-all duration-1000 delay-1000 ${selectedIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} items-[var(--hero-align-items)] justify-[var(--hero-text-align)]`}>
                  {slide.cta_text &&
                <Link to={slide.cta_link} className="w-full sm:w-auto">
                      <Button
                    size="lg"
                    className="h-16 w-full sm:w-auto px-12 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-2xl border-b-4 border-orange-800 uppercase tracking-widest text-sm">
                    
                        {slide.cta_text}
                      </Button>
                    </Link>
                }
                  {slide.secondary_cta_text &&
                <Link to={slide.secondary_cta_link || "#"} className="w-full sm:w-auto">
                      <Button
                    variant="outline"
                    size="lg"
                    className="h-16 w-full sm:w-auto px-12 border-2 border-white text-white hover:bg-white hover:text-slate-950 backdrop-blur-md rounded-2xl font-black transition-all hover:scale-105 shadow-2xl uppercase tracking-widest text-sm">
                    
                        {slide.secondary_cta_text}
                      </Button>
                    </Link>
                }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-white/5 hover:bg-orange-600 text-white transition-all backdrop-blur-xl z-20 hidden md:flex items-center justify-center border border-white/10 group shadow-2xl"
        title="Diapositive précédente">
        
        <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-white/5 hover:bg-orange-600 text-white transition-all backdrop-blur-xl z-20 hidden md:flex items-center justify-center border border-white/10 group shadow-2xl"
        title="Diapositive suivante">
        
        <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <span className="text-white/40 text-xs font-bold tracking-widest uppercase">0{selectedIndex + 1}</span>
        <div className="flex gap-2">
          {slides.map((_, index) =>
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`transition-all duration-500 rounded-full h-1.5 ${selectedIndex === index ? 'w-12 bg-orange-500' : 'w-4 bg-white/20'}`}
            title={`Aller à la diapositive ${index + 1}`} />

          )}
        </div>
        <span className="text-white/40 text-xs font-bold tracking-widest uppercase">0{slides.length}</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-slate-950 z-10 pointer-events-none"></div>
    </div>);

};