import type { ValidationIssue, ValidationReport, ValidatorContext } from './types';
import { validateBlockTree } from './block-validator';
import { validateTokens } from './token-validator';
import { validateLayout } from './layout-validator';
import { validateBindings } from './binding-validator';
import { validateAnimations } from './animation-validator';
import { validatePlugins } from './plugin-validator';
import { validatePublishReady } from './publish-validator';
import { validateAISafety } from './ai-safety';
import { eventBus } from '../events/bus';

export type ValidationMode = 'save' | 'publish' | 'ai' | 'full';

const DEFAULT_OPTIONS = {
  mode: 'save' as ValidationMode,
  stopOnError: false,
};

function aggregate(issues: ValidationIssue[][]): ValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const infos: ValidationIssue[] = [];

  for (const issueList of issues) {
    for (const issue of issueList) {
      if (issue.severity === 'error') errors.push(issue);
      else if (issue.severity === 'warning') warnings.push(issue);
      else infos.push(issue);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    infos,
  };
}

function shouldStop(errors: ValidationIssue[], options: typeof DEFAULT_OPTIONS): boolean {
  return options.stopOnError && errors.length > 0;
}

export function validateRuntime(
  context: ValidatorContext,
  options: Partial<typeof DEFAULT_OPTIONS> = {},
): ValidationReport {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const allIssues: ValidationIssue[][] = [];
  let totalErrors = 0;

  const run = (validator: () => ValidationIssue[]) => {
    if (shouldStop(totalErrors > 0 ? [] : [], opts)) return;
    const issues = validator();
    allIssues.push(issues);
    totalErrors += issues.filter(i => i.severity === 'error').length;
  };

  run(() => validateBlockTree(context));

  if (!shouldStop([], { ...opts, stopOnError: opts.stopOnError && opts.mode === 'publish' })) {
    run(() => validateTokens(context));
  }

  run(() => validateLayout(context));

  if (opts.mode !== 'save') {
    run(() => validateBindings(context));
  }

  if (opts.mode === 'full' || opts.mode === 'publish') {
    run(() => validateAnimations(context));
  }

  if (opts.mode === 'full' || opts.mode === 'publish') {
    run(() => validatePlugins(context));
  }

  if (opts.mode === 'publish') {
    run(() => validatePublishReady(context).errors);
  }

  if (opts.mode === 'ai' || opts.mode === 'full') {
    run(() => validateAISafety(context));
  }

  const report = aggregate(allIssues);

  if (report.errors.length > 0) {
    eventBus.emit('validation:failed', {
      mode: opts.mode,
      errors: report.errors,
    });
  } else {
    eventBus.emit('validation:passed', {
      mode: opts.mode,
      warnings: report.warnings,
    });
  }

  return report;
}

export async function validateBeforeSave(
  blocks: unknown[],
  options: { themeConfig?: Record<string, unknown> } = {},
): Promise<ValidationReport> {
  return validateRuntime(
    {
      blocks,
      themeConfig: options.themeConfig,
    },
    { mode: 'save' },
  );
}
