import type { ValidationIssue, Validator, ValidatorContext } from './types';

const VALID_PRESETS = new Set([
  'fadeIn', 'fadeUp', 'fadeDown', 'fadeLeft', 'fadeRight',
  'scaleIn', 'scaleUp', 'scaleDown',
  'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown',
  'zoomIn',
  'flipInX', 'flipInY',
  'bounceIn', 'bounceUp',
  'none',
]);

const VALID_TRIGGERS = new Set(['mount', 'viewport', 'hover', 'click', 'scroll', 'none']);

const VALID_DIRECTIONS = new Set(['normal', 'reverse', 'alternate']);

const VALID_FILL_MODES = new Set(['none', 'forwards', 'backwards', 'both']);

const VALID_STAGGER_DIRECTIONS = new Set(['forward', 'reverse', 'random']);

const VALID_STAGGER_SPATIAL = new Set(['row', 'column', 'grid']);

function validateBlockAnimations(
  block: Record<string, unknown>,
  issues: ValidationIssue[],
  path: string,
) {
  const animations = block.animations as Array<Record<string, unknown>> | Record<string, unknown> | undefined;

  if (!animations) return;

  const animList = Array.isArray(animations) ? animations : [animations];

  for (let i = 0; i < animList.length; i++) {
    const anim = animList[i];
    if (!anim || typeof anim !== 'object') {
      issues.push({
        code: 'ANIMATION_INVALID_ENTRY',
        severity: 'error',
        message: `Animation entry at index ${i} is not a valid object`,
        path: `${path}.animations[${i}]`,
        blockId: block.id as string,
      });
      continue;
    }

    const preset = anim.preset as string | undefined;
    if (preset && !VALID_PRESETS.has(preset)) {
      issues.push({
        code: 'ANIMATION_UNKNOWN_PRESET',
        severity: 'error',
        message: `Unknown animation preset "${preset}"`,
        path: `${path}.animations[${i}].preset`,
        blockId: block.id as string,
        expected: [...VALID_PRESETS].join(', '),
        received: preset,
      });
    }

    if (anim.duration !== undefined && typeof anim.duration === 'string') {
      const durMatch = anim.duration.match(/^(\d+)(ms|s)$/);
      if (!durMatch) {
        issues.push({
          code: 'ANIMATION_INVALID_DURATION',
          severity: 'warning',
          message: `Invalid duration format "${anim.duration}"`,
          path: `${path}.animations[${i}].duration`,
          blockId: block.id as string,
          expected: 'e.g. 300ms, 0.5s',
          received: anim.duration,
        });
      } else {
        const num = parseInt(durMatch[1], 10);
        const unit = durMatch[2];
        if (unit === 'ms' && num < 50) {
          issues.push({
            code: 'ANIMATION_DURATION_TOO_SHORT',
            severity: 'info',
            message: `Animation duration "${anim.duration}" is very short (<50ms)`,
            path: `${path}.animations[${i}].duration`,
            blockId: block.id as string,
          });
        }
        if (unit === 's' && num > 10) {
          issues.push({
            code: 'ANIMATION_DURATION_TOO_LONG',
            severity: 'warning',
            message: `Animation duration "${anim.duration}" is very long (>10s)`,
            path: `${path}.animations[${i}].duration`,
            blockId: block.id as string,
          });
        }
      }
    }

    if (anim.delay !== undefined && typeof anim.delay === 'string') {
      if (!anim.delay.match(/^(\d+)(ms|s)$/)) {
        issues.push({
          code: 'ANIMATION_INVALID_DELAY',
          severity: 'warning',
          message: `Invalid delay format "${anim.delay}"`,
          path: `${path}.animations[${i}].delay`,
          blockId: block.id as string,
        });
      }
    }

    if (anim.trigger && !VALID_TRIGGERS.has(anim.trigger as string)) {
      issues.push({
        code: 'ANIMATION_INVALID_TRIGGER',
        severity: 'warning',
        message: `Invalid animation trigger "${anim.trigger}"`,
        path: `${path}.animations[${i}].trigger`,
        blockId: block.id as string,
        expected: [...VALID_TRIGGERS].join(', '),
        received: anim.trigger as string,
      });
    }

    if (anim.direction && !VALID_DIRECTIONS.has(anim.direction as string)) {
      issues.push({
        code: 'ANIMATION_INVALID_DIRECTION',
        severity: 'warning',
        message: `Invalid animation direction "${anim.direction}"`,
        path: `${path}.animations[${i}].direction`,
        blockId: block.id as string,
        expected: [...VALID_DIRECTIONS].join(', '),
        received: anim.direction as string,
      });
    }

    if (anim.fillMode && !VALID_FILL_MODES.has(anim.fillMode as string)) {
      issues.push({
        code: 'ANIMATION_INVALID_FILL_MODE',
        severity: 'info',
        message: `Invalid animation fillMode "${anim.fillMode}"`,
        path: `${path}.animations[${i}].fillMode`,
        blockId: block.id as string,
        expected: [...VALID_FILL_MODES].join(', '),
        received: anim.fillMode as string,
      });
    }

    if (anim.repeat !== undefined) {
      if (anim.repeat !== 'infinite' && (typeof anim.repeat !== 'number' || anim.repeat < 0)) {
        issues.push({
          code: 'ANIMATION_INVALID_REPEAT',
          severity: 'warning',
          message: `Invalid repeat value "${anim.repeat}"`,
          path: `${path}.animations[${i}].repeat`,
          blockId: block.id as string,
          expected: 'positive number, 0, or "infinite"',
          received: `${anim.repeat}`,
        });
      }
    }

    if (anim.stagger) {
      const stagger = anim.stagger as Record<string, unknown>;
      if (stagger.delayPerChild && typeof stagger.delayPerChild === 'string') {
        if (!stagger.delayPerChild.match(/^(\d+)(ms|s)$/)) {
          issues.push({
            code: 'ANIMATION_INVALID_STAGGER_DELAY',
            severity: 'warning',
            message: `Invalid stagger delayPerChild "${stagger.delayPerChild}"`,
            path: `${path}.animations[${i}].stagger.delayPerChild`,
            blockId: block.id as string,
          });
        }
      }
      if (stagger.direction && !VALID_STAGGER_DIRECTIONS.has(stagger.direction as string)) {
        issues.push({
          code: 'ANIMATION_INVALID_STAGGER_DIRECTION',
          severity: 'warning',
          message: `Invalid stagger direction "${stagger.direction}"`,
          path: `${path}.animations[${i}].stagger.direction`,
          blockId: block.id as string,
          expected: [...VALID_STAGGER_DIRECTIONS].join(', '),
          received: stagger.direction as string,
        });
      }
      if (stagger.spatial && !VALID_STAGGER_SPATIAL.has(stagger.spatial as string)) {
        issues.push({
          code: 'ANIMATION_INVALID_STAGGER_SPATIAL',
          severity: 'info',
          message: `Invalid stagger spatial "${stagger.spatial}"`,
          path: `${path}.animations[${i}].stagger.spatial`,
          blockId: block.id as string,
          expected: [...VALID_STAGGER_SPATIAL].join(', '),
          received: stagger.spatial as string,
        });
      }
    }
  }
}

function walkBlocksForAnimations(blocks: unknown[], issues: ValidationIssue[], basePath: string) {
  for (let i = 0; i < (blocks as Array<Record<string, unknown>>).length; i++) {
    const block = (blocks as Array<Record<string, unknown>>)[i];
    const path = `${basePath}[${i}]`;

    validateBlockAnimations(block, issues, path);

    if (Array.isArray(block.children)) {
      walkBlocksForAnimations(block.children, issues, `${path}.children`);
    }
  }
}

export const validateAnimations: Validator = (context: ValidatorContext) => {
  const issues: ValidationIssue[] = [];

  if (Array.isArray(context.blocks)) {
    walkBlocksForAnimations(context.blocks, issues, 'blocks');
  }

  return issues;
};
