/**
 * Unit Tests for useBuilderState Hook
 */

import { renderHook, act } from '@testing-library/react';
import { useBuilderState } from '../useBuilderState';
import { useBuilderStore } from '@/stores/useBuilderStore';

// Mock the store
jest.mock('@/stores/useBuilderStore');

describe('useBuilderState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return builder state', () => {
    const mockStore = {
      blocks: [],
      selectedBlockId: null,
      pageMetadata: {},
      templates: [],
      history: [],
      historyIndex: -1,
      setBlocks: jest.fn(),
      addBlock: jest.fn(),
      importBlock: jest.fn(),
      moveBlock: jest.fn(),
      selectBlock: jest.fn(),
      setPageMetadata: jest.fn(),
      updateBlockStyle: jest.fn(),
      updateBlockContent: jest.fn(),
      removeBlock: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
      canUndo: jest.fn(() => false),
      canRedo: jest.fn(() => false),
      snapshotHistory: jest.fn(),
      saveTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
      loadTemplates: jest.fn()
    };

    (useBuilderStore as unknown as jest.Mock).mockReturnValue(mockStore);

    const { result } = renderHook(() => useBuilderState());

    expect(result.current.blocks).toEqual([]);
    expect(result.current.selectedBlockId).toBeNull();
    expect(result.current.pageMetadata).toEqual({});
    expect(result.current.templates).toEqual([]);
  });

  it('should call setBlocks when setBlocks is called', () => {
    const mockSetBlocks = jest.fn();
    const mockStore = {
      blocks: [],
      selectedBlockId: null,
      pageMetadata: {},
      templates: [],
      history: [],
      historyIndex: -1,
      setBlocks: mockSetBlocks,
      addBlock: jest.fn(),
      importBlock: jest.fn(),
      moveBlock: jest.fn(),
      selectBlock: jest.fn(),
      setPageMetadata: jest.fn(),
      updateBlockStyle: jest.fn(),
      updateBlockContent: jest.fn(),
      removeBlock: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
      canUndo: jest.fn(() => false),
      canRedo: jest.fn(() => false),
      snapshotHistory: jest.fn(),
      saveTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
      loadTemplates: jest.fn()
    };

    (useBuilderStore as unknown as jest.Mock).mockReturnValue(mockStore);

    const { result } = renderHook(() => useBuilderState());

    act(() => {
      result.current.setBlocks([]);
    });

    expect(mockSetBlocks).toHaveBeenCalledWith([]);
  });

  it('should call addBlock when addBlock is called', () => {
    const mockAddBlock = jest.fn();
    const mockStore = {
      blocks: [],
      selectedBlockId: null,
      pageMetadata: {},
      templates: [],
      history: [],
      historyIndex: -1,
      setBlocks: jest.fn(),
      addBlock: mockAddBlock,
      importBlock: jest.fn(),
      moveBlock: jest.fn(),
      selectBlock: jest.fn(),
      setPageMetadata: jest.fn(),
      updateBlockStyle: jest.fn(),
      updateBlockContent: jest.fn(),
      removeBlock: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
      canUndo: jest.fn(() => false),
      canRedo: jest.fn(() => false),
      snapshotHistory: jest.fn(),
      saveTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
      loadTemplates: jest.fn()
    };

    (useBuilderStore as unknown as jest.Mock).mockReturnValue(mockStore);

    const { result } = renderHook(() => useBuilderState());

    act(() => {
      result.current.addBlock('hero', 'hero');
    });

    expect(mockAddBlock).toHaveBeenCalledWith('hero', 'hero');
  });
});
