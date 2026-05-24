import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useBuilderStore } from '@/stores/useBuilderStore';
import BuilderPageRenderer from '@/components/builder/BuilderPageRenderer';
import { BlockErrorBoundary } from '@/components/builder/BlockErrorBoundary';
import { Block } from '@/types/builder';

// Mock ComponentRegistry to avoid full DOM rendering of complex blocks
vi.mock('@/components/builder/ComponentRegistry', () => ({
  ComponentRegistry: {
    hero: ({ content, id }: any) => <div data-testid={`mock-hero-${id}`}>{content?.title || 'No Title'}</div>,
    crash: () => { throw new Error('Simulated Crash'); }
  }
}));

describe('BE Builder Unit Tests', () => {
  beforeEach(() => {
    // Reset Zustand store before each test
    useBuilderStore.setState({
      blocks: [],
      selectedBlockId: null,
      history: [],
      historyIndex: -1
    });
  });

  describe('Store (useBuilderStore)', () => {
    it('should add a block and update history', () => {
      const store = useBuilderStore.getState();
      expect(store.blocks).toHaveLength(0);

      store.addBlock('hero');
      
      const newState = useBuilderStore.getState();
      expect(newState.blocks).toHaveLength(1);
      expect(newState.blocks[0].type).toBe('hero');
      expect(newState.history).toHaveLength(1); // The snapshot of the empty state before adding the block
    });

    it('should update block content without adding to history (live update)', () => {
      const store = useBuilderStore.getState();
      store.addBlock('hero');
      const blockId = useBuilderStore.getState().blocks[0].id;
      
      const stateBeforeUpdate = useBuilderStore.getState();
      const historyLengthBefore = stateBeforeUpdate.history.length;

      stateBeforeUpdate.updateBlockContent(blockId, { title: 'Updated Title' });

      const stateAfterUpdate = useBuilderStore.getState();
      expect(stateAfterUpdate.blocks[0].content.title).toBe('Updated Title');
      expect(stateAfterUpdate.history.length).toBe(historyLengthBefore); // History shouldn't grow on typing
    });
  });

  describe('UI & Robustness (BuilderPageRenderer & BlockErrorBoundary)', () => {
    it('should render blocks with safe defaults when content is undefined', () => {
      const blocks: Block[] = [
        {
          id: 'block-1',
          type: 'hero',
          // content deliberately omitted to test fallback logic
          style: {}
        } as unknown as Block
      ];

      render(<BuilderPageRenderer blocks={blocks} isEditor={true} />);
      
      // Should fallback to 'No Title' defined in our mock, but not crash
      expect(screen.getByTestId('mock-hero-block-1')).toBeInTheDocument();
      expect(screen.getByTestId('mock-hero-block-1')).toHaveTextContent('No Title');
    });

    it('should catch errors in individual blocks without crashing the whole page', () => {
      const blocks: Block[] = [
        {
          id: 'valid-block',
          type: 'hero',
          content: { title: 'Safe Block' },
          style: {}
        },
        {
          id: 'crash-block',
          type: 'crash', // This will throw in our mock
          content: {},
          style: {}
        }
      ];

      // Suppress console.error for the expected React error boundary log
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<BuilderPageRenderer blocks={blocks} isEditor={true} />);
      
      // The valid block should still render
      expect(screen.getByTestId('mock-hero-valid-block')).toHaveTextContent('Safe Block');
      
      // The crashed block should show the Error Boundary UI
      expect(screen.getByText('⚠️ Erreur de rendu (Bloc crash-block)')).toBeInTheDocument();
      expect(screen.getByText('Simulated Crash')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});
