import type { Block } from '@/types/builder';
import type { ComputedNode } from '@/engine/layout/types';

// ── Presets ──────────────────────────────────────────────────

export type AnimationPresetName =
  | 'fadeIn' | 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight'
  | 'scaleIn' | 'scaleUp' | 'scaleDown'
  | 'slideInLeft' | 'slideInRight' | 'slideInUp' | 'slideInDown'
  | 'zoomIn'
  | 'flipInX' | 'flipInY'
  | 'bounceIn' | 'bounceUp'
  | 'none';

// ── Trigger ──────────────────────────────────────────────────

export type AnimationTrigger = 'mount' | 'viewport' | 'hover' | 'click' | 'scroll' | 'none';

// ── Stagger ──────────────────────────────────────────────────

export interface StaggerConfig {
  /** Delay increment per child (e.g. "80ms", "0.1s") */
  delayPerChild: string;
  /** Stagger direction */
  direction?: 'forward' | 'reverse' | 'random';
  /** Optional — use computed positions for spatial stagger */
  spatial?: 'row' | 'column' | 'grid';
}

// ── Per-block animation config ───────────────────────────────

export interface BlockAnimation {
  preset: AnimationPresetName;
  /** CSS animation-duration (e.g. "600ms", "1s") */
  duration?: string;
  /** CSS animation-delay (e.g. "100ms") */
  delay?: string;
  /** CSS animation-timing-function */
  easing?: string;
  /** When the animation triggers */
  trigger?: AnimationTrigger;
  /** Stagger configuration for children */
  stagger?: StaggerConfig;
  /** CSS animation-iteration-count */
  repeat?: number | 'infinite';
  /** CSS animation-direction */
  direction?: 'normal' | 'reverse' | 'alternate';
  /** CSS animation-fill-mode */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// ── Keyframe step ────────────────────────────────────────────

export interface KeyframeStep {
  /** 0 to 1 */
  offset: number;
  /** CSS properties at this keyframe */
  properties: Record<string, string>;
}

// ── Preset definition ────────────────────────────────────────

export interface AnimationPreset {
  name: AnimationPresetName;
  keyframes: KeyframeStep[];
  defaultDuration: string;
  defaultEasing: string;
}

// ── Timeline ─────────────────────────────────────────────────

export interface TimelineSequence {
  steps: TimelineStep[];
  repeat?: number;
}

export interface TimelineStep {
  blockId: string;
  animation: BlockAnimation;
  /** Relative start offset from previous step */
  startOffset?: string;
}

// ── Resolved animation for a block ───────────────────────────

export interface ResolvedAnimation {
  blockId: string;
  preset: AnimationPresetName;
  /** Final CSS animation value */
  cssAnimation: string;
  /** Final CSS animation-delay (after stagger resolution) */
  resolvedDelay: string;
  /** Computed final duration */
  resolvedDuration: string;
  /** Trigger mode */
  trigger: AnimationTrigger;
  /** Stagger details if applicable */
  staggerIndex?: number;
  staggerTotal?: number;
}

// ── Animation state for a block ──────────────────────────────

export type AnimationPlayState = 'idle' | 'playing' | 'paused' | 'finished';

export interface BlockAnimationState {
  blockId: string;
  playState: AnimationPlayState;
  animation: BlockAnimation;
}

// ── Engine input ─────────────────────────────────────────────

export interface AnimationEngineInput {
  blocks: Block[];
  computedNodes?: ComputedNode[];
}

// ── Engine output ────────────────────────────────────────────

export interface AnimationEngineOutput {
  /** All resolved animations per block */
  animations: ResolvedAnimation[];
  /** CSS @keyframes rules to inject */
  keyframesCSS: string;
  /** CSS classes to inject */
  classesCSS: string;
  /** Blocks with viewport trigger (need IntersectionObserver) */
  viewportBlocks: string[];
}

// ── Global animation registry ────────────────────────────────

export interface AnimationRegistryState {
  presets: Record<AnimationPresetName, AnimationPreset>;
  generatedKeyframes: Set<string>; // preset names already emitted as CSS
  blockStates: Record<string, BlockAnimationState>;
}
