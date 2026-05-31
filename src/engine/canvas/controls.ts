import type { CanvasTransform, CanvasConfig } from './types';

/** Result of a zoom operation */
export interface ZoomResult {
  transform: CanvasTransform;
  /** Whether the zoom actually changed */
  changed: boolean;
}

/** Result of a pan operation */
export interface PanResult {
  transform: CanvasTransform;
  /** Whether the pan actually changed */
  changed: boolean;
}

/**
 * Zoom in at a given screen-space point (e.g., mouse cursor).
 * This keeps the point under the cursor stable.
 */
export function zoomAtPoint(
  transform: CanvasTransform,
  point: { x: number; y: number },
  delta: number,
  config: CanvasConfig,
): ZoomResult {
  const oldZoom = transform.zoom;
  const newZoom = Math.max(config.minZoom, Math.min(config.maxZoom, oldZoom + delta));

  if (newZoom === oldZoom) {
    return { transform, changed: false };
  }

  const zoomFactor = newZoom / oldZoom;
  const newX = point.x - (point.x - transform.x) * zoomFactor;
  const newY = point.y - (point.y - transform.y) * zoomFactor;

  return {
    transform: { x: newX, y: newY, zoom: newZoom },
    changed: true,
  };
}

/**
 * Zoom by a factor (1.1 = zoom in, 0.9 = zoom out) centered on a point.
 */
export function zoomByFactor(
  transform: CanvasTransform,
  point: { x: number; y: number },
  factor: number,
  config: CanvasConfig,
): ZoomResult {
  const oldZoom = transform.zoom;
  const newZoom = Math.max(config.minZoom, Math.min(config.maxZoom, oldZoom * factor));
  if (newZoom === oldZoom) return { transform, changed: false };

  const px = (point.x - transform.x) / oldZoom;
  const py = (point.y - transform.y) / oldZoom;
  const newX = point.x - px * newZoom;
  const newY = point.y - py * newZoom;

  return { transform: { x: newX, y: newY, zoom: newZoom }, changed: true };
}

/**
 * Pan the canvas by a delta in screen pixels.
 */
export function panBy(
  transform: CanvasTransform,
  dx: number,
  dy: number,
): PanResult {
  if (dx === 0 && dy === 0) return { transform, changed: false };
  return {
    transform: { ...transform, x: transform.x + dx, y: transform.y + dy },
    changed: true,
  };
}

/**
 * Convert screen-space coordinates to canvas-space coordinates.
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  transform: CanvasTransform,
): { x: number; y: number } {
  return {
    x: (screenX - transform.x) / transform.zoom,
    y: (screenY - transform.y) / transform.zoom,
  };
}

/**
 * Convert canvas-space coordinates to screen-space coordinates.
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  transform: CanvasTransform,
): { x: number; y: number } {
  return {
    x: canvasX * transform.zoom + transform.x,
    y: canvasY * transform.zoom + transform.y,
  };
}

/** Fit all content bounds into the viewport */
export function fitToViewport(
  contentBounds: { x: number; y: number; width: number; height: number },
  viewportWidth: number,
  viewportHeight: number,
  config: CanvasConfig,
  padding: number = 40,
): CanvasTransform {
  const contentW = contentBounds.width + padding * 2;
  const contentH = contentBounds.height + padding * 2;
  const zoomX = viewportWidth / contentW;
  const zoomY = viewportHeight / contentH;
  const zoom = Math.max(config.minZoom, Math.min(config.maxZoom, Math.min(zoomX, zoomY)));

  const cx = (viewportWidth - contentBounds.width * zoom) / 2 - contentBounds.x * zoom;
  const cy = (viewportHeight - contentBounds.height * zoom) / 2 - contentBounds.y * zoom;

  return { x: cx, y: cy, zoom };
}

/**
 * Create event handlers for mouse-wheel-based zoom + pan.
 */
export function createWheelHandler(config: CanvasConfig) {
  let lastWheelTime = 0;

  return (
    e: WheelEvent,
    transform: CanvasTransform,
  ): ZoomResult | PanResult => {
    const now = Date.now();

    // Ctrl/Cmd + wheel = zoom
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      lastWheelTime = now;
      return zoomAtPoint(transform, { x: e.clientX, y: e.clientY }, delta, config);
    }

    // Trackpad or mouse wheel = pan
    lastWheelTime = now;
    return panBy(transform, -e.deltaX, -e.deltaY);
  };
}

/**
 * Create pan gesture state machine for mouse drag + touch drag panning.
 */
export function createPanGesture() {
  let isPanning = false;
  let lastX = 0;
  let lastY = 0;
  let velocityX = 0;
  let velocityY = 0;

  const start = (x: number, y: number): void => {
    isPanning = true;
    lastX = x;
    lastY = y;
    velocityX = 0;
    velocityY = 0;
  };

  const move = (
    x: number,
    y: number,
    transform: CanvasTransform,
  ): PanResult => {
    if (!isPanning) return { transform, changed: false };
    const dx = x - lastX;
    const dy = y - lastY;
    velocityX = dx;
    velocityY = dy;
    lastX = x;
    lastY = y;
    return panBy(transform, dx, dy);
  };

  const end = (): { velocityX: number; velocityY: number } => {
    isPanning = false;
    return { velocityX, velocityY };
  };

  const cancel = (): void => {
    isPanning = false;
    velocityX = 0;
    velocityY = 0;
  };

  return { start, move, end, cancel, get isPanning() { return isPanning; } };
}
