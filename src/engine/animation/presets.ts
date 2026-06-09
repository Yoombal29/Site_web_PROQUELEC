import type { AnimationPreset, AnimationPresetName, KeyframeStep } from './types';

// ── Keyframe helpers ─────────────────────────────────────────

const k = (offset: number, properties: Record<string, string>): KeyframeStep => ({
  offset,
  properties,
});

const from = (props: Record<string, string>) => k(0, props);
const mid = (offset: number, props: Record<string, string>) => k(offset, props);
const to = (props: Record<string, string>) => k(1, props);

// ── Preset definitions ───────────────────────────────────────

export const presets: Record<AnimationPresetName, AnimationPreset> = {
  fadeIn: {
    name: 'fadeIn',
    defaultDuration: '400ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ opacity: '0' }),
      to({ opacity: '1' }),
    ],
  },

  fadeUp: {
    name: 'fadeUp',
    defaultDuration: '500ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ opacity: '0', transform: 'translateY(24px)' }),
      to({ opacity: '1', transform: 'translateY(0)' }),
    ],
  },

  fadeDown: {
    name: 'fadeDown',
    defaultDuration: '500ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ opacity: '0', transform: 'translateY(-24px)' }),
      to({ opacity: '1', transform: 'translateY(0)' }),
    ],
  },

  fadeLeft: {
    name: 'fadeLeft',
    defaultDuration: '500ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ opacity: '0', transform: 'translateX(-24px)' }),
      to({ opacity: '1', transform: 'translateX(0)' }),
    ],
  },

  fadeRight: {
    name: 'fadeRight',
    defaultDuration: '500ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ opacity: '0', transform: 'translateX(24px)' }),
      to({ opacity: '1', transform: 'translateX(0)' }),
    ],
  },

  scaleIn: {
    name: 'scaleIn',
    defaultDuration: '400ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ opacity: '0', transform: 'scale(0.9)' }),
      to({ opacity: '1', transform: 'scale(1)' }),
    ],
  },

  scaleUp: {
    name: 'scaleUp',
    defaultDuration: '500ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ opacity: '0', transform: 'scale(0.75)' }),
      mid(0.6, { opacity: '1', transform: 'scale(1.05)' }),
      to({ transform: 'scale(1)' }),
    ],
  },

  scaleDown: {
    name: 'scaleDown',
    defaultDuration: '400ms',
    defaultEasing: 'ease-in',
    keyframes: [
      from({ opacity: '0', transform: 'scale(1.1)' }),
      to({ opacity: '1', transform: 'scale(1)' }),
    ],
  },

  slideInLeft: {
    name: 'slideInLeft',
    defaultDuration: '600ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ transform: 'translateX(-100%)' }),
      to({ transform: 'translateX(0)' }),
    ],
  },

  slideInRight: {
    name: 'slideInRight',
    defaultDuration: '600ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ transform: 'translateX(100%)' }),
      to({ transform: 'translateX(0)' }),
    ],
  },

  slideInUp: {
    name: 'slideInUp',
    defaultDuration: '600ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ transform: 'translateY(100%)' }),
      to({ transform: 'translateY(0)' }),
    ],
  },

  slideInDown: {
    name: 'slideInDown',
    defaultDuration: '600ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ transform: 'translateY(-100%)' }),
      to({ transform: 'translateY(0)' }),
    ],
  },

  zoomIn: {
    name: 'zoomIn',
    defaultDuration: '500ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ opacity: '0', transform: 'scale(0.3)' }),
      mid(0.5, { opacity: '1', transform: 'scale(1.05)' }),
      to({ transform: 'scale(1)' }),
    ],
  },

  flipInX: {
    name: 'flipInX',
    defaultDuration: '600ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ transform: 'perspective(400px) rotateX(90deg)', opacity: '0' }),
      mid(0.4, { transform: 'perspective(400px) rotateX(-20deg)' }),
      mid(0.6, { transform: 'perspective(400px) rotateX(10deg)', opacity: '1' }),
      to({ transform: 'perspective(400px) rotateX(0deg)' }),
    ],
  },

  flipInY: {
    name: 'flipInY',
    defaultDuration: '600ms',
    defaultEasing: 'ease-out',
    keyframes: [
      from({ transform: 'perspective(400px) rotateY(90deg)', opacity: '0' }),
      mid(0.4, { transform: 'perspective(400px) rotateY(-20deg)' }),
      mid(0.6, { transform: 'perspective(400px) rotateY(10deg)', opacity: '1' }),
      to({ transform: 'perspective(400px) rotateY(0deg)' }),
    ],
  },

  bounceIn: {
    name: 'bounceIn',
    defaultDuration: '700ms',
    defaultEasing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    keyframes: [
      from({ opacity: '0', transform: 'scale(0.3)' }),
      mid(0.2, { transform: 'scale(1.1)' }),
      mid(0.4, { transform: 'scale(0.9)' }),
      mid(0.6, { opacity: '1', transform: 'scale(1.03)' }),
      mid(0.8, { transform: 'scale(0.97)' }),
      to({ opacity: '1', transform: 'scale(1)' }),
    ],
  },

  bounceUp: {
    name: 'bounceUp',
    defaultDuration: '600ms',
    defaultEasing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    keyframes: [
      from({ opacity: '0', transform: 'translateY(40px)' }),
      mid(0.3, { opacity: '1', transform: 'translateY(-10px)' }),
      mid(0.5, { transform: 'translateY(4px)' }),
      mid(0.7, { transform: 'translateY(-2px)' }),
      to({ transform: 'translateY(0)' }),
    ],
  },

  none: {
    name: 'none',
    defaultDuration: '0ms',
    defaultEasing: 'linear',
    keyframes: [
      from({}),
      to({}),
    ],
  },
};

// ── Helpers ──────────────────────────────────────────────────

export function getPreset(name: AnimationPresetName): AnimationPreset {
  return presets[name] || presets.fadeIn;
}

export function isKnownPreset(name: string): name is AnimationPresetName {
  return name in presets;
}

export function getAllPresetNames(): AnimationPresetName[] {
  return Object.keys(presets).filter((k): k is AnimationPresetName => k !== 'none');
}

/** Default animation options by block type — used by AI/heuristic */
export const defaultPresetByType: Record<string, AnimationPresetName> = {
  hero: 'fadeUp',
  section: 'fadeIn',
  'text-block': 'fadeUp',
  image: 'scaleIn',
  button: 'fadeIn',
  card: 'fadeUp',
  stats: 'fadeUp',
  grid: 'fadeIn',
  columns: 'fadeIn',
  list: 'fadeLeft',
  video: 'scaleIn',
  form: 'fadeUp',
  divider: 'fadeIn',
  spacer: 'none',
};
