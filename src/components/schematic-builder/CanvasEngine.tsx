/**
 * CanvasEngine.tsx
 * Moteur de rendu React-Konva ultra-performant pour l'éditeur schématique.
 *
 * ⚡ RÈGLES PERFORMANCE :
 * - Ce composant est isolé avec React.memo → il ne re-rend JAMAIS quand
 *   l'inspector ou la sidebar changent d'état.
 * - Le zoom/pan est géré par Konva nativement (stage.scale, stage.position)
 *   sans setState React.
 * - On utilise batchDraw() pour le rendu natif Konva, non requestAnimationFrame.
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useSchematicStore } from '@/stores/useSchematicStore';
import { DraggableShape } from './DraggableShape';

/* =========================================================
   CONSTANTES
========================================================= */

const GRID_SIZE = 20;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_SPEED = 1.08;

/* =========================================================
   PROPS
========================================================= */

interface CanvasEngineProps {
  width: number;
  height: number;
  stageRef?: React.RefObject<Konva.Stage>;
}

/* =========================================================
   GRID — purement Konva, zéro re-render React
========================================================= */

const GridLayer: React.FC<{ width: number; height: number }> = React.memo(({ width, height }) => {
  const lines: React.ReactNode[] = [];
  const count = Math.max(width, height) / GRID_SIZE;

  for (let i = 0; i <= count; i++) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i * GRID_SIZE, width * 2, i * GRID_SIZE]}
        stroke="#e2e8f0"
        strokeWidth={0.5}
        listening={false}
      />,
      <Line
        key={`v-${i}`}
        points={[i * GRID_SIZE, 0, i * GRID_SIZE, height * 2]}
        stroke="#e2e8f0"
        strokeWidth={0.5}
        listening={false}
      />
    );
  }

  // Grille principale tous les 5 cellules
  for (let i = 0; i <= count; i += 5) {
    lines.push(
      <Line
        key={`hm-${i}`}
        points={[0, i * GRID_SIZE, width * 2, i * GRID_SIZE]}
        stroke="#cbd5e1"
        strokeWidth={1}
        listening={false}
      />,
      <Line
        key={`vm-${i}`}
        points={[i * GRID_SIZE, 0, i * GRID_SIZE, height * 2]}
        stroke="#cbd5e1"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
});

GridLayer.displayName = 'GridLayer';

/* =========================================================
   CANVAS ENGINE
========================================================= */

export const CanvasEngine: React.FC<CanvasEngineProps> = React.memo(({ width, height, stageRef: externalStageRef }) => {
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef ?? internalStageRef;
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // Sélection granulaire — on ne subscribe qu'aux éléments, pas à tout le store
  const elements = useSchematicStore((state) => state.elements);
  const selectedId = useSchematicStore((state) => state.selectedId);
  const zoom = useSchematicStore((state) => state.zoom);
  const panX = useSchematicStore((state) => state.panX);
  const panY = useSchematicStore((state) => state.panY);
  const setZoom = useSchematicStore((state) => state.setZoom);
  const setPan = useSchematicStore((state) => state.setPan);
  const selectElement = useSchematicStore((state) => state.selectElement);

  const elementsList = Object.values(elements);

  // --- Zoom au scroll de la molette ---
  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldScale * (direction > 0 ? ZOOM_SPEED : 1 / ZOOM_SPEED)));

      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stage.position(newPos);
      stage.batchDraw();

      setZoom(newScale);
      setPan(newPos.x, newPos.y);
    },
    [setZoom, setPan]
  );

  // --- Pan (glisser le fond avec clic molette ou espace + drag) ---
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1 || e.evt.button === 2) {
      // Molette ou clic droit = pan
      isPanning.current = true;
      lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY };
      e.evt.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isPanning.current) return;
      const stage = stageRef.current;
      if (!stage) return;

      const dx = e.evt.clientX - lastPointer.current.x;
      const dy = e.evt.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY };

      const newPos = { x: stage.x() + dx, y: stage.y() + dy };
      stage.position(newPos);
      stage.batchDraw();
      setPan(newPos.x, newPos.y);
    },
    [setPan]
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // --- Désélectionner en cliquant sur le fond ---
  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        selectElement(null);
      }
    },
    [selectElement]
  );

  // Sync viewport initial depuis le store
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.scale({ x: zoom, y: zoom });
    stage.position({ x: panX, y: panY });
    stage.batchDraw();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleStageClick}
      onContextMenu={(e) => e.evt.preventDefault()}
      style={{ background: '#f8fafc', cursor: isPanning.current ? 'grab' : 'default' }}
    >
      {/* Layer 1 : Grille de fond (jamais re-rendu) */}
      <Layer listening={false}>
        <GridLayer width={width} height={height} />
      </Layer>

      {/* Layer 2 : Éléments déplaçables */}
      <Layer>
        {elementsList.map((el) => (
          <DraggableShape
            key={el.id}
            element={el}
            isSelected={el.id === selectedId}
          />
        ))}
      </Layer>
    </Stage>
  );
});

CanvasEngine.displayName = 'CanvasEngine';
