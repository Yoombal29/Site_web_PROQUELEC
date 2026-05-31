import type { ValidationIssue, Validator, ValidatorContext } from './types';

const VALID_EVENT_CATEGORIES = [
  'block', 'page', 'history', 'export', 'ai',
  'data', 'layout', 'template', 'system', 'validation',
];

const VALID_COMMAND_PREFIXES = [
  'CREATE_', 'UPDATE_', 'DELETE_', 'MOVE_', 'SELECT_',
  'IMPORT_', 'SET_', 'SNAPSHOT_', 'UNDO', 'REDO',
  'VALIDATE_', 'PUBLISH_', 'EXPORT_', 'AI_',
];

const VALID_PANEL_POSITIONS = ['sidebar', 'right-panel', 'toolbar', 'modal', 'tab'];

export const validatePlugins: Validator = (context: ValidatorContext) => {
  const issues: ValidationIssue[] = [];

  const plugins = context.plugins || [];

  if (!Array.isArray(plugins)) {
    issues.push({
      code: 'PLUGIN_NOT_ARRAY',
      severity: 'error',
      message: 'Plugins must be an array',
    });
    return issues;
  }

  if (plugins.length === 0) return issues;

  const pluginNames = new Set<string>();

  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i];
    if (!plugin || typeof plugin !== 'object') {
      issues.push({
        code: 'PLUGIN_INVALID_ENTRY',
        severity: 'error',
        message: `Plugin at index ${i} is not a valid object`,
        path: `plugins[${i}]`,
      });
      continue;
    }

    const p = plugin as Record<string, unknown>;
    const name = (p.name || p.id) as string | undefined;

    if (!name) {
      issues.push({
        code: 'PLUGIN_MISSING_NAME',
        severity: 'error',
        message: `Plugin at index ${i} has no name or id`,
        path: `plugins[${i}]`,
      });
      continue;
    }

    if (pluginNames.has(name)) {
      issues.push({
        code: 'PLUGIN_DUPLICATE_NAME',
        severity: 'error',
        message: `Duplicate plugin name "${name}"`,
        path: `plugins[${i}]`,
      });
    }
    pluginNames.add(name);

    if (p.dependencies && Array.isArray(p.dependencies)) {
      for (const dep of p.dependencies as string[]) {
        if (!pluginNames.has(dep) && !(p as Record<string, boolean>).__allowMissingDep) {
          issues.push({
            code: 'PLUGIN_MISSING_DEPENDENCY',
            severity: 'error',
            message: `Plugin "${name}" depends on "${dep}" which is not registered`,
            path: `plugins[${i}].dependencies`,
          });
        }
      }
    }

    if (p.config && typeof p.config === 'object') {
      const config = p.config as Record<string, unknown>;
      if (config.events && Array.isArray(config.events)) {
        for (const evt of config.events as Array<Record<string, unknown>>) {
          const eventName = evt.event as string | undefined;
          if (eventName) {
            const category = eventName.split(':')[0];
            if (category && !VALID_EVENT_CATEGORIES.includes(category)) {
              issues.push({
                code: 'PLUGIN_INVALID_EVENT_CATEGORY',
                severity: 'warning',
                message: `Plugin "${name}" subscribes to event "${eventName}" with unknown category "${category}"`,
                path: `plugins[${i}].config.events`,
              });
            }
          }
        }
      }

      if (config.commands && Array.isArray(config.commands)) {
        for (const cmd of config.commands as Array<Record<string, unknown>>) {
          const cmdType = cmd.type as string | undefined;
          if (cmdType) {
            const hasValidPrefix = VALID_COMMAND_PREFIXES.some(prefix => cmdType.startsWith(prefix));
            if (!hasValidPrefix) {
              issues.push({
                code: 'PLUGIN_UNUSUAL_COMMAND_PREFIX',
                severity: 'info',
                message: `Plugin "${name}" registers command "${cmdType}" with non-standard prefix`,
                path: `plugins[${i}].config.commands`,
              });
            }
          }
        }
      }

      if (config.panels && Array.isArray(config.panels)) {
        for (const panel of config.panels as Array<Record<string, unknown>>) {
          const pos = panel.position as string | undefined;
          if (pos && !VALID_PANEL_POSITIONS.includes(pos)) {
            issues.push({
              code: 'PLUGIN_INVALID_PANEL_POSITION',
              severity: 'warning',
              message: `Plugin "${name}" uses invalid panel position "${pos}"`,
              path: `plugins[${i}].config.panels`,
              expected: VALID_PANEL_POSITIONS.join(', '),
              received: pos,
            });
          }
        }
      }
    }
  }

  return issues;
};
