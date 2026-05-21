
import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  version: string;
  tags: string[];
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  ttl?: number;
  version?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  serialize?: boolean;
}

class AdvancedCacheManager {
  private cache = new Map<string, CacheItem<unknown>>();
  private maxSize = 200;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
    this.loadFromStorage();
  }

  private startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Nettoyage toutes les minutes
  }

  private cleanup() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Supprimer les entrées expirées
    entries.forEach(([key, item]) => {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    });

    // Si la cache est encore trop pleine, supprimer les moins utilisées
    if (this.cache.size > this.maxSize) {
      const sortedEntries = entries.
      filter(([, item]) => now <= item.expiry).
      sort((a, b) => {
        // Tri par priorité d'accès (moins accédé récemment = supprimé en premier)
        const scoreA = a[1].accessCount / (now - a[1].lastAccessed);
        const scoreB = b[1].accessCount / (now - b[1].lastAccessed);
        return scoreA - scoreB;
      });

      const toDelete = sortedEntries.slice(0, this.cache.size - this.maxSize);
      toDelete.forEach(([key]) => this.cache.delete(key));
    }

    this.saveToStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('advanced-cache');
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();

        Object.entries(data).forEach(([key, item]: [string, unknown]) => {
          if (now <= item.expiry) {
            this.cache.set(key, item);
          }
        });
      }
    } catch (error) {
      console.warn('Erreur chargement cache:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem('advanced-cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Erreur sauvegarde cache:', error);
    }
  }

  set<T>(key: string, data: T, config: CacheConfig = {}): void {
    const {
      ttl = 300000, // 5 minutes par défaut
      version = '1.0',
      tags = [],
      serialize = true
    } = config;

    const processedData = serialize && typeof data === 'object' ?
    JSON.parse(JSON.stringify(data)) :
    data;

    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data: processedData,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      version,
      tags,
      accessCount: 0,
      lastAccessed: Date.now()
    });

    this.saveToStorage();
  }

  get<T>(key: string, expectedVersion?: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    const now = Date.now();
    if (now > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Vérification de version
    if (expectedVersion && item.version !== expectedVersion) {
      this.cache.delete(key);
      return null;
    }

    // Mise à jour des statistiques d'accès
    item.accessCount++;
    item.lastAccessed = now;

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    return item !== undefined && Date.now() <= item.expiry;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.saveToStorage();
  }

  invalidateByTag(tag: string): void {
    const toDelete: string[] = [];

    this.cache.forEach((item, key) => {
      if (item.tags.includes(tag)) {
        toDelete.push(key);
      }
    });

    toDelete.forEach((key) => this.cache.delete(key));
    this.saveToStorage();
  }

  invalidateByPattern(pattern: RegExp): void {
    const toDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        toDelete.push(key);
      }
    });

    toDelete.forEach((key) => this.cache.delete(key));
    this.saveToStorage();
  }

  clear(): void {
    this.cache.clear();
    localStorage.removeItem('advanced-cache');
  }

  getStats() {
    const now = Date.now();
    const items = Array.from(this.cache.values());

    return {
      totalItems: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage: JSON.stringify(Object.fromEntries(this.cache.entries())).length,
      expiredItems: items.filter((item) => now > item.expiry).length,
      averageAccessCount: items.reduce((acc, item) => acc + item.accessCount, 0) / items.length || 0,
      oldestItem: Math.min(...items.map((item) => item.timestamp)),
      newestItem: Math.max(...items.map((item) => item.timestamp))
    };
  }

  prefetch<T>(key: string, fetcher: () => Promise<T>, config?: CacheConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      // Si déjà en cache, retourner immédiatement
      const cached = this.get<T>(key, config?.version);
      if (cached) {
        resolve(cached);
        return;
      }

      // Sinon, récupérer et mettre en cache
      fetcher().
      then((data) => {
        this.set(key, data, config);
        resolve(data);
      }).
      catch(reject);
    });
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

const advancedCacheManager = new AdvancedCacheManager();

export function useAdvancedCache<T>(
key: string,
fetcher: () => Promise<T>,
config: CacheConfig & {enabled?: boolean;} = {})
{
  const { enabled = true, ...cacheConfig } = config;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false, background = false) => {
    if (!enabled) return;

    if (!background) {
      setLoading(true);
      setError(null);
    }

    try {
      // Vérifier le cache en premier
      if (!forceRefresh) {
        const cached = advancedCacheManager.get<T>(key, cacheConfig.version);
        if (cached) {
          setData(cached);
          if (!background) setLoading(false);
          return cached;
        }
      }

      // Récupérer les nouvelles données
      const result = await fetcher();
      advancedCacheManager.set(key, result, cacheConfig);
      setData(result);

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      if (!background) {
        setError(error);
      }
      throw error;
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  }, [key, fetcher, enabled, cacheConfig]);

  const invalidate = useCallback(() => {
    advancedCacheManager.invalidate(key);
    fetchData(true);
  }, [key, fetchData]);

  const prefetch = useCallback(async () => {
    if (!advancedCacheManager.has(key)) {
      await fetchData(false, true);
    }
  }, [key, fetchData]);

  const refresh = useCallback(async () => {
    return fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    prefetch,
    isCached: advancedCacheManager.has(key),
    cacheStats: advancedCacheManager.getStats()
  };
}

export { advancedCacheManager };