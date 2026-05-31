import type { Patch } from '@/engine/diff/types';
import { applyConflictResolution } from '@/engine/diff/conflict';
import type { MergeResult } from '@/engine/diff/types';
import { mergePatches } from '@/engine/diff/merge';
import { useDirtyStore } from './dirty-store';
import { eventBus } from '@/engine/events/bus';

export type PersistFn = (patches: Patch[]) => Promise<boolean>;

export interface SaveQueueOptions {
  debounceMs: number;
  maxRetries: number;
  onSave?: (patches: Patch[]) => Promise<boolean>;
}

const DEFAULT_OPTIONS: SaveQueueOptions = {
  debounceMs: 2000,
  maxRetries: 3,
};

export class SaveQueue {
  private options: SaveQueueOptions;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private persistFn: PersistFn | null = null;
  private isProcessing = false;
  private patchesSinceLastSave: Patch[] = [];

  constructor(options: Partial<SaveQueueOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  setPersistFn(fn: PersistFn): void {
    this.persistFn = fn;
  }

  push(patches: Patch[]): void {
    this.patchesSinceLastSave.push(...patches);
    this.schedule();
  }

  private schedule(): void {
    if (this.timer) clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.flush();
    }, this.options.debounceMs);
  }

  async flush(): Promise<boolean> {
    if (this.isProcessing) return false;
    if (this.patchesSinceLastSave.length === 0) return true;

    this.isProcessing = true;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    try {
      const store = useDirtyStore.getState();
      store.markSaving();

      const allPatches = this.patchesSinceLastSave;
      this.patchesSinceLastSave = [];

      const merged = this.mergePending(allPatches);

      let success = false;
      let retries = 0;

      while (!success && retries <= this.options.maxRetries) {
        if (retries > 0) {
          store.markRetrying();
          await this.delay(1000 * retries);
        }

        try {
          if (this.persistFn) {
            success = await this.persistFn(merged);
          } else {
            success = await this.defaultPersist(merged);
          }
        } catch {
          success = false;
        }

        if (!success) {
          retries++;
          eventBus.emit('save:failed', {
            patchesCount: merged.length,
            retryCount: retries,
            error: `Save failed after ${retries} attempt(s)`,
          });
        }
      }

      if (success) {
        eventBus.emit('save:completed', {
          patchesCount: merged.length,
          timestamp: Date.now(),
        });
        store.markSaved();
      } else {
        store.markError(`Save failed after ${retries} retries`);
      }

      return success;
    } finally {
      this.isProcessing = false;
    }
  }

  private mergePending(patches: Patch[]): Patch[] {
    if (patches.length <= 1) return patches;

    const merged: Patch[] = [];
    const seen = new Set<string>();

    for (const p of patches) {
      const id = 'nodeId' in p ? p.nodeId : '';
      const path = 'path' in p ? (p.path || []).join('.') : '';
      const key = `${p.op}:${id}:${path}`;

      if (seen.has(key)) {
        const existing = merged.find((m) => {
          const mId = 'nodeId' in m ? m.nodeId : '';
          const mPath = 'path' in m ? (m.path || []).join('.') : '';
          return `${m.op}:${mId}:${mPath}` === key;
        });
        if (existing && 'next' in existing && 'next' in p) {
          (existing as Record<string, unknown>).next = (p as Record<string, unknown>).next;
        }
      } else {
        seen.add(key);
        merged.push(p);
      }
    }

    return merged;
  }

  private async defaultPersist(_patches: Patch[]): Promise<boolean> {
    const url = `/api/admin/pages/${window.location.pathname.split('/').pop()}`;
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_blocks: _patches }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  get pendingCount(): number {
    return this.patchesSinceLastSave.length;
  }

  get isFlushing(): boolean {
    return this.isProcessing;
  }

  cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.patchesSinceLastSave = [];
  }

  destroy(): void {
    this.cancel();
    this.persistFn = null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
