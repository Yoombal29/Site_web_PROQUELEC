import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';


export interface BlockTemplate {
  id: string;
  name: string;
  block: Block;
  thumbnail?: string;
  createdAt: number;
}

interface BuilderState {
  blocks: Block[];
  selectedBlockId: string | null;

  // Undo/Redo
  history: Block[][];
  historyIndex: number;

  // Templates
  templates: BlockTemplate[];

  // Actions
  setBlocks: (blocks: Block[]) => void;
  addBlock: (type: string, parentId?: string, index?: number) => void;
  importBlock: (block: Block, parentId?: string, index?: number) => void;
  moveBlock: (activeId: string, overId: string) => void;
  selectBlock: (id: string | null) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Template Actions
  saveTemplate: (block: Block, name: string) => void;
  deleteTemplate: (templateId: string) => void;
  loadTemplates: () => void;
}

// Helpers
const updateBlockRecursive = (blocks: Block[], id: string, updater: (b: Block) => Block): Block[] => {
  return blocks.map((b) => {
    if (b.id === id) return updater(b);
    if (b.children && b.children.length > 0) {
      return { ...b, children: updateBlockRecursive(b.children, id, updater) };
    }
    return b;
  });
};

const removeBlockRecursive = (blocks: Block[], id: string): Block[] => {
  return blocks.filter((b) => b.id !== id).map((b) => ({
    ...b,
    children: b.children ? removeBlockRecursive(b.children, id) : undefined
  }));
};

const cloneBlock = (block: Block): Block => {
  const newBlock = { ...block, id: uuidv4() };
  if (newBlock.children) {
    newBlock.children = newBlock.children.map((child) => cloneBlock(child));
  }
  return newBlock;
};

// Helper: Save current state to history
const saveHistory = (state: BuilderState): Partial<BuilderState> => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(state.blocks)));

  if (newHistory.length > 20) newHistory.shift(); // Limit to 20 steps

  return {
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  selectedBlockId: null,
  history: [],
  historyIndex: -1,
  templates: [],

  setBlocks: (blocks) => set({ blocks, history: [blocks], historyIndex: 0 }),

  addBlock: (type, parentId, index) => set((state) => {
    const historyUpdate = saveHistory(state);

    const newBlock: Block = {
      id: uuidv4(),
      type,
      content: { title: 'Nouveau Bloc' },
      style: { padding: '20px' },
      children: []
    };

    const newBlocks = [...state.blocks];
    if (typeof index === 'number') {
      newBlocks.splice(index, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    return {
      ...historyUpdate,
      blocks: newBlocks
    };
  }),

  importBlock: (blockTemplate, parentId, index) => set((state) => {
    const historyUpdate = saveHistory(state);
    const newBlock = cloneBlock(blockTemplate);

    const newBlocks = [...state.blocks];
    if (typeof index === 'number') {
      newBlocks.splice(index, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    return {
      ...historyUpdate,
      blocks: newBlocks
    };
  }),

  moveBlock: (activeId, overId) => set((state) => {
    const historyUpdate = saveHistory(state);
    const oldIndex = state.blocks.findIndex((b) => b.id === activeId);
    const newIndex = state.blocks.findIndex((b) => b.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newBlocks = [...state.blocks];
      const [movedBlock] = newBlocks.splice(oldIndex, 1);
      newBlocks.splice(newIndex, 0, movedBlock);
      return {
        ...historyUpdate,
        blocks: newBlocks
      };
    }
    return state;
  }),

  removeBlock: (id) => set((state) => {
    const historyUpdate = saveHistory(state);
    return {
      ...historyUpdate,
      blocks: removeBlockRecursive(state.blocks, id),
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId
    };
  }),

  updateBlockContent: (id, content) => set((state) => {
    const historyUpdate = saveHistory(state);
    return {
      ...historyUpdate,
      blocks: updateBlockRecursive(state.blocks, id, (b) => ({
        ...b,
        content: { ...b.content, ...content }
      }))
    };
  }),

  updateBlockStyle: (id, style) => set((state) => {
    // Optimisation: ne pas sauvegarder l'historique pour chaque pixel de drag/slider si possible
    // Mais pour l'instant on garde simple.
    const historyUpdate = saveHistory(state);
    return {
      ...historyUpdate,
      blocks: updateBlockRecursive(state.blocks, id, (b) => ({
        ...b,
        style: { ...b.style, ...style }
      }))
    };
  }),

  selectBlock: (id) => set({ selectedBlockId: id }),

  // --- Undo / Redo ---
  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      return {
        blocks: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex
      };
    }
    return {};
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      return {
        blocks: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex
      };
    }
    return {};
  }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // --- Template Actions ---
  saveTemplate: (block, name) => {
    const newTemplate: BlockTemplate = {
      id: uuidv4(),
      name,
      block: JSON.parse(JSON.stringify(block)),
      createdAt: Date.now()
    };

    set((state) => {
      const updatedTemplates = [...state.templates, newTemplate];
      localStorage.setItem('builder_templates', JSON.stringify(updatedTemplates));
      return { templates: updatedTemplates };
    });
  },

  deleteTemplate: (templateId) => {
    set((state) => {
      const updatedTemplates = state.templates.filter((t) => t.id !== templateId);
      localStorage.setItem('builder_templates', JSON.stringify(updatedTemplates));
      return { templates: updatedTemplates };
    });
  },

  loadTemplates: () => {
    const stored = localStorage.getItem('builder_templates');
    if (stored) {
      try {
        set({ templates: JSON.parse(stored) });
      } catch (e) {
        console.error("Failed to load templates", e);
      }
    }
  }
}));