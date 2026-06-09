import type { ViewportRect, RenderItem } from './types';

/** Fraction of node area that must be inside viewport to be considered "partial" */
const PARTIAL_THRESHOLD = 0.01;

export function rectsOverlap(a: ViewportRect, b: ViewportRect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function rectContains(outer: ViewportRect, inner: ViewportRect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

/** Returns the overlap area between two rects */
export function overlapArea(a: ViewportRect, b: ViewportRect): number {
  const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return xOverlap * yOverlap;
}

/** Returns 0–1 fraction of node area visible in viewport */
export function visibleFraction(nodeBounds: ViewportRect, viewport: ViewportRect): number {
  const area = nodeBounds.width * nodeBounds.height;
  if (area <= 0) return 0;
  const visible = overlapArea(nodeBounds, viewport);
  return Math.min(visible / area, 1);
}

export function computeVisibleState(
  bounds: ViewportRect,
  viewport: ViewportRect,
): 'visible' | 'partial' | 'hidden' {
  if (!rectsOverlap(bounds, viewport)) return 'hidden';
  if (rectContains(viewport, bounds)) return 'visible';
  const fraction = visibleFraction(bounds, viewport);
  if (fraction >= PARTIAL_THRESHOLD) return 'partial';
  return 'hidden';
}

/** Filter a list of RenderItems to those visible in the given viewport */
export function computeVisibleNodes(
  items: RenderItem[],
  viewport: ViewportRect,
  overscan: number = 0,
): RenderItem[] {
  if (!items.length) return [];

  const expanded: ViewportRect = {
    x: viewport.x - overscan,
    y: viewport.y - overscan,
    width: viewport.width + overscan * 2,
    height: viewport.height + overscan * 2,
  };

  return items.filter((item) => rectsOverlap(item.bounds, expanded));
}

export function isNodeVisible(
  bounds: ViewportRect,
  viewport: ViewportRect,
  overscan: number = 0,
): boolean {
  const expanded: ViewportRect = {
    x: viewport.x - overscan,
    y: viewport.y - overscan,
    width: viewport.width + overscan * 2,
    height: viewport.height + overscan * 2,
  };
  return rectsOverlap(bounds, expanded);
}
