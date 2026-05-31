import type { ValidationIssue, Validator, ValidatorContext } from './types';

const VALID_COLOR_SCALES = [
  'primary', 'secondary', 'surface', 'accent',
  'danger', 'warning', 'success', 'neutral',
];

const VALID_COLOR_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const VALID_SHADES_SET = new Set(VALID_COLOR_SHADES);

const VALID_SPACING_TOKENS = [
  'none', 'xs', 'sm', 'md', 'lg', 'xl',
  '2xl', '3xl', '4xl', '5xl', '6xl',
];

const VALID_SPACING_SET = new Set(VALID_SPACING_TOKENS);

const VALID_RADIUS_TOKENS = [
  'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full',
];

const VALID_RADIUS_SET = new Set(VALID_RADIUS_TOKENS);

const VALID_SHADOW_TOKENS = [
  'none', 'sm', 'md', 'lg', 'xl', '2xl', 'inner', 'outline',
];

const VALID_SHADOW_SET = new Set(VALID_SHADOW_TOKENS);

const VALID_FONT_FAMILIES = ['sans', 'serif', 'mono', 'heading', 'body'];
const VALID_FONT_FAMILIES_SET = new Set(VALID_FONT_FAMILIES);

const VALID_FONT_SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
const VALID_FONT_SIZES_SET = new Set(VALID_FONT_SIZES);

const VALID_FONT_WEIGHTS = ['thin', 'light', 'normal', 'medium', 'semibold', 'bold', 'black'];
const VALID_FONT_WEIGHTS_SET = new Set(VALID_FONT_WEIGHTS);

const COLOR_TOKEN_REGEX = /^(primary|secondary|surface|accent|danger|warning|success|neutral)\.(\d+)$/;
const SPACING_TOKEN_REGEX = /^(none|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl)$/;
const TOKEN_PREFIX_REGEX = /^(color|spacing|radius|shadow|font|motion|primary|secondary|surface|accent|danger|warning|success|neutral)\./;

export function validateTokenValue(value: string, issues: ValidationIssue[], path: string, blockId?: string) {
  if (!TOKEN_PREFIX_REGEX.test(value)) {
    return;
  }

  if (value.startsWith('color.') || value.startsWith('primary.') || value.startsWith('secondary.') ||
      value.startsWith('surface.') || value.startsWith('accent.') || value.startsWith('danger.') ||
      value.startsWith('warning.') || value.startsWith('success.') || value.startsWith('neutral.')) {
    const match = value.match(COLOR_TOKEN_REGEX);
    if (!match) {
      issues.push({
        code: 'TOKEN_INVALID_COLOR',
        severity: 'error',
        message: `Invalid color token "${value}"`,
        path,
        blockId,
        expected: 'primary.500',
        received: value,
      });
      return;
    }
    const shade = parseInt(match[2], 10);
    if (!VALID_SHADES_SET.has(shade)) {
      issues.push({
        code: 'TOKEN_INVALID_COLOR_SHADE',
        severity: 'error',
        message: `Invalid color shade "${shade}" in token "${value}"`,
        path,
        blockId,
        expected: [...VALID_COLOR_SHADES].join(', '),
        received: `${shade}`,
      });
    }
    return;
  }

  if (value.startsWith('spacing.')) {
    const token = value.replace('spacing.', '');
    if (!VALID_SPACING_SET.has(token)) {
      issues.push({
        code: 'TOKEN_INVALID_SPACING',
        severity: 'error',
        message: `Invalid spacing token "${value}"`,
        path,
        blockId,
        expected: VALID_SPACING_TOKENS.join(', '),
        received: token,
      });
    }
    return;
  }

  if (value.startsWith('radius.')) {
    const token = value.replace('radius.', '');
    if (!VALID_RADIUS_SET.has(token)) {
      issues.push({
        code: 'TOKEN_INVALID_RADIUS',
        severity: 'error',
        message: `Invalid radius token "${value}"`,
        path,
        blockId,
        expected: VALID_RADIUS_TOKENS.join(', '),
        received: token,
      });
    }
    return;
  }

  if (value.startsWith('shadow.')) {
    const token = value.replace('shadow.', '');
    if (!VALID_SHADOW_SET.has(token)) {
      issues.push({
        code: 'TOKEN_INVALID_SHADOW',
        severity: 'warning',
        message: `Invalid shadow token "${value}"`,
        path,
        blockId,
        expected: VALID_SHADOW_TOKENS.join(', '),
        received: token,
      });
    }
    return;
  }

  if (value.startsWith('font.')) {
    const parts = value.split('.');
    if (parts[1] === 'family' && parts[2]) {
      if (!VALID_FONT_FAMILIES_SET.has(parts[2])) {
        issues.push({
          code: 'TOKEN_INVALID_FONT_FAMILY',
          severity: 'warning',
          message: `Invalid font family "${parts[2]}" in token "${value}"`,
          path,
          blockId,
          expected: VALID_FONT_FAMILIES.join(', '),
          received: parts[2],
        });
      }
    }
    if (parts[1] === 'size' && parts[2]) {
      if (!VALID_FONT_SIZES_SET.has(parts[2])) {
        issues.push({
          code: 'TOKEN_INVALID_FONT_SIZE',
          severity: 'warning',
          message: `Invalid font size "${parts[2]}" in token "${value}"`,
          path,
          blockId,
          expected: VALID_FONT_SIZES.join(', '),
          received: parts[2],
        });
      }
    }
    if (parts[1] === 'weight' && parts[2]) {
      if (!VALID_FONT_WEIGHTS_SET.has(parts[2])) {
        issues.push({
          code: 'TOKEN_INVALID_FONT_WEIGHT',
          severity: 'warning',
          message: `Invalid font weight "${parts[2]}" in token "${value}"`,
          path,
          blockId,
          expected: VALID_FONT_WEIGHTS.join(', '),
          received: parts[2],
        });
      }
    }
    return;
  }

  issues.push({
    code: 'TOKEN_UNKNOWN_PREFIX',
    severity: 'warning',
    message: `Unknown token prefix in "${value}"`,
    path,
    blockId,
  });
}

function walkStyleForTokens(
  obj: unknown,
  issues: ValidationIssue[],
  blockId?: string,
  basePath = '',
) {
  if (!obj || typeof obj !== 'object') return;

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const path = basePath ? `${basePath}.${key}` : key;

    if (typeof value === 'string' && TOKEN_PREFIX_REGEX.test(value)) {
      validateTokenValue(value, issues, path, blockId);
    } else if (typeof value === 'object' && value !== null) {
      walkStyleForTokens(value, issues, blockId, path);
    }
  }
}

function walkBlocksForTokens(
  blocks: unknown[],
  issues: ValidationIssue[],
) {
  for (const block of blocks as Array<Record<string, unknown>>) {
    const blockId = block.id as string | undefined;

    if (block.style && typeof block.style === 'object') {
      walkStyleForTokens(block.style, issues, blockId, 'style');
    }

    if (block.content && typeof block.content === 'object') {
      walkStyleForTokens(block.content, issues, blockId, 'content');
    }

    if (block.props && typeof block.props === 'object') {
      walkStyleForTokens(block.props, issues, blockId, 'props');
    }

    if (Array.isArray(block.children)) {
      walkBlocksForTokens(block.children, issues);
    }
  }
}

export const validateTokens: Validator = (context: ValidatorContext) => {
  const issues: ValidationIssue[] = [];

  if (Array.isArray(context.blocks)) {
    walkBlocksForTokens(context.blocks, issues);
  }

  const themeConfig = (context as unknown as Record<string, unknown>).themeConfig as Record<string, unknown> | undefined;
  if (themeConfig && typeof themeConfig === 'object') {
    walkStyleForTokens(themeConfig, issues, undefined, 'themeConfig');
  }

  return issues;
};
