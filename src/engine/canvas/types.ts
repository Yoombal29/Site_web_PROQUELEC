/** Camera position and zoom on the infinite canvas */
export interface CanvasTransform {
  x: number;
  y: number;
  zoom: number;
}

/** Config for the infinite canvas behavior */
export interface CanvasConfig {
  /** Min zoom level (default: 0.1) */
  minZoom: number;
  /** Max zoom level (default: 5) */
  maxZoom: number;
  /** Zoom step per scroll/tick (default: 0.1) */
  zoomStep: number;
  /** Grid spacing in logical px at zoom=1 (default: 100) */
  gridSize: number;
  /** Whether to show the background grid */
  showGrid: boolean;
  /** Background color outside the grid */
  backgroundColor: string;
  /** Grid line color */
  gridColor: string;
  /** Whether pan inertia is enabled */
  enableInertia: boolean;
  /** Inertia decay factor (0–1, default: 0.95) */
  inertiaDecay: number;
}

export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  minZoom: 0.1,
  maxZoom: 5,
  zoomStep: 0.1,
  gridSize: 100,
  showGrid: true,
  backgroundColor: '#f1f5f9',
  gridColor: '#e2e8f0',
  enableInertia: true,
  inertiaDecay: 0.95,
};

/** Minimap display config */
export interface MinimapConfig {
  /** Minimap width in px */
  width: number;
  /** Minimap height in px */
  height: number;
  /** Minimap position (bottom-left vs bottom-right) */
  position: 'bottom-left' | 'bottom-right';
  /** Whether minimap is visible */
  visible: boolean;
  /** Opacity of the minimap background */
  backgroundOpacity: number;
}

export const DEFAULT_MINIMAP_CONFIG: MinimapConfig = {
  width: 180,
  height: 120,
  position: 'bottom-right',
  visible: true,
  backgroundOpacity: 0.85,
};

/** Overall canvas state persisted in store */
export interface CanvasState {
  transform: CanvasTransform;
  config: CanvasConfig;
  minimap: MinimapConfig;
}
