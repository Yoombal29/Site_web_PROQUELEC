export interface RuntimeEffects {
  shadow?: string;
  blur?: string; // generic blur value (px/em/rem)
  backdropBlur?: string; // backdrop blur value (px)
  opacity?: number; // 0..1
  transition?: {
    duration?: string; // e.g. '300ms', '8000ms'
    easing?: string; // e.g. 'ease', 'linear', 'ease-in-out'
    property?: string; // e.g. 'opacity, transform'
  };
  // Lightweight animation/runtime hints
  transform?: string; // e.g. 'translateY(4px)'
  willChange?: string; // e.g. 'opacity, transform'
  reduceMotion?: boolean; // respect prefers-reduced-motion
}

export type EffectRuntimeSchema = RuntimeEffects;
