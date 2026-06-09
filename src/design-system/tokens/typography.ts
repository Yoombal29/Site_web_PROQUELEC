export interface FontFamily {
  sans: string;
  serif: string;
  mono: string;
  heading: string;
  body: string;
}

export interface FontSizeScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface FontWeight {
  thin: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  black: number;
}

export interface LineHeight {
  none: string;
  tight: string;
  snug: string;
  normal: string;
  relaxed: string;
  loose: string;
}

export interface TypographyTokens {
  fontFamily: FontFamily;
  fontSize: FontSizeScale;
  fontWeight: FontWeight;
  lineHeight: LineHeight;
}

export const typography: TypographyTokens = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    serif: "'Merriweather', Georgia, serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
    heading: "'Inter', system-ui, -apple-system, sans-serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  fontWeight: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
};

export type FontFamilyToken = keyof FontFamily;
export type FontSizeToken = keyof FontSizeScale;
export type FontWeightToken = keyof FontWeight;
export type LineHeightToken = keyof LineHeight;

export const fontSizeTailwindMap: Record<FontSizeToken, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
};

export const fontWeightTailwindMap: Record<FontWeightToken, string> = {
  thin: 'font-thin',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  black: 'font-black',
};
