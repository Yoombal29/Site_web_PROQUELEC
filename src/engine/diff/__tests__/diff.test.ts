import { describe, it, expect, beforeEach } from 'vitest';
import type { Block } from '@/types/builder';
import { diffBlocks, diffTrees } from '../tree-diff';
import { applyPatch, applyPatches } from '../apply-patch';
import { mergePatches } from '../merge';
import { hasConflicts, autoResolveConflicts, applyConflictResolution } from '../conflict';
import { ChangeDetector } from '../change-detector';
import { hashSubtree, hashTree, compareHashes } from '../structural-hash';
import { PatchOp, ConflictType } from '../types';
import type { Patch } from '../types';

// ── Helpers ──────────────────────────────────────────────────

function block(id: string, type: string = 'section', overrides: Partial<Block> = {}): Block {
  return {
    id,
    type,
    content: {},
    style: {},
    children: [],
    ...overrides,
  };
}

function textBlock(id: string, text: string): Block {
  return block(id, 'text', { content: { text } });
}

function children(parentId: string, ...kids: Block[]): Block {
  return block(parentId, 'section', { children: kids });
}

// ── Tests ────────────────────────────────────────────────────

describe('Diff Engine', () => {
  describe('structural hashing', () => {
    it('should produce stable hashes for same content', () => {
      const a = block('a1', 'text', { content: { text: 'hello' }, style: { color: 'red' } });
      const b = block('a2', 'text', { content: { text: 'hello' }, style: { color: 'red' } });
      const hashA = hashSubtree(a);
      const hashB = hashSubtree(b);
      expect(hashA.hash).toBe(hashB.hash);
    });

    it('should produce different hashes for different content', () => {
      const a = block('a1', 'text', { content: { text: 'hello' } });
      const b = block('a2', 'text', { content: { text: 'world' } });
      expect(hashSubtree(a).hash).not.toBe(hashSubtree(b).hash);
    });

    it('should detect changed, added, removed via compareHashes', () => {
      const oldTree = hashTree([
        block('a', 'section'),
        block('b', 'text'),
      ]);
      const newTree = hashTree([
        block('a', 'section'),
        block('c', 'button'),
      ]);

      const result = compareHashes(oldTree, newTree);
      expect(result.removed).toContain('b');
      expect(result.added).toContain('c');
      expect(result.changed).not.toContain('a');
    });
  });

  describe('tree diff — create and delete', () => {
    it('should detect a simple add', () => {
      const patches = diffTrees([], [block('a', 'section')]);
      expect(patches).toHaveLength(1);
      expect(patches[0].op).toBe(PatchOp.CREATE_NODE);
    });

    it('should detect a simple delete', () => {
      const patches = diffTrees([block('a', 'section')], []);
      expect(patches).toHaveLength(1);
      expect(patches[0].op).toBe(PatchOp.DELETE_NODE);
    });

    it('should detect create and delete simultaneously', () => {
      const patches = diffTrees(
        [block('a', 'section')],
        [block('b', 'text')],
      );
      expect(patches.some(p => p.op === PatchOp.CREATE_NODE)).toBe(true);
      expect(patches.some(p => p.op === PatchOp.DELETE_NODE)).toBe(true);
    });
  });

  describe('tree diff — moves', () => {
    it('should detect a node reorder', () => {
      const before: Block[] = [
        block('a', 'section'),
        block('b', 'section'),
      ];
      const after: Block[] = [
        block('b', 'section'),
        block('a', 'section'),
      ];
      const patches = diffTrees(before, after);
      expect(patches.some(p => p.op === PatchOp.MOVE_NODE)).toBe(true);
    });

    it('should detect a move between siblings within same parent', () => {
      const before: Block[] = [
        children('parent',
          block('a', 'text'),
          block('b', 'text'),
          block('c', 'text'),
        ),
      ];
      const after: Block[] = [
        children('parent',
          block('c', 'text'),
          block('b', 'text'),
          block('a', 'text'),
        ),
      ];
      const patches = diffTrees(before, after);
      expect(patches.some(p => p.op === PatchOp.MOVE_NODE)).toBe(true);
    });
  });

  describe('tree diff — updates', () => {
    it('should detect content update', () => {
      const patches = diffTrees(
        [textBlock('t1', 'old')],
        [textBlock('t1', 'new')],
      );
      expect(patches.some(p => p.op === PatchOp.UPDATE_CONTENT)).toBe(true);
    });

    it('should detect style update', () => {
      const patches = diffTrees(
        [block('s1', 'section', { style: { color: 'red' } })],
        [block('s1', 'section', { style: { color: 'blue' } })],
      );
      const stylePatches = patches.filter(p => p.op === PatchOp.UPDATE_STYLE);
      expect(stylePatches.length).toBeGreaterThanOrEqual(1);
    });

    it('should detect enabled toggle', () => {
      const patches = diffTrees(
        [block('e1', 'section', { enabled: true })],
        [block('e1', 'section', { enabled: false })],
      );
      expect(patches.some(p => p.op === PatchOp.UPDATE_ENABLED)).toBe(true);
    });

    it('should detect binding update', () => {
      const patches = diffTrees(
        [block('b1', 'text')],
        [block('b1', 'text', { bindings: { text: '{{user.name}}' } })],
      );
      expect(patches.some(p => p.op === PatchOp.UPDATE_BINDING)).toBe(true);
    });

    it('should not produce patches for identical trees', () => {
      const blocks = [textBlock('t1', 'hello'), block('s1', 'section')];
      const patches = diffTrees(blocks, JSON.parse(JSON.stringify(blocks)));
      expect(patches).toHaveLength(0);
    });
  });

  describe('diffBlocks — DiffResult', () => {
    it('should return correct stats', () => {
      const result = diffBlocks(
        [block('a'), block('b')],
        [block('a'), block('c'), block('d')],
      );
      expect(result.stats.creates).toBe(2);
      expect(result.stats.deletes).toBe(1);
      expect(result.patches).toHaveLength(3);
    });
  });

  describe('apply-patch', () => {
    it('should apply CREATE_NODE at root', () => {
      const result = applyPatch([], {
        op: PatchOp.CREATE_NODE,
        node: block('a', 'text'),
        parentId: null,
        index: 0,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a');
    });

    it('should apply CREATE_NODE as child', () => {
      const root = [children('parent', block('c1', 'text'))];
      const result = applyPatch(root, {
        op: PatchOp.CREATE_NODE,
        node: block('c2', 'button'),
        parentId: 'parent',
        index: 1,
      });
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children![1].id).toBe('c2');
    });

    it('should apply DELETE_NODE', () => {
      const root = [block('a'), block('b')];
      const result = applyPatch(root, {
        op: PatchOp.DELETE_NODE,
        nodeId: 'a',
        parentId: null,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b');
    });

    it('should apply MOVE_NODE between parents', () => {
      const root = [
        children('parent1', block('child', 'text')),
        children('parent2'),
      ];
      const result = applyPatch(root, {
        op: PatchOp.MOVE_NODE,
        nodeId: 'child',
        fromParentId: 'parent1',
        toParentId: 'parent2',
        fromIndex: 0,
        toIndex: 0,
      });
      expect(result[0].children).toHaveLength(0);
      expect(result[1].children).toHaveLength(1);
      expect(result[1].children![0].id).toBe('child');
    });

    it('should apply UPDATE_CONTENT', () => {
      const root = [textBlock('t1', 'old')];
      const result = applyPatch(root, {
        op: PatchOp.UPDATE_CONTENT,
        nodeId: 't1',
        path: ['text'],
        previous: 'old',
        next: 'new',
      });
      expect(result[0].content.text).toBe('new');
    });

    it('should apply UPDATE_STYLE', () => {
      const root = [block('s1', 'section', { style: { color: 'red' } })];
      const result = applyPatch(root, {
        op: PatchOp.UPDATE_STYLE,
        nodeId: 's1',
        path: ['color'],
        previous: 'red',
        next: 'blue',
      });
      expect(result[0].style?.color).toBe('blue');
    });

    it('should apply UPDATE_ENABLED', () => {
      const root = [block('e1', 'section', { enabled: true })];
      const result = applyPatch(root, {
        op: PatchOp.UPDATE_ENABLED,
        nodeId: 'e1',
        previous: true,
        next: false,
      });
      expect(result[0].enabled).toBe(false);
    });

    it('should apply UPDATE_BINDING', () => {
      const root = [block('b1', 'text')];
      const binding = { text: '{{user.name}}' };
      const result = applyPatch(root, {
        op: PatchOp.UPDATE_BINDING,
        nodeId: 'b1',
        previous: null,
        next: binding,
      });
      expect(result[0].bindings).toEqual(binding);
    });

    it('should apply multiple patches via applyPatches', () => {
      const result = applyPatches([], [
        { op: PatchOp.CREATE_NODE, node: block('a'), parentId: null, index: 0 },
        { op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: undefined, next: 'hello' },
      ]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a');
      expect(result[0].content.text).toBe('hello');
    });
  });

  describe('merge', () => {
    it('should merge non-conflicting patches', () => {
      const base: Patch[] = [
        { op: PatchOp.CREATE_NODE, node: block('a'), parentId: null, index: 0 },
      ];
      const incoming: Patch[] = [
        { op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: undefined, next: 'hello' },
      ];
      const result = mergePatches(base, incoming);
      expect(result.patches).toHaveLength(2);
      expect(result.conflicts).toHaveLength(0);
      expect(result.resolved).toBe(true);
    });

    it('should detect delete + update conflict', () => {
      const base: Patch[] = [
        { op: PatchOp.DELETE_NODE, nodeId: 'a', parentId: null },
      ];
      const incoming: Patch[] = [
        { op: PatchOp.UPDATE_CONTENT, nodeId: 'a', path: ['text'], previous: 'old', next: 'new' },
      ];
      const result = mergePatches(base, incoming);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].type).toBe(ConflictType.SAME_NODE_DELETE_AND_UPDATE);
      expect(result.resolved).toBe(false);
    });
  });

  describe('conflict', () => {
    it('hasConflicts should detect conflicts', () => {
      const conflicts = [{ patchA: {} as Patch, patchB: {} as Patch, type: ConflictType.SAME_NODE_DELETE_AND_UPDATE, description: 'test' }];
      expect(hasConflicts(conflicts)).toBe(true);
    });

    it('hasConflicts should return false for no conflicts', () => {
      expect(hasConflicts([])).toBe(false);
    });

    it('autoResolveConflicts should keep_a by default', () => {
      const conflicts = [{ patchA: {} as Patch, patchB: {} as Patch, type: ConflictType.SAME_NODE_DELETE_AND_UPDATE, description: 'test', resolution: 'keep_a' as const }];
      const result = autoResolveConflicts(conflicts);
      expect(result.resolved).toHaveLength(1);
      expect(result.unresolved).toHaveLength(0);
    });
  });

  describe('ChangeDetector', () => {
    let detector: ChangeDetector;

    beforeEach(() => {
      detector = new ChangeDetector();
    });

    it('should return null on first detect without seed', () => {
      const result = detector.detect([block('a')]);
      expect(result).toBeNull();
    });

    it('should detect changes after seeding', () => {
      detector.seed([block('a'), block('b')]);
      const result = detector.detect([block('a'), block('c')]);
      expect(result).not.toBeNull();
      expect(result!.patches.some(p => p.op === PatchOp.DELETE_NODE)).toBe(true);
    });

    it('should return null for identical blocks', () => {
      const blocks = [block('a')];
      detector.seed(blocks);
      const result = detector.detect(JSON.parse(JSON.stringify(blocks)));
      expect(result).toBeNull();
    });

    it('should report isDirty correctly', () => {
      detector.seed([block('a')]);
      expect(detector.isDirty).toBe(false);
      detector.detect([block('b')]);
      expect(detector.isDirty).toBe(true);
      detector.markClean();
      expect(detector.isDirty).toBe(false);
    });

    it('should fire onChange listeners', () => {
      const called: string[] = [];
      detector.seed([block('a')]);
      const unsub = detector.onChange((changeSet) => {
        called.push(changeSet.source);
      });
      detector.detect([block('b')]);
      expect(called).toContain('change-detector');
      unsub();
    });

    it('should cleanup on destroy', () => {
      detector.seed([block('a')]);
      detector.destroy();
      expect(detector.isDirty).toBe(false);
    });
  });
});
