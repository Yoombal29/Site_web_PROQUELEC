import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MousePointer2 } from 'lucide-react';
import { useBuilderStore } from '@/stores/useBuilderStore';
import BuilderPageRenderer from './BuilderPageRenderer';
import type { Block } from '@/types/builder';

interface BuilderCanvasProps {
  blocks: Block[];
  widthClass: string;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({ blocks, widthClass }) => {
  const { isOver, setNodeRef } = useDroppable({ id: 'canvas-droppable' });
  const { selectedBlockId, selectBlock } = useBuilderStore();

  const overClasses = isOver ? 'border-blue-400 shadow-lg' : 'border-slate-200';

  // Memoize block IDs to prevent recalculation on every render
  // Optimized to use array mutation instead of spread for better performance
  const sortableItems = useMemo(() => {
    const getAllBlockIds = (nodes: Block[], result: string[] = []): string[] => {
      for (const node of nodes) {
        result.push(node.id);
        if (node.children?.length) {
          getAllBlockIds(node.children, result);
        }
      }
      return result;
    };
    return getAllBlockIds(blocks);
  }, [blocks]);

  return (
    <div
      ref={setNodeRef}
      className={`${widthClass} w-full min-h-[800px] bg-white shadow-xl rounded-sm border-2 ${overClasses} transition-all p-8 shrink-0 click-outside-handler pb-32`}
      onClick={(e) => {
        if (e.target === e.currentTarget && selectedBlockId) {
          selectBlock(null);
        }
      }}>
      
      <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
        {blocks.length > 0 ? (
          <BuilderPageRenderer
            blocks={blocks}
            isEditor={true}
            selectedId={selectedBlockId}
            onSelect={selectBlock}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-slate-300 border-2 border-dashed border-slate-100 rounded-lg">
            <MousePointer2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-slate-400">La page est vide</p>
            <p className="text-sm">Glissez un élément ou un modèle depuis la barre latérale.</p>
          </div>
        )}
      </SortableContext>
    </div>
  );
};
