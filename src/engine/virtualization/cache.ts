/**
 * Simple LRU cache for memoizing virtualization computations.
 */
export class MemoCache<K, V> {
  private map = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    // Move to end (most recently used)
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxSize) {
      // Evict least recently used (first inserted)
      const oldest = this.map.keys().next();
      if (!oldest.done) {
        this.map.delete(oldest.value);
      }
    }
    this.map.set(key, value);
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  clear(): void {
    this.map.clear();
  }

  invalidate(predicate: (key: K) => boolean): void {
    for (const key of this.map.keys()) {
      if (predicate(key)) {
        this.map.delete(key);
      }
    }
  }

  get size(): number {
    return this.map.size;
  }
}

/** Typed cache keys for virtualization computations */
export type VirtualizationCacheKey =
  | { type: 'viewport'; viewportKey: string }
  | { type: 'renderItem'; nodeId: string; breakpoint: string }
  | { type: 'flattenedTree'; treeHash: string }
  | { type: 'spatialIndex'; treeHash: string };

export function createViewportKey(viewport: { scrollX: number; scrollY: number; zoom: number; width: number; height: number }): string {
  return `${viewport.scrollX.toFixed(0)}:${viewport.scrollY.toFixed(0)}:${viewport.zoom.toFixed(2)}:${viewport.width}:${viewport.height}`;
}
