import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Monitor, BookOpen, HelpCircle, ChevronLeft, ChevronRight } from
'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { cn } from '@/lib/utils';
import { PresentationToolbar, ToolType, ThemeType, TransitionType } from './presentation/PresentationToolbar';
import { DrawingCanvas } from './presentation/DrawingCanvas';
import { LaserPointer } from './presentation/LaserPointer';
import { SpeakerNotes } from './presentation/SpeakerNotes';
import { ThumbnailSidebar } from './presentation/ThumbnailSidebar';
import { SlideTransitions } from './presentation/SlideTransitions';
import { SlideOverview } from './presentation/SlideOverview';

interface PresentationModeProps {
  course: Course;
  onClose: () => void;
}

interface Slide {
  id: string;
  type: 'title' | 'intro' | 'section' | 'examples' | 'warnings' | 'qcm' | 'conclusion';
  title: string;
  content: string;
  items?: string[];
  sectionIndex?: number;
  notes?: string;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ course, onClose }) => {
  // Navigation state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [showOverview, setShowOverview] = useState(false);

  // Display state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Tools state
  const [currentTool, setCurrentTool] = useState<ToolType>('pointer');
  const [penColor, setPenColor] = useState('#ef4444');
  const [clearAnnotations, setClearAnnotations] = useState(false);

  // Playback state
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(5);
  const [isMuted, setIsMuted] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<ThemeType>('default');
  const [transition, setTransition] = useState<TransitionType>('fade');

  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate slides from course content
  const generateSlides = useCallback((): Slide[] => {
    const slides: Slide[] = [];

    slides.push({
      id: 'title',
      type: 'title',
      title: course.title,
      content: `${course.modules.length} modules • ${course.content.sections.length} sections`,
      notes: 'Bienvenue dans cette présentation. Prenez le temps de vous présenter et d\'expliquer les objectifs de la formation.'
    });

    if (course.content.introduction) {
      slides.push({
        id: 'intro',
        type: 'intro',
        title: 'Introduction',
        content: course.content.introduction,
        notes: 'Présentez le contexte et les prérequis nécessaires pour cette formation.'
      });
    }

    course.content.sections.forEach((section, index) => {
      slides.push({
        id: `section-${index}`,
        type: 'section',
        title: section.title,
        content: section.explanation,
        sectionIndex: index,
        notes: `Section ${index + 1}: Expliquez les concepts clés et assurez-vous que les participants comprennent avant de passer aux exemples.`
      });

      if (section.examples.length > 0) {
        slides.push({
          id: `examples-${index}`,
          type: 'examples',
          title: `${section.title} - Exemples`,
          content: '',
          items: section.examples,
          sectionIndex: index,
          notes: 'Prenez le temps d\'expliquer chaque exemple en détail. Encouragez les questions.'
        });
      }

      if (section.warnings.length > 0) {
        slides.push({
          id: `warnings-${index}`,
          type: 'warnings',
          title: `${section.title} - Points d'attention`,
          content: '',
          items: section.warnings,
          sectionIndex: index,
          notes: 'Ces points sont critiques. Assurez-vous que les participants les notent.'
        });
      }
    });

    course.content.qcm.forEach((question, index) => {
      slides.push({
        id: `qcm-${index}`,
        type: 'qcm',
        title: `Question ${index + 1}`,
        content: question.question,
        items: question.options,
        notes: `La bonne réponse est: ${question.options[question.correctAnswer]}. Explication: ${question.explanation}`
      });
    });

    if (course.content.conclusion) {
      slides.push({
        id: 'conclusion',
        type: 'conclusion',
        title: 'Conclusion',
        content: course.content.conclusion,
        items: course.content.resources,
        notes: 'Résumez les points clés et répondez aux dernières questions.'
      });
    }

    return slides;
  }, [course]);

  const slides = generateSlides();
  const totalSlides = slides.length;
  const progress = (currentSlide + 1) / totalSlides * 100;
  const currentSlideData = slides[currentSlide];

  // Timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Navigation functions
  const goToSlide = useCallback((index: number) => {
    setSlideDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(Math.max(0, Math.min(totalSlides - 1, index)));
    setShowOverview(false);
    setClearAnnotations(true);
  }, [currentSlide, totalSlides]);

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setSlideDirection('next');
      setCurrentSlide((prev) => prev + 1);
      setClearAnnotations(true);
    }
  }, [currentSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setSlideDirection('prev');
      setCurrentSlide((prev) => prev - 1);
      setClearAnnotations(true);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showOverview) {
        if (e.key === 'Escape') {
          setShowOverview(false);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'Backspace':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'g':
        case 'G':
          setShowOverview((prev) => !prev);
          break;
        case 'n':
        case 'N':
          setShowNotes((prev) => !prev);
          break;
        case 't':
        case 'T':
          setShowThumbnails((prev) => !prev);
          break;
        case 'p':
        case 'P':
          setCurrentTool('pointer');
          break;
        case 'l':
        case 'L':
          setCurrentTool('laser');
          break;
        case 'd':
        case 'D':
          setCurrentTool('pen');
          break;
        case 'h':
        case 'H':
          setCurrentTool('highlighter');
          break;
        case 'e':
        case 'E':
          setCurrentTool('eraser');
          break;
        case 'c':
        case 'C':
          setClearAnnotations(true);
          break;
        case 'Home':
          goToSlide(0);
          break;
        case 'End':
          goToSlide(totalSlides - 1);
          break;
        case '+':
        case '=':
          setZoom((prev) => Math.min(2, prev + 0.1));
          break;
        case '-':
          setZoom((prev) => Math.max(0.5, prev - 0.1));
          break;
        case '0':
          setZoom(1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onClose, isFullscreen, showOverview, totalSlides, goToSlide]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      if (currentSlide < totalSlides - 1) {
        nextSlide();
      } else {
        setIsAutoPlay(false);
      }
    }, autoPlaySpeed * 1000);

    return () => clearInterval(interval);
  }, [isAutoPlay, currentSlide, totalSlides, nextSlide, autoPlaySpeed]);

  // Fullscreen handling
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Theme background
  const getThemeBackground = () => {
    switch (theme) {
      case 'dark':return 'bg-slate-900 text-white';
      case 'corporate':return 'bg-gradient-to-br from-slate-800 to-blue-900 text-white';
      case 'creative':return 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white';
      case 'minimal':return 'bg-white text-slate-900';
      case 'gradient':return 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white';
      default:return 'bg-background text-foreground';
    }
  };

  // Render slide content
  const renderSlideContent = () => {
    const slide = currentSlideData;

    switch (slide.type) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-12">
            <Badge className="mb-6 text-lg px-4 py-2" variant="secondary">
              <Monitor className="w-5 h-5 mr-2" />
              Présentation
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {slide.title}
            </h1>
            <p className="text-xl md:text-2xl opacity-80 max-w-3xl">
              {slide.content}
            </p>
            <div className="mt-12 flex items-center gap-4 text-sm opacity-60">
              <span>{course.modules.length} modules</span>
              <span>•</span>
              <span>{course.content.sections.length} sections</span>
              <span>•</span>
              <span>{course.content.qcm.length} questions</span>
            </div>
          </div>);


      case 'intro':
      case 'section':
      case 'conclusion':
        return (
          <div className="flex flex-col h-full px-12 py-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-12 bg-primary rounded-full" />
              <h2 className="text-4xl md:text-5xl font-bold">
                {slide.title}
              </h2>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {slide.content}
                </ReactMarkdown>
              </div>
              {slide.type === 'conclusion' && slide.items && slide.items.length > 0 &&
              <div className="mt-8 p-6 bg-black/10 dark:bg-white/10 rounded-xl">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Ressources complémentaires
                  </h3>
                  <ul className="space-y-2">
                    {slide.items.map((item, i) =>
                  <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">→</span>
                        {item}
                      </li>
                  )}
                  </ul>
                </div>
              }
            </div>
          </div>);


      case 'examples':
        return (
          <div className="flex flex-col h-full px-12 py-8">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-10 h-10 text-primary" />
              <h2 className="text-4xl font-bold">{slide.title}</h2>
            </div>
            <div className="flex-1 grid gap-4 content-start">
              {slide.items?.map((example, i) =>
              <div
                key={i}
                className="p-6 bg-primary/10 border-l-4 border-primary rounded-r-xl"
                style={{ animationDelay: `${i * 150}ms` }}>
                
                  <p className="text-lg md:text-xl">{example}</p>
                </div>
              )}
            </div>
          </div>);


      case 'warnings':
        return (
          <div className="flex flex-col h-full px-12 py-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-4xl font-bold">{slide.title}</h2>
            </div>
            <div className="flex-1 grid gap-4 content-start">
              {slide.items?.map((warning, i) =>
              <div
                key={i}
                className="p-6 bg-destructive/10 border-l-4 border-destructive rounded-r-xl"
                style={{ animationDelay: `${i * 150}ms` }}>
                
                  <p className="text-lg md:text-xl">{warning}</p>
                </div>
              )}
            </div>
          </div>);


      case 'qcm':
        return (
          <div className="flex flex-col h-full px-12 py-8">
            <div className="flex items-center gap-3 mb-8">
              <HelpCircle className="w-10 h-10 text-primary" />
              <h2 className="text-3xl font-bold">{slide.title}</h2>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-2xl md:text-3xl font-medium mb-8">
                {slide.content}
              </p>
              <div className="grid gap-4">
                {slide.items?.map((option, i) =>
                <div
                  key={i}
                  className="p-5 bg-black/5 dark:bg-white/10 rounded-xl border-2 border-transparent hover:border-primary transition-colors cursor-pointer"
                  style={{ animationDelay: `${i * 100}ms` }}>
                  
                    <span className="font-bold text-primary mr-3">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="text-lg">{option}</span>
                  </div>
                )}
              </div>
            </div>
          </div>);


      default:
        return null;
    }
  };

  // Show overview
  if (showOverview) {
    return (
      <SlideOverview
        slides={slides}
        currentSlide={currentSlide}
        onSelectSlide={goToSlide}
        onClose={() => setShowOverview(false)} />);


  }

  return (
    <div className={cn("fixed inset-0 z-50 flex flex-col", getThemeBackground())}>
      {/* Toolbar */}
      <PresentationToolbar
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        isFullscreen={isFullscreen}
        isAutoPlay={isAutoPlay}
        autoPlaySpeed={autoPlaySpeed}
        showNotes={showNotes}
        showThumbnails={showThumbnails}
        currentTool={currentTool}
        penColor={penColor}
        theme={theme}
        transition={transition}
        zoom={zoom}
        isMuted={isMuted}
        elapsedTime={elapsedTime}
        onClose={onClose}
        onGoToSlide={goToSlide}
        onToggleFullscreen={toggleFullscreen}
        onToggleAutoPlay={() => setIsAutoPlay(!isAutoPlay)}
        onSetAutoPlaySpeed={setAutoPlaySpeed}
        onToggleNotes={() => setShowNotes(!showNotes)}
        onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
        onSetTool={setCurrentTool}
        onSetPenColor={setPenColor}
        onSetTheme={setTheme}
        onSetTransition={setTransition}
        onSetZoom={setZoom}
        onToggleMute={() => setIsMuted(!isMuted)}
        onShowOverview={() => setShowOverview(true)}
        onClearAnnotations={() => setClearAnnotations(true)} />
      

      {/* Progress bar */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Thumbnail sidebar */}
        <ThumbnailSidebar
          isVisible={showThumbnails}
          slides={slides}
          currentSlide={currentSlide}
          onSelectSlide={goToSlide} />
        

        {/* Slide content */}
        <div
          className={cn(
            "flex-1 flex items-stretch overflow-hidden relative",
            showThumbnails && "ml-48"
          )}>
          
          {/* Previous slide button */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={cn(
              "w-16 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors z-10",
              currentSlide === 0 && "opacity-30 cursor-not-allowed"
            )} aria-label="Action">
            
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Slide with transitions and zoom */}
          <div
            className="flex-1 overflow-hidden relative"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
            
            <SlideTransitions
              transition={transition}
              direction={slideDirection}
              slideKey={currentSlide}>
              
              {renderSlideContent()}
            </SlideTransitions>

            {/* Drawing canvas */}
            <DrawingCanvas
              isActive={currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'eraser'}
              tool={currentTool}
              penColor={penColor}
              onClear={clearAnnotations}
              onClearComplete={() => setClearAnnotations(false)} />
            
          </div>

          {/* Next slide button */}
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className={cn(
              "w-16 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors z-10",
              currentSlide === totalSlides - 1 && "opacity-30 cursor-not-allowed"
            )} aria-label="Action">
            
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Laser pointer */}
        <LaserPointer isActive={currentTool === 'laser'} />
      </div>

      {/* Speaker notes */}
      <SpeakerNotes
        isVisible={showNotes}
        currentSlideTitle={currentSlideData.title}
        nextSlideTitle={slides[currentSlide + 1]?.title}
        notes={currentSlideData.notes || ''}
        onToggle={() => setShowNotes(!showNotes)} />
      

      {/* Bottom navigation dots */}
      {!showNotes &&
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/20 dark:bg-white/20 rounded-full px-4 py-2 opacity-0 hover:opacity-100 transition-opacity">
          {slides.map((_, index) =>
        <button
          key={index}
          onClick={() => goToSlide(index)}
          className={cn(
            "w-2 h-2 rounded-full transition-all",
            currentSlide === index ?
            "bg-primary scale-150" :
            "bg-white/50 hover:bg-white/80"
          )} aria-label="Action" />

        )}
        </div>
      }

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 right-4 text-xs opacity-30 hover:opacity-100 transition-opacity space-x-3">
        <span className="bg-black/20 px-2 py-1 rounded">F</span>
        <span className="bg-black/20 px-2 py-1 rounded">L</span>
        <span className="bg-black/20 px-2 py-1 rounded">D</span>
        <span className="bg-black/20 px-2 py-1 rounded">N</span>
        <span className="bg-black/20 px-2 py-1 rounded">G</span>
      </div>
    </div>);

};