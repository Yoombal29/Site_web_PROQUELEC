import type { TemplateExpression } from './types';

const TEMPLATE_REGEX = /\{\{([^}]+)\}\}/g;

export function parseTemplate(str: string): TemplateExpression | null {
  const paths: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(TEMPLATE_REGEX.source, 'g');

  while ((match = regex.exec(str)) !== null) {
    const path = match[1].trim();
    if (path) paths.push(path);
  }

  if (paths.length === 0) return null;

  return {
    original: str,
    paths,
  };
}

export function hasTemplate(str: string): boolean {
  return TEMPLATE_REGEX.test(str);
}

export function resolveTemplate(
  str: string,
  data: Record<string, unknown>,
): string {
  return str.replace(TEMPLATE_REGEX, (_match, path: string) => {
    const trimmed = path.trim();
    const value = resolveDataPath(trimmed, data);
    if (value === undefined || value === null) return _match;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  });
}

export function resolveDataPath(path: string, data: Record<string, unknown>): unknown {
  const parts = path.split('.');
  let current: unknown = data;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

export function resolveDeep(obj: unknown, data: Record<string, unknown>): unknown {
  if (typeof obj === 'string') {
    if (hasTemplate(obj)) return resolveTemplate(obj, data);
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => resolveDeep(item, data));
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveDeep(value, data);
    }
    return result;
  }

  return obj;
}
