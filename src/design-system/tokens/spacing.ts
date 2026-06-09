export interface SpacingScale {
  none: '0';
  xs: '0.25rem';
  sm: '0.5rem';
  md: '1rem';
  lg: '1.5rem';
  xl: '2rem';
  '2xl': '3rem';
  '3xl': '4rem';
  '4xl': '6rem';
  '5xl': '8rem';
  '6xl': '12rem';
}

export const spacing: SpacingScale = {
  none: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
  '5xl': '8rem',
  '6xl': '12rem',
};

export type SpacingToken = keyof SpacingScale;

export const spacingTailwindMap: Record<SpacingToken, string> = {
  none: 'p-0',
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  '2xl': 'p-12',
  '3xl': 'p-16',
  '4xl': 'p-24',
  '5xl': 'p-32',
  '6xl': 'p-48',
};

export const marginTailwindMap: Record<SpacingToken, string> = {
  none: 'm-0',
  xs: 'm-1',
  sm: 'm-2',
  md: 'm-4',
  lg: 'm-6',
  xl: 'm-8',
  '2xl': 'm-12',
  '3xl': 'm-16',
  '4xl': 'm-24',
  '5xl': 'm-32',
  '6xl': 'm-48',
};

export const gapTailwindMap: Record<SpacingToken, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
  '3xl': 'gap-16',
  '4xl': 'gap-24',
  '5xl': 'gap-32',
  '6xl': 'gap-48',
};

export function resolveSpacing(token: SpacingToken): string {
  return spacing[token];
}
