import { describe, it, expect, beforeEach } from 'vitest';
import { PatchStore } from '../store';
import type { Block } from '@/types/builder';

function makeBlock(id: string, overrides: Partial<Block> = {}): Block {
  return {
    id,
    type: 'section',
    content: { title: `Block ${id}` },
    style: { padding: '20px' },
    ...overrides,
  };
}

function makeBlocks(ids: string[]): Block[] {
  return ids.map((id) => makeBlock(id));
}

describe('PatchStore', () => {
  let store: PatchStore;

  beforeEach(() => {
    store = new PatchStore();
  });

  describe('initial state', () => {
    it('should start empty', () => {
      expect(store.length).toBe(0);
      expect(store.index).toBe(-1);
      expect(store.canUndo).toBe(false);
      expect(store.canRedo).toBe(false);
    });

    it('should reset with initial blocks', () => {
      const blocks = makeBlocks(['a', 'b', 'c']);
      store.reset(blocks);
      expect(store.length).toBe(0);
      expect(store.index).toBe(-1);
    });
  });

  describe('record', () => {
    it('should record a new entry after mutation', () => {
      const blocks = makeBlocks(['a', 'b']);
      const next = store.record(blocks, (draft) => {
        draft.push(makeBlock('c'));
      });
      expect(next).toHaveLength(3);
      expect(next[2].id).toBe('c');
      expect(store.length).toBe(1);
      expect(store.index).toBe(0);
    });

    it('should discard future entries on new record', () => {
      let blocks = makeBlocks(['a']);

      blocks = store.record(blocks, (draft) => { draft.push(makeBlock('b')); });
      expect(blocks).toHaveLength(2);

      blocks = store.record(blocks, (draft) => { draft.push(makeBlock('c')); });
      expect(blocks).toHaveLength(3);
      expect(store.length).toBe(2);

      // Undo once — back to ['a', 'b']
      const undone = store.undo(blocks);
      expect(undone).not.toBeNull();
      blocks = undone!.blocks;
      expect(blocks).toHaveLength(2);
      expect(store.index).toBe(0);

      // New mutation on undone state — discards the 'c' entry
      blocks = store.record(blocks, (draft) => { draft.push(makeBlock('d')); });
      expect(blocks).toHaveLength(3);
      expect(blocks[1].id).toBe('b');
      expect(blocks[2].id).toBe('d');
      // Only 2 entries: 'b' and 'd' ('c' was discarded)
      expect(store.length).toBe(2);
      expect(store.canRedo).toBe(false);
    });

    it('should preserve immutability of original blocks', () => {
      const blocks = makeBlocks(['a']);
      const original = blocks[0];
      store.record(blocks, (draft) => {
        draft[0].content.title = 'Modified';
      });
      expect(original.content.title).toBe('Block a');
    });

    it('should enforce max entries limit', () => {
      const smallStore = new PatchStore({ maxEntries: 3 });
      const blocks = makeBlocks(['a']);

      let current = blocks;
      for (let i = 0; i < 5; i++) {
        const idx = i;
        current = smallStore.record(current, (draft) => {
          draft.push(makeBlock(`item-${idx}`));
        });
      }

      expect(smallStore.length).toBe(3);
      expect(smallStore.canUndo).toBe(true);
    });
  });

  describe('undo', () => {
    it('should reverse the last mutation', () => {
      const blocks = makeBlocks(['a', 'b']);
      const next = store.record(blocks, (draft) => {
        draft.push(makeBlock('c'));
      });
      expect(next).toHaveLength(3);

      const undone = store.undo(next);
      expect(undone).not.toBeNull();
      expect(undone!.blocks).toHaveLength(2);
      expect(undone!.blocks[0].id).toBe('a');
      expect(undone!.blocks[1].id).toBe('b');
    });

    it('should return null when nothing to undo', () => {
      const result = store.undo([]);
      expect(result).toBeNull();
    });
  });

  describe('redo', () => {
    it('should re-apply a previously undone mutation', () => {
      const blocks = makeBlocks(['a']);
      const afterAdd = store.record(blocks, (draft) => {
        draft.push(makeBlock('b'));
      });
      expect(afterAdd).toHaveLength(2);

      const undone = store.undo(afterAdd);
      expect(undone!.blocks).toHaveLength(1);

      const redone = store.redo(undone!.blocks);
      expect(redone).not.toBeNull();
      expect(redone!.blocks).toHaveLength(2);
      expect(redone!.blocks[1].id).toBe('b');
    });

    it('should return null when nothing to redo', () => {
      const result = store.redo([]);
      expect(result).toBeNull();
    });
  });

  describe('complex mutations', () => {
    it('should handle style updates', () => {
      const blocks = makeBlocks(['a']);
      const next = store.record(blocks, (draft) => {
        draft[0].style = { ...draft[0].style, backgroundColor: 'red' };
      });
      expect(next[0].style?.backgroundColor).toBe('red');

      const undone = store.undo(next);
      expect(undone!.blocks[0].style?.backgroundColor).toBeUndefined();

      const redone = store.redo(undone!.blocks);
      expect(redone!.blocks[0].style?.backgroundColor).toBe('red');
    });

    it('should handle content updates', () => {
      const blocks = makeBlocks(['a']);
      const next = store.record(blocks, (draft) => {
        draft[0].content.title = 'New Title';
      });
      expect(next[0].content.title).toBe('New Title');

      const undone = store.undo(next);
      expect(undone!.blocks[0].content.title).toBe('Block a');
    });

    it('should handle deletions', () => {
      const blocks = makeBlocks(['a', 'b', 'c']);
      const next = store.record(blocks, (draft) => {
        draft.splice(1, 1); // remove 'b'
      });
      expect(next).toHaveLength(2);
      expect(next[0].id).toBe('a');
      expect(next[1].id).toBe('c');

      const undone = store.undo(next);
      expect(undone!.blocks).toHaveLength(3);
      expect(undone!.blocks[1].id).toBe('b');
    });

    it('should handle deep nested mutations', () => {
      const blocks: Block[] = [{
        ...makeBlock('parent'),
        children: makeBlocks(['child-a', 'child-b']),
      }];

      const next = store.record(blocks, (draft) => {
        draft[0].children![0].content.title = 'Modified Child';
      });
      expect(next[0].children![0].content.title).toBe('Modified Child');

      const undone = store.undo(next);
      expect(undone!.blocks[0].children![0].content.title).toBe('Block child-a');
    });
  });

  describe('multiple undo/redo cycles', () => {
    it('should handle multiple undo steps', () => {
      let blocks = makeBlocks(['a']);
      const states: Block[][] = [blocks];

      for (let i = 0; i < 5; i++) {
        const idx = i;
        blocks = store.record(blocks, (draft) => {
          draft.push(makeBlock(`item-${idx}`));
        });
        states.push(blocks);
      }

      expect(blocks).toHaveLength(6);
      expect(store.canUndo).toBe(true);
      expect(store.canRedo).toBe(false);

      // Undo all 5 steps
      for (let i = 4; i >= 0; i--) {
        const undone = store.undo(blocks);
        expect(undone).not.toBeNull();
        blocks = undone!.blocks;
        expect(blocks).toHaveLength(i + 1);
      }

      expect(store.canUndo).toBe(false);
      expect(store.canRedo).toBe(true);

      // Redo all 5 steps
      for (let i = 1; i <= 5; i++) {
        const redone = store.redo(blocks);
        expect(redone).not.toBeNull();
        blocks = redone!.blocks;
        expect(blocks).toHaveLength(i + 1);
      }

      expect(blocks).toHaveLength(6);
    });
  });

  describe('getSummary', () => {
    it('should return accurate summary', () => {
      const blocks = makeBlocks(['a']);
      expect(store.getSummary().entries).toBe(0);

      store.record(blocks, (draft) => { draft.push(makeBlock('b')); });
      const summary = store.getSummary();
      expect(summary.entries).toBe(1);
      expect(summary.canUndo).toBe(true);
      expect(summary.canRedo).toBe(false);
      expect(summary.estimatedMemoryBytes).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('should clear all history', () => {
      const blocks = makeBlocks(['a']);
      store.record(blocks, (draft) => { draft.push(makeBlock('b')); });
      expect(store.length).toBe(1);

      store.reset(makeBlocks(['x']));
      expect(store.length).toBe(0);
      expect(store.index).toBe(-1);
      expect(store.canUndo).toBe(false);
    });
  });

  describe('empty arrays', () => {
    it('should handle recording on empty blocks', () => {
      const next = store.record([], (draft) => {
        draft.push(makeBlock('a'));
      });
      expect(next).toHaveLength(1);
    });

    it('should undo on empty blocks', () => {
      expect(store.undo([])).toBeNull();
    });
  });

  describe('configurable max entries', () => {
    it('should use default config', () => {
      const s = new PatchStore();
      expect(s['config'].maxEntries).toBe(50);
    });

    it('should accept custom config', () => {
      const s = new PatchStore({ maxEntries: 10, debug: true });
      expect(s['config'].maxEntries).toBe(10);
      expect(s['config'].debug).toBe(true);
    });
  });
});
