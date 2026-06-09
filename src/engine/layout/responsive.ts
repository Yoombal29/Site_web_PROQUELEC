import type { Breakpoint, ResponsiveValue } from './types';
import type { BlockStyle } from '@/types/builder';

export function resolveResponsiveValue<T>(value: ResponsiveValue<T> | undefined, breakpoint: Breakpoint): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'object' || Array.isArray(value)) return value as T;
  const partial = value as Partial<Record<Breakpoint, T>>;
  const breakpoints: Breakpoint[] = ['desktop', 'tablet', 'mobile'];
  const currentIndex = breakpoints.indexOf(breakpoint);
  if (currentIndex === -1) return partial.desktop ?? partial.tablet ?? partial.mobile;
  for (let i = currentIndex; i >= 0; i--) {
    if (partial[breakpoints[i]] !== undefined) return partial[breakpoints[i]];
  }
  return undefined;
}

export function resolveResponsiveStyle(style: BlockStyle, breakpoint: Breakpoint): BlockStyle {
  if (!style) return style;

  const resolved = { ...style };

  // Remove responsive overrides from the base style
  delete (resolved as any).mobile;
  delete (resolved as any).tablet;
  delete (resolved as any).darkStyle;

  // Apply responsive overrides if they exist
  const overrides: Partial<BlockStyle> | undefined =
    breakpoint === 'mobile' ? style.mobile :
    breakpoint === 'tablet' ? style.tablet :
    undefined;

  if (overrides) {
    Object.assign(resolved, overrides);
  }

  return resolved;
}

export function responsiveClassName(breakpoint: Breakpoint): string {
  const prefix = breakpoint === 'desktop' ? 'lg' : breakpoint === 'tablet' ? 'md' : '';
  return prefix;
}

export function breakpointMediaQuery(breakpoint: Breakpoint): string {
  switch (breakpoint) {
    case 'mobile': return '@media (max-width: 767px)';
    case 'tablet': return '@media (min-width: 768px) and (max-width: 1279px)';
    case 'desktop': return '@media (min-width: 1280px)';
    default: return '';
  }
}
