import { create } from 'zustand';

interface BuilderUiState {
  viewport: 'desktop' | 'tablet' | 'mobile';
  hoveredNodeId: string | null;
  lockedNodes: Record<string, boolean>;
  hiddenNodes: Record<string, boolean>;
  collapsedLayers: Record<string, boolean>;
  setViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
  setHoveredNodeId: (id: string | null) => void;
  toggleLockNode: (id: string) => void;
  setNodeLocked: (id: string, locked: boolean) => void;
  toggleHideNode: (id: string) => void;
  setNodeHidden: (id: string, hidden: boolean) => void;
  toggleCollapseLayer: (id: string) => void;
  setLayerCollapsed: (id: string, collapsed: boolean) => void;
  resetUiState: () => void;
}

export const useBuilderUiStore = create<BuilderUiState>((set) => ({
  viewport: 'desktop',
  hoveredNodeId: null,
  lockedNodes: {},
  hiddenNodes: {},
  collapsedLayers: {},
  setViewport: (viewport) => set({ viewport }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  toggleLockNode: (id) =>
    set((state) => ({
      lockedNodes: {
        ...state.lockedNodes,
        [id]: !state.lockedNodes[id],
      },
    })),
  setNodeLocked: (id, locked) =>
    set((state) => ({
      lockedNodes: {
        ...state.lockedNodes,
        [id]: locked,
      },
    })),
  toggleHideNode: (id) =>
    set((state) => ({
      hiddenNodes: {
        ...state.hiddenNodes,
        [id]: !state.hiddenNodes[id],
      },
    })),
  setNodeHidden: (id, hidden) =>
    set((state) => ({
      hiddenNodes: {
        ...state.hiddenNodes,
        [id]: hidden,
      },
    })),
  toggleCollapseLayer: (id) =>
    set((state) => ({
      collapsedLayers: {
        ...state.collapsedLayers,
        [id]: !state.collapsedLayers[id],
      },
    })),
  setLayerCollapsed: (id, collapsed) =>
    set((state) => ({
      collapsedLayers: {
        ...state.collapsedLayers,
        [id]: collapsed,
      },
    })),
  resetUiState: () =>
    set({
      viewport: 'desktop',
      hoveredNodeId: null,
      lockedNodes: {},
      hiddenNodes: {},
      collapsedLayers: {},
    }),
}));
