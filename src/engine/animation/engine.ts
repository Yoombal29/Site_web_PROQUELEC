import type { Block } from '@/types/builder';
import type { ComputedNode } from '@/engine/layout/types';
import type {
  BlockAnimation,
  AnimationEngineInput,
  AnimationEngineOutput,
  ResolvedAnimation,
  AnimationPresetName,
  AnimationTrigger,
  StaggerConfig,
} from './types';
import { getPreset, defaultPresetByType, isKnownPreset } from './presets';
import {
  generateKeyframesCSSForPresets,
  buildAnimationCSSValue,
  generateViewportAnimationClass,
  generateAnimationClass,
} from './css';

// ── Extract animation config from a block ────────────────────

export function extractBlockAnimation(block: Block): BlockAnimation | null {
  // Check for animation in block style
  const style = block.style || {};

  // If block has an explicit animation string, try to parse it
  if (style.animation && style.animation !== 'none') {
    // Could be "fadeUp 500ms ease-out" — try to extract preset name
    const parts = style.animation.split(/\s+/);
    const presetName = parts[0];
    if (isKnownPreset(presetName)) {
      return {
        preset: presetName,
        duration: parts[1],
        easing: parts[2],
        trigger: 'mount',
      };
    }
  }

  // Check for animation in block props/content
  const content = block.content || {};
  const anim = (content as Record<string, unknown>).animation as
    | Record<string, unknown>
    | undefined;

  if (anim && typeof anim === 'object') {
    const type = anim.type as string | undefined;
    if (type && type !== 'none' && type !== undefined) {
      // Map old type names to preset names
      const presetMap: Record<string, AnimationPresetName> = {
        fade: 'fadeIn',
        slide: 'slideInUp',
        zoom: 'zoomIn',
      };
      const preset = type === 'fade' ? 'fadeIn'
        : type === 'slide' ? 'slideInUp'
        : type === 'zoom' ? 'zoomIn'
        : null;
      if (preset) {
        return {
          preset,
          duration: anim.duration ? `${anim.duration}ms` : undefined,
          delay: anim.delay ? `${anim.delay}ms` : undefined,
          trigger: 'viewport',
        };
      }
    }
  }

  // No explicit animation
  return null;
}

// ── Resolve stagger delays ──────────────────────────────────

export function resolveStaggerDelays(
  children: Block[],
  stagger: StaggerConfig,
  computedNodes?: ComputedNode[],
): { blockId: string; delay: string }[] {
  const count = children.length;
  if (count === 0) return [];

  const delayMs = parseCssTime(stagger.delayPerChild);
  if (delayMs <= 0) return children.map((c) => ({ blockId: c.id, delay: '0ms' }));

  if (stagger.spatial && computedNodes && computedNodes.length > 0) {
    // Spatial stagger: order by position
    const nodeMap = new Map(computedNodes.map((n) => [n.id, n]));
    const withPos = children
      .map((c) => ({ block: c, node: nodeMap.get(c.id) }))
      .sort((a, b) => {
        if (!a.node || !b.node) return 0;
        if (stagger.spatial === 'row') return a.node.x - b.node.x;
        if (stagger.spatial === 'column') return a.node.y - b.node.y;
        // grid: row-major
        const rowDiff = a.node.y - b.node.y;
        return rowDiff !== 0 ? rowDiff : a.node.x - b.node.x;
      });

    return withPos.map((item, i) => ({
      blockId: item.block.id,
      delay: `${i * delayMs}ms`,
    }));
  }

  // Directional stagger
  if (stagger.direction === 'reverse') {
    return children.map((c, i) => ({
      blockId: c.id,
      delay: `${(count - 1 - i) * delayMs}ms`,
    }));
  }

  if (stagger.direction === 'random') {
    return children.map((c) => ({
      blockId: c.id,
      delay: `${Math.floor(Math.random() * count) * delayMs}ms`,
    }));
  }

  // Default: forward
  return children.map((c, i) => ({
    blockId: c.id,
    delay: `${i * delayMs}ms`,
  }));
}

// ── Resolve animations for a block tree ──────────────────────

export interface ResolveAnimationOptions {
  /** Force viewport trigger for all blocks with animations */
  forceViewport?: boolean;
  /** Default trigger when none is specified */
  defaultTrigger?: AnimationTrigger;
  /** Previously generated preset names (to avoid duplicate keyframes) */
  alreadyGenerated?: Set<string>;
}

export function resolveBlockAnimations(
  blocks: Block[],
  computedNodes?: ComputedNode[],
  options: ResolveAnimationOptions = {},
): AnimationEngineOutput {
  const animations: ResolvedAnimation[] = [];
  const neededPresets = new Set<string>();
  const viewportBlocks: string[] = [];
  const generated = options.alreadyGenerated || new Set<string>();
  const defaultTrigger = options.defaultTrigger || 'mount';

  function walk(blockList: Block[], parentAnimation?: BlockAnimation): void {
    for (const block of blockList) {
      let anim = extractBlockAnimation(block);

      // Inherit parent stagger if not specified
      if (!anim && parentAnimation?.stagger && parentAnimation.preset !== 'none') {
        anim = {
          preset: defaultPresetByType[block.type] || 'fadeIn',
          trigger: defaultTrigger,
          duration: undefined,
          delay: undefined,
          easing: undefined,
        };
      }

      if (anim && anim.preset !== 'none') {
        const preset = getPreset(anim.preset);
        neededPresets.add(anim.preset);

        const duration = anim.duration || preset.defaultDuration;
        const easing = anim.easing || preset.defaultEasing;
        const delay = anim.delay || '0ms';
        const trigger = options.forceViewport ? 'viewport' : (anim.trigger || defaultTrigger);

        const cssAnimation = buildAnimationCSSValue(anim.preset, {
          duration,
          easing,
          delay,
          repeat: anim.repeat,
          direction: anim.direction,
          fillMode: anim.fillMode,
        });

        const ra: ResolvedAnimation = {
          blockId: block.id,
          preset: anim.preset,
          cssAnimation,
          resolvedDelay: delay,
          resolvedDuration: duration,
          trigger,
        };

        animations.push(ra);

        if (trigger === 'viewport') {
          viewportBlocks.push(block.id);
        }
      }

      // Handle stagger for children
      if (anim?.stagger && block.children && block.children.length > 0) {
        const staggerDelays = resolveStaggerDelays(
          block.children,
          anim.stagger,
          computedNodes,
        );
        const staggerDelayMap = new Map(staggerDelays.map((d) => [d.blockId, d.delay]));

        for (const child of block.children) {
          let childAnim = extractBlockAnimation(child);
          if (!childAnim) {
            childAnim = {
              preset: defaultPresetByType[child.type] || 'fadeIn',
              trigger: 'viewport',
              duration: undefined,
              delay: undefined,
              easing: undefined,
            };
          }

          if (childAnim.preset !== 'none') {
            const childDelay = staggerDelayMap.get(child.id) || '0ms';
            const preset = getPreset(childAnim.preset);
            neededPresets.add(childAnim.preset);

            const duration = childAnim.duration || preset.defaultDuration;
            const easing = childAnim.easing || preset.defaultEasing;
            const trigger = options.forceViewport ? 'viewport' : (childAnim.trigger || 'viewport');

            const cssAnimation = buildAnimationCSSValue(childAnim.preset, {
              duration,
              easing,
              delay: childDelay,
              repeat: childAnim.repeat,
              direction: childAnim.direction,
              fillMode: childAnim.fillMode,
            });

            const ra: ResolvedAnimation = {
              blockId: child.id,
              preset: childAnim.preset,
              cssAnimation,
              resolvedDelay: childDelay,
              resolvedDuration: duration,
              trigger,
              staggerIndex: staggerDelays.findIndex((d) => d.blockId === child.id),
              staggerTotal: staggerDelays.length,
            };

            animations.push(ra);

            if (trigger === 'viewport') {
              viewportBlocks.push(child.id);
            }
          }
        }
      }

      // Recurse into children (even without stagger)
      if (block.children && block.children.length > 0 && !anim?.stagger) {
        walk(block.children, anim || undefined);
      }
    }
  }

  walk(blocks);

  // Generate CSS
  const { css: keyframesCSS, generated: updatedGenerated } = generateKeyframesCSSForPresets(
    Array.from(neededPresets) as AnimationPresetName[],
    generated,
  );

  // Generate class CSS
  const classParts: string[] = [];
  for (const ra of animations) {
    if (ra.trigger === 'viewport') {
      classParts.push(
        generateViewportAnimationClass(ra.preset, {
          preset: ra.preset,
          duration: ra.resolvedDuration,
          easing: undefined,
          delay: ra.resolvedDelay,
          trigger: 'viewport',
        }),
      );
    }
  }

  const classesCSS = classParts.join('\n\n');

  return {
    animations,
    keyframesCSS,
    classesCSS,
    viewportBlocks,
  };
}

// ── Helper: Parse CSS time to ms ─────────────────────────────

export function parseCssTime(value: string): number {
  const match = value.match(/^([\d.]+)(ms|s)$/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  return match[2] === 's' ? num * 1000 : num;
}
