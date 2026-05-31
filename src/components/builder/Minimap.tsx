import React, { useRef, useEffect, useCallback } from 'react';
import type { CanvasTransform, CanvasConfig, MinimapConfig } from '@/engine/canvas';
import { computeGridLines, renderGridSVG } from '@/engine/canvas';

interface MinimapProps {
  canvasTransform: CanvasTransform;
  canvasConfig: CanvasConfig;
  minimapConfig: MinimapConfig;
  viewportWidth: number;
  viewportHeight: number;
  /** All item bounds for content thumbnail (x, y, width, height) */
  contentBounds?: { x: number; y: number; width: number; height: number };
  onNavigate?: (canvasX: number, canvasY: number) => void;
}

/**
 * Minimap — miniature overview of the entire canvas with a viewport indicator.
 */
export const Minimap: React.FC<MinimapProps> = ({
  canvasTransform,
  canvasConfig,
  minimapConfig,
  viewportWidth,
  viewportHeight,
  contentBounds,
  onNavigate,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  if (!minimapConfig.visible) return null;

  const { width, height } = minimapConfig;

  // Compute the minimap's own zoom factor to fit the canvas content
  const mapZoom = (() => {
    if (!contentBounds) return 1;
    const scaleX = width / (contentBounds.width || 800);
    const scaleY = height / (contentBounds.height || 600);
    return Math.min(scaleX, scaleY) * 0.9;
  })();

  // Viewport indicator rect in minimap space
  const viewportIndicator = (() => {
    if (!contentBounds) return null;
    const vx = (-canvasTransform.x / canvasTransform.zoom - contentBounds.x) * mapZoom + (width - contentBounds.width * mapZoom) / 2;
    const vy = (-canvasTransform.y / canvasTransform.zoom - contentBounds.y) * mapZoom + (height - contentBounds.height * mapZoom) / 2;
    const vw = (viewportWidth / canvasTransform.zoom) * mapZoom;
    const vh = (viewportHeight / canvasTransform.zoom) * mapZoom;
    return { x: vx, y: vy, width: vw, height: vh };
  })();

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!onNavigate || !contentBounds) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (e.clientX - rect.left) / mapZoom;
    const my = (e.clientY - rect.top) / mapZoom;
    // Convert minimap position → canvas position
    const cx = mx - (width - contentBounds.width * mapZoom) / (2 * mapZoom) + contentBounds.x;
    const cy = my - (height - contentBounds.height * mapZoom) / (2 * mapZoom) + contentBounds.y;
    onNavigate(cx * canvasTransform.zoom, cy * canvasTransform.zoom);
  }, [onNavigate, contentBounds, mapZoom, canvasTransform.zoom, width, height]);

  const positionClass = minimapConfig.position === 'bottom-right'
    ? 'bottom-3 right-3'
    : 'bottom-3 left-3';

  return (
    <div
      className={`absolute ${positionClass} z-40 rounded-lg overflow-hidden shadow-lg border border-slate-200`}
      style={{
        width,
        height,
        opacity: minimapConfig.backgroundOpacity,
      }}
    >
      {/* Background grid */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="cursor-pointer"
        onClick={handleClick}
        style={{ backgroundColor: canvasConfig.backgroundColor }}
      >
        {/* Grid lines (simplified for minimap) */}
        {canvasConfig.showGrid && contentBounds && (
          <g opacity={0.15}>
            <GridInRect
              bounds={contentBounds}
              gridSize={canvasConfig.gridSize * 4}
              mapZoom={mapZoom}
              width={width}
              height={height}
              color={canvasConfig.gridColor}
            />
          </g>
        )}

        {/* Content area outline */}
        {contentBounds && (
          <rect
            x={(width - contentBounds.width * mapZoom) / 2}
            y={(height - contentBounds.height * mapZoom) / 2}
            width={contentBounds.width * mapZoom}
            height={contentBounds.height * mapZoom}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={0.5}
            strokeDasharray="2,2"
          />
        )}

        {/* Viewport indicator */}
        {viewportIndicator && (
          <rect
            x={viewportIndicator.x}
            y={viewportIndicator.y}
            width={viewportIndicator.width}
            height={viewportIndicator.height}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            strokeWidth={1.5}
            rx={2}
          />
        )}
      </svg>
    </div>
  );
};

/** Draw simplified grid lines within a content bounds rectangle */
const GridInRect: React.FC<{
  bounds: { x: number; y: number; width: number; height: number };
  gridSize: number;
  mapZoom: number;
  width: number;
  height: number;
  color: string;
}> = ({ bounds, gridSize, mapZoom, width, height, color }) => {
  const offsetX = (width - bounds.width * mapZoom) / 2;
  const offsetY = (height - bounds.height * mapZoom) / 2;
  const lines: React.ReactNode[] = [];

  const startX = Math.floor(bounds.x / gridSize) * gridSize;
  const startY = Math.floor(bounds.y / gridSize) * gridSize;
  const endX = bounds.x + bounds.width + gridSize;
  const endY = bounds.y + bounds.height + gridSize;

  for (let gx = startX; gx <= endX; gx += gridSize) {
    const sx = (gx - bounds.x) * mapZoom + offsetX;
    lines.push(
      <line key={`v${gx}`} x1={sx} y1={offsetY} x2={sx} y2={offsetY + bounds.height * mapZoom} stroke={color} strokeWidth={0.5} />,
    );
  }
  for (let gy = startY; gy <= endY; gy += gridSize) {
    const sy = (gy - bounds.y) * mapZoom + offsetY;
    lines.push(
      <line key={`h${gy}`} x1={offsetX} y1={sy} x2={offsetX + bounds.width * mapZoom} y2={sy} stroke={color} strokeWidth={0.5} />,
    );
  }

  return <>{lines}</>;
};
