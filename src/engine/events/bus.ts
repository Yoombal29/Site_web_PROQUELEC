import type {
  BuilderEventMap,
  BuilderEventName,
  EventHandler,
  EventMiddleware,
  WildcardHandler,
} from './types';

type HandlerEntry = {
  handler: EventHandler;
  once: boolean;
};

export class EventBus {
  private listeners = new Map<string, HandlerEntry[]>();
  private wildcardListeners: Array<{ handler: WildcardHandler; once: boolean }> = [];
  private middleware: EventMiddleware[] = [];

  on<E extends BuilderEventName>(
    event: E,
    handler: EventHandler<E>,
  ): () => void {
    return this.addListener(event, handler as EventHandler, false);
  }

  once<E extends BuilderEventName>(
    event: E,
    handler: EventHandler<E>,
  ): () => void {
    return this.addListener(event, handler as EventHandler, true);
  }

  onAny(handler: WildcardHandler): () => void {
    this.wildcardListeners.push({ handler, once: false });
    return () => {
      this.wildcardListeners = this.wildcardListeners.filter(
        (h) => h.handler !== handler,
      );
    };
  }

  onceAny(handler: WildcardHandler): () => void {
    this.wildcardListeners.push({ handler, once: true });
    return () => {
      this.wildcardListeners = this.wildcardListeners.filter(
        (h) => h.handler !== handler,
      );
    };
  }

  off<E extends BuilderEventName>(
    event: E,
    handler: EventHandler<E>,
  ): void {
    const entries = this.listeners.get(event);
    if (!entries) return;
    const filtered = entries.filter((h) => h.handler !== handler);
    if (filtered.length === 0) {
      this.listeners.delete(event);
    } else {
      this.listeners.set(event, filtered);
    }
  }

  emit<E extends BuilderEventName>(
    event: E,
    payload: BuilderEventMap[E],
  ): void {
    const run = () => {
      // Named listeners
      const entries = this.listeners.get(event);
      if (entries) {
        const toRemove: EventHandler[] = [];
        for (const entry of entries) {
          entry.handler(payload, event);
          if (entry.once) toRemove.push(entry.handler);
        }
        if (toRemove.length > 0) {
          this.listeners.set(
            event,
            entries.filter((h) => !toRemove.includes(h.handler)),
          );
        }
      }

      // Wildcard listeners
      const wildcardToRemove: WildcardHandler[] = [];
      for (const w of this.wildcardListeners) {
        w.handler(payload as BuilderEventMap[BuilderEventName], event);
        if (w.once) wildcardToRemove.push(w.handler);
      }
      if (wildcardToRemove.length > 0) {
        this.wildcardListeners = this.wildcardListeners.filter(
          (h) => !wildcardToRemove.includes(h.handler),
        );
      }
    };

    if (this.middleware.length === 0) {
      run();
      return;
    }

    // Run through middleware chain
    let index = 0;
    const next = () => {
      if (index < this.middleware.length) {
        const mw = this.middleware[index++];
        mw(event, payload, next);
      } else {
        run();
      }
    };
    next();
  }

  clear(event?: BuilderEventName): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
      this.wildcardListeners = [];
    }
  }

  use(middleware: EventMiddleware): () => void {
    this.middleware.push(middleware);
    return () => {
      this.middleware = this.middleware.filter((m) => m !== middleware);
    };
  }

  listenerCount(event?: BuilderEventName): number {
    if (event) {
      return (this.listeners.get(event) || []).length;
    }
    let count = 0;
    for (const entries of this.listeners.values()) {
      count += entries.length;
    }
    count += this.wildcardListeners.length;
    return count;
  }

  reset(): void {
    this.listeners.clear();
    this.wildcardListeners = [];
    this.middleware = [];
  }

  private addListener(
    event: string,
    handler: EventHandler,
    once: boolean,
  ): () => void {
    const entries = this.listeners.get(event) || [];
    entries.push({ handler, once });
    this.listeners.set(event, entries);
    return () => this.off(event as BuilderEventName, handler);
  }
}

// Singleton
export const eventBus = new EventBus();

// Dev helper — expose on window for debugging in dev mode
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  (window as Record<string, unknown>).__eventBus = eventBus;
}
