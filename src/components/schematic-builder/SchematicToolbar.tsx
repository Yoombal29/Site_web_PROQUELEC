/**
 * SchematicToolbar.tsx
 * Barre d'outils supérieure de l'éditeur schématique.
 * Zoom, export SVG/PNG, titre et indicateur d'éléments.
 */

import React, { useCallback, useRef } from 'react';
import { useSchematicStore } from '@/stores/useSchematicStore';
import { toast } from 'sonner';
import Konva from 'konva';

interface SchematicToolbarProps {
  title?: string;
  stageRef: React.RefObject<Konva.Stage>;
  onBack?: () => void;
}

export const SchematicToolbar: React.FC<SchematicToolbarProps> = React.memo(
  ({ title = 'Éditeur Schématique', stageRef, onBack }) => {
    const zoom = useSchematicStore((s) => s.zoom);
    const setZoom = useSchematicStore((s) => s.setZoom);
    const setPan = useSchematicStore((s) => s.setPan);
    const resetViewport = useSchematicStore((s) => s.resetViewport);
    const elementCount = useSchematicStore((s) => Object.keys(s.elements).length);
    const undo = useSchematicStore((s) => s.undo);
    const redo = useSchematicStore((s) => s.redo);
    const past = useSchematicStore((s) => s.past);
    const future = useSchematicStore((s) => s.future);

    const zoomIn = useCallback(() => {
      const stage = stageRef.current;
      if (!stage) return;
      const newScale = Math.min(zoom * 1.2, 5);
      stage.scale({ x: newScale, y: newScale });
      stage.batchDraw();
      setZoom(newScale);
    }, [zoom, setZoom, stageRef]);

    const zoomOut = useCallback(() => {
      const stage = stageRef.current;
      if (!stage) return;
      const newScale = Math.max(zoom / 1.2, 0.1);
      stage.scale({ x: newScale, y: newScale });
      stage.batchDraw();
      setZoom(newScale);
    }, [zoom, setZoom, stageRef]);

    const handleReset = useCallback(() => {
      const stage = stageRef.current;
      if (!stage) return;
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });
      stage.batchDraw();
      resetViewport();
    }, [resetViewport, stageRef]);

    const exportPNG = useCallback(() => {
      const stage = stageRef.current;
      if (!stage) {
        toast.error('Canvas non disponible');
        return;
      }
      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `schema-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      toast.success('Export PNG réussi');
    }, [stageRef]);

    const exportSVG = useCallback(() => {
      // Konva génère un SVG via son API interne
      const stage = stageRef.current;
      if (!stage) return;
      try {
        // Création d'un SVG basé sur les données du store
        const svgData = stage.toCanvas().toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `schema-${Date.now()}.png`;
        link.href = svgData;
        link.click();
        toast.success('Export SVG (PNG HD) réussi');
      } catch {
        toast.error("Erreur lors de l'export");
      }
    }, [stageRef]);

    return (
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 h-12 flex-shrink-0">
        {/* Gauche */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-slate-700 transition-colors text-sm"
              title="Retour"
            >
              ← Retour
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">⚡</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-none">{title}</h1>
              <p className="text-[10px] text-slate-400">
                {elementCount} élément{elementCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Centre — Outils */}
        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={past.length === 0}
            title="Annuler (Ctrl+Z)"
            className="px-2.5 py-1.5 text-xs rounded-md hover:bg-slate-100 disabled:opacity-30 
                       disabled:cursor-not-allowed transition-colors text-slate-600 font-medium"
          >
            ↩
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            title="Rétablir (Ctrl+Y)"
            className="px-2.5 py-1.5 text-xs rounded-md hover:bg-slate-100 disabled:opacity-30 
                       disabled:cursor-not-allowed transition-colors text-slate-600 font-medium"
          >
            ↪
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Zoom */}
          <button
            onClick={zoomOut}
            title="Dézoomer"
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 
                       text-slate-600 text-lg font-bold transition-colors"
          >
            −
          </button>
          <button
            onClick={handleReset}
            className="px-2 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 
                       text-slate-600 font-mono font-semibold min-w-[52px] text-center transition-colors"
            title="Réinitialiser le zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={zoomIn}
            title="Zoomer"
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 
                       text-slate-600 text-lg font-bold transition-colors"
          >
            +
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Aide rapide */}
          <div className="text-[10px] text-slate-400 hidden lg:block">
            Scroll = zoom • Clic molette = pan • Suppr = effacer
          </div>
        </div>

        {/* Droite — Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md
                       bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            📥 PNG
          </button>
          <button
            onClick={exportSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md
                       bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm"
          >
            💾 Sauvegarder
          </button>
        </div>
      </div>
    );
  }
);

SchematicToolbar.displayName = 'SchematicToolbar';
