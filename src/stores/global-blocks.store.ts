import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GlobalBlock {
  id: string;
  name: string;
  serializedNode: any;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface GlobalBlocksState {
  blocks: GlobalBlock[];
  addBlock: (block: Omit<GlobalBlock, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBlock: (id: string, updates: Partial<GlobalBlock>) => void;
  removeBlock: (id: string) => void;
  getBlock: (id: string) => GlobalBlock | undefined;
}

export const useGlobalBlocksStore = create<GlobalBlocksState>()(
  persist(
    (set, get) => ({
      blocks: [],
      addBlock: (block) => set((state) => ({
        blocks: [...state.blocks, {
          ...block,
          id: 'gb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
      })),
      updateBlock: (id, updates) => set((state) => ({
        blocks: state.blocks.map((b) =>
          b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
        ),
      })),
      removeBlock: (id) => set((state) => ({
        blocks: state.blocks.filter((b) => b.id !== id),
      })),
      getBlock: (id) => get().blocks.find((b) => b.id === id),
    }),
    { name: 'proquelec-global-blocks' }
  )
);
