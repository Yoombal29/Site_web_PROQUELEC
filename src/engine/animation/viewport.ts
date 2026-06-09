export interface ViewportObserverOptions {
  /** IntersectionObserver threshold (0–1) */
  threshold?: number;
  /** Root margin (e.g. "0px 0px -50px 0px") */
  rootMargin?: string;
  /** Only trigger once */
  once?: boolean;
  /** CSS class to add when visible */
  visibleClass?: string;
}

export interface ViewportObserverEntry {
  blockId: string;
  isIntersecting: boolean;
  ratio: number;
}

export type ViewportCallback = (entry: ViewportObserverEntry) => void;

// ── Viewport observer manager ────────────────────────────────

export class ViewportAnimationManager {
  private observer: IntersectionObserver | null = null;
  private targets = new Map<
    string,
    {
      element: Element;
      callback: ViewportCallback;
      options: ViewportObserverOptions;
      hasTriggered: boolean;
    }
  >();

  private createObserver(options: ViewportObserverOptions): IntersectionObserver {
    return new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const blockId = entry.target.getAttribute('data-block-id');
          if (!blockId) continue;

          const target = this.targets.get(blockId);
          if (!target) continue;

          // Once mode: skip if already triggered
          if (target.options.once !== false && target.hasTriggered && entry.isIntersecting) {
            continue;
          }

          target.callback({
            blockId,
            isIntersecting: entry.isIntersecting,
            ratio: entry.intersectionRatio,
          });

          if (entry.isIntersecting) {
            target.hasTriggered = true;
            // Add visible class
            if (target.options.visibleClass) {
              entry.target.classList.add(target.options.visibleClass);
            }
            // Unobserve if once
            if (target.options.once !== false) {
              this.unobserve(blockId);
            }
          }
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? '0px 0px -50px 0px',
      },
    );
  }

  observe(
    blockId: string,
    element: Element,
    callback: ViewportCallback,
    options: ViewportObserverOptions = {},
  ): void {
    // Lazy init observer
    if (!this.observer) {
      this.observer = this.createObserver(options);
    }

    this.targets.set(blockId, {
      element,
      callback,
      options,
      hasTriggered: false,
    });

    this.observer.observe(element);
  }

  unobserve(blockId: string): void {
    const target = this.targets.get(blockId);
    if (target) {
      this.observer?.unobserve(target.element);
      this.targets.delete(blockId);
    }
  }

  unobserveAll(): void {
    for (const [blockId] of this.targets) {
      this.unobserve(blockId);
    }
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.targets.clear();
  }

  get observedBlocks(): string[] {
    return Array.from(this.targets.keys());
  }

  hasBlock(blockId: string): boolean {
    return this.targets.has(blockId);
  }
}

// ── Singleton ────────────────────────────────────────────────

export const viewportManager = new ViewportAnimationManager();
