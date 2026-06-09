import { create } from 'zustand';
import type { CanvasTransform, CanvasConfig, MinimapConfig, CanvasState } from './types';
import { DEFAULT_CANVAS_CONFIG, DEFAULT_MINIMAP_CONFIG } from './types';
import { panBy, zoomAtPoint, zoomByFactor, fitToViewport } from './controls';
import type { ZoomResult, PanResult } from './controls';

/**
 * Canvas store — manages the infinite canvas transform, config, and minimap state.
 *
 * Key design decisions:
 * - `x`/`y` represent the camera offset in screen pixels (not canvas units).
 * - `zoom` is a multiplier (1 = 100%).
 * - All transforms are stored in a single state atom for atomic updates.
 * - The store is decoupled from rendering — it only manages state.
 */
export interface CanvasStoreState {
  /** Current camera transform */
  transform: CanvasTransform;
  /** Canvas behavior configuration */
  config: CanvasConfig;
  /** Minimap configuration */
  minimap: MinimapConfig;

  // ── Transform actions ──
  setTransform: (transform: CanvasTransform) => void;
  zoomIn: (point?: { x: number; y: number }) => void;
  zoomOut: (point?: { x: number; y: number }) => void;
  zoomTo: (zoom: number, point?: { x: number; y: number }) => void;
  zoomByFactor: (factor: number, point?: { x: number; y: number }) => void;
  panTo: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;
  pan: (dx: number, dy: number) => PanResult;

  // ── Utility actions ──
  fitContent: (
    contentBounds: { x: number; y: number; width: number; height: number },
    viewportWidth: number,
    viewportHeight: number,
    padding?: number,
  ) => void;
  resetView: () => void;
  screenToCanvas: (sx: number, sy: number) => { x: number; y: number };
  canvasToScreen: (cx: number, cy: number) => { x: number; y: number };

  // ── Config actions ──
  setConfig: (config: Partial<CanvasConfig>) => void;
  setMinimapConfig: (config: Partial<MinimapConfig>) => void;
  toggleGrid: () => void;
  toggleMinimap: () => void;
}

/** Default starting transform — centered at origin, zoom = 1 */
const DEFAULT_TRANSFORM: CanvasTransform = { x: 0, y: 0, zoom: 1 };

/** Internal imports for screen/canvas conversion */
import {
  screenToCanvas as stc,
  canvasToScreen as cts,
} from './controls';

export const useCanvasStore = create<CanvasStoreState>((set, get) => ({
  transform: { ...DEFAULT_TRANSFORM },
  config: { ...DEFAULT_CANVAS_CONFIG },
  minimap: { ...DEFAULT_MINIMAP_CONFIG },

  setTransform: (transform) => set({ transform }),

  zoomIn: (point) => {
    const { transform, config } = get();
    const p = point ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const result = zoomAtPoint(transform, p, config.zoomStep, config);
    if (result.changed) set({ transform: result.transform });
  },

  zoomOut: (point) => {
    const { transform, config } = get();
    const p = point ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const result = zoomAtPoint(transform, p, -config.zoomStep, config);
    if (result.changed) set({ transform: result.transform });
  },

  zoomTo: (zoom, point) => {
    const { transform, config } = get();
    const p = point ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const delta = zoom - transform.zoom;
    const result = zoomAtPoint(transform, p, delta, config);
    if (result.changed) set({ transform: result.transform });
  },

  zoomByFactor: (factor, point) => {
    const { transform, config } = get();
    const p = point ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const result = zoomByFactor(transform, p, factor, config);
    if (result.changed) set({ transform: result.transform });
  },

  panTo: (x, y) => set((s) => ({ transform: { ...s.transform, x, y } })),

  panBy: (dx, dy) => {
    const { transform } = get();
    const result = panBy(transform, dx, dy);
    if (result.changed) set({ transform: result.transform });
  },

  pan: (dx, dy) => panBy(get().transform, dx, dy),

  fitContent: (contentBounds, viewportWidth, viewportHeight, padding) => {
    const { config } = get();
    const transform = fitToViewport(contentBounds, viewportWidth, viewportHeight, config, padding);
    set({ transform });
  },

  resetView: () => set({ transform: { ...DEFAULT_TRANSFORM } }),

  screenToCanvas: (sx, sy) => stc(sx, sy, get().transform),
  canvasToScreen: (cx, cy) => cts(cx, cy, get().transform),

  setConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
  setMinimapConfig: (partial) => set((s) => ({ minimap: { ...s.minimap, ...partial } })),
  toggleGrid: () => set((s) => ({ config: { ...s.config, showGrid: !s.config.showGrid } })),
  toggleMinimap: () => set((s) => ({ minimap: { ...s.minimap, visible: !s.minimap.visible } })),
}));
