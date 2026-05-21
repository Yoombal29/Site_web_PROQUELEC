import React from 'react';
import {
  X, Home, Grid3X3, Play, Pause, Maximize2, Minimize2,
  PenTool, MousePointer2, ZoomIn, ZoomOut,
  Clock, StickyNote, Settings, SkipBack, SkipForward,
  Volume2, VolumeX, Eraser } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
'@/components/ui/popover';
import { cn } from '@/lib/utils';

export type TransitionType = 'none' | 'fade' | 'slide' | 'zoom' | 'flip' | 'cube';
export type ThemeType = 'default' | 'dark' | 'corporate' | 'creative' | 'minimal' | 'gradient';
export type ToolType = 'pointer' | 'laser' | 'pen' | 'highlighter' | 'eraser';

interface PresentationToolbarProps {
  currentSlide: number;
  totalSlides: number;
  isFullscreen: boolean;
  isAutoPlay: boolean;
  autoPlaySpeed: number;
  showNotes: boolean;
  showThumbnails: boolean;
  currentTool: ToolType;
  penColor: string;
  theme: ThemeType;
  transition: TransitionType;
  zoom: number;
  isMuted: boolean;
  elapsedTime: number;
  onClose: () => void;
  onGoToSlide: (index: number) => void;
  onToggleFullscreen: () => void;
  onToggleAutoPlay: () => void;
  onSetAutoPlaySpeed: (speed: number) => void;
  onToggleNotes: () => void;
  onToggleThumbnails: () => void;
  onSetTool: (tool: ToolType) => void;
  onSetPenColor: (color: string) => void;
  onSetTheme: (theme: ThemeType) => void;
  onSetTransition: (transition: TransitionType) => void;
  onSetZoom: (zoom: number) => void;
  onToggleMute: () => void;
  onShowOverview: () => void;
  onClearAnnotations: () => void;
}

const penColors = [
'#ef4444', '#f97316', '#eab308', '#22c55e',
'#3b82f6', '#8b5cf6', '#ec4899', '#000000', '#ffffff'];


const themes: {id: ThemeType;name: string;preview: string;}[] = [
{ id: 'default', name: 'Par défaut', preview: 'bg-background' },
{ id: 'dark', name: 'Sombre', preview: 'bg-slate-900' },
{ id: 'corporate', name: 'Corporate', preview: 'bg-blue-900' },
{ id: 'creative', name: 'Créatif', preview: 'bg-gradient-to-br from-purple-600 to-pink-500' },
{ id: 'minimal', name: 'Minimal', preview: 'bg-white' },
{ id: 'gradient', name: 'Dégradé', preview: 'bg-gradient-to-br from-cyan-500 to-blue-600' }];


const transitions: {id: TransitionType;name: string;}[] = [
{ id: 'none', name: 'Aucune' },
{ id: 'fade', name: 'Fondu' },
{ id: 'slide', name: 'Glissement' },
{ id: 'zoom', name: 'Zoom' },
{ id: 'flip', name: 'Retournement' },
{ id: 'cube', name: 'Cube 3D' }];


export const PresentationToolbar: React.FC<PresentationToolbarProps> = ({
  currentSlide,
  totalSlides,
  isFullscreen,
  isAutoPlay,
  autoPlaySpeed,
  showNotes,
  showThumbnails,
  currentTool,
  penColor,
  theme,
  transition,
  zoom,
  isMuted,
  elapsedTime,
  onClose,
  onGoToSlide,
  onToggleFullscreen,
  onToggleAutoPlay,
  onSetAutoPlaySpeed,
  onToggleNotes,
  onToggleThumbnails,
  onSetTool,
  onSetPenColor,
  onSetTheme,
  onSetTransition,
  onSetZoom,
  onToggleMute,
  onShowOverview,
  onClearAnnotations
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-20 p-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="w-4 h-4 mr-2" />
          Quitter
        </Button>
        
        <div className="h-6 w-px bg-white/20" />
        
        <Badge variant="secondary" className="bg-white/20 text-white">
          {currentSlide + 1} / {totalSlides}
        </Badge>

        <div className="h-6 w-px bg-white/20" />

        <div className="flex items-center gap-1 text-white/80 text-sm">
          <Clock className="w-4 h-4" />
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Center section - Tools */}
      <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSetTool('pointer')}
          className={cn(
            "text-white hover:bg-white/20",
            currentTool === 'pointer' && "bg-white/30"
          )}>
          
          <MousePointer2 className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSetTool('laser')}
          className={cn(
            "text-white hover:bg-white/20",
            currentTool === 'laser' && "bg-white/30"
          )}>
          
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-white hover:bg-white/20",
                currentTool === 'pen' && "bg-white/30"
              )}>
              
              <PenTool className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="center">
            <div className="space-y-3">
              <p className="text-sm font-medium">Couleur du stylo</p>
              <div className="flex gap-1">
                {penColors.map((color) =>
                <button
                  key={color}
                  onClick={() => {
                    onSetPenColor(color);
                    onSetTool('pen');
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                    penColor === color ? "border-primary scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }} aria-label="Action" />

                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSetTool('highlighter')}
          className={cn(
            "text-white hover:bg-white/20",
            currentTool === 'highlighter' && "bg-white/30"
          )}>
          
          <span className="w-4 h-4 bg-yellow-400/70 rounded" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSetTool('eraser')}
          className={cn(
            "text-white hover:bg-white/20",
            currentTool === 'eraser' && "bg-white/30"
          )}>
          
          <Eraser className="w-4 h-4" />
        </Button>

        <div className="h-4 w-px bg-white/20 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAnnotations}
          className="text-white hover:bg-white/20">
          
          Effacer
        </Button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onGoToSlide(0)}
          disabled={currentSlide === 0}
          className="text-white hover:bg-white/20 disabled:opacity-30">
          
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShowOverview}
          className="text-white hover:bg-white/20">
          
          <Grid3X3 className="w-4 h-4" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("text-white hover:bg-white/20", isAutoPlay && "bg-white/30")}>
              
              {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lecture automatique</span>
                <Button size="sm" variant="outline" onClick={onToggleAutoPlay}>
                  {isAutoPlay ? 'Arrêter' : 'Démarrer'}
                </Button>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Vitesse: {autoPlaySpeed}s</span>
                <Slider
                  value={[autoPlaySpeed]}
                  onValueChange={([val]) => onSetAutoPlaySpeed(val)}
                  min={2}
                  max={15}
                  step={1} />
                
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onGoToSlide(totalSlides - 1)}
          disabled={currentSlide === totalSlides - 1}
          className="text-white hover:bg-white/20 disabled:opacity-30">
          
          <SkipForward className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px bg-white/20 mx-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Zoom</span>
                <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="w-4 h-4" />
                <Slider
                  value={[zoom]}
                  onValueChange={([val]) => onSetZoom(val)}
                  min={0.5}
                  max={2}
                  step={0.1} />
                
                <ZoomIn className="w-4 h-4" />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleNotes}
          className={cn("text-white hover:bg-white/20", showNotes && "bg-white/30")}>
          
          <StickyNote className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleThumbnails}
          className={cn("text-white hover:bg-white/20", showThumbnails && "bg-white/30")}>
          
          <Home className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMute}
          className="text-white hover:bg-white/20">
          
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Thème</DropdownMenuLabel>
            {themes.map((t) =>
            <DropdownMenuItem
              key={t.id}
              onClick={() => onSetTheme(t.id)}
              className={cn(theme === t.id && "bg-accent")}>
              
                <div className={cn("w-4 h-4 rounded mr-2", t.preview)} />
                {t.name}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Transition</DropdownMenuLabel>
            {transitions.map((t) =>
            <DropdownMenuItem
              key={t.id}
              onClick={() => onSetTransition(t.id)}
              className={cn(transition === t.id && "bg-accent")}>
              
                {t.name}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" onClick={onToggleFullscreen} className="text-white hover:bg-white/20">
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>);

};