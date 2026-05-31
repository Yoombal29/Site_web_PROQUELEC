/**
 * useSchematicStore.ts
 * Store Zustand dédié au moteur de rendu schématique.
 *
 * Règle d'or : les positions X/Y des éléments ne sont JAMAIS mises à jour
 * pendant le drag (onDragMove). Elles sont synchronisées uniquement au dragEnd,
 * ce qui évite toute cascade de re-renders React pendant le déplacement.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/* =========================================================
   TYPES
========================================================= */

export type ElementType =
  | 'rect'
  | 'circle'
  | 'text'
  | 'image'
  | 'wire'
  | 'switch'
  | 'breaker'
  | 'socket'
  | 'light'
  | 'motor'
  | 'transformer'
  | 'capacitor'
  | 'resistor'
  | 'ground'
  | 'bus';

export interface Anchor {
  id: string;
  x: number; // relatif au centre de l'élément
  y: number;
}

export interface SchematicElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label?: string;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  props?: Record<string, unknown>;
  anchors?: Anchor[];
}

export interface WireConnection {
  id: string;
  fromElementId: string;
  fromAnchorId: string;
  toElementId: string;
  toAnchorId: string;
  points: number[]; // [x1, y1, x2, y2, ...]
}

export interface SchematicState {
  // --- Canvas State ---
  elements: Record<string, SchematicElement>;
  connections: WireConnection[];
  selectedId: string | null;
  hoveredId: string | null;

  // --- Viewport ---
  zoom: number;
  panX: number;
  panY: number;

  // --- History (Undo/Redo) ---
  past: Array<Record<string, SchematicElement>>;
  future: Array<Record<string, SchematicElement>>;

  // --- Actions ---
  addElement: (element: SchematicElement) => void;
  removeElement: (id: string) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateElementProps: (id: string, props: Partial<SchematicElement>) => void;
  selectElement: (id: string | null) => void;
  hoverElement: (id: string | null) => void;

  addConnection: (connection: WireConnection) => void;
  removeConnection: (id: string) => void;

  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetViewport: () => void;

  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  clearAll: () => void;
}

/* =========================================================
   STORE
========================================================= */

export const useSchematicStore = create<SchematicState>()(
  subscribeWithSelector((set, get) => ({
    // --- Initial State ---
    elements: {},
    connections: [],
    selectedId: null,
    hoveredId: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    past: [],
    future: [],

    // --- Element Actions ---
    addElement: (element) => {
      const prev = get().elements;
      set((state) => ({
        elements: { ...state.elements, [element.id]: element },
        past: [...state.past, prev],
        future: [],
      }));
    },

    removeElement: (id) => {
      const prev = get().elements;
      set((state) => {
        const next = { ...state.elements };
        delete next[id];
        return {
          elements: next,
          selectedId: state.selectedId === id ? null : state.selectedId,
          connections: state.connections.filter(
            (c) => c.fromElementId !== id && c.toElementId !== id
          ),
          past: [...state.past, prev],
          future: [],
        };
      });
    },

    /**
     * CRITIQUE : appelé uniquement au dragEnd, jamais au dragMove.
     * Cela évite tout cycle de rendu React pendant le drag.
     */
    updateElementPosition: (id, x, y) => {
      const prev = get().elements;
      set((state) => ({
        elements: {
          ...state.elements,
          [id]: { ...state.elements[id], x, y },
        },
        past: [...state.past, prev],
        future: [],
      }));
    },

    updateElementProps: (id, props) => {
      const prev = get().elements;
      set((state) => ({
        elements: {
          ...state.elements,
          [id]: { ...state.elements[id], ...props },
        },
        past: [...state.past, prev],
        future: [],
      }));
    },

    selectElement: (id) => set({ selectedId: id }),
    hoverElement: (id) => set({ hoveredId: id }),

    // --- Connection Actions ---
    addConnection: (connection) => {
      set((state) => ({
        connections: [...state.connections, connection],
      }));
    },
    removeConnection: (id) => {
      set((state) => ({
        connections: state.connections.filter((c) => c.id !== id),
      }));
    },

    // --- Viewport ---
    setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.1), 5) }),
    setPan: (panX, panY) => set({ panX, panY }),
    resetViewport: () => set({ zoom: 1, panX: 0, panY: 0 }),

    // --- History ---
    undo: () => {
      const { past, elements } = get();
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, -1);
      set({ elements: previous, past: newPast, future: [elements, ...get().future] });
    },
    redo: () => {
      const { future, elements } = get();
      if (future.length === 0) return;
      const next = future[0];
      const newFuture = future.slice(1);
      set({ elements: next, future: newFuture, past: [...get().past, elements] });
    },
    clearHistory: () => set({ past: [], future: [] }),

    clearAll: () =>
      set({ elements: {}, connections: [], selectedId: null, past: [], future: [] }),
  }))
);
