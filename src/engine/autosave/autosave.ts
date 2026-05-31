import type { Block } from '@/types/builder';
import type { Patch } from '@/engine/diff/types';
import { ChangeDetector } from '@/engine/diff/change-detector';
import { diffTrees } from '@/engine/diff/tree-diff';
import { SaveQueue } from './save-queue';
import { useDirtyStore } from './dirty-store';
import { eventBus } from '@/engine/events/bus';

export interface AutosaveConfig {
  debounceMs: number;
  maxRetries: number;
  validateBeforeSave: boolean;
  onChange?: (patches: Patch[]) => void;
  onSave?: (patches: Patch[]) => Promise<boolean>;
}

const DEFAULT_CONFIG: AutosaveConfig = {
  debounceMs: 2000,
  maxRetries: 3,
  validateBeforeSave: true,
};

export class AutosaveEngine {
  private config: AutosaveConfig;
  private detector: ChangeDetector;
  private queue: SaveQueue;
  private seeded = false;
  private _destroyed = false;

  constructor(config: Partial<AutosaveConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.detector = new ChangeDetector();
    this.queue = new SaveQueue({
      debounceMs: this.config.debounceMs,
      maxRetries: this.config.maxRetries,
    });

    if (this.config.onSave) {
      this.queue.setPersistFn(this.config.onSave);
    }

    this.detector.onChange((changeSet) => {
      if (this._destroyed) return;
      this.config.onChange?.(changeSet.patches);

      const store = useDirtyStore.getState();
      store.markDirty(changeSet.patches);

      eventBus.emit('save:started', {
        patchesCount: changeSet.patches.length,
        timestamp: Date.now(),
      });

      this.queue.push(changeSet.patches);
    });
  }

  get isDirty(): boolean {
    return useDirtyStore.getState().isDirty;
  }

  get pendingCount(): number {
    return this.queue.pendingCount;
  }

  get saveStatus() {
    return useDirtyStore.getState().saveStatus;
  }

  seed(blocks: Block[]): void {
    if (this.seeded) return;
    this.detector.seed(blocks);
    this.seeded = true;
  }

  detect(blocks: Block[]): void {
    if (!this.seeded) {
      this.detector.seed(blocks);
      this.seeded = true;
      return;
    }
    this.detector.detect(blocks);
  }

  markDirty(blocks: Block[], previousBlocks: Block[]): void {
    if (!this.seeded) {
      this.detector.seed(previousBlocks);
      this.seeded = true;
    }
    const patches = diffTrees(previousBlocks, blocks);
    if (patches.length === 0) return;

    const store = useDirtyStore.getState();
    store.markDirty(patches);

    eventBus.emit('save:started', {
      patchesCount: patches.length,
      timestamp: Date.now(),
    });

    this.queue.push(patches);
  }

  async flushNow(): Promise<boolean> {
    return this.queue.flush();
  }

  markClean(): void {
    this.detector.markClean();
    useDirtyStore.getState().clearDirty();
  }

  reset(): void {
    this.detector.destroy();
    this.queue.destroy();
    useDirtyStore.getState().reset();
    this.seeded = false;
    this._destroyed = false;

    this.detector = new ChangeDetector();
    this.queue = new SaveQueue({
      debounceMs: this.config.debounceMs,
      maxRetries: this.config.maxRetries,
    });

    if (this.config.onSave) {
      this.queue.setPersistFn(this.config.onSave);
    }
  }

  destroy(): void {
    this._destroyed = true;
    this.detector.destroy();
    this.queue.destroy();
    useDirtyStore.getState().reset();
    this.seeded = false;
  }
}

let _globalAutosave: AutosaveEngine | null = null;

export function getAutosaveEngine(config?: Partial<AutosaveConfig>): AutosaveEngine {
  if (!_globalAutosave) {
    _globalAutosave = new AutosaveEngine(config);
  }
  return _globalAutosave;
}

export function resetAutosaveEngine(): void {
  _globalAutosave?.destroy();
  _globalAutosave = null;
}
