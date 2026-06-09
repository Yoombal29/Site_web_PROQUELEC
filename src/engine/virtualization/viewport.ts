import type { ViewportRect, ViewportState } from './types';

/** Derive the logical viewport rect (in canvas coordinates) from scroll/zoom state */
export function getViewportRect(viewport: ViewportState): ViewportRect {
  return {
    x: viewport.scrollX / viewport.zoom,
    y: viewport.scrollY / viewport.zoom,
    width: viewport.width / viewport.zoom,
    height: viewport.height / viewport.zoom,
  };
}

/** Check if two viewport states are equal (within tolerance) */
export function viewportStateEquals(a: ViewportState, b: ViewportState, tolerance: number = 1): boolean {
  return (
    Math.abs(a.scrollX - b.scrollX) <= tolerance &&
    Math.abs(a.scrollY - b.scrollY) <= tolerance &&
    Math.abs(a.zoom - b.zoom) <= 0.01 &&
    a.width === b.width &&
    a.height === b.height
  );
}

/** Compute the zoom level to fit the given rect within the viewport */
export function fitToViewport(
  targetRect: ViewportRect,
  viewportSize: { width: number; height: number },
  padding: number = 40,
): { scrollX: number; scrollY: number; zoom: number } {
  const scaleX = (viewportSize.width - padding * 2) / targetRect.width;
  const scaleY = (viewportSize.height - padding * 2) / targetRect.height;
  const zoom = Math.min(scaleX, scaleY, 2);

  const centerX = targetRect.x + targetRect.width / 2;
  const centerY = targetRect.y + targetRect.height / 2;

  return {
    scrollX: centerX * zoom - viewportSize.width / 2,
    scrollY: centerY * zoom - viewportSize.height / 2,
    zoom,
  };
}

/** Clamp scroll position to prevent scrolling outside canvas bounds */
export function clampScroll(
  scrollX: number,
  scrollY: number,
  canvasBounds: ViewportRect,
  viewportWidth: number,
  viewportHeight: number,
  zoom: number,
): { scrollX: number; scrollY: number } {
  const maxX = Math.max(0, (canvasBounds.x + canvasBounds.width) * zoom - viewportWidth);
  const maxY = Math.max(0, (canvasBounds.y + canvasBounds.height) * zoom - viewportHeight);

  return {
    scrollX: Math.max(0, Math.min(scrollX, maxX + 200)),
    scrollY: Math.max(0, Math.min(scrollY, maxY + 200)),
  };
}
