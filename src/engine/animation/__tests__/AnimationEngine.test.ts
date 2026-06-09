import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Block } from '@/types/builder';
import { presets, getPreset, isKnownPreset, getAllPresetNames, defaultPresetByType } from '../presets';
import {
  generateKeyframesCSS,
  buildAnimationCSSValue,
  generateAnimationClass,
  generateViewportAnimationClass,
} from '../css';
import {
  extractBlockAnimation,
  resolveBlockAnimations,
  resolveStaggerDelays,
  parseCssTime,
} from '../engine';
import { TimelineRunner, buildTimelineFromAnimations } from '../timeline';

describe('AnimationPresets', () => {
  it('should have all presets defined', () => {
    expect(presets.fadeIn).toBeDefined();
    expect(presets.fadeUp).toBeDefined();
    expect(presets.scaleIn).toBeDefined();
    expect(presets.slideInLeft).toBeDefined();
    expect(presets.zoomIn).toBeDefined();
    expect(presets.flipInX).toBeDefined();
    expect(presets.bounceIn).toBeDefined();
    expect(presets.none).toBeDefined();
  });

  it('should have valid keyframes', () => {
    for (const preset of Object.values(presets)) {
      expect(preset.keyframes.length).toBeGreaterThanOrEqual(2);
      expect(preset.keyframes[0].offset).toBe(0);
      expect(preset.keyframes[preset.keyframes.length - 1].offset).toBe(1);
    }
  });

  it('should get preset by name', () => {
    expect(getPreset('fadeIn').name).toBe('fadeIn');
    expect(getPreset('none').name).toBe('none');
  });

  it('should fallback to fadeIn for unknown preset', () => {
    expect(getPreset('undefined' as any).name).toBe('fadeIn');
  });

  it('should detect known presets', () => {
    expect(isKnownPreset('fadeIn')).toBe(true);
    expect(isKnownPreset('bounceUp')).toBe(true);
    expect(isKnownPreset('unknown')).toBe(false);
  });

  it('should return all preset names excluding none', () => {
    const names = getAllPresetNames();
    expect(names).not.toContain('none');
    expect(names).toContain('fadeIn');
    expect(names).toContain('bounceUp');
  });

  it('should have default presets for block types', () => {
    expect(defaultPresetByType.hero).toBe('fadeUp');
    expect(defaultPresetByType.card).toBe('fadeUp');
    expect(defaultPresetByType.spacer).toBe('none');
  });
});

describe('CSS generation', () => {
  it('should generate @keyframes CSS', () => {
    const css = generateKeyframesCSS(presets.fadeIn);
    expect(css).toContain('@keyframes fadeIn');
    expect(css).toContain('0%');
    expect(css).toContain('100%');
    expect(css).toContain('opacity: 0');
    expect(css).toContain('opacity: 1');
  });

  it('should build animation CSS value', () => {
    const value = buildAnimationCSSValue('fadeIn', {
      duration: '500ms',
      easing: 'ease-out',
      delay: '100ms',
    });
    expect(value).toContain('fadeIn');
    expect(value).toContain('500ms');
    expect(value).toContain('ease-out');
    expect(value).toContain('100ms');
    expect(value).toContain('both');
  });

  it('should use preset defaults when not specified', () => {
    const value = buildAnimationCSSValue('fadeUp');
    expect(value).toContain('500ms');
    expect(value).toContain('ease-out');
    expect(value).toContain('0ms');
  });

  it('should generate animation class', () => {
    const css = generateAnimationClass('fadeIn', {
      preset: 'fadeIn',
      duration: '400ms',
      easing: 'ease-out',
      trigger: 'mount',
    });
    expect(css).toContain('.anim-fadeIn');
    expect(css).toContain('animation:');
  });

  it('should generate viewport animation class', () => {
    const css = generateViewportAnimationClass('fadeUp', {
      preset: 'fadeUp',
      duration: '500ms',
      easing: 'ease-out',
      trigger: 'viewport',
    });
    expect(css).toContain('anim-fadeUp-vp');
    expect(css).toContain('anim-visible');
    expect(css).toContain('animation-play-state: paused');
    expect(css).toContain('animation-play-state: running');
  });
});

describe('extractBlockAnimation', () => {
  it('should return null for block without animation', () => {
    const block: Block = { id: '1', type: 'hero', content: {} };
    expect(extractBlockAnimation(block)).toBeNull();
  });

  it('should extract from style.animation string', () => {
    const block: Block = {
      id: '1',
      type: 'hero',
      content: {},
      style: { animation: 'fadeUp 500ms ease-out' },
    };
    const anim = extractBlockAnimation(block);
    expect(anim).not.toBeNull();
    expect(anim!.preset).toBe('fadeUp');
  });

  it('should extract from content.animation object (legacy)', () => {
    const block: Block = {
      id: '1',
      type: 'section',
      content: {
        title: 'Test',
        animation: { type: 'fade', duration: 400, delay: 100 },
      },
    };
    const anim = extractBlockAnimation(block);
    expect(anim).not.toBeNull();
    expect(anim!.preset).toBe('fadeIn');
    expect(anim!.duration).toBe('400ms');
    expect(anim!.delay).toBe('100ms');
  });
});

describe('resolveBlockAnimations', () => {
  it('should return empty output for empty blocks', () => {
    const result = resolveBlockAnimations([]);
    expect(result.animations).toHaveLength(0);
    expect(result.keyframesCSS).toBe('');
    expect(result.classesCSS).toBe('');
    expect(result.viewportBlocks).toHaveLength(0);
  });

  it('should resolve animation for blocks with style.animation', () => {
    const blocks: Block[] = [
      {
        id: 'b1',
        type: 'hero',
        content: {},
        style: { animation: 'fadeUp 500ms ease-out' },
      },
    ];
    const result = resolveBlockAnimations(blocks);
    expect(result.animations).toHaveLength(1);
    expect(result.animations[0].blockId).toBe('b1');
    expect(result.animations[0].preset).toBe('fadeUp');
    expect(result.keyframesCSS).toContain('@keyframes fadeUp');
  });

  it('should deduplicate keyframes', () => {
    const blocks: Block[] = [
      { id: 'b1', type: 'hero', content: {}, style: { animation: 'fadeUp 500ms ease-out' } },
      { id: 'b2', type: 'section', content: {}, style: { animation: 'fadeUp 400ms ease-in' } },
    ];
    const result = resolveBlockAnimations(blocks);
    // Keyframes should only appear once
    const matches = result.keyframesCSS.match(/@keyframes fadeUp/g);
    expect(matches).toHaveLength(1);
  });

  it('should identify viewport blocks', () => {
    const blocks: Block[] = [
      {
        id: 'b1',
        type: 'hero',
        content: {},
        style: { animation: 'fadeIn' },
      },
    ];
    const result = resolveBlockAnimations(blocks, undefined, {
      forceViewport: true,
    });
    expect(result.viewportBlocks).toContain('b1');
    expect(result.classesCSS).toContain('anim-fadeIn-vp');
  });
});

describe('resolveStaggerDelays', () => {
  const children: Block[] = [
    { id: 'c1', type: 'card', content: {} },
    { id: 'c2', type: 'card', content: {} },
    { id: 'c3', type: 'card', content: {} },
  ];

  it('should calculate forward stagger delays', () => {
    const delays = resolveStaggerDelays(children, {
      delayPerChild: '100ms',
      direction: 'forward',
    });
    expect(delays).toHaveLength(3);
    expect(delays[0].delay).toBe('0ms');
    expect(delays[1].delay).toBe('100ms');
    expect(delays[2].delay).toBe('200ms');
  });

  it('should calculate reverse stagger delays', () => {
    const delays = resolveStaggerDelays(children, {
      delayPerChild: '100ms',
      direction: 'reverse',
    });
    expect(delays[0].delay).toBe('200ms');
    expect(delays[1].delay).toBe('100ms');
    expect(delays[2].delay).toBe('0ms');
  });
});

describe('parseCssTime', () => {
  it('should parse ms values', () => {
    expect(parseCssTime('300ms')).toBe(300);
    expect(parseCssTime('0ms')).toBe(0);
    expect(parseCssTime('1000ms')).toBe(1000);
  });

  it('should parse s values', () => {
    expect(parseCssTime('1s')).toBe(1000);
    expect(parseCssTime('0.5s')).toBe(500);
    expect(parseCssTime('2s')).toBe(2000);
  });

  it('should return 0 for invalid values', () => {
    expect(parseCssTime('')).toBe(0);
    expect(parseCssTime('auto')).toBe(0);
  });
});

describe('TimelineRunner', () => {
  it('should run timeline steps in order', () => {
    vi.useFakeTimers();

    const sequence = {
      steps: [
        { blockId: 'b1', animation: { preset: 'fadeIn' as const, duration: '50ms', trigger: 'mount' as const }, startOffset: '0ms' },
        { blockId: 'b2', animation: { preset: 'fadeUp' as const, duration: '50ms', trigger: 'mount' as const }, startOffset: '20ms' },
      ],
    };

    const runner = new TimelineRunner(sequence);
    const events: string[] = [];

    runner.onEvent((e) => {
      const label = e.stepIndex !== undefined ? `${e.type}:${e.stepIndex}` : e.type;
      events.push(label);
    });

    runner.play();

    // Fast forward past all animations: 0 + 50 + 20 + 50 = 120ms total
    vi.advanceTimersByTime(200);

    expect(events).toEqual([
      'step:start:0',
      'step:end:0',
      'step:start:1',
      'step:end:1',
      'timeline:end',
    ]);

    runner.destroy();
    vi.useRealTimers();
  });

  it('should build timeline from animations', () => {
    const animations = [
      { blockId: 'b1', animation: { preset: 'fadeIn' as const, duration: '300ms', trigger: 'mount' as const } },
      { blockId: 'b2', animation: { preset: 'fadeUp' as const, duration: '400ms', trigger: 'mount' as const } },
    ];

    const sequence = buildTimelineFromAnimations(animations, '100ms');
    expect(sequence.steps).toHaveLength(2);
    expect(sequence.steps[0].startOffset).toBe('0ms');
    expect(sequence.steps[1].startOffset).toBe('400ms');
  });

  it('should build timeline from animations using preset default durations', () => {
    const animations = [
      { blockId: 'b1', animation: { preset: 'fadeIn' as const, trigger: 'mount' as const } },
      { blockId: 'b2', animation: { preset: 'fadeUp' as const, trigger: 'mount' as const } },
    ];

    const sequence = buildTimelineFromAnimations(animations, '0ms');
    expect(sequence.steps[1].startOffset).toBe('400ms'); // fadeIn default = 400ms
  });
});
