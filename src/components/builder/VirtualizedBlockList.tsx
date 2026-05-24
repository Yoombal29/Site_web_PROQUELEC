/**
 * Virtualized Block List Component
 * Simple virtualization implementation for large block lists
 * Falls back to regular rendering if virtualization is not needed
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
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
 * Simple virtualized list implementation
 * Only renders visible blocks based on scroll position
 */
export const VirtualizedBlockList: React.FC<VirtualizedBlockListProps> = ({
  blocks,
  height,
  itemHeight,
  isEditor = false,
  selectedId,
  onSelect
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
    const endIndex = Math.min(blocks.length - 1, Math.floor((scrollTop + height) / itemHeight) + 2);
    return { startIndex, endIndex };
  }, [scrollTop, height, itemHeight, blocks.length]);

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Only render visible blocks
  const visibleBlocks = useMemo(() => {
    return blocks.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [blocks, visibleRange]);

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-slate-300 border-2 border-dashed border-slate-100 rounded-lg">
        <p className="text-lg font-medium text-slate-400">La page est vide</p>
        <p className="text-sm">Glissez un élément ou un modèle depuis la barre latérale.</p>
      </div>
    );
  }

  // For small lists, render all blocks without virtualization
  if (blocks.length < 20) {
    return (
      <div className="space-y-4">
        {blocks.map((block) => {
          const BlockComponent = ComponentRegistry[block.type];
          if (!BlockComponent) return null;

          return (
            <BlockErrorBoundary key={block.id} blockId={block.id}>
              <BlockComponent
                {...block}
                isEditor={isEditor}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            </BlockErrorBoundary>
          );
        })}
      </div>
    );
  }

  // For large lists, use simple virtualization
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height, overflowY: 'auto' }}
      className="relative"
    >
      {/* Spacer for total height */}
      <div style={{ height: blocks.length * itemHeight }} />
      
      {/* Visible items */}
      {visibleBlocks.map((block, index) => {
        const actualIndex = visibleRange.startIndex + index;
        const BlockComponent = ComponentRegistry[block.type];
        
        if (!BlockComponent) return null;

        return (
          <div
            key={block.id}
            style={{
              position: 'absolute',
              top: actualIndex * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
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
      })}
    </div>
  );
};
