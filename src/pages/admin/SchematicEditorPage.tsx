/**
 * SchematicEditorPage.tsx
 * Page d'assemblage principale de l'éditeur schématique.
 *
 * ARCHITECTURE DÉCOUPLÉE :
 * ┌─────────────────────────────────────────────────────────┐
 * │ SchematicToolbar  (zoom, undo, export)                  │
 * ├───────────────┬─────────────────────────┬───────────────┤
 * │ SchematicSidebar│   CanvasEngine (Konva) │ SchematicInspector│
 * │  (DnD source) │   (canvas 2D, 60fps)   │  (propriétés) │
 * └───────────────┴─────────────────────────┴───────────────┘
 *
 * ⚡ FLUX DU DRAG DEPUIS LA SIDEBAR VERS LE CANVAS :
 * 1. DnD Kit détecte le dragEnd sur un item de la sidebar.
 * 2. On calcule la position dans le référentiel du canvas Konva.
 * 3. On crée l'élément dans le store Zustand.
 * 4. Konva re-rend uniquement le layer des éléments (pas la sidebar, pas l'inspector).
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import type Konva from 'konva';
import { toast } from 'sonner';

import { useSchematicStore } from '@/stores/useSchematicStore';
import type { SchematicElement } from '@/stores/useSchematicStore';
import type { SymbolCatalogItem } from '@/components/schematic-builder/symbols/electricalSymbols';

import { CanvasEngine } from '@/components/schematic-builder/CanvasEngine';
import { SchematicSidebar } from '@/components/schematic-builder/SchematicSidebar';
import { SchematicInspector } from '@/components/schematic-builder/SchematicInspector';
import { SchematicToolbar } from '@/components/schematic-builder/SchematicToolbar';

/* =========================================================
   UTILS
========================================================= */

function createElementFromCatalog(
  item: SymbolCatalogItem,
  canvasX: number,
  canvasY: number
): SchematicElement {
  return {
    id: crypto.randomUUID(),
    type: item.type,
    x: Math.round(canvasX / 20) * 20, // snap to grid 20px
    y: Math.round(canvasY / 20) * 20,
    width: item.defaultWidth,
    height: item.defaultHeight,
    rotation: 0,
    label: item.label,
    props: { ...(item.defaultProps ?? {}) },
    anchors: [
      { id: `a-${crypto.randomUUID()}`, x: 0, y: item.defaultHeight / 2 },
      { id: `b-${crypto.randomUUID()}`, x: item.defaultWidth, y: item.defaultHeight / 2 },
    ],
  };
}

/* =========================================================
   PAGE PRINCIPALE
========================================================= */

const SchematicEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [canvasSize, setCanvasSize] = React.useState({ width: 800, height: 600 });

  const addElement = useSchematicStore((s) => s.addElement);
  const undo = useSchematicStore((s) => s.undo);
  const redo = useSchematicStore((s) => s.redo);
  const removeElement = useSchematicStore((s) => s.removeElement);
  const selectedId = useSchematicStore((s) => s.selectedId);

  // --- Responsive canvas ---
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // --- Raccourcis clavier ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si on est dans un champ de saisie
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        removeElement(selectedId);
        toast.info('Élément supprimé');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, removeElement, selectedId]);

  // --- DnD Kit : dépôt depuis la sidebar ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // évite les faux positifs sur les clics
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over, active } = event;

      // Le drop doit atterrir sur le canvas
      if (!over || over.id !== 'schematic-canvas-drop') return;

      const catalogItem = active.data.current?.catalogItem as SymbolCatalogItem | undefined;
      if (!catalogItem) return;

      // Calculer la position dans le référentiel du canvas Konva
      const stage = stageRef.current;
      const container = canvasContainerRef.current;
      if (!stage || !container) return;

      const containerRect = container.getBoundingClientRect();
      const stageScale = stage.scaleX();
      const stagePos = stage.position();

      // Position de la souris au moment du drop, relative au canvas
      const pointerPos = {
        x: (event.activatorEvent as PointerEvent).clientX - containerRect.left,
        y: (event.activatorEvent as PointerEvent).clientY - containerRect.top,
      };

      // Convertir en coordonnées canvas (en tenant compte du zoom et du pan)
      const canvasX = (pointerPos.x - stagePos.x) / stageScale;
      const canvasY = (pointerPos.y - stagePos.y) / stageScale;

      // Créer l'élément et l'ajouter au store
      const newElement = createElementFromCatalog(catalogItem, canvasX, canvasY);
      addElement(newElement);
      toast.success(`${catalogItem.label} ajouté`);
    },
    [addElement]
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50">

        {/* Barre d'outils supérieure */}
        <SchematicToolbar
          title="Éditeur Schématique"
          stageRef={stageRef as React.RefObject<Konva.Stage>}
          onBack={() => navigate('/dashboard')}
        />

        {/* Corps principal */}
        <div className="flex-1 flex overflow-hidden">

          {/* Barre latérale gauche */}
          <SchematicSidebar />

          {/* Zone de canvas (flex-1 pour prendre tout l'espace disponible) */}
          <div
            ref={canvasContainerRef}
            id="schematic-canvas-drop"
            data-droppable="true"
            className="flex-1 overflow-hidden relative"
          >
            {canvasSize.width > 0 && (
              <CanvasEngine
                width={canvasSize.width}
                height={canvasSize.height}
                stageRef={stageRef as React.RefObject<Konva.Stage>}
              />
            )}

            {/* Indication de dépôt */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-slate-900/60 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-sm">
                Scroll = zoom · Molette/Clic droit = pan · Suppr = effacer
              </div>
            </div>
          </div>

          {/* Inspecteur de propriétés (droite) */}
          <SchematicInspector />
        </div>
      </div>
    </DndContext>
  );
};

export default SchematicEditorPage;
