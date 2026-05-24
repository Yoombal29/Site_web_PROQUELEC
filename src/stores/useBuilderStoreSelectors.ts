import { shallow } from 'zustand/shallow';
import { useBuilderStore } from './useBuilderStore';
import type { Block, BlockStyle, BlockContent } from '@/types/builder';

const findBlockRecursive = (id: string | null, blocks: Block[] = []): Block | null => {
  if (!id) return null;
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children && b.children.length) {
      const found = findBlockRecursive(id, b.children);
      if (found) return found;
    }
  }
  return null;
};

export const useSelectedBlock = (): Block | null =>
  useBuilderStore((s) => findBlockRecursive(s.selectedBlockId, s.blocks) ?? null);

export const useBlockStyle = () =>
  useBuilderStore((s) => findBlockRecursive(s.selectedBlockId, s.blocks)?.style) as BlockStyle | undefined;

export const useBlockContent = () =>
  useBuilderStore((s) => findBlockRecursive(s.selectedBlockId, s.blocks)?.content) as BlockContent | undefined;

// Actions
export const useUpdateBlockStyle = () => useBuilderStore((s) => s.updateBlockStyle);
export const useUpdateBlockContent = () => useBuilderStore((s) => s.updateBlockContent);
export const useRemoveBlock = () => useBuilderStore((s) => s.removeBlock);
export const useSaveTemplate = () => useBuilderStore((s) => s.saveTemplate);
export const useSelectedBlockId = () => useBuilderStore((s) => s.selectedBlockId);

