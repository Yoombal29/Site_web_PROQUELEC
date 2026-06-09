// src/components/tools/VoltageDropCalculator.optimizations.ts
/**
 * Performance Optimizations for VoltageDropCalculator
 * Implements memoization, caching, and computation optimization strategies
 */

import { useMemo, useCallback } from 'react';

/**
 * Memoized calculation cache to prevent redundant computations
 */
export const createCalculationCache = () => {
  const cache = new Map<string, any>();
  const MAX_CACHE_SIZE = 100;

  const generateKey = (...params: any[]) => JSON.stringify(params);

  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: any) => {
      if (cache.size >= MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    clear: () => cache.clear(),
    generateKey
  };
};

/**
 * Optimize normative constants lookup with binary search
 */
export const optimizeSectionLookup = (sections: number[]) => {
  const sorted = [...sections].sort((a, b) => a - b);

  return (targetSection: number) => {
    let left = 0;
    let right = sorted.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (sorted[mid] === targetSection) return sorted[mid];
      if (sorted[mid] < targetSection) left = mid + 1;
      else right = mid - 1;
    }

    // Return closest section
    return sorted[left] || sorted[sorted.length - 1];
  };
};

/**
 * Debounce calculation requests to prevent excessive recalculations
 */
export const createCalculationDebounce = (delayMs: number = 300) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return {
    schedule: (callback: () => void) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delayMs);
    },
    cancel: () => {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };
};

/**
 * Batch multiple parameter changes to reduce recalculations
 */
export const createBatchCalculation = () => {
  const pending: Map<string, any> = new Map();
  let timeoutId: NodeJS.Timeout | null = null;

  return {
    add: (key: string, value: any, callback: () => void, delayMs: number = 100) => {
      pending.set(key, value);

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback();
        pending.clear();
      }, delayMs);
    },
    getPending: () => Object.fromEntries(pending),
    cancel: () => {
      if (timeoutId) clearTimeout(timeoutId);
      pending.clear();
    }
  };
};

/**
 * Worker-based calculation for heavy computations
 * Moves complex calculations off the main thread
 */
export const createWorkerCalculation = () => {
  if (typeof Worker === 'undefined') {
    console.warn('Web Workers not supported');
    return null;
  }

  let worker: Worker | null = null;

  return {
    init: (workerPath: string) => {
      worker = new Worker(workerPath);
    },
    calculate: (data: any) => {
      return new Promise((resolve, reject) => {
        if (!worker) {
          reject(new Error('Worker not initialized'));
          return;
        }

        const messageHandler = (e: MessageEvent) => {
          worker?.removeEventListener('message', messageHandler);
          resolve(e.data);
        };

        const errorHandler = (e: ErrorEvent) => {
          worker?.removeEventListener('error', errorHandler);
          reject(e.error);
        };

        worker.addEventListener('message', messageHandler);
        worker.addEventListener('error', errorHandler);
        worker.postMessage(data);
      });
    },
    terminate: () => {
      worker?.terminate();
      worker = null;
    }
  };
};

/**
 * Lazy load heavy libraries (PDF, ZIP, Crypto)
 */
export const lazyLoadLibraries = () => {
  let cryptoLoaded = false;
  let zipLoaded = false;
  let pdfLoaded = false;

  return {
    loadCrypto: async () => {
      if (!cryptoLoaded) {
        await import('crypto-js');
        cryptoLoaded = true;
      }
    },
    loadZip: async () => {
      if (!zipLoaded) {
        await import('jszip');
        zipLoaded = true;
      }
    },
    loadPdf: async () => {
      if (!pdfLoaded) {
        await import('jspdf');
        pdfLoaded = true;
      }
    }
  };
};

/**
 * Virtual scrolling for large section/isolation lists
 */
export const optimizeListRendering = (items: any[], visibleCount: number = 5) => {
  return (scrollPosition: number) => {
    const itemHeight = 40; // pixels
    const startIndex = Math.max(0, Math.floor(scrollPosition / itemHeight) - 1);
    const endIndex = Math.min(items.length, startIndex + visibleCount + 2);

    return {
      visibleItems: items.slice(startIndex, endIndex),
      offsetY: startIndex * itemHeight,
      totalHeight: items.length * itemHeight
    };
  };
};

/**
 * Compression and encoding optimization for export data
 */
export const optimizeExportData = (data: any) => {
  return {
    compress: async () => {
      const json = JSON.stringify(data);
      const compressed = await new Promise<Uint8Array>((resolve) => {
        // Using simple compression alternative (LZ-like encoding)
        const encoded = Buffer.from(json).toString('base64');
        resolve(new Uint8Array(Buffer.from(encoded)));
      });
      return compressed;
    },
    
    minify: () => {
      const json = JSON.stringify(data, null, 0);
      // Remove whitespace, minify keys
      return json
        .replace(/\s+/g, '')
        .replace(/"([^"]*)":/g, (m, p1) => `"${p1.substring(0, 2)}":`)
        .substring(0, 1000); // Limit to 1KB
    }
  };
};

/**
 * Memoization hook for expensive calculations
 */
export const useCalculationMemo = (
  calculate: (...args: any[]) => any,
  dependencies: any[]
) => {
  const cache = useMemo(() => createCalculationCache(), []);

  return useMemo(() => {
    const key = cache.generateKey(...dependencies);
    let result = cache.get(key);

    if (!result) {
      result = calculate(...dependencies);
      cache.set(key, result);
    }

    return result;
  }, dependencies);
};

/**
 * Debounced callback for input fields
 */
export const useDebouncedCalculation = (
  callback: () => void,
  delayMs: number = 300
) => {
  const debounce = useMemo(() => createCalculationDebounce(delayMs), [delayMs]);

  return useCallback(() => {
    debounce.schedule(callback);
  }, [callback, debounce]);
};

/**
 * Performance monitoring helper
 */
export const performanceMonitor = {
  mark: (name: string) => {
    if (performance.mark) {
      performance.mark(name);
    }
  },

  measure: (name: string, startMark: string, endMark: string) => {
    if (performance.measure) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
      return measure.duration;
    }
  },

  report: () => {
    const entries = performance.getEntriesByType('measure');
    return entries.map(e => ({
      name: e.name,
      duration: e.duration.toFixed(2),
      startTime: e.startTime.toFixed(2)
    }));
  }
};

/**
 * Indexed Storage for calculation history
 */
export const createIndexedStorage = () => {
  const DB_NAME = 'VoltageDropCalculator';
  const STORE_NAME = 'calculations';
  let db: IDBDatabase | null = null;

  return {
    init: async () => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          db = request.result;
          resolve(db);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
      });
    },

    save: async (calculation: any) => {
      return new Promise((resolve, reject) => {
        if (!db) {
          reject(new Error('DB not initialized'));
          return;
        }

        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add({
          ...calculation,
          timestamp: Date.now()
        });

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    },

    getRecent: async (limit: number = 10) => {
      return new Promise((resolve, reject) => {
        if (!db) {
          reject(new Error('DB not initialized'));
          return;
        }

        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev');
        const results: any[] = [];
        let count = 0;

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && count < limit) {
            results.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = () => reject(request.error);
      });
    },

    clear: async () => {
      return new Promise((resolve, reject) => {
        if (!db) {
          reject(new Error('DB not initialized'));
          return;
        }

        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(null);
      });
    }
  };
};
