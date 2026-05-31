import { create } from 'zustand';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
  spacingScale: string;
  [key: string]: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#2376df',
  secondaryColor: '#054393',
  fontFamily: 'Inter, sans-serif',
  borderRadius: '12px',
  spacingScale: '1.2',
};

export const generateThemeCssVariables = (theme: ThemeConfig): Record<string, string> => {
  return {
    '--theme-primary-color': theme.primaryColor || '#2563eb',
    '--theme-secondary-color': theme.secondaryColor || '#4f46e5',
    '--theme-font-family': theme.fontFamily || 'Inter, sans-serif',
    '--theme-border-radius': theme.borderRadius || '8px',
    '--theme-spacing-scale': theme.spacingScale || '1',
  };
};

export const applyThemeCssVariables = (theme: ThemeConfig, targetDocument: Document = document) => {
  const vars = generateThemeCssVariables(theme);
  const root = targetDocument.documentElement;
  Object.entries(vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
};

interface BuilderThemeState {
  themeConfig: ThemeConfig;
  setThemeConfig: (config: Partial<ThemeConfig>) => void;
  loadTheme: (config: ThemeConfig) => void;
  resetThemeState: () => void;
}

export const useBuilderThemeStore = create<BuilderThemeState>((set) => ({
  themeConfig: { ...DEFAULT_THEME },
  setThemeConfig: (config) =>
    set((state) => {
      const nextTheme = { ...state.themeConfig, ...config };
      applyThemeCssVariables(nextTheme);
      return { themeConfig: nextTheme };
    }),
  loadTheme: (config) => {
    const nextTheme = { ...DEFAULT_THEME, ...config };
    applyThemeCssVariables(nextTheme);
    set({ themeConfig: nextTheme });
  },
  resetThemeState: () =>
    set(() => {
      applyThemeCssVariables(DEFAULT_THEME);
      return { themeConfig: { ...DEFAULT_THEME } };
    }),
}));
