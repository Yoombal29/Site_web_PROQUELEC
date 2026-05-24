/**
 * Virtualized Block List Component
 * Uses react-window for efficient rendering of large block lists
 */

import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import type { Block } from '@/types/builder';
import { BlockErrorBoundary } from './BlockErrorBoundary';
import { ComponentRegistry } from './ComponentRegistry';

interface VirtualizedBlockListProps {
  blocks: Block[];
  height: number;
  itemHeight: number;
  isEditor?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

/**
 * Row component for virtualized list
 */
const BlockRow = ({ index, style, data }: { index: number; style: React.CSSProperties; data: any }) => {
  const { blocks, isEditor, selectedId, onSelect } = data;
  const block = blocks[index];

  if (!block) return null;

  const BlockComponent = ComponentRegistry[block.type];

  if (!BlockComponent) {
    return (
      <div style={style} className="p-4 border border-red-200 bg-red-50">
        <p className="text-red-600">Unknown block type: {block.type}</p>
      </div>
    );
  }

  return (
    <div style={style}>
      <BlockErrorBoundary blockId={block.id}>
        <BlockComponent
          {...block}
          isEditor={isEditor}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </BlockErrorBoundary>
    </div>
  );
};

/**
 * Virtualized Block List Component
 * Optimizes rendering for large block lists by only rendering visible items
 */
export const VirtualizedBlockList: React.FC<VirtualizedBlockListProps> = ({
  blocks,
  height,
  itemHeight,
  isEditor = false,
  selectedId,
  onSelect
}) => {
  const itemData = useMemo(() => ({ blocks, isEditor, selectedId, onSelect }), [blocks, isEditor, selectedId, onSelect]);

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-slate-300 border-2 border-dashed border-slate-100 rounded-lg">
        <p className="text-lg font-medium text-slate-400">La page est vide</p>
        <p className="text-sm">Glissez un élément ou un modèle depuis la barre latérale.</p>
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={blocks.length}
      itemSize={itemHeight}
      itemData={itemData}
      width="100%"
    >
      {BlockRow}
    </List>
  );
};
