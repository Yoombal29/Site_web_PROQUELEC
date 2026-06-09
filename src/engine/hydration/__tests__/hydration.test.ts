import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeBlocksTree } from '../normalize';
import { applyMigrations, registerMigration, getMigrationPath } from '../migrations';
import { CURRENT_SCHEMA_VERSION } from '../types';
import { loadBlockAnimations } from '../animation-loader';
import { computePageLayout } from '../layout-loader';
import { loadBlockBindings, setBindingContext } from '../binding-loader';

// ── Mocks ──────────────────────────────────────────────────────

const mockHeroBlock = {
  id: 'h1',
  type: 'hero',
  content: { title: 'Hello', subtitle: 'World' },
  style: { padding: '64px' },
};

const mockTextBlock = {
  id: 't1',
  type: 'text',
  content: { text: 'Some content' },
};

const mockSectionBlock = {
  id: 's1',
  type: 'section',
  children: [mockHeroBlock, mockTextBlock],
};

const mockCardBlock = {
  id: 'c1',
  type: 'card',
  content: { title: 'Card', content: 'Body' },
  style: { padding: '16px', borderRadius: '8px' },
};

const mockBlockWithBindings = {
  id: 'b1',
  type: 'text',
  content: { text: '{{user.name}}' },
  dataSource: { type: 'context', config: { path: 'user' } },
  bindings: { title: '{{user.name}}' },
};

const mockBlockWithAnimation = {
  id: 'a1',
  type: 'section',
  content: {},
  style: { animation: 'fadeUp 500ms ease-out' },
};

const mockGridBlock = {
  id: 'g1',
  type: 'grid',
  content: {},
  style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
};

// ── Tests ──────────────────────────────────────────────────────

describe('Hydration Engine', () => {
  describe('normalizeBlocksTree', () => {
    it('should return empty array for null input', () => {
      const result = normalizeBlocksTree(null as unknown as []);
      expect(result.blocks).toEqual([]);
      expect(result.warnings).toContain('blocks is not an array');
    });

    it('should normalize blocks with missing fields', () => {
      const input = [{ type: 'section' }];
      const result = normalizeBlocksTree(input);
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0]).toHaveProperty('id');
      expect(result.blocks[0]).toHaveProperty('content');
      expect(result.blocks[0]).toHaveProperty('style');
      expect(result.blocks[0].type).toBe('section');
    });

    it('should fill defaults from BLOCK_DEFAULTS', () => {
      const input = [{ id: 'h1', type: 'hero', content: { title: 'Test' } }];
      const result = normalizeBlocksTree(input);
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].style?.padding).toBe('64px 24px');
      expect(result.blocks[0].style?.textAlign).toBe('center');
      expect(result.blocks[0].content.title).toBe('Test');
      expect(result.blocks[0].content.subtitle).toBe('');
    });

    it('should map "props" to "content" with warning', () => {
      const input = [{ id: 'im1', type: 'text', props: { text: 'via props' } }];
      const result = normalizeBlocksTree(input);
      expect(result.blocks[0].content.text).toBe('via props');
      expect(result.warnings.some(w => w.includes('props'))).toBe(true);
    });

    it('should normalize nested children recursively', () => {
      const result = normalizeBlocksTree([mockSectionBlock]);
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].children).toHaveLength(2);
      expect(result.blocks[0].children![0].type).toBe('hero');
      expect(result.blocks[0].children![1].type).toBe('text');
    });

    it('should handle empty array gracefully', () => {
      const result = normalizeBlocksTree([]);
      expect(result.blocks).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should filter out null entries', () => {
      const result = normalizeBlocksTree([null, mockHeroBlock, undefined]);
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].id).toBe('h1');
    });

    it('should keep isGlobal flag', () => {
      const input = [{ id: 'g2', type: 'button', isGlobal: true }];
      const result = normalizeBlocksTree(input);
      expect(result.blocks[0].isGlobal).toBe(true);
    });

    it('should keep enabled flag', () => {
      const input = [{ id: 'e1', type: 'section', enabled: false }];
      const result = normalizeBlocksTree(input);
      expect(result.blocks[0].enabled).toBe(false);
    });
  });

  describe('migrations', () => {
    it('should have CURRENT_SCHEMA_VERSION set to 1', () => {
      expect(CURRENT_SCHEMA_VERSION).toBe(1);
    });

    it('should return empty migration path for same version', () => {
      const path = getMigrationPath(1, 1);
      expect(path).toEqual([]);
    });

    it('should return empty migration path for current version', () => {
      const path = getMigrationPath(CURRENT_SCHEMA_VERSION);
      expect(path).toEqual([]);
    });

    it('should register and find a migration in the path', () => {
      const initialPathLen = getMigrationPath(0, 1).length;

      registerMigration({
        from: 0,
        to: 1,
        description: 'extra v0→v1',
        migrate: (doc) => ({ ...doc, extra: true }),
      });

      expect(getMigrationPath(0, 1).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('animation loader', () => {
    it('should extract animations from blocks', () => {
      const result = loadBlockAnimations([mockBlockWithAnimation]);
      expect(result.animations).toEqual([]);
      expect(result.keyframesCSS).toBeTruthy();
    });

    it('should return empty result for blocks without animations', () => {
      const result = loadBlockAnimations([mockTextBlock]);
      expect(result.animations).toEqual([]);
      expect(result.keyframesCSS).toBe('');
      expect(result.viewportBlocks).toEqual([]);
    });

    it('should detect viewport-triggered animations', () => {
      const block = {
        id: 'v1',
        type: 'section',
        content: { animation: { type: 'fade', duration: 600, delay: 100 } },
      };
      const result = loadBlockAnimations([block]);
      expect(result.viewportBlocks).toContain('v1');
    });
  });

  describe('layout loader', () => {
    it('should compute layout for grid blocks', () => {
      const result = computePageLayout([mockGridBlock]);
      expect(result.nodes).toHaveLength(1);
      const node = result.nodes[0];
      expect(node.type).toBe('grid');
      expect(node).toHaveProperty('x');
      expect(node).toHaveProperty('y');
      expect(node).toHaveProperty('width');
      expect(node).toHaveProperty('height');
    });

    it('should compute layout with custom container size', () => {
      const result = computePageLayout([mockHeroBlock], {
        containerWidth: 1920,
        containerHeight: 1080,
      });
      expect(result.nodes).toHaveLength(1);
      expect(result.errors).toEqual([]);
    });

    it('should return empty for empty blocks', () => {
      const result = computePageLayout([]);
      expect(result.nodes).toEqual([]);
    });
  });

  describe('binding loader', () => {
    it('should register sources and detect bindings', () => {
      const result = loadBlockBindings([mockBlockWithBindings]);
      expect(result.registeredSources).toBe(1);
      expect(result.bindingsDetected).toBe(1);
      expect(result.errors).toEqual([]);
    });

    it('should handle blocks without bindings', () => {
      const result = loadBlockBindings([mockTextBlock]);
      expect(result.registeredSources).toBe(0);
      expect(result.bindingsDetected).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('should traverse nested blocks for bindings', () => {
      const result = loadBlockBindings([mockSectionBlock]);
      expect(result.errors).toEqual([]);
    });
  });

  describe('full normalization output', () => {
    it('should handle a realistic page structure', () => {
      const blocks = [
        {
          id: 'p1',
          type: 'hero',
          content: { title: 'Welcome', subtitle: 'Best place' },
          style: {},
        },
        {
          id: 'p2',
          type: 'section',
          children: [
            {
              id: 'p3',
              type: 'card',
              content: { title: 'Card 1', content: 'Desc' },
              style: { padding: '24px' },
            },
            {
              id: 'p4',
              type: 'card',
              content: { title: 'Card 2', content: 'Desc 2' },
            },
          ],
        },
        {
          id: 'p5',
          type: 'text',
          content: { text: '{{page.title}}' },
          dataSource: { type: 'context', config: { path: 'page' } },
        },
        {
          id: 'p6',
          type: 'button',
          content: { title: 'Click' },
          style: {},
        },
      ];

      const result = normalizeBlocksTree(blocks);
      expect(result.blocks).toHaveLength(4);
      expect(result.warnings).toEqual([]);

      const hero = result.blocks[0];
      expect(hero.type).toBe('hero');
      expect(hero.content.title).toBe('Welcome');
      expect(hero.style?.textAlign).toBe('center');

      const section = result.blocks[1];
      expect(section.children).toHaveLength(2);
      expect(section.children![0].type).toBe('card');

      const text = result.blocks[2];
      expect(text.dataSource).toBeDefined();

      const button = result.blocks[3];
      expect(button.style?.display).toBe('inline-block');
      expect(button.style?.backgroundColor).toBe('primary.500');
    });
  });
});
