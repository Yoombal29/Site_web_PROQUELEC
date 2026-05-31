/**
 * DraggableShape.tsx
 * Composant Konva ultra-performant pour les éléments du canvas schématique.
 *
 * ⚡ RÈGLE PERFORMANCE :
 * - onDragMove : mise à jour via Ref locale UNIQUEMENT → zéro re-render React
 * - onDragEnd  : synchronisation avec le store Zustand → un seul cycle de rendu
 * - batchDraw  : Konva ne redessine que ce qui a changé
 */

import React, { useRef, useCallback } from 'react';
import { Group, Rect, Circle, Text, Image } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useSchematicStore, SchematicElement, ElementType } from '@/stores/useSchematicStore';
import { getElectricalSymbolPath } from './symbols/electricalSymbols';

/* =========================================================
   PROPS
========================================================= */

interface DraggableShapeProps {
  element: SchematicElement;
  isSelected: boolean;
}

/* =========================================================
   UTILS — rendu de la forme selon le type
========================================================= */

const COLORS: Record<ElementType, string> = {
  rect: '#3b82f6',
  circle: '#8b5cf6',
  text: '#374151',
  image: '#e5e7eb',
  wire: '#1f2937',
  switch: '#f59e0b',
  breaker: '#ef4444',
  socket: '#10b981',
  light: '#fbbf24',
  motor: '#6366f1',
  transformer: '#ec4899',
  capacitor: '#06b6d4',
  resistor: '#84cc16',
  ground: '#6b7280',
  bus: '#1e40af',
};

const LABELS: Record<ElementType, string> = {
  rect: '▭',
  circle: '◯',
  text: 'T',
  image: '🖼',
  wire: '~',
  switch: 'SW',
  breaker: 'CB',
  socket: '⊕',
  light: '💡',
  motor: 'M',
  transformer: 'TR',
  capacitor: '⊣',
  resistor: 'R',
  ground: '⏚',
  bus: '═',
};

/* =========================================================
   COMPONENT
========================================================= */

export const DraggableShape: React.FC<DraggableShapeProps> = React.memo(({ element, isSelected }) => {
  const { updateElementPosition, selectElement } = useSchematicStore();

  // ⚡ Ref locale : position pendant le drag, sans setState
  const localPos = useRef({ x: element.x, y: element.y });

  const color = COLORS[element.type] || '#94a3b8';
  const iconLabel = LABELS[element.type] || '?';
  const isElectrical = getElectricalSymbolPath(element.type) !== null;

  // --- Handlers ---

  const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
    // Met à jour UNIQUEMENT la ref locale, sans toucher à React state
    localPos.current = { x: e.target.x(), y: e.target.y() };
    // Konva redessine uniquement ce qui a changé sur le layer
    e.target.getLayer()?.batchDraw();
  }, []);

  const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    // Synchronisation avec le store Zustand UNIQUEMENT au dragEnd
    updateElementPosition(element.id, e.target.x(), e.target.y());
  }, [element.id, updateElementPosition]);

  const handleClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    selectElement(element.id);
  }, [element.id, selectElement]);

  // --- Snap to grid (optional) ---
  const handleDragBound = useCallback(
    (pos: { x: number; y: number }) => {
      const GRID = 20;
      return {
        x: Math.round(pos.x / GRID) * GRID,
        y: Math.round(pos.y / GRID) * GRID,
      };
    },
    []
  );

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      draggable
      rotation={element.rotation ?? 0}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
      dragBoundFunc={handleDragBound}
    >
      {/* Corps principal */}
      <Rect
        x={0}
        y={0}
        width={element.width}
        height={element.height}
        fill={color}
        opacity={0.85}
        cornerRadius={6}
        shadowEnabled={isSelected}
        shadowColor="#3b82f6"
        shadowBlur={12}
        shadowOpacity={0.6}
        stroke={isSelected ? '#3b82f6' : (element.strokeColor ?? 'rgba(0,0,0,0.1)')}
        strokeWidth={isSelected ? 2 : (element.strokeWidth ?? 1)}
      />

      {/* Symbole ou icône centrale */}
      {isElectrical ? (
        // Pour les symboles électriques NF C 15-100, on utilise un SVG custom
        <Text
          x={0}
          y={element.height / 2 - 10}
          width={element.width}
          align="center"
          text={iconLabel}
          fontSize={18}
          fontStyle="bold"
          fill="white"
          listening={false}
        />
      ) : (
        <Text
          x={0}
          y={element.height / 2 - 10}
          width={element.width}
          align="center"
          text={iconLabel}
          fontSize={22}
          fill="white"
          listening={false}
        />
      )}

      {/* Label optionnel sous le bloc */}
      {element.label && (
        <Text
          x={0}
          y={element.height + 4}
          width={element.width}
          align="center"
          text={element.label}
          fontSize={11}
          fill="#374151"
          listening={false}
        />
      )}

      {/* Ancres de connexion (visibles uniquement quand sélectionné) */}
      {isSelected && element.anchors?.map((anchor) => (
        <Circle
          key={anchor.id}
          x={anchor.x}
          y={anchor.y}
          radius={5}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
        />
      ))}
    </Group>
  );
});

DraggableShape.displayName = 'DraggableShape';
