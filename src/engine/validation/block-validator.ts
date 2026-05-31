import type { ValidationIssue, Validator, ValidatorContext } from './types';

const KNOWN_BLOCK_TYPES = new Set([
  'hero', 'section', 'text', 'text-block', 'image',
  'columns', 'button', 'divider', 'spacer', 'grid',
  'card', 'video', 'list', 'stats', 'form', 'html', 'code',
]);

const BLOCKS_WITH_CHILDREN = new Set(['section', 'columns', 'card', 'grid']);
const MAX_DEPTH = 10;

const REQUIRED_PROPS: Record<string, string[]> = {
  hero: ['title'],
  section: ['title'],
  columns: [],
  image: ['src'],
  button: ['text'],
  form: ['fields'],
  html: ['html'],
  code: ['code'],
};

interface RawBlock {
  id?: string;
  type?: string;
  children?: RawBlock[];
  content?: Record<string, unknown>;
  style?: Record<string, unknown>;
  props?: Record<string, unknown>;
  [key: string]: unknown;
}

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function collectBlockIds(blocks: RawBlock[]): Set<string> {
  const ids = new Set<string>();
  function walk(list: RawBlock[]) {
    for (const b of list) {
      if (b.id) ids.add(b.id);
      if (b.children) walk(b.children);
    }
  }
  walk(blocks);
  return ids;
}

function validateBlock(
  block: RawBlock,
  issues: ValidationIssue[],
  parentType: string | null,
  depth: number,
  allIds: Set<string>,
  path: string,
) {
  if (depth > MAX_DEPTH) {
    issues.push({
      code: 'BLOCK_MAX_DEPTH_EXCEEDED',
      severity: 'error',
      message: `Block tree exceeds maximum depth of ${MAX_DEPTH}`,
      path,
      blockId: block.id,
    });
    return;
  }

  if (!block.id || typeof block.id !== 'string') {
    issues.push({
      code: 'BLOCK_MISSING_ID',
      severity: 'error',
      message: 'Block must have a string id',
      path,
    });
  }

  if (!block.type || typeof block.type !== 'string') {
    issues.push({
      code: 'BLOCK_MISSING_TYPE',
      severity: 'error',
      message: 'Block must have a type',
      path,
      blockId: block.id,
    });
    return;
  }

  if (!KNOWN_BLOCK_TYPES.has(block.type)) {
    issues.push({
      code: 'BLOCK_UNKNOWN_TYPE',
      severity: 'error',
      message: `Unknown block type "${block.type}"`,
      path,
      blockId: block.id,
      expected: [...KNOWN_BLOCK_TYPES].join(', '),
      received: block.type,
    });
  }

  if (parentType && !BLOCKS_WITH_CHILDREN.has(parentType)) {
    issues.push({
      code: 'BLOCK_CHILD_IN_PARENT',
      severity: 'warning',
      message: `Block type "${block.type}" placed inside "${parentType}" which does not support children`,
      path,
      blockId: block.id,
      expected: `Parent should be one of: ${[...BLOCKS_WITH_CHILDREN].join(', ')}`,
      received: parentType,
    });
  }

  const required = REQUIRED_PROPS[block.type];
  if (required && required.length > 0) {
    const content = block.content || block.props || {};
    for (const prop of required) {
      if (content[prop] === undefined || content[prop] === null || content[prop] === '') {
        issues.push({
          code: 'BLOCK_MISSING_REQUIRED_PROP',
          severity: 'warning',
          message: `Block "${block.type}" is missing required property "${prop}"`,
          path: `${path}.content.${prop}`,
          blockId: block.id,
        });
      }
    }
  }

  const content = block.content || block.props || {};
  if (typeof content === 'object' && content !== null) {
    for (const [key, value] of Object.entries(content)) {
      if (typeof value === 'string' && HEX_COLOR_REGEX.test(value)) {
        issues.push({
          code: 'BLOCK_HARDCODED_COLOR',
          severity: 'warning',
          message: `Block "${block.type}" uses hardcoded color "${value}" instead of a design token (e.g. "primary.500")`,
          path: `${path}.content.${key}`,
          blockId: block.id,
        });
      }
    }
  }

  const style = block.style;
  if (style && typeof style === 'object') {
    for (const [key, value] of Object.entries(style)) {
      if (typeof value === 'string' && key !== 'boxShadow' && HEX_COLOR_REGEX.test(value)) {
        issues.push({
          code: 'BLOCK_HARDCODED_COLOR_IN_STYLE',
          severity: 'warning',
          message: `Block "${block.type}" uses hardcoded color "${value}" in style.${key} instead of a design token`,
          path: `${path}.style.${key}`,
          blockId: block.id,
        });
      }
    }
  }

  if (block.children) {
    if (!Array.isArray(block.children)) {
      issues.push({
        code: 'BLOCK_CHILDREN_NOT_ARRAY',
        severity: 'error',
        message: `Block "${block.type}" has children that is not an array`,
        path: `${path}.children`,
        blockId: block.id,
      });
      return;
    }

    for (let i = 0; i < block.children.length; i++) {
      validateBlock(
        block.children[i],
        issues,
        block.type,
        depth + 1,
        allIds,
        `${path}.children[${i}]`,
      );
    }
  }
}

export const validateBlockTree: Validator = (context: ValidatorContext) => {
  const issues: ValidationIssue[] = [];
  const blocks = context.blocks as RawBlock[];

  if (!Array.isArray(blocks)) {
    issues.push({
      code: 'BLOCKS_NOT_ARRAY',
      severity: 'error',
      message: 'Blocks root must be an array',
    });
    return issues;
  }

  const allIds = collectBlockIds(blocks);

  if (allIds.size < blocks.length) {
    issues.push({
      code: 'BLOCK_DUPLICATE_IDS',
      severity: 'error',
      message: 'Duplicate block IDs found in tree',
    });
  }

  for (let i = 0; i < blocks.length; i++) {
    validateBlock(blocks[i], issues, null, 0, allIds, `blocks[${i}]`);
  }

  return issues;
};
