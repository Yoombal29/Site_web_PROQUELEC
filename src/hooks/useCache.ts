
import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<unknown>>();
  private maxSize = 100;

  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes par défaut
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    return item !== undefined && Date.now() <= item.expiry;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

const cacheManager = new CacheManager();

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; enabled?: boolean } = {}
) {
  const { ttl = 300000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    const cachedData = cacheManager.get<T>(key);
    
    if (cachedData && !forceRefresh) {
      setData(cachedData);
      return cachedData;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cacheManager.set(key, result, ttl);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, enabled]);

  const invalidate = useCallback(() => {
    cacheManager.delete(key);
    fetchData(true);
  }, [key, fetchData]);

  const prefetch = useCallback(async () => {
    if (!cacheManager.has(key)) {
      await fetchData();
    }
  }, [key, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate,
    prefetch,
    isCached: cacheManager.has(key),
  };
}

export { cacheManager };
