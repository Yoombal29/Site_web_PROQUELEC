import type { Block, BlockStyle, BlockContent } from '@/types/builder';
import { defaultStyle, defaultContent, applyDefaults } from './defaults';

export interface NormalizationResult {
  blocks: Block[];
  warnings: string[];
}

function hasId(block: Block): boolean {
  return Boolean(block.id);
}

function ensureNumeric(block: Block, path: string): void {
  const style = block.style;
  if (!style) return;
  const value = (style as Record<string, unknown>)[path];
  if (typeof value === 'string' && !isNaN(Number(value))) {
    (style as Record<string, unknown>)[path] = Number(value);
  }
}

function normalizeBlock(block: Block, depth: number, warnings: string[]): Block {
  if (!hasId(block)) {
    warnings.push(`Block at depth ${depth} missing id; type="${block.type}"`);
  }

  const result: Block = {
    id: block.id || '',
    type: block.type || 'section',
    content: { ...defaultContent(), ...(block.content || {}) },
    style: { ...defaultStyle(), ...(block.style || {}) },
  };

  if (block.props) {
    result.content = { ...result.content, ...(block.props as BlockContent) };
    warnings.push(`Block ${result.id || '<unknown>'}: "props" merged into "content" (v1 compat)`);
  }

  if (block.enabled === false) {
    result.enabled = false;
  }

  if (block.isGlobal) {
    result.isGlobal = true;
  }

  if (block.dataSource) {
    result.dataSource = block.dataSource;
  }

  if (block.bindings) {
    result.bindings = block.bindings;
  }

  if (block.dataSourceId) {
    result.dataSourceId = block.dataSourceId;
  }

  ensureNumeric(result, 'opacity');
  ensureNumeric(result, 'zIndex');

  if (block.children && Array.isArray(block.children) && block.children.length > 0) {
    result.children = normalizeBlocks(block.children, depth + 1, warnings);
  }

  return result;
}

function normalizeBlocks(blocks: Block[], depth: number, warnings: string[]): Block[] {
  return blocks.map((b) => normalizeBlock(b, depth, warnings));
}

export function normalizeBlocksTree(blocks: unknown[]): NormalizationResult {
  const warnings: string[] = [];

  if (!Array.isArray(blocks)) {
    return { blocks: [], warnings: ['blocks is not an array'] };
  }

  const normalized = blocks
    .filter((b) => b != null)
    .map((b) => {
      const partial = b as Partial<Block>;
      return normalizeBlock(
        {
          id: partial.id || '',
          type: (partial.type as string) || 'section',
          content: partial.content || {},
          style: partial.style || {},
          children: partial.children,
          enabled: partial.enabled,
          isGlobal: partial.isGlobal,
          props: partial.props,
          dataSource: partial.dataSource,
          bindings: partial.bindings,
          dataSourceId: partial.dataSourceId,
        } as Block,
        0,
        warnings,
      );
    });

  const withDefaults = normalized.map(applyDefaults);

  return { blocks: withDefaults, warnings };
}
