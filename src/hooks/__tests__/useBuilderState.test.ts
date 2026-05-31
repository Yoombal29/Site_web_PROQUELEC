/**
 * Unit Tests for useBuilderState Hook (Vitest version)
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBuilderState } from '../useBuilderState';
import { useBuilderStore } from '@/stores/useBuilderStore';

// Mock the store using Vitest mock API
vi.mock('@/stores/useBuilderStore', () => ({
  useBuilderStore: vi.fn(),
}));

describe('useBuilderState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return builder state', () => {
    const mockStore = {
      blocks: [],
      selectedBlockId: null,
      pageMetadata: {},
      templates: [],
      history: [],
      historyIndex: -1,
      setBlocks: vi.fn(),
      addBlock: vi.fn(),
      importBlock: vi.fn(),
      moveBlock: vi.fn(),
      selectBlock: vi.fn(),
      setPageMetadata: vi.fn(),
      updateBlockStyle: vi.fn(),
      updateBlockContent: vi.fn(),
      removeBlock: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: vi.fn(() => false),
      canRedo: vi.fn(() => false),
      snapshotHistory: vi.fn(),
      saveTemplate: vi.fn(),
      deleteTemplate: vi.fn(),
      loadTemplates: vi.fn()
    };

    (useBuilderStore as any).mockReturnValue(mockStore);

    const { result } = renderHook(() => useBuilderState());

    expect(result.current.blocks).toEqual([]);
    expect(result.current.selectedBlockId).toBeNull();
    expect(result.current.pageMetadata).toEqual({});
    expect(result.current.templates).toEqual([]);
  });

  it('should call setBlocks when setBlocks is called', () => {
    const mockSetBlocks = vi.fn();
    const mockStore = {
      blocks: [],
      selectedBlockId: null,
      pageMetadata: {},
      templates: [],
      history: [],
      historyIndex: -1,
      setBlocks: mockSetBlocks,
      addBlock: vi.fn(),
      importBlock: vi.fn(),
      moveBlock: vi.fn(),
      selectBlock: vi.fn(),
      setPageMetadata: vi.fn(),
      updateBlockStyle: vi.fn(),
      updateBlockContent: vi.fn(),
      removeBlock: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: vi.fn(() => false),
      canRedo: vi.fn(() => false),
      snapshotHistory: vi.fn(),
      saveTemplate: vi.fn(),
      deleteTemplate: vi.fn(),
      loadTemplates: vi.fn()
    };

    (useBuilderStore as any).mockReturnValue(mockStore);

    const { result } = renderHook(() => useBuilderState());

    act(() => {
      result.current.setBlocks([]);
    });

    expect(mockSetBlocks).toHaveBeenCalledWith([]);
  });

  it('should call addBlock when addBlock is called', () => {
    const mockAddBlock = vi.fn();
    const mockStore = {
      blocks: [],
      selectedBlockId: null,
      pageMetadata: {},
      templates: [],
      history: [],
      historyIndex: -1,
      setBlocks: vi.fn(),
      addBlock: mockAddBlock,
      importBlock: vi.fn(),
      moveBlock: vi.fn(),
      selectBlock: vi.fn(),
      setPageMetadata: vi.fn(),
      updateBlockStyle: vi.fn(),
      updateBlockContent: vi.fn(),
      removeBlock: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: vi.fn(() => false),
      canRedo: vi.fn(() => false),
      snapshotHistory: vi.fn(),
      saveTemplate: vi.fn(),
      deleteTemplate: vi.fn(),
      loadTemplates: vi.fn()
    };

    (useBuilderStore as any).mockReturnValue(mockStore);

    const { result } = renderHook(() => useBuilderState());

    act(() => {
      result.current.addBlock('hero', 'hero');
    });

    expect(mockAddBlock).toHaveBeenCalledWith('hero', 'hero');
  });
});
