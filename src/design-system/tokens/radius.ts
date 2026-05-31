export interface RadiusScale {
  none: '0';
  sm: '0.125rem';
  md: '0.375rem';
  lg: '0.5rem';
  xl: '0.75rem';
  '2xl': '1rem';
  '3xl': '1.5rem';
  full: '9999px';
}

export const radius: RadiusScale = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

export type RadiusToken = keyof RadiusScale;

export const radiusTailwindMap: Record<RadiusToken, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded',
  lg: 'rounded-md',
  xl: 'rounded-lg',
  '2xl': 'rounded-xl',
  '3xl': 'rounded-2xl',
  full: 'rounded-full',
};

export function resolveRadius(token: RadiusToken): string {
  return radius[token];
}
