import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useCanvasStore } from '@/engine/canvas';
import { computeGridLines } from '@/engine/canvas';
import { createWheelHandler, createPanGesture } from '@/engine/canvas';
import { Minimap } from './Minimap';
import { ZoomControls } from './ZoomControls';
import { useCollaborationStore } from '@/stores/useCollaborationStore';
import { RemoteCursors } from './collaboration/RemoteCursors';

interface InfiniteCanvasProps {
  /** Total content bounds for minimap context */
  contentBounds?: { x: number; y: number; width: number; height: number };
  className?: string;
  children?: React.ReactNode;
}

/**
 * InfiniteCanvas — wraps existing builder content with zoom/pan, grid, minimap,
 * zoom controls, and remote cursor overlay. Preserves DnD and existing rendering.
 */
export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  contentBounds,
  className,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transform = useCanvasStore((s) => s.transform);
  const config = useCanvasStore((s) => s.config);
  const minimapConfig = useCanvasStore((s) => s.minimap);
  const setTransform = useCanvasStore((s) => s.setTransform);
  const toggleGrid = useCanvasStore((s) => s.toggleGrid);

  const [viewportSize, setViewportSize] = React.useState({ width: 1200, height: 800 });
  const peers = useCollaborationStore((s) => s.peers);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Grid lines
  const gridData = useMemo(
    () => config.showGrid ? computeGridLines(viewportSize.width, viewportSize.height, transform, config) : null,
    [config.showGrid, viewportSize, transform, config],
  );

  // Wheel handler
  const wheelHandler = useMemo(() => createWheelHandler(config), [config]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    // Only intercept wheel when ctrl is pressed (zoom), or when space is not pressed
    if (e.ctrlKey || e.metaKey) {
      e.stopPropagation();
      e.preventDefault();
      const result = wheelHandler(e.nativeEvent, transform);
      if (result && 'changed' in result && result.changed) {
        setTransform(result.transform);
      }
      return;
    }
    // Regular wheel passes through to container scroll
  }, [wheelHandler, transform, setTransform]);

  // Space+drag pan gesture
  const panGestureRef = useRef(createPanGesture());
  const [isSpaceDown, setIsSpaceDown] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsSpaceDown(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false);
        panGestureRef.current.cancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (isSpaceDown || e.button === 1) {
      e.preventDefault();
      const gesture = panGestureRef.current;
      gesture.start(e.clientX, e.clientY);

      const onMouseMove = (ev: MouseEvent) => {
        const result = gesture.move(ev.clientX, ev.clientY, transform);
        if (result.changed) setTransform(result.transform);
      };

      const onMouseUp = () => {
        gesture.end();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  }, [isSpaceDown, transform, setTransform]);

  // Minimap navigation
  const onMinimapNavigate = useCallback((cx: number, cy: number) => {
    setTransform({ ...transform, x: -cx, y: -cy });
  }, [transform, setTransform]);

  // Content transform style
  const contentStyle = useMemo(() => ({
    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
    transformOrigin: '0 0',
  }), [transform]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-slate-100 ${className ?? ''}`}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      style={{
        cursor: isSpaceDown ? 'grab' : 'default',
        userSelect: isSpaceDown ? 'none' : undefined,
      }}
    >
      {/* Background grid SVG layer */}
      {config.showGrid && gridData && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width={viewportSize.width}
          height={viewportSize.height}
          style={{ zIndex: 0 }}
        >
          {gridData.minorLines.map((l, i) => (
            <line
              key={`minor-${i}`}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={config.gridColor}
              strokeOpacity={0.3}
              strokeWidth={0.5}
            />
          ))}
          {gridData.lines.map((l, i) => (
            <line
              key={`major-${i}`}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={config.gridColor}
              strokeOpacity={0.5}
              strokeWidth={1}
            />
          ))}
        </svg>
      )}

      {/* Content layer with zoom/pan transform */}
      <div
        className="relative"
        style={{
          ...contentStyle,
          zIndex: 1,
          minHeight: '100%',
          width: viewportSize.width,
          height: viewportSize.height,
        }}
      >
        {children}
      </div>

      {/* Remote cursors overlay */}
      {peers && peers.length > 0 && (
        <RemoteCursors
          peers={peers}
          containerTransform={`translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`}
        />
      )}

      {/* Floating controls */}
      <ZoomControls
        zoom={transform.zoom}
        minZoom={config.minZoom}
        maxZoom={config.maxZoom}
        onZoomIn={() => useCanvasStore.getState().zoomIn()}
        onZoomOut={() => useCanvasStore.getState().zoomOut()}
        onReset={() => useCanvasStore.getState().resetView()}
        onFitContent={() => {
          if (contentBounds) {
            useCanvasStore.getState().fitContent(contentBounds, viewportSize.width, viewportSize.height);
          }
        }}
        showGrid={config.showGrid}
        onToggleGrid={toggleGrid}
      />

      {/* Minimap */}
      <Minimap
        canvasTransform={transform}
        canvasConfig={config}
        minimapConfig={minimapConfig}
        viewportWidth={viewportSize.width}
        viewportHeight={viewportSize.height}
        contentBounds={contentBounds}
        onNavigate={onMinimapNavigate}
      />
    </div>
  );
};
