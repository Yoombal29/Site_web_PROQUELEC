import { useEffect, useRef } from 'react';

export function useAnimateOnScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  options?: { threshold?: number; rootMargin?: string; once?: boolean }
) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const threshold = options?.threshold ?? 0.1;
    const rootMargin = options?.rootMargin ?? '0px 0px -50px 0px';
    const once = options?.once ?? true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (once) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    observerRef.current = observer;

    const observeAnimated = () => {
      if (!container) return;
      const elements = container.querySelectorAll('[class*="animate-"]');
      elements.forEach((el) => {
        if (!el.classList.contains('is-visible')) {
          observer.observe(el);
        }
      });
    };

    observeAnimated();

    const mutationObserver = new MutationObserver(observeAnimated);
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [containerRef, options?.threshold, options?.rootMargin, options?.once]);
}
