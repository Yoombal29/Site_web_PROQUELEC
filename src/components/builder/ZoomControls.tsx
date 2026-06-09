import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Grid3x3, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitContent: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

/**
 * ZoomControls — floating zoom UI overlay on the infinite canvas.
 */
export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  minZoom,
  maxZoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitContent,
  showGrid,
  onToggleGrid,
}) => {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="absolute bottom-3 left-3 z-40 flex flex-col gap-1">
      {/* Zoom controls */}
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 px-1.5 py-1">
        <button
          onClick={onZoomOut}
          disabled={zoom <= minZoom}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600"
          title="Zoom arrière"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          className="px-2 py-0.5 text-[11px] font-mono font-bold text-slate-600 hover:text-blue-600 min-w-[44px] text-center"
          title="Réinitialiser le zoom (100%)"
        >
          {zoomPercent}%
        </button>

        <button
          onClick={onZoomIn}
          disabled={zoom >= maxZoom}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600"
          title="Zoom avant"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        <button
          onClick={onFitContent}
          className="p-1 rounded hover:bg-slate-100 text-slate-600"
          title="Ajuster au contenu"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        <button
          onClick={onToggleGrid}
          className={`p-1 rounded hover:bg-slate-100 ${showGrid ? 'text-blue-600' : 'text-slate-400'}`}
          title={showGrid ? 'Masquer la grille' : 'Afficher la grille'}
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="text-[10px] text-slate-400 text-center bg-white/60 rounded px-1.5 py-0.5">
        Ctrl+Molette · Espace+Glisser
      </div>
    </div>
  );
};
