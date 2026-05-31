import type { ValidationIssue, Validator, ValidatorContext } from './types';

const VALID_DIRECTIONS = new Set(['row', 'column', 'horizontal', 'vertical']);
const VALID_ALIGNMENTS = new Set(['start', 'center', 'end', 'stretch', 'space-between', 'space-around', 'space-evenly']);
const VALID_POSITIONS = new Set(['relative', 'absolute', 'fixed', 'sticky']);
const VALID_OVERFLOWS = new Set(['visible', 'hidden', 'auto', 'scroll']);
const VALID_DISPLAYS = new Set(['block', 'flex', 'grid', 'inline-block', 'none']);

const NEGATIVE_SIZE_REGEX = /^-\d/;

interface StyleMap {
  display?: string;
  position?: string;
  overflow?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  flexWrap?: string;
  zIndex?: number | string;
  width?: string;
  height?: string;
  maxWidth?: string;
  minHeight?: string;
  padding?: string;
  margin?: string;
  gap?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  aspectRatio?: string;
  [key: string]: unknown;
}

export const validateLayout: Validator = (context: ValidatorContext) => {
  const issues: ValidationIssue[] = [];
  const blocks = context.blocks as Array<Record<string, unknown>>;

  if (!Array.isArray(blocks)) return issues;

  const absoluteParents = new Set<string>();

  function collectAbsoluteParents(list: Array<Record<string, unknown>>) {
    for (const block of list) {
      const style = (block.style || {}) as StyleMap;
      if (style.position === 'relative' || style.position === undefined) {
        if (block.id) absoluteParents.add(block.id as string);
      }
      if (Array.isArray(block.children)) {
        collectAbsoluteParents(block.children as Array<Record<string, unknown>>);
      }
    }
  }
  collectAbsoluteParents(blocks);

  function walk(list: Array<Record<string, unknown>>, parentPath: string, parentStyle: StyleMap | null) {
    for (let i = 0; i < list.length; i++) {
      const block = list[i];
      const style = (block.style || {}) as StyleMap;
      const path = `${parentPath}[${i}]`;

      if (style.position && !VALID_POSITIONS.has(style.position)) {
        issues.push({
          code: 'LAYOUT_INVALID_POSITION',
          severity: 'error',
          message: `Invalid position value "${style.position}"`,
          path: `${path}.style.position`,
          blockId: block.id as string,
          expected: [...VALID_POSITIONS].join(', '),
          received: style.position,
        });
      }

      if (style.display && !VALID_DISPLAYS.has(style.display)) {
        issues.push({
          code: 'LAYOUT_INVALID_DISPLAY',
          severity: 'warning',
          message: `Invalid display value "${style.display}"`,
          path: `${path}.style.display`,
          blockId: block.id as string,
          expected: [...VALID_DISPLAYS].join(', '),
          received: style.display,
        });
      }

      if (style.overflow && !VALID_OVERFLOWS.has(style.overflow)) {
        issues.push({
          code: 'LAYOUT_INVALID_OVERFLOW',
          severity: 'warning',
          message: `Invalid overflow value "${style.overflow}"`,
          path: `${path}.style.overflow`,
          blockId: block.id as string,
          expected: [...VALID_OVERFLOWS].join(', '),
          received: style.overflow,
        });
      }

      if (style.flexDirection && !VALID_DIRECTIONS.has(style.flexDirection)) {
        issues.push({
          code: 'LAYOUT_INVALID_FLEX_DIRECTION',
          severity: 'warning',
          message: `Invalid flexDirection "${style.flexDirection}"`,
          path: `${path}.style.flexDirection`,
          blockId: block.id as string,
          expected: [...VALID_DIRECTIONS].join(', '),
          received: style.flexDirection,
        });
      }

      if (style.justifyContent && !VALID_ALIGNMENTS.has(style.justifyContent)) {
        issues.push({
          code: 'LAYOUT_INVALID_JUSTIFY_CONTENT',
          severity: 'warning',
          message: `Invalid justifyContent "${style.justifyContent}"`,
          path: `${path}.style.justifyContent`,
          blockId: block.id as string,
          expected: [...VALID_ALIGNMENTS].join(', '),
          received: style.justifyContent,
        });
      }

      if (style.alignItems && !VALID_ALIGNMENTS.has(style.alignItems)) {
        issues.push({
          code: 'LAYOUT_INVALID_ALIGN_ITEMS',
          severity: 'warning',
          message: `Invalid alignItems "${style.alignItems}"`,
          path: `${path}.style.alignItems`,
          blockId: block.id as string,
          expected: [...VALID_ALIGNMENTS].join(', '),
          received: style.alignItems,
        });
      }

      for (const dim of ['width', 'height', 'maxWidth', 'minHeight', 'padding', 'margin', 'gap']) {
        const val = style[dim];
        if (typeof val === 'string' && NEGATIVE_SIZE_REGEX.test(val)) {
          issues.push({
            code: 'LAYOUT_NEGATIVE_SIZE',
            severity: 'error',
            message: `Negative value "${val}" in ${dim}`,
            path: `${path}.style.${dim}`,
            blockId: block.id as string,
          });
        }
      }

      if (style.flexWrap && !['wrap', 'nowrap'].includes(style.flexWrap)) {
        issues.push({
          code: 'LAYOUT_INVALID_FLEX_WRAP',
          severity: 'warning',
          message: `Invalid flexWrap "${style.flexWrap}"`,
          path: `${path}.style.flexWrap`,
          blockId: block.id as string,
          expected: 'wrap or nowrap',
          received: style.flexWrap,
        });
      }

      if (style.zIndex !== undefined) {
        const z = typeof style.zIndex === 'number' ? style.zIndex : parseInt(style.zIndex as string, 10);
        if (isNaN(z)) {
          issues.push({
            code: 'LAYOUT_INVALID_Z_INDEX',
            severity: 'error',
            message: `Invalid z-index value "${style.zIndex}"`,
            path: `${path}.style.zIndex`,
            blockId: block.id as string,
          });
        }
      }

      if (style.position === 'absolute' || style.position === 'fixed') {
        const hasPositionProps = ['top', 'right', 'bottom', 'left'].some(p => style[p] !== undefined);
        if (!hasPositionProps) {
          issues.push({
            code: 'LAYOUT_ABSOLUTE_MISSING_COORDS',
            severity: 'warning',
            message: `Block with position "${style.position}" has no positioning properties (top/right/bottom/left)`,
            path,
            blockId: block.id as string,
          });
        }
      }

      if (style.aspectRatio && typeof style.aspectRatio === 'string') {
        const parts = style.aspectRatio.split('/');
        if (parts.length === 2) {
          const num = parseFloat(parts[0]);
          const den = parseFloat(parts[1]);
          if (isNaN(num) || isNaN(den) || den === 0) {
            issues.push({
              code: 'LAYOUT_INVALID_ASPECT_RATIO',
              severity: 'error',
              message: `Invalid aspectRatio "${style.aspectRatio}"`,
              path: `${path}.style.aspectRatio`,
              blockId: block.id as string,
            });
          }
        }
      }

      if (Array.isArray(block.children)) {
        walk(
          block.children as Array<Record<string, unknown>>,
          `${path}.children`,
          style,
        );
      }
    }
  }

  walk(blocks, 'blocks', null);

  return issues;
};
