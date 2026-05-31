export type Severity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  code: string;
  severity: Severity;
  message: string;
  path?: string;
  blockId?: string;
  expected?: string;
  received?: string;
}

export interface ValidationReport {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  infos: ValidationIssue[];
}

export interface ValidatorContext {
  blocks: unknown[];
  designTokens?: Record<string, unknown>;
  plugins?: string[];
  bindings?: unknown[];
  animations?: unknown[];
  layout?: unknown;
}

export type Validator = (context: ValidatorContext) => ValidationIssue[];
