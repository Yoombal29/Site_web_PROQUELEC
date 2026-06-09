import { colors, generateColorCSSVars } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { radius } from '../tokens/radius';

export interface ThemeDefinition {
  id: string;
  name: string;
  colors: Record<string, Record<string, string>>;
  spacing: Record<string, string>;
  fonts: Record<string, string>;
  radii: Record<string, string>;
}

const proquelecColors: Record<string, Record<string, string>> = {};
for (const [scale, shades] of Object.entries(colors)) {
  proquelecColors[scale] = { ...shades };
}

export const themes: Record<string, ThemeDefinition> = {
  proquelec: {
    id: 'proquelec',
    name: 'PROQUELEC',
    colors: proquelecColors,
    spacing: { ...spacing },
    fonts: {
      heading: typography.fontFamily.heading,
      body: typography.fontFamily.body,
      mono: typography.fontFamily.mono,
    },
    radii: { ...radius },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: {
        50: '#172554',
        100: '#1e3a8a',
        200: '#1e40af',
        300: '#1d4ed8',
        400: '#2563eb',
        500: '#3b82f6',
        600: '#60a5fa',
        700: '#93c5fd',
        800: '#bfdbfe',
        900: '#dbeafe',
        950: '#eff6ff',
      },
      secondary: {
        50: '#052e16',
        100: '#14532d',
        200: '#166534',
        300: '#15803d',
        400: '#16a34a',
        500: '#22c55e',
        600: '#4ade80',
        700: '#86efac',
        800: '#bbf7d0',
        900: '#dcfce7',
        950: '#f0fdf4',
      },
      surface: {
        50: '#020617',
        100: '#0f172a',
        200: '#1e293b',
        300: '#334155',
        400: '#475569',
        500: '#64748b',
        600: '#94a3b8',
        700: '#cbd5e1',
        800: '#e2e8f0',
        900: '#f1f5f9',
        950: '#f8fafc',
      },
      accent: proquelecColors.accent,
      danger: proquelecColors.danger,
      warning: proquelecColors.warning,
      success: proquelecColors.success,
      neutral: {
        50: '#0a0a0a',
        100: '#171717',
        200: '#262626',
        300: '#404040',
        400: '#525252',
        500: '#737373',
        600: '#a3a3a3',
        700: '#d4d4d4',
        800: '#e5e5e5',
        900: '#f5f5f5',
        950: '#fafafa',
      },
    },
    spacing: { ...spacing },
    fonts: {
      heading: typography.fontFamily.heading,
      body: typography.fontFamily.body,
      mono: typography.fontFamily.mono,
    },
    radii: { ...radius },
  },
};

export function getTheme(themeId: string): ThemeDefinition {
  return themes[themeId] || themes.proquelec;
}

export function generateThemeCSS(theme: ThemeDefinition): string {
  return `/* Theme: ${theme.name} */
:root {
${generateColorCSSVars('color')}
  --font-heading: ${theme.fonts.heading};
  --font-body: ${theme.fonts.body};
  --font-mono: ${theme.fonts.mono};
${Object.entries(theme.spacing).map(([k, v]) => `  --spacing-${k}: ${v};`).join('\n')}
${Object.entries(theme.radii).map(([k, v]) => `  --radius-${k}: ${v};`).join('\n')}
}`;
}

export function generateTailwindConfig(theme: ThemeDefinition): string {
  const colorEntries = Object.entries(theme.colors)
    .map(([scale, shades]) => {
      const shadesStr = Object.entries(shades)
        .map(([k, v]) => `        ${k}: '${v}'`)
        .join(',\n');
      return `      ${scale}: {\n${shadesStr}\n      }`;
    })
    .join(',\n');

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${colorEntries}
      },
      fontFamily: {
        heading: ['${theme.fonts.heading}'],
        body: ['${theme.fonts.body}'],
        mono: ['${theme.fonts.mono}'],
      },
      borderRadius: {
${Object.entries(theme.radii).map(([k, v]) => `        ${k}: '${v}'`).join(',\n')}
      },
      spacing: {
${Object.entries(theme.spacing).map(([k, v]) => `        ${k}: '${v}'`).join(',\n')}
      },
    },
  },
};`;
}
