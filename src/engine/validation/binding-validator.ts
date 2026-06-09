import type { ValidationIssue, Validator, ValidatorContext } from './types';

const TEMPLATE_REGEX = /\{\{([^}]*)\}\}/g;

const KNOWN_DATA_PATHS = [
  'page.title',
  'page.slug',
  'page.meta_description',
  'page.author',
  'page.published_at',
  'project.name',
  'project.client.name',
  'project.status',
  'project.deadline',
  'inspection.id',
  'inspection.date',
  'inspection.status',
  'inspection.result',
  'user.name',
  'user.email',
  'user.role',
  'site.name',
  'site.url',
  'stats.total',
  'stats.completed',
  'stats.pending',
  'stats.approved',
];

const KNOWN_DATA_PATHS_SET = new Set(KNOWN_DATA_PATHS);

const VALID_SOURCE_TYPES = new Set(['api', 'query', 'static', 'context', 'store']);

function validateTemplateString(value: string, issues: ValidationIssue[], path: string, blockId?: string) {
  const matches = Array.from(value.matchAll(TEMPLATE_REGEX));

  for (const match of matches) {
    const fullMatch = match[0];
    const expression = match[1].trim();

    if (!expression) {
      issues.push({
        code: 'BINDING_EMPTY_EXPRESSION',
        severity: 'error',
        message: 'Empty template expression {{}}',
        path,
        blockId,
      });
      continue;
    }

    const parts = expression.split('|').map(s => s.trim());
    const dataPath = parts[0];
    const filter = parts[1];

    if (!dataPath) {
      issues.push({
        code: 'BINDING_MISSING_PATH',
        severity: 'error',
        message: `Template expression "${fullMatch}" has no data path`,
        path,
        blockId,
      });
      continue;
    }

    const pathSegments = dataPath.split('.');
    if (pathSegments.length < 2) {
      issues.push({
        code: 'BINDING_SHORT_PATH',
        severity: 'warning',
        message: `Template expression "${fullMatch}" has a short path "${dataPath}" (expected at least 2 segments)`,
        path,
        blockId,
      });
    }

    if (!KNOWN_DATA_PATHS_SET.has(dataPath)) {
      issues.push({
        code: 'BINDING_UNKNOWN_PATH',
        severity: 'warning',
        message: `Template expression "${fullMatch}" references unknown data path "${dataPath}"`,
        path,
        blockId,
        expected: `Known paths: ${KNOWN_DATA_PATHS.slice(0, 5).join(', ')}...`,
        received: dataPath,
      });
    }

    if (filter && !['uppercase', 'lowercase', 'capitalize', 'json', 'date', 'number', 'currency'].includes(filter)) {
      issues.push({
        code: 'BINDING_UNKNOWN_FILTER',
        severity: 'warning',
        message: `Unknown template filter "${filter}" in "${fullMatch}"`,
        path,
        blockId,
        expected: 'uppercase, lowercase, capitalize, json, date, number, currency',
        received: filter,
      });
    }
  }
}

function walkBlocksForBindings(
  blocks: unknown[],
  issues: ValidationIssue[],
  bindings: unknown[],
) {
  for (const block of blocks as Array<Record<string, unknown>>) {
    const blockId = block.id as string | undefined;

    if (block.dataSource) {
      const ds = block.dataSource as Record<string, unknown>;
      if (ds.type && !VALID_SOURCE_TYPES.has(ds.type as string)) {
        issues.push({
          code: 'BINDING_INVALID_SOURCE_TYPE',
          severity: 'error',
          message: `Invalid data source type "${ds.type}"`,
          path: `blocks[].dataSource.type`,
          blockId,
          expected: [...VALID_SOURCE_TYPES].join(', '),
          received: ds.type as string,
        });
      }
      if ((ds.type === 'api' || ds.type === 'query') && !ds.endpoint && !ds.key) {
        issues.push({
          code: 'BINDING_API_MISSING_ENDPOINT',
          severity: 'error',
          message: `Data source of type "${ds.type}" is missing endpoint/key`,
          path: `blocks[].dataSource`,
          blockId,
        });
      }
    }

    const content = (block.content || block.props || {}) as Record<string, unknown>;
    for (const [key, value] of Object.entries(content)) {
      if (typeof value === 'string' && TEMPLATE_REGEX.test(value)) {
        TEMPLATE_REGEX.lastIndex = 0;
        validateTemplateString(value, issues, `blocks[].content.${key}`, blockId);
        TEMPLATE_REGEX.lastIndex = 0;
      }
    }

    const style = block.style as Record<string, unknown> | undefined;
    if (style) {
      for (const [key, value] of Object.entries(style)) {
        if (typeof value === 'string' && TEMPLATE_REGEX.test(value)) {
          TEMPLATE_REGEX.lastIndex = 0;
          validateTemplateString(value, issues, `blocks[].style.${key}`, blockId);
          TEMPLATE_REGEX.lastIndex = 0;
        }
      }
    }

    if (Array.isArray(block.children)) {
      walkBlocksForBindings(block.children, issues, bindings);
    }
  }
}

export const validateBindings: Validator = (context: ValidatorContext) => {
  const issues: ValidationIssue[] = [];

  if (Array.isArray(context.blocks)) {
    walkBlocksForBindings(context.blocks, issues, context.bindings || []);
  }

  const knownBindings = context.bindings || [];
  const bindingIds = new Set<string>();

  for (const binding of knownBindings as Array<Record<string, unknown>>) {
    const nodeId = binding.node_id as string | undefined;

    if (nodeId && bindingIds.has(nodeId)) {
      issues.push({
        code: 'BINDING_DUPLICATE_NODE',
        severity: 'warning',
        message: `Duplicate binding for node_id "${nodeId}"`,
        blockId: nodeId,
      });
    }
    if (nodeId) bindingIds.add(nodeId);

    if (binding.source_type && !VALID_SOURCE_TYPES.has(binding.source_type as string)) {
      issues.push({
        code: 'BINDING_INVALID_SOURCE_TYPE_TABLE',
        severity: 'error',
        message: `Binding has invalid source_type "${binding.source_type}"`,
        blockId: nodeId,
        expected: [...VALID_SOURCE_TYPES].join(', '),
        received: binding.source_type as string,
      });
    }
  }

  return issues;
};
