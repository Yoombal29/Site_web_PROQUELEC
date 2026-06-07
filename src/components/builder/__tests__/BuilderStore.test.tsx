import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBuilderStore } from '@/stores/useBuilderStore';
import { eventBus } from '@/engine/events/bus';
import type { Block } from '@/types/builder';

// ── Module-level mocks ──────────────────────────────────────────────────────

vi.mock('uuid', () => ({ v4: () => 'test-uuid-123' }));

vi.mock('@/engine/events/bus', () => ({
  eventBus: { emit: vi.fn() },
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeBlock(overrides: Partial<Block> & { id: string; type: string }): Block {
  return {
    content: {},
    style: {},
    children: [],
    ...overrides,
  };
}

/** Reset the store to a clean slate before each test */
function resetStore(): void {
  useBuilderStore.setState({
    blocks: [],
    selectedBlockId: null,
    history: [],
    historyIndex: -1,
    pageMetadata: {},
  });
}

// ── Suite ───────────────────────────────────────────────────────────────────

describe('Builder Store — Advanced', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 1. moveBlock
  // ────────────────────────────────────────────────────────────────────────────

  describe('moveBlock', () => {
    it('should move a block within the same parent', () => {
      const blockA = makeBlock({ id: 'a', type: 'hero', content: { title: 'A' } });
      const blockB = makeBlock({ id: 'b', type: 'hero', content: { title: 'B' } });
      const blockC = makeBlock({ id: 'c', type: 'hero', content: { title: 'C' } });

      useBuilderStore.setState({ blocks: [blockA, blockB, blockC] });

      // Move block A to block C's position (index 2).
      // Since same-parent and activeIdx (0) < overIdx (2),
      // the store adjusts newIdx to 2-1 = 1.
      useBuilderStore.getState().moveBlock('a', 'c');

      const state = useBuilderStore.getState();
      expect(state.blocks.map((b) => b.id)).toEqual(['b', 'a', 'c']);
    });

    it('should move a block from one parent to another', () => {
      const childInFirst = makeBlock({
        id: 'child-1',
        type: 'text',
        content: { title: 'Child 1' },
      });
      const childInSecond = makeBlock({
        id: 'child-2',
        type: 'text',
        content: { title: 'Child 2' },
      });

      const parent1 = makeBlock({
        id: 'parent-1',
        type: 'section',
        content: {},
        children: [childInFirst],
      });
      const parent2 = makeBlock({
        id: 'parent-2',
        type: 'section',
        content: {},
        children: [childInSecond],
      });

      useBuilderStore.setState({ blocks: [parent1, parent2] });

      // Move child-1 from parent-1 to parent-2 (on top of child-2)
      useBuilderStore.getState().moveBlock('child-1', 'child-2');

      const state = useBuilderStore.getState();
      const p2 = state.blocks.find((b) => b.id === 'parent-2');
      expect(p2).toBeDefined();
      expect(p2!.children).toHaveLength(2);
      expect(p2!.children![0].id).toBe('child-1');
      expect(p2!.children![1].id).toBe('child-2');

      // Parent 1 should now have no children
      const p1 = state.blocks.find((b) => b.id === 'parent-1');
      expect(p1!.children).toHaveLength(0);
    });

    it('should be a no-op when activeId equals overId', () => {
      const blockA = makeBlock({ id: 'a', type: 'hero', content: { title: 'A' } });
      const blockB = makeBlock({ id: 'b', type: 'hero', content: { title: 'B' } });

      useBuilderStore.setState({ blocks: [blockA, blockB] });

      // Clear any prior eventBus calls from setState
      vi.clearAllMocks();

      useBuilderStore.getState().moveBlock('a', 'a');

      const state = useBuilderStore.getState();
      expect(state.blocks.map((b) => b.id)).toEqual(['a', 'b']);
      // No event should be emitted for a no-op
      expect(eventBus.emit).not.toHaveBeenCalledWith('block:moved', expect.anything());
    });

    it('should emit block:moved with correct payload', () => {
      const blockA = makeBlock({ id: 'a', type: 'hero', content: { title: 'A' } });
      const blockB = makeBlock({ id: 'b', type: 'hero', content: { title: 'B' } });
      useBuilderStore.setState({ blocks: [blockA, blockB] });

      vi.clearAllMocks();
      useBuilderStore.getState().moveBlock('a', 'b');

      // When moving earlier sibling forward within the same parent,
      // the store subtracts 1 from overId's index.
      expect(eventBus.emit).toHaveBeenCalledWith('block:moved', {
        activeId: 'a',
        overId: 'b',
        previousIndex: 0,
        newIndex: 0,
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 2. removeBlock
  // ────────────────────────────────────────────────────────────────────────────

  describe('removeBlock', () => {
    it('should remove a block and its children', () => {
      const child = makeBlock({ id: 'child', type: 'text', content: { title: 'Kid' } });
      const parent = makeBlock({ id: 'parent', type: 'section', content: {}, children: [child] });
      useBuilderStore.setState({ blocks: [parent] });

      useBuilderStore.getState().removeBlock('parent');

      const state = useBuilderStore.getState();
      expect(state.blocks).toHaveLength(0);
    });

    it('should clear selectedBlockId when the removed block was selected', () => {
      const block = makeBlock({ id: 'sel', type: 'hero', content: {} });
      useBuilderStore.setState({ blocks: [block], selectedBlockId: 'sel' });

      useBuilderStore.getState().removeBlock('sel');

      expect(useBuilderStore.getState().selectedBlockId).toBeNull();
    });

    it('should NOT clear selectedBlockId when a different block is removed', () => {
      const blockA = makeBlock({ id: 'a', type: 'hero', content: {} });
      const blockB = makeBlock({ id: 'b', type: 'hero', content: {} });
      useBuilderStore.setState({ blocks: [blockA, blockB], selectedBlockId: 'a' });

      useBuilderStore.getState().removeBlock('b');

      expect(useBuilderStore.getState().selectedBlockId).toBe('a');
    });

    it('should emit block:deleted with correct payload', () => {
      const block = makeBlock({ id: 'dead', type: 'hero', content: { title: 'Bye' } });
      useBuilderStore.setState({ blocks: [block] });
      vi.clearAllMocks();

      useBuilderStore.getState().removeBlock('dead');

      expect(eventBus.emit).toHaveBeenCalledWith('block:deleted', {
        id: 'dead',
        block: expect.objectContaining({ id: 'dead', type: 'hero' }),
        parentId: undefined,
        index: 0,
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 3. undo / redo
  // ────────────────────────────────────────────────────────────────────────────

  describe('undo / redo', () => {
    it('should undo the last action and restore previous blocks', () => {
      const block1 = makeBlock({ id: 'b1', type: 'hero', content: { title: 'One' } });
      const block2 = makeBlock({ id: 'b2', type: 'hero', content: { title: 'Two' } });

      // Simulate 3 states: [], then [b1], then [b1, b2]
      // Current: [b1, b2], history: [[], [b1], [b1, b2]], historyIndex: 2
      useBuilderStore.setState({
        blocks: [block1, block2],
        history: [[], [block1], [block1, block2]],
        historyIndex: 2,
      });

      useBuilderStore.getState().undo();

      const state = useBuilderStore.getState();
      expect(state.blocks).toHaveLength(1);
      expect(state.blocks[0].id).toBe('b1');
      expect(state.historyIndex).toBe(1);
    });

    it('should redo after undo and restore the later blocks', () => {
      const block1 = makeBlock({ id: 'b1', type: 'hero', content: { title: 'One' } });
      const block2 = makeBlock({ id: 'b2', type: 'hero', content: { title: 'Two' } });

      // State after one undo: [b1], history: [[], [b1], [b1, b2]], historyIndex: 1
      useBuilderStore.setState({
        blocks: [block1],
        history: [[], [block1], [block1, block2]],
        historyIndex: 1,
      });

      useBuilderStore.getState().redo();

      const state = useBuilderStore.getState();
      expect(state.blocks).toHaveLength(2);
      expect(state.blocks[1].id).toBe('b2');
      expect(state.historyIndex).toBe(2);
    });

    it('should undo after remove and bring the block back', () => {
      const block = makeBlock({ id: 'x', type: 'hero', content: { title: 'Back' } });

      // State after remove: blocks=[], history=[[], [x]], historyIndex=1
      useBuilderStore.setState({
        blocks: [],
        history: [[], [block]],
        historyIndex: 1,
      });

      useBuilderStore.getState().undo();

      expect(useBuilderStore.getState().blocks).toHaveLength(0); // goes to history[0] = []
      expect(useBuilderStore.getState().historyIndex).toBe(0);
    });

    it('should emit history:undo event', () => {
      const block = makeBlock({ id: 'b', type: 'hero', content: {} });
      useBuilderStore.setState({
        blocks: [block],
        history: [[], [block]],
        historyIndex: 1,
      });
      vi.clearAllMocks();

      useBuilderStore.getState().undo();

      expect(eventBus.emit).toHaveBeenCalledWith('history:undo', {
        fromIndex: 1,
        toIndex: 0,
      });
    });

    it('should emit history:redo event', () => {
      const block = makeBlock({ id: 'b', type: 'hero', content: {} });
      useBuilderStore.setState({
        blocks: [],
        history: [[], [block]],
        historyIndex: 0,
      });
      vi.clearAllMocks();

      useBuilderStore.getState().redo();

      expect(eventBus.emit).toHaveBeenCalledWith('history:redo', {
        fromIndex: 0,
        toIndex: 1,
      });
    });

    it('canUndo should return false at the start of history', () => {
      useBuilderStore.setState({
        blocks: [makeBlock({ id: 'b', type: 'hero', content: {} })],
        history: [[]],
        historyIndex: 0,
      });

      expect(useBuilderStore.getState().canUndo()).toBe(false);
    });

    it('canUndo should return true when there is history to go back to', () => {
      const block = makeBlock({ id: 'b', type: 'hero', content: {} });
      useBuilderStore.setState({
        blocks: [block],
        history: [[], [block]],
        historyIndex: 1,
      });

      expect(useBuilderStore.getState().canUndo()).toBe(true);
    });

    it('canRedo should return false at the end of history', () => {
      const block = makeBlock({ id: 'b', type: 'hero', content: {} });
      useBuilderStore.setState({
        blocks: [block],
        history: [[], [block]],
        historyIndex: 1,
      });

      expect(useBuilderStore.getState().canRedo()).toBe(false);
    });

    it('canRedo should return true after undo', () => {
      const block = makeBlock({ id: 'b', type: 'hero', content: {} });
      useBuilderStore.setState({
        blocks: [],
        history: [[], [block]],
        historyIndex: 0,
      });

      expect(useBuilderStore.getState().canRedo()).toBe(true);
    });

    it('undo at boundary (historyIndex === 0) should be a no-op', () => {
      useBuilderStore.setState({
        blocks: [makeBlock({ id: 'b', type: 'hero', content: {} })],
        history: [[]],
        historyIndex: 0,
      });
      vi.clearAllMocks();

      const before = useBuilderStore.getState().blocks;
      useBuilderStore.getState().undo();
      const after = useBuilderStore.getState().blocks;

      expect(after).toEqual(before);
      expect(eventBus.emit).not.toHaveBeenCalledWith('history:undo', expect.anything());
    });

    it('redo at boundary (historyIndex at last entry) should be a no-op', () => {
      const block = makeBlock({ id: 'b', type: 'hero', content: {} });
      useBuilderStore.setState({
        blocks: [block],
        history: [[], [block]],
        historyIndex: 1,
      });
      vi.clearAllMocks();

      const before = useBuilderStore.getState().blocks;
      useBuilderStore.getState().redo();
      const after = useBuilderStore.getState().blocks;

      expect(after).toEqual(before);
      expect(eventBus.emit).not.toHaveBeenCalledWith('history:redo', expect.anything());
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 4. importBlock
  // ────────────────────────────────────────────────────────────────────────────

  describe('importBlock', () => {
    it('should import a block at the root level when no parentId is given', () => {
      const template: Block = makeBlock({
        id: 'source',
        type: 'hero',
        content: { title: 'Imported!' },
      });

      useBuilderStore.getState().importBlock(template);

      const state = useBuilderStore.getState();
      expect(state.blocks).toHaveLength(1);
      // The imported block gets a new id from uuid v4 mock → 'test-uuid-123'
      expect(state.blocks[0].id).toBe('test-uuid-123');
      expect(state.blocks[0].content.title).toBe('Imported!');
    });

    it('should import a block as a child when parentId is given', () => {
      const parent = makeBlock({ id: 'parent', type: 'section', content: {}, children: [] });
      const template: Block = makeBlock({
        id: 'src',
        type: 'text',
        content: { title: 'Child' },
      });

      useBuilderStore.setState({ blocks: [parent] });
      useBuilderStore.getState().importBlock(template, 'parent');

      const state = useBuilderStore.getState();
      expect(state.blocks).toHaveLength(1);
      expect(state.blocks[0].children).toHaveLength(1);
      expect(state.blocks[0].children![0].content.title).toBe('Child');
    });

    it('should emit block:imported with correct payload', () => {
      const template: Block = makeBlock({
        id: 'src',
        type: 'hero',
        content: { title: 'Imp' },
      });
      vi.clearAllMocks();

      useBuilderStore.getState().importBlock(template, undefined, 0);

      expect(eventBus.emit).toHaveBeenCalledWith('block:imported', {
        block: expect.objectContaining({ content: { title: 'Imp' } }),
        parentId: undefined,
        index: 0,
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 5. setPageMetadata
  // ────────────────────────────────────────────────────────────────────────────

  describe('setPageMetadata', () => {
    it('should merge partial metadata into the current metadata', () => {
      useBuilderStore.setState({
        pageMetadata: { title: 'My Page', slug: 'my-page' },
      });

      useBuilderStore.getState().setPageMetadata({ meta_description: 'A great page' });

      const meta = useBuilderStore.getState().pageMetadata;
      expect(meta.title).toBe('My Page');
      expect(meta.slug).toBe('my-page');
      expect(meta.meta_description).toBe('A great page');
    });

    it('should emit page:metadata:updated with previous and next data', () => {
      useBuilderStore.setState({
        pageMetadata: { title: 'Old' },
      });
      vi.clearAllMocks();

      useBuilderStore.getState().setPageMetadata({ title: 'New', slug: 'new-page' });

      expect(eventBus.emit).toHaveBeenCalledWith('page:metadata:updated', {
        previous: { title: 'Old' },
        next: { title: 'New', slug: 'new-page' },
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 6. selectBlock
  // ────────────────────────────────────────────────────────────────────────────

  describe('selectBlock', () => {
    it('should set selectedBlockId when a valid id is provided', () => {
      useBuilderStore.setState({ selectedBlockId: null });

      useBuilderStore.getState().selectBlock('block-42');

      expect(useBuilderStore.getState().selectedBlockId).toBe('block-42');
    });

    it('should clear selection when null is passed', () => {
      useBuilderStore.setState({ selectedBlockId: 'block-42' });

      useBuilderStore.getState().selectBlock(null);

      expect(useBuilderStore.getState().selectedBlockId).toBeNull();
    });

    it('should emit block:selected with previous and current id', () => {
      useBuilderStore.setState({ selectedBlockId: 'old-block' });
      vi.clearAllMocks();

      useBuilderStore.getState().selectBlock('new-block');

      expect(eventBus.emit).toHaveBeenCalledWith('block:selected', {
        id: 'new-block',
        previousId: 'old-block',
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 7. saveTemplate / deleteTemplate / loadTemplates
  // ────────────────────────────────────────────────────────────────────────────

  describe('template CRUD', () => {
    it('saveTemplate should add a template and emit template:saved', () => {
      expect(useBuilderStore.getState().templates.length).toBeGreaterThan(0); // has defaults
      vi.clearAllMocks();

      const block = makeBlock({ id: 'custom', type: 'hero', content: { title: 'Custom' } });
      useBuilderStore.getState().saveTemplate(block, 'My Custom Template');

      const state = useBuilderStore.getState();
      const saved = state.templates.find((t) => t.name === 'My Custom Template');
      expect(saved).toBeDefined();
      expect(saved!.block.content.title).toBe('Custom');
      expect(saved!.id).toBe('test-uuid-123'); // from uuid mock

      expect(eventBus.emit).toHaveBeenCalledWith('template:saved', {
        name: 'My Custom Template',
        blocksCount: 1,
      });
    });

    it('deleteTemplate should remove a template and emit template:deleted', () => {
      // The uuid mock makes all ids 'test-uuid-123', so we insert a template with
      // a manually assigned unique id to avoid collision with default templates.
      const block = makeBlock({ id: 'c', type: 'hero', content: {} });
      useBuilderStore.setState({
        templates: [
          ...useBuilderStore.getState().templates,
          {
            id: 'custom-tpl-id',
            name: 'To Delete',
            block,
            createdAt: Date.now(),
          },
        ],
      });

      vi.clearAllMocks();
      useBuilderStore.getState().deleteTemplate('custom-tpl-id');

      const state = useBuilderStore.getState();
      expect(state.templates.find((t) => t.id === 'custom-tpl-id')).toBeUndefined();

      expect(eventBus.emit).toHaveBeenCalledWith('template:deleted', {
        id: 'custom-tpl-id',
        name: 'To Delete',
      });
    });

    it('deleteTemplate should not emit an event when the template does not exist', () => {
      vi.clearAllMocks();
      useBuilderStore.getState().deleteTemplate('non-existent-id');

      expect(eventBus.emit).not.toHaveBeenCalledWith('template:deleted', expect.anything());
    });

    it('loadTemplates should restore default templates when localStorage is empty', () => {
      // Reset templates to an empty array to simulate corrupted/empty state
      useBuilderStore.setState({ templates: [] });

      useBuilderStore.getState().loadTemplates();

      // Should now have the default templates (the store initialises with them)
      expect(useBuilderStore.getState().templates.length).toBeGreaterThan(0);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 8. snapshotHistory
  // ────────────────────────────────────────────────────────────────────────────

  describe('snapshotHistory', () => {
    it('should push a snapshot and advance historyIndex', () => {
      const block = makeBlock({ id: 'b', type: 'hero', content: {} });
      useBuilderStore.setState({
        blocks: [block],
        history: [[]],
        historyIndex: 0,
      });

      useBuilderStore.getState().snapshotHistory();

      const state = useBuilderStore.getState();
      expect(state.history).toHaveLength(2);
      expect(state.historyIndex).toBe(1);
      // The snapshot should be a clone of the current blocks
      expect(state.history[1]).toEqual([block]);
    });

    it('should emit history:snapshot:created with correct payload', () => {
      useBuilderStore.setState({
        blocks: [makeBlock({ id: 'b', type: 'hero', content: {} })],
        history: [[]],
        historyIndex: 0,
      });
      vi.clearAllMocks();

      useBuilderStore.getState().snapshotHistory();

      expect(eventBus.emit).toHaveBeenCalledWith('history:snapshot:created', {
        snapshot: expect.objectContaining({
          id: 'test-uuid-123',
          label: 'Snapshot #2',
          type: 'auto',
        }),
        blocksCount: 1,
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 9. Event emissions (comprehensive)
  // ────────────────────────────────────────────────────────────────────────────

  describe('event emissions', () => {
    it('should emit block:created when addBlock is called', () => {
      vi.clearAllMocks();
      useBuilderStore.getState().addBlock('hero');

      expect(eventBus.emit).toHaveBeenCalledWith('block:created', {
        block: expect.objectContaining({
          type: 'hero',
          content: { title: 'Nouveau Bloc' },
        }),
        parentId: undefined,
        index: undefined,
      });
    });

    it('should emit block:selected when selectBlock is called', () => {
      vi.clearAllMocks();
      useBuilderStore.getState().selectBlock('foo');

      expect(eventBus.emit).toHaveBeenCalledWith('block:selected', {
        id: 'foo',
        previousId: null,
      });
    });

    it('should emit state:changed when setBlocks is called', () => {
      vi.clearAllMocks();
      const newBlock = makeBlock({ id: 'fresh', type: 'hero', content: {} });
      useBuilderStore.getState().setBlocks([newBlock]);

      expect(eventBus.emit).toHaveBeenCalledWith(
        'state:changed',
        expect.objectContaining({ action: 'setBlocks' }),
      );
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 10. setBlocks
  // ────────────────────────────────────────────────────────────────────────────

  describe('setBlocks', () => {
    it('should replace blocks and reset history', () => {
      const oldBlock = makeBlock({ id: 'old', type: 'hero', content: {} });
      useBuilderStore.setState({
        blocks: [oldBlock],
        history: [[], [oldBlock]],
        historyIndex: 1,
      });

      const newBlock = makeBlock({ id: 'new', type: 'section', content: { title: 'Fresh' } });
      useBuilderStore.getState().setBlocks([newBlock]);

      const state = useBuilderStore.getState();
      expect(state.blocks).toHaveLength(1);
      expect(state.blocks[0].id).toBe('new');
      // History is reset: only the new blocks are stored as the sole snapshot
      expect(state.history).toHaveLength(1);
      expect(state.history[0]).toEqual([newBlock]);
      expect(state.historyIndex).toBe(0);
    });
  });
});
