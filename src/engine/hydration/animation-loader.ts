import type { Block } from '@/types/builder';
import type { BlockAnimation, AnimationRegistryState, ResolvedAnimation } from '@/engine/animation/types';
import { extractBlockAnimation } from '@/engine/animation/engine';
import { generateKeyframesCSSForPresets, generateViewportAnimationClass } from '@/engine/animation/css';

export interface AnimationLoadResult {
  animations: ResolvedAnimation[];
  viewportBlocks: string[];
  keyframesCSS: string;
  errors: string[];
}

export function loadBlockAnimations(blocks: Block[]): AnimationLoadResult {
  const result: AnimationLoadResult = {
    animations: [],
    viewportBlocks: [],
    keyframesCSS: '',
    errors: [],
  };

  const usedPresets = new Set<string>();

  function walk(block: Block): void {
    try {
      const anim = extractBlockAnimation(block);
      if (anim && anim.preset !== 'none') {
        usedPresets.add(anim.preset);
        if (anim.trigger === 'viewport') {
          result.viewportBlocks.push(block.id);
        }
      }
    } catch (err) {
      result.errors.push(
        `Animation extract error on block ${block.id}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    if (block.children && block.children.length > 0) {
      for (const child of block.children) {
        walk(child);
      }
    }
  }

  for (const block of blocks) {
    walk(block);
  }

  if (usedPresets.size > 0) {
    result.keyframesCSS = generateKeyframesCSSForPresets(Array.from(usedPresets));
  }

  result.viewportBlocks = [...new Set(result.viewportBlocks)];

  return result;
}
