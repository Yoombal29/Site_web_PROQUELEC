import { useBuilderStore } from './useBuilderStore';
import { useShallow } from 'zustand/react/shallow';
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

// Retourne uniquement l'ID — très léger, pas de re-render inutile
export const useSelectedBlockId = () => useBuilderStore((s) => s.selectedBlockId);

// Retourne les champs clés du bloc sélectionné via useShallow pour éviter les re-renders inutiles.
// On retourne un objet avec les champs pertinents plutôt que le bloc entier.
export const useSelectedBlock = (): Block | null => {
  const block = useBuilderStore(
    useShallow((s) => {
      const b = findBlockRecursive(s.selectedBlockId, s.blocks);
      if (!b) return null;
      // Retourner une copie shallow pour que Zustand compare champ par champ
      return {
        id: b.id,
        type: b.type,
        content: b.content,
        style: b.style,
        children: b.children,
        enabled: b.enabled,
      } as Block;
    })
  );
  return block;
};

// Selector optimisé pour le style — ne re-rendre que si le style change
export const useBlockStyle = (): BlockStyle | undefined =>
  useBuilderStore(
    useShallow((s) => findBlockRecursive(s.selectedBlockId, s.blocks)?.style as BlockStyle | undefined)
  );

// Selector optimisé pour le contenu — ne re-rendre que si le contenu change
export const useBlockContent = (): BlockContent | undefined =>
  useBuilderStore(
    useShallow((s) => findBlockRecursive(s.selectedBlockId, s.blocks)?.content as BlockContent | undefined)
  );

// Actions (les actions Zustand sont stables, pas besoin de shallow)
export const useUpdateBlockStyle = () => useBuilderStore((s) => s.updateBlockStyle);
export const useUpdateBlockContent = () => useBuilderStore((s) => s.updateBlockContent);
export const useRemoveBlock = () => useBuilderStore((s) => s.removeBlock);
export const useSaveTemplate = () => useBuilderStore((s) => s.saveTemplate);
