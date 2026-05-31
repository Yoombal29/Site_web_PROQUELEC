import type { ValidationIssue, ValidationReport, ValidatorContext } from './types';
import { validateBlockTree } from './block-validator';
import { validateTokens } from './token-validator';
import { validateLayout } from './layout-validator';
import { validateBindings } from './binding-validator';
import { validateAnimations } from './animation-validator';
import { validatePlugins } from './plugin-validator';

const MIN_BLOCKS_FOR_PUBLISH = 1;
const MAX_BLOCKS_FOR_PUBLISH = 500;

export function validatePublishReady(context: ValidatorContext): ValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const infos: ValidationIssue[] = [];

  const collect = (issues: ValidationIssue[]) => {
    for (const issue of issues) {
      if (issue.severity === 'error') errors.push(issue);
      else if (issue.severity === 'warning') warnings.push(issue);
      else infos.push(issue);
    }
  };

  collect(validateBlockTree(context));
  collect(validateTokens(context));
  collect(validateLayout(context));
  collect(validateBindings(context));
  collect(validateAnimations(context));
  collect(validatePlugins(context));

  const blocks = context.blocks || [];
  if (!Array.isArray(blocks)) {
    errors.push({
      code: 'PUBLISH_BLOCKS_NOT_ARRAY',
      severity: 'error',
      message: 'Blocks is not an array',
    });
  } else {
    if (blocks.length < MIN_BLOCKS_FOR_PUBLISH) {
      errors.push({
        code: 'PUBLISH_NO_BLOCKS',
        severity: 'error',
        message: `Page has fewer than ${MIN_BLOCKS_FOR_PUBLISH} block(s). Add content before publishing.`,
      });
    }

    if (blocks.length > MAX_BLOCKS_FOR_PUBLISH) {
      warnings.push({
        code: 'PUBLISH_TOO_MANY_BLOCKS',
        severity: 'warning',
        message: `Page has ${blocks.length} blocks, which exceeds ${MAX_BLOCKS_FOR_PUBLISH}. Performance may degrade.`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    infos,
  };
}

export const validatePublish: Validator = (context: ValidatorContext) => {
  const report = validatePublishReady(context);
  return [...report.errors, ...report.warnings, ...report.infos];
};
