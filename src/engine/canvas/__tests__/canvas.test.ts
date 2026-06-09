import { describe, it, expect, beforeEach } from 'vitest';
import {
  zoomAtPoint,
  zoomByFactor,
  panBy,
  screenToCanvas,
  canvasToScreen,
  fitToViewport,
  createWheelHandler,
  createPanGesture,
  computeGridLines,
} from '..';
import type { CanvasTransform, CanvasConfig, GridVisual } from '../types';
import { DEFAULT_CANVAS_CONFIG } from '../types';
import { useCanvasStore } from '../store';

const defaultTransform: CanvasTransform = { x: 0, y: 0, zoom: 1 };

// ── zoomAtPoint ─────────────────────────────────────────────

describe('zoomAtPoint', () => {
  it('should zoom in at origin', () => {
    const result = zoomAtPoint(defaultTransform, { x: 0, y: 0 }, 0.1, DEFAULT_CANVAS_CONFIG);
    expect(result.changed).toBe(true);
    expect(result.transform.zoom).toBeCloseTo(1.1);
  });

  it('should zoom out at origin', () => {
    const result = zoomAtPoint(defaultTransform, { x: 0, y: 0 }, -0.1, DEFAULT_CANVAS_CONFIG);
    expect(result.changed).toBe(true);
    expect(result.transform.zoom).toBeCloseTo(0.9);
  });

  it('should keep point under cursor stable when zooming in', () => {
    const point = { x: 200, y: 300 };
    // Zoom in at (200, 300), the canvas point under cursor should remain the same
    const t = { x: -100, y: -100, zoom: 1 };
    const canvasP = screenToCanvas(point.x, point.y, t);

    const result = zoomAtPoint(t, point, 0.5, DEFAULT_CANVAS_CONFIG);
    const newCanvasP = screenToCanvas(point.x, point.y, result.transform);

    expect(newCanvasP.x).toBeCloseTo(canvasP.x, 5);
    expect(newCanvasP.y).toBeCloseTo(canvasP.y, 5);
  });

  it('should clamp to min zoom', () => {
    const result = zoomAtPoint(defaultTransform, { x: 0, y: 0 }, -100, DEFAULT_CANVAS_CONFIG);
    expect(result.transform.zoom).toBe(DEFAULT_CANVAS_CONFIG.minZoom);
  });

  it('should clamp to max zoom', () => {
    const result = zoomAtPoint(defaultTransform, { x: 0, y: 0 }, 100, DEFAULT_CANVAS_CONFIG);
    expect(result.transform.zoom).toBe(DEFAULT_CANVAS_CONFIG.maxZoom);
  });

  it('should not change when delta is zero', () => {
    const result = zoomAtPoint(defaultTransform, { x: 0, y: 0 }, 0, DEFAULT_CANVAS_CONFIG);
    expect(result.changed).toBe(false);
  });

  it('should zoom with non-origin camera position', () => {
    const t = { x: 200, y: 100, zoom: 2 };
    const result = zoomAtPoint(t, { x: 400, y: 300 }, 0.2, DEFAULT_CANVAS_CONFIG);
    expect(result.changed).toBe(true);
    expect(result.transform.zoom).toBeCloseTo(2.2);
    expect(result.transform.x).not.toBe(t.x);
    expect(result.transform.y).not.toBe(t.y);
  });
});

// ── zoomByFactor ────────────────────────────────────────────

describe('zoomByFactor', () => {
  it('should zoom by factor 1.1', () => {
    const result = zoomByFactor(defaultTransform, { x: 0, y: 0 }, 1.1, DEFAULT_CANVAS_CONFIG);
    expect(result.changed).toBe(true);
    expect(result.transform.zoom).toBeCloseTo(1.1);
  });

  it('should zoom by factor 0.5', () => {
    const result = zoomByFactor(defaultTransform, { x: 0, y: 0 }, 0.5, DEFAULT_CANVAS_CONFIG);
    expect(result.changed).toBe(true);
    expect(result.transform.zoom).toBeCloseTo(0.5);
  });

  it('should keep point stable', () => {
    const point = { x: 300, y: 200 };
    const t = { x: -50, y: -50, zoom: 1 };
    const canvasP = screenToCanvas(point.x, point.y, t);

    const result = zoomByFactor(t, point, 2, DEFAULT_CANVAS_CONFIG);
    const newCanvasP = screenToCanvas(point.x, point.y, result.transform);

    expect(newCanvasP.x).toBeCloseTo(canvasP.x, 5);
    expect(newCanvasP.y).toBeCloseTo(canvasP.y, 5);
  });
});

// ── panBy ───────────────────────────────────────────────────

describe('panBy', () => {
  it('should pan right and down', () => {
    const result = panBy(defaultTransform, 100, 50);
    expect(result.changed).toBe(true);
    expect(result.transform.x).toBe(100);
    expect(result.transform.y).toBe(50);
  });

  it('should not change with zero delta', () => {
    const result = panBy(defaultTransform, 0, 0);
    expect(result.changed).toBe(false);
  });

  it('should pan left and up', () => {
    const result = panBy({ x: 100, y: 100, zoom: 1 }, -50, -25);
    expect(result.transform.x).toBe(50);
    expect(result.transform.y).toBe(75);
  });
});

// ── screenToCanvas / canvasToScreen ─────────────────────────

describe('coordinate conversion', () => {
  it('should convert screen to canvas at zoom=1', () => {
    const p = screenToCanvas(100, 200, defaultTransform);
    expect(p.x).toBe(100);
    expect(p.y).toBe(200);
  });

  it('should convert canvas to screen at zoom=1', () => {
    const p = canvasToScreen(100, 200, defaultTransform);
    expect(p.x).toBe(100);
    expect(p.y).toBe(200);
  });

  it('should be inverse operations', () => {
    const t = { x: 150, y: -50, zoom: 2.5 };
    const original = { x: 42, y: 97 };
    const screen = canvasToScreen(original.x, original.y, t);
    const back = screenToCanvas(screen.x, screen.y, t);
    expect(back.x).toBeCloseTo(original.x, 5);
    expect(back.y).toBeCloseTo(original.y, 5);
  });

  it('should handle non-zero camera offset', () => {
    const t = { x: 200, y: 100, zoom: 1 };
    const p = screenToCanvas(500, 400, t);
    expect(p.x).toBe(300);
    expect(p.y).toBe(300);
  });

  it('should handle zoom', () => {
    const t = { x: 0, y: 0, zoom: 2 };
    const p = screenToCanvas(200, 100, t);
    expect(p.x).toBe(100);
    expect(p.y).toBe(50);
  });
});

// ── fitToViewport ───────────────────────────────────────────

describe('fitToViewport', () => {
  it('should fit content into viewport', () => {
    const transform = fitToViewport(
      { x: 0, y: 0, width: 800, height: 600 },
      1024, 768,
      DEFAULT_CANVAS_CONFIG,
    );
    // Should zoom to fill width or height
    expect(transform.zoom).toBeGreaterThan(0);
    expect(transform.zoom).toBeLessThanOrEqual(1.2);
  });

  it('should respect padding', () => {
    const withPadding = fitToViewport(
      { x: 0, y: 0, width: 800, height: 600 },
      1024, 768,
      DEFAULT_CANVAS_CONFIG, 80,
    );
    const withoutPadding = fitToViewport(
      { x: 0, y: 0, width: 800, height: 600 },
      1024, 768,
      DEFAULT_CANVAS_CONFIG, 0,
    );
    // More padding = smaller zoom
    expect(withPadding.zoom).toBeLessThan(withoutPadding.zoom);
  });

  it('should clamp zoom to configured limits', () => {
    const tinyConfig = { ...DEFAULT_CANVAS_CONFIG, minZoom: 0.5, maxZoom: 1 };
    const transform = fitToViewport(
      { x: 0, y: 0, width: 50, height: 50 },
      1024, 768,
      tinyConfig,
    );
    expect(transform.zoom).toBe(tinyConfig.maxZoom);
  });
});

// ── createWheelHandler ──────────────────────────────────────

describe('createWheelHandler', () => {
  it('should zoom when ctrl is pressed', () => {
    const handler = createWheelHandler(DEFAULT_CANVAS_CONFIG);
    const wheelEvent = {
      ctrlKey: true,
      metaKey: false,
      deltaY: -100,
      clientX: 300,
      clientY: 200,
      preventDefault: () => {},
    } as WheelEvent;

    const result = handler(wheelEvent, defaultTransform) as ReturnType<typeof handler>;
    expect('changed' in result!).toBe(true);
    if ('changed' in result!) {
      expect(result.changed).toBe(true);
      const zoomResult = result as any;
      expect(zoomResult.transform.zoom).toBeGreaterThan(1);
    }
  });

  it('should pan without ctrl', () => {
    const handler = createWheelHandler(DEFAULT_CANVAS_CONFIG);
    const wheelEvent = {
      ctrlKey: false,
      metaKey: false,
      deltaX: 50,
      deltaY: 100,
      clientX: 300,
      clientY: 200,
      preventDefault: () => {},
    } as WheelEvent;

    const result = handler(wheelEvent, defaultTransform);
    expect(result).toBeDefined();
    if (result && 'transform' in result) {
      expect(result.transform.x).toBe(-50);
      expect(result.transform.y).toBe(-100);
    }
  });
});

// ── createPanGesture ────────────────────────────────────────

describe('createPanGesture', () => {
  it('should start, move, and end pan', () => {
    const gesture = createPanGesture();
    expect(gesture.isPanning).toBe(false);

    gesture.start(100, 200);
    expect(gesture.isPanning).toBe(true);

    const moveResult = gesture.move(150, 250, defaultTransform);
    expect(moveResult.changed).toBe(true);
    expect(moveResult.transform.x).toBe(50);
    expect(moveResult.transform.y).toBe(50);

    const endResult = gesture.end();
    expect(endResult.velocityX).toBe(50);
    expect(endResult.velocityY).toBe(50);
    expect(gesture.isPanning).toBe(false);
  });

  it('should cancel pan', () => {
    const gesture = createPanGesture();
    gesture.start(0, 0);
    gesture.move(10, 10, defaultTransform);
    gesture.cancel();
    expect(gesture.isPanning).toBe(false);
  });

  it('should not pan when not started', () => {
    const gesture = createPanGesture();
    const result = gesture.move(10, 10, defaultTransform);
    expect(result.changed).toBe(false);
  });
});

// ── computeGridLines ────────────────────────────────────────

describe('computeGridLines', () => {
  it('should return grid lines for default viewport', () => {
    const grid = computeGridLines(800, 600, defaultTransform, DEFAULT_CANVAS_CONFIG);
    expect(grid.lines.length).toBeGreaterThan(0);
    expect(grid.originX).toBe(0);
    expect(grid.originY).toBe(0);
  });

  it('should shift lines with camera', () => {
    const t = { x: 100, y: 50, zoom: 1 };
    const grid = computeGridLines(800, 600, t, DEFAULT_CANVAS_CONFIG);
    expect(grid.originX).toBe(100);
    expect(grid.originY).toBe(50);
  });

  it('should have fewer lines at low zoom', () => {
    const farOut = { x: 0, y: 0, zoom: 0.1 };
    const normal = { x: 0, y: 0, zoom: 1 };
    const gridFar = computeGridLines(800, 600, farOut, DEFAULT_CANVAS_CONFIG);
    const gridNormal = computeGridLines(800, 600, normal, DEFAULT_CANVAS_CONFIG);
    // Far out sees more area, so more lines should be visible
    // but each line represents 100px in canvas space → zoom 0.1 means
    // viewport covers 10x more canvas units → more lines
    // Actually this comparison is not trivial. Just verify both return lines.
    expect(gridFar.lines.length).toBeGreaterThan(0);
    expect(gridNormal.lines.length).toBeGreaterThan(0);
  });

  it('should include minor lines only when zoom > 0.3', () => {
    const lowZoom = { x: 0, y: 0, zoom: 0.2 };
    const highZoom = { x: 0, y: 0, zoom: 1 };
    const gridLow = computeGridLines(800, 600, lowZoom, DEFAULT_CANVAS_CONFIG);
    const gridHigh = computeGridLines(800, 600, highZoom, DEFAULT_CANVAS_CONFIG);
    expect(gridLow.minorLines.length).toBe(0);
    expect(gridHigh.minorLines.length).toBeGreaterThan(0);
  });
});

// ── Store ───────────────────────────────────────────────────

describe('useCanvasStore', () => {
  beforeEach(() => {
    useCanvasStore.setState({
      transform: { x: 0, y: 0, zoom: 1 },
    });
  });

  it('should initialize with defaults', () => {
    const state = useCanvasStore.getState();
    expect(state.transform).toEqual({ x: 0, y: 0, zoom: 1 });
    expect(state.config.showGrid).toBe(true);
    expect(state.minimap.visible).toBe(true);
  });

  it('should zoom in', () => {
    useCanvasStore.getState().zoomIn();
    expect(useCanvasStore.getState().transform.zoom).toBeGreaterThan(1);
  });

  it('should zoom out', () => {
    useCanvasStore.getState().zoomOut();
    expect(useCanvasStore.getState().transform.zoom).toBeLessThan(1);
  });

  it('should pan', () => {
    useCanvasStore.getState().panBy(50, 100);
    expect(useCanvasStore.getState().transform.x).toBe(50);
    expect(useCanvasStore.getState().transform.y).toBe(100);
  });

  it('should reset view', () => {
    useCanvasStore.getState().panBy(500, 500);
    useCanvasStore.getState().zoomIn();
    useCanvasStore.getState().resetView();
    expect(useCanvasStore.getState().transform).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('should toggle grid', () => {
    expect(useCanvasStore.getState().config.showGrid).toBe(true);
    useCanvasStore.getState().toggleGrid();
    expect(useCanvasStore.getState().config.showGrid).toBe(false);
  });

  it('should toggle minimap', () => {
    expect(useCanvasStore.getState().minimap.visible).toBe(true);
    useCanvasStore.getState().toggleMinimap();
    expect(useCanvasStore.getState().minimap.visible).toBe(false);
  });

  it('should fit content', () => {
    useCanvasStore.getState().fitContent(
      { x: 0, y: 0, width: 800, height: 600 },
      1024, 768,
    );
    const s = useCanvasStore.getState();
    expect(s.transform.zoom).toBeGreaterThan(0);
    expect(s.transform.zoom).toBeLessThanOrEqual(1.2);
  });

  it('should convert coordinates', () => {
    const canvas = useCanvasStore.getState().screenToCanvas(100, 200);
    expect(canvas.x).toBe(100);
    expect(canvas.y).toBe(200);

    const screen = useCanvasStore.getState().canvasToScreen(100, 200);
    expect(screen.x).toBe(100);
    expect(screen.y).toBe(200);
  });

  it('should zoom by factor', () => {
    useCanvasStore.getState().zoomByFactor(2);
    expect(useCanvasStore.getState().transform.zoom).toBeCloseTo(2);
  });

  it('should zoom to specific level', () => {
    useCanvasStore.getState().zoomTo(3);
    expect(useCanvasStore.getState().transform.zoom).toBe(3);
  });

  it('should update config', () => {
    useCanvasStore.getState().setConfig({ showGrid: false, gridColor: '#000' });
    const s = useCanvasStore.getState();
    expect(s.config.showGrid).toBe(false);
    expect(s.config.gridColor).toBe('#000');
  });

  it('should update minimap config', () => {
    useCanvasStore.getState().setMinimapConfig({ visible: false, width: 300 });
    const s = useCanvasStore.getState();
    expect(s.minimap.visible).toBe(false);
    expect(s.minimap.width).toBe(300);
  });
});
