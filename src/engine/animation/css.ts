import type { AnimationPreset, BlockAnimation, ResolvedAnimation, AnimationTrigger, AnimationPresetName } from './types';
import { getPreset } from './presets';

// ── Keyframe generation ──────────────────────────────────────

/** Generate CSS @keyframes rule for a preset */
export function generateKeyframesCSS(preset: AnimationPreset): string {
  const name = preset.name;
  const steps = preset.keyframes
    .map((step) => {
      const pct = `${Math.round(step.offset * 100)}%`;
      const props = Object.entries(step.properties)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n');
      return `${pct} {\n${props}\n}`;
    })
    .join('\n\n');

  return `@keyframes ${name} {\n${steps}\n}`;
}

/** Generate CSS @keyframes for a list of preset names (deduped) */
export function generateKeyframesCSSForPresets(
  presetNames: AnimationPresetName[],
  alreadyGenerated: Set<string>,
): { css: string; generated: Set<string> } {
  const generated = new Set(alreadyGenerated);
  const parts: string[] = [];

  for (const name of presetNames) {
    if (generated.has(name) || name === 'none') continue;
    const preset = getPreset(name);
    parts.push(generateKeyframesCSS(preset));
    generated.add(name);
  }

  return { css: parts.join('\n\n'), generated };
}

// ── Animation value generation ───────────────────────────────

export interface AnimationCSSOptions {
  duration?: string;
  delay?: string;
  easing?: string;
  repeat?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

/** Build the full CSS `animation` shorthand value */
export function buildAnimationCSSValue(
  presetName: string,
  options: AnimationCSSOptions = {},
): string {
  const preset = presetName !== 'none' ? getPreset(presetName as AnimationPresetName) : null;
  if (!preset) return 'none';

  const duration = options.duration || preset.defaultDuration;
  const easing = options.easing || preset.defaultEasing;
  const delay = options.delay || '0ms';
  const repeat = options.repeat ?? 1;
  const direction = options.direction || 'normal';
  const fillMode = options.fillMode || 'both';

  const count = repeat === 'infinite' ? 'infinite' : String(repeat);

  return `${presetName} ${duration} ${easing} ${delay} ${count} ${direction} ${fillMode}`;
}

// ── CSS class generation ─────────────────────────────────────

export function generateAnimationClass(
  presetName: string,
  animation: BlockAnimation,
): string {
  const value = buildAnimationCSSValue(presetName, animation);
  return `.anim-${presetName} {\n  animation: ${value};\n}`;
}

/** Generate a viewport-triggered class that pauses until `.anim-visible` is added */
export function generateViewportAnimationClass(
  presetName: string,
  animation: BlockAnimation,
): string {
  const value = buildAnimationCSSValue(presetName, {
    ...animation,
    delay: animation.delay || '0ms',
    fillMode: animation.fillMode || 'both',
  });
  return (
    `.anim-${presetName}-vp {\n` +
    `  animation: ${value};\n` +
    `  animation-play-state: paused;\n` +
    `  opacity: 0;\n` +
    `}\n` +
    `.anim-${presetName}-vp.anim-visible {\n` +
    `  animation-play-state: running;\n` +
    `}`
  );
}

// ── Resolved animation → string ──────────────────────────────

export function resolvedAnimationToCSS(ra: ResolvedAnimation): string {
  return (
    `[data-block-id="${ra.blockId}"] {\n` +
    `  animation: ${ra.cssAnimation};\n` +
    `  animation-delay: ${ra.resolvedDelay};\n` +
    `  animation-duration: ${ra.resolvedDuration};\n` +
    `}`
  );
}

// ── Animation play state classes ─────────────────────────────

export const PLAY_STATE_CLASSES: Record<string, string> = {
  idle: '',
  playing: 'anim-playing',
  paused: 'anim-paused',
  finished: 'anim-finished',
};
