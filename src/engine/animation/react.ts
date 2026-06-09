import { useEffect, useRef, useCallback, useState } from 'react';
import type { BlockAnimation, AnimationPlayState, AnimationPresetName } from './types';
import { ViewportAnimationManager } from './viewport';
import { eventBus } from '@/engine/events/bus';

// ── useAnimation: apply CSS animation to a ref ───────────────

export function useAnimation(
  animation: BlockAnimation | null,
): { ref: React.RefObject<HTMLDivElement | null>; playState: AnimationPlayState } {
  const ref = useRef<HTMLDivElement | null>(null);
  const [playState, setPlayState] = useState<AnimationPlayState>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el || !animation || animation.preset === 'none') return;

    const style = el.style;
    style.animation = `${animation.preset} ${animation.duration || '400ms'} ${animation.easing || 'ease-out'} ${animation.delay || '0ms'} both`;

    setPlayState('playing');

    const onEnd = () => {
      setPlayState('finished');
    };
    el.addEventListener('animationend', onEnd, { once: true });

    return () => {
      el.removeEventListener('animationend', onEnd);
      style.animation = '';
    };
  }, [animation?.preset, animation?.duration, animation?.delay, animation?.easing]);

  return { ref, playState };
}

// ── useViewportAnimation: trigger animation on scroll ────────

export function useViewportAnimation(
  blockId: string,
  animation: BlockAnimation | null,
  options?: { threshold?: number; rootMargin?: string },
): { ref: React.RefObject<HTMLDivElement | null>; isVisible: boolean } {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const managerRef = useRef<ViewportAnimationManager | null>(null);

  useEffect(() => {
    if (!animation || animation.preset === 'none') return;

    const el = ref.current;
    if (!el) return;

    const manager = new ViewportAnimationManager();
    managerRef.current = manager;

    el.style.opacity = '0';
    el.style.animation = `${animation.preset} ${animation.duration || '500ms'} ${animation.easing || 'ease-out'} ${animation.delay || '0ms'} both`;
    el.style.animationPlayState = 'paused';

    manager.observe(
      blockId,
      el,
      (entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          el.style.opacity = '1';
          el.style.animationPlayState = 'running';
        }
      },
      {
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? '0px 0px -50px 0px',
        once: true,
        visibleClass: 'anim-visible',
      },
    );

    return () => {
      manager.disconnect();
    };
  }, [blockId, animation?.preset, animation?.duration, animation?.delay, animation?.easing, options?.threshold, options?.rootMargin]);

  return { ref, isVisible };
}

// ── useStaggeredAnimations: staggered entrance for children ──

export function useStaggeredAnimations(
  parentAnimation: BlockAnimation | null,
  childCount: number,
): { containerRef: React.RefObject<HTMLDivElement | null>; childRefs: React.RefObject<HTMLDivElement | null>[] } {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [childRefs] = useState(() =>
    Array.from({ length: childCount }, () => React.createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement | null>),
  );

  useEffect(() => {
    if (!parentAnimation?.stagger || childCount === 0) return;

    const delayPerChild = parseCssTime(parentAnimation.stagger.delayPerChild);
    const dir = parentAnimation.stagger.direction || 'forward';

    childRefs.forEach((ref, i) => {
      const el = ref.current;
      if (!el) return;

      const index = dir === 'reverse' ? childCount - 1 - i : i;
      const delay = dir === 'random'
        ? Math.floor(Math.random() * childCount) * delayPerChild
        : index * delayPerChild;

      el.style.animation = `${parentAnimation.preset} ${parentAnimation.duration || '500ms'} ${parentAnimation.easing || 'ease-out'} ${delay}ms both`;
      el.style.opacity = '0';

      // Trigger
      requestAnimationFrame(() => {
        el.style.opacity = '1';
      });
    });
  }, [parentAnimation?.preset, parentAnimation?.stagger, childCount]);

  return { containerRef, childRefs };
}

// ── Event Bus integration ────────────────────────────────────

export function useAnimationEventBus(): void {
  useEffect(() => {
    const unsubBlockCreated = eventBus.on('block:created', (payload) => {
      const el = document.querySelector(`[data-block-id="${payload.block.id}"]`);
      if (el instanceof HTMLElement) {
        el.style.animation = 'fadeIn 400ms ease-out both';
      }
    });

    const unsubBlockDeleted = eventBus.on('block:deleted', (payload) => {
      const el = document.querySelector(`[data-block-id="${payload.id}"]`);
      if (el instanceof HTMLElement) {
        el.style.animation = 'fadeOut 300ms ease-in both';
        setTimeout(() => {
          el.style.display = 'none';
        }, 300);
      }
    });

    return () => {
      unsubBlockCreated();
      unsubBlockDeleted();
    };
  }, []);
}

// ── Helper ─────────────────────────────────────────────────

function parseCssTime(value: string): number {
  const match = value.match(/^([\d.]+)(ms|s)$/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  return match[2] === 's' ? num * 1000 : num;
}

// React needs to be imported for createRef
import React from 'react';
