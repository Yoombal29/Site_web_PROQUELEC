/**
 * toolOverrides.ts
 * Utilitaire pour lire les surcharges de configuration des outils
 * Stockées dans localStorage par ToolsManagerPage
 */

const OVERRIDES_KEY = 'proquelec_tools_overrides';

export type ToolOverride = {
  category?: 'free' | 'premium' | 'internal';
  status?: 'active' | 'coming' | 'development';
};

export function getToolOverrides(): Record<string, ToolOverride> {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getEffectiveCategory(
  originalCategory: string,
  toolId: string,
): 'free' | 'premium' | 'internal' {
  const overrides = getToolOverrides();
  const override = overrides[toolId];
  if (override?.category) return override.category;
  return originalCategory as 'free' | 'premium' | 'internal';
}

export function getEffectiveStatus(
  originalStatus: string,
  toolId: string,
): 'active' | 'coming' | 'development' {
  const overrides = getToolOverrides();
  const override = overrides[toolId];
  if (override?.status) return override.status;
  return originalStatus as 'active' | 'coming' | 'development';
}
