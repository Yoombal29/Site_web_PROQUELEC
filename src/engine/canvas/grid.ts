import type { CanvasTransform, CanvasConfig } from './types';

/** Computed grid properties for efficient rendering */
export interface GridVisual {
  lines: { x1: number; y1: number; x2: number; y2: number }[];
  minorLines: { x1: number; y1: number; x2: number; y2: number }[];
  originX: number;
  originY: number;
}

/**
 * Compute visible grid lines for a given viewport and camera transform.
 * Only returns lines that intersect the viewport.
 */
export function computeGridLines(
  viewportWidth: number,
  viewportHeight: number,
  transform: CanvasTransform,
  config: CanvasConfig,
): GridVisual {
  const { x: camX, y: camY, zoom } = transform;
  const gridSize = config.gridSize * zoom;
  const minorGridSize = gridSize / 5;

  // Viewport bounds in canvas space
  const viewLeft = -camX;
  const viewTop = -camY;
  const viewRight = viewLeft + viewportWidth / zoom;
  const viewBottom = viewTop + viewportHeight / zoom;

  // Find first grid lines within viewport
  const firstMajorX = Math.floor(viewLeft / config.gridSize) * config.gridSize;
  const firstMajorY = Math.floor(viewTop / config.gridSize) * config.gridSize;

  const lines: GridVisual['lines'] = [];
  const minorLines: GridVisual['minorLines'] = [];

  // Major grid lines
  for (let gx = firstMajorX; gx <= viewRight + config.gridSize; gx += config.gridSize) {
    const sx = gx * zoom + camX;
    lines.push({
      x1: sx,
      y1: 0,
      x2: sx,
      y2: viewportHeight,
    });
  }
  for (let gy = firstMajorY; gy <= viewBottom + config.gridSize; gy += config.gridSize) {
    const sy = gy * zoom + camY;
    lines.push({
      x1: 0,
      y1: sy,
      x2: viewportWidth,
      y2: sy,
    });
  }

  // Minor grid lines (subdivide major cells into 5)
  if (zoom > 0.3) {
    for (let gx = firstMajorX - config.gridSize; gx <= viewRight + config.gridSize; gx += config.gridSize) {
      for (let i = 1; i < 5; i++) {
        const mx = gx + (config.gridSize * i) / 5;
        if (mx >= viewLeft && mx <= viewRight) {
          const sx = mx * zoom + camX;
          minorLines.push({ x1: sx, y1: 0, x2: sx, y2: viewportHeight });
        }
      }
    }
    for (let gy = firstMajorY - config.gridSize; gy <= viewBottom + config.gridSize; gy += config.gridSize) {
      for (let i = 1; i < 5; i++) {
        const my = gy + (config.gridSize * i) / 5;
        if (my >= viewTop && my <= viewBottom) {
          const sy = my * zoom + camY;
          minorLines.push({ x1: 0, y1: sy, x2: viewportWidth, y2: sy });
        }
      }
    }
  }

  // Origin position in screen space
  const originX = camX;
  const originY = camY;

  return { lines, minorLines, originX, originY };
}

/** Generate SVG markup for the grid. Used by the minimap and background. */
export function renderGridSVG(
  width: number,
  height: number,
  gridData: GridVisual,
  config: CanvasConfig,
): string {
  const minorOpacity = 0.3;
  const majorOpacity = 0.5;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<rect width="${width}" height="${height}" fill="${config.backgroundColor}"/>`;

  // Minor lines
  for (const l of gridData.minorLines) {
    svg += `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="${config.gridColor}" stroke-opacity="${minorOpacity}" stroke-width="0.5"/>`;
  }

  // Major lines
  for (const l of gridData.lines) {
    svg += `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="${config.gridColor}" stroke-opacity="${majorOpacity}" stroke-width="1"/>`;
  }

  // Origin crosshair
  svg += `<line x1="${gridData.originX - 10}" y1="${gridData.originY}" x2="${gridData.originX + 10}" y2="${gridData.originY}" stroke="#94a3b8" stroke-width="1"/>
<line x1="${gridData.originX}" y1="${gridData.originY - 10}" x2="${gridData.originX}" y2="${gridData.originY + 10}" stroke="#94a3b8" stroke-width="1"/>
</svg>`;

  return svg;
}
