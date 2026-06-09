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

// React.memo avec comparateur profond sur les IDs + widthClass
// Empêche le canvas de re-rendre quand pageData change mais que les blocs restent identiques
export const BuilderCanvas: React.FC<BuilderCanvasProps> = React.memo(
  ({ blocks, widthClass }) => {
    const { isOver, setNodeRef } = useDroppable({ id: 'canvas-droppable' });
    const { selectedBlockId, selectBlock } = useBuilderStore();

    const overClasses = isOver ? 'border-blue-400 shadow-lg' : 'border-slate-200';

    const sortableItems = useMemo(() => blocks.map(b => b.id), [blocks]);

    return (
      <div
        ref={setNodeRef}
        data-testid="builder-canvas"
        className={`${widthClass} mx-auto mt-12 w-full min-h-[800px] bg-white shadow-xl rounded-sm border-2 ${overClasses} transition-all p-8 shrink-0 click-outside-handler pb-32`}
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
  },
  // Comparateur : ne re-rendre que si la largeur, la longueur des blocs ou les IDs des blocs ont changé
  (prevProps, nextProps) => {
    if (prevProps.widthClass !== nextProps.widthClass) {
      return false;
    }

    if (prevProps.blocks.length !== nextProps.blocks.length) {
      return false;
    }

    for (let i = 0; i < prevProps.blocks.length; i++) {
      if (prevProps.blocks[i].id !== nextProps.blocks[i].id) {
        return false;
      }
    }

    return true;
  }
);
