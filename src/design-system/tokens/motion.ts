export interface DurationScale {
  instant: '0ms';
  fast: '150ms';
  normal: '300ms';
  slow: '500ms';
  slower: '700ms';
  slowest: '1000ms';
}

export interface EasingFunctions {
  linear: string;
  in: string;
  out: string;
  inOut: string;
  bounce: string;
  spring: string;
}

export interface TransitionProperties {
  default: string;
  color: string;
  transform: string;
  opacity: string;
  all: string;
}

export interface MotionTokens {
  duration: DurationScale;
  easing: EasingFunctions;
  transition: TransitionProperties;
}

export const motion: MotionTokens = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  transition: {
    default: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1), color 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    all: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export type DurationToken = keyof DurationScale;
export type EasingToken = keyof EasingFunctions;
export type TransitionToken = keyof TransitionProperties;
