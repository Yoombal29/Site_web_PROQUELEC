import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import type { ComputedNode } from '@/engine/layout/types';
import type { ViewportState, RenderItem, VirtualizationConfig, ViewportRect } from './types';
import { DEFAULT_VIRTUALIZATION_CONFIG } from './types';
import { createMemoizedVirtualization } from './renderer';
import { createViewportKey } from './cache';
import { isNodeVisible } from './visibility';

/**
 * Hook that manages viewport navigation state (scroll, zoom).
 */
export function useViewportState(initialZoom: number = 1): {
  viewport: ViewportState;
  setScroll: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
  setSize: (width: number, height: number) => void;
  scrollTo: (x: number, y: number, smooth?: boolean) => void;
  scrollBy: (dx: number, dy: number, smooth?: boolean) => void;
  resetView: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
} {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({
    scrollX: 0,
    scrollY: 0,
    zoom: initialZoom,
    width: 1200,
    height: 800,
  });

  const setScroll = useCallback((x: number, y: number) => {
    setViewport((prev) => ({ ...prev, scrollX: x, scrollY: y }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setViewport((prev) => ({ ...prev, zoom: Math.max(0.1, Math.min(5, zoom)) }));
  }, []);

  const setSize = useCallback((width: number, height: number) => {
    setViewport((prev) => ({ ...prev, width, height }));
  }, []);

  const scrollTo = useCallback((x: number, y: number, smooth?: boolean) => {
    if (smooth && containerRef.current) {
      containerRef.current.scrollTo({ left: x, top: y, behavior: 'smooth' });
    } else {
      setScroll(x, y);
    }
  }, [setScroll]);

  const scrollBy = useCallback((dx: number, dy: number, smooth?: boolean) => {
    if (smooth && containerRef.current) {
      containerRef.current.scrollBy({ left: dx, top: dy, behavior: 'smooth' });
    } else {
      setViewport((prev) => ({
        ...prev,
        scrollX: prev.scrollX + dx,
        scrollY: prev.scrollY + dy,
      }));
    }
  }, []);

  const resetView = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      scrollX: 0,
      scrollY: 0,
      zoom: initialZoom,
    }));
  }, [initialZoom]);

  return {
    viewport,
    setScroll,
    setZoom,
    setSize,
    scrollTo,
    scrollBy,
    resetView,
    containerRef,
  };
}

/**
 * Hook that computes the virtualization result for a given node tree and viewport.
 * Memoized to avoid redundant computations.
 */
export function useVirtualizedRender(
  computedNodes: ComputedNode[],
  viewport: ViewportState,
  config: VirtualizationConfig = DEFAULT_VIRTUALIZATION_CONFIG,
) {
  const memoized = useMemo(() => createMemoizedVirtualization(config), [config.overscan, config.useSpatialIndex]);

  return useMemo(() => {
    if (!computedNodes.length) {
      return {
        allItems: [] as RenderItem[],
        visibleItems: [] as RenderItem[],
        visibility: { newVisibleIds: new Set<string>(), totalCount: 0, visibleCount: 0, partialCount: 0 },
        canvasBounds: { x: 0, y: 0, width: 0, height: 0 } as ViewportRect,
        itemMap: new Map<string, RenderItem>(),
        spatialIndex: null as unknown,
      };
    }
    return memoized.compute(computedNodes, viewport);
  }, [computedNodes, viewport, memoized]);
}

/**
 * Hook that tracks which items are visible for intersection-observation-like needs.
 */
export function useVisibleNodes(
  items: RenderItem[],
  viewportRect: ViewportRect,
  overscan: number = 300,
): Set<string> {
  return useMemo(() => {
    const visible = new Set<string>();
    for (const item of items) {
      if (isNodeVisible(item.bounds, viewportRect, overscan)) {
        visible.add(item.id);
      }
    }
    return visible;
  }, [items, viewportRect, overscan]);
}

/** Props for the VirtualizedCanvas component */
export interface VirtualizedCanvasProps {
  computedNodes: ComputedNode[];
  config?: Partial<VirtualizationConfig>;
  className?: string;
  style?: React.CSSProperties;
  renderItem: (item: RenderItem) => React.ReactNode;
  renderOverlay?: (viewport: ViewportState) => React.ReactNode;
  onViewportChange?: (viewport: ViewportState) => void;
  children?: React.ReactNode;
}

/**
 * VirtualizedCanvas — the main renderer that only renders nodes visible in the viewport.
 *
 * Architecture:
 *   ComputedNode tree → flatten → spatial index → viewport query → visible items → memoized render
 */
export function VirtualizedCanvas({
  computedNodes,
  config: configPartial,
  className,
  style,
  renderItem,
  renderOverlay,
  onViewportChange,
  children,
}: VirtualizedCanvasProps): React.ReactElement {
  const config: VirtualizationConfig = { ...DEFAULT_VIRTUALIZATION_CONFIG, ...configPartial };
  const { viewport, setScroll, setSize, containerRef } = useViewportState(1);
  const result = useVirtualizedRender(computedNodes, viewport, config);

  // Sync container size
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize(width, height);
        onViewportChange?.(viewport);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [setSize, onViewportChange]);

  // Sync scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    setScroll(containerRef.current.scrollLeft, containerRef.current.scrollTop);
  }, [setScroll]);

  const canvasBounds = result.canvasBounds;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'auto',
        width: '100%',
        height: '100%',
        ...style,
      }}
      onScroll={handleScroll}
    >
      {/* Spacer div to enable native scrolling */}
      <div
        style={{
          width: Math.max(canvasBounds.width + canvasBounds.x + 1000, viewport.width + 1000),
          height: Math.max(canvasBounds.height + canvasBounds.y + 1000, viewport.height + 1000),
          position: 'relative',
          transform: `scale(${viewport.zoom})`,
          transformOrigin: '0 0',
          pointerEvents: 'none',
        }}
      >
        {/* Only render visible items */}
        {result.visibleItems.map((item) => (
          <div
            key={item.id}
            data-node-id={item.id}
            data-depth={item.depth}
            style={{
              position: 'absolute',
              left: item.bounds.x,
              top: item.bounds.y,
              width: item.bounds.width,
              height: item.bounds.height,
              zIndex: item.zIndex,
              overflow: item.overflow as React.CSSProperties['overflow'],
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>

      {/* Overlay layer (selection, guides, drag handles, etc.) */}
      {renderOverlay?.(viewport)}

      {children}
    </div>
  );
}
