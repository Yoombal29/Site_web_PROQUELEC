import type {
  TimelineSequence,
  TimelineStep,
  BlockAnimation,
  AnimationPlayState,
  AnimationPresetName,
} from './types';
import { getPreset } from './presets';

// ── Timeline runner ──────────────────────────────────────────

export type TimelineEventHandler = (event: {
  type: 'step:start' | 'step:end' | 'timeline:end';
  stepIndex?: number;
  blockId?: string;
}) => void;

export class TimelineRunner {
  private sequence: TimelineSequence;
  private currentStep = -1;
  private timeoutIds: ReturnType<typeof setTimeout>[] = [];
  private _state: AnimationPlayState = 'idle';
  private eventHandler?: TimelineEventHandler;

  constructor(sequence: TimelineSequence) {
    this.sequence = sequence;
  }

  get state(): AnimationPlayState {
    return this._state;
  }

  onEvent(handler: TimelineEventHandler): void {
    this.eventHandler = handler;
  }

  play(): void {
    if (this._state === 'playing') return;
    this._state = 'playing';
    this.currentStep = -1;
    this.runNext();
  }

  pause(): void {
    this._state = 'paused';
    this.clearTimeouts();
  }

  resume(): void {
    if (this._state !== 'paused') return;
    this._state = 'playing';
    this.runNext();
  }

  stop(): void {
    this._state = 'idle';
    this.clearTimeouts();
    this.currentStep = -1;
  }

  private runNext(): void {
    if (this._state !== 'playing') return;

    this.currentStep++;

    if (this.currentStep >= this.sequence.steps.length) {
      if (this.sequence.repeat && this.sequence.repeat > 0) {
        this.currentStep = -1;
        this.runNext();
      } else {
        this._state = 'finished';
        this.emit('timeline:end');
      }
      return;
    }

    const step = this.sequence.steps[this.currentStep];
    const startOffset = parseTime(step.startOffset || '0ms');

    const timeout = setTimeout(() => {
      if (this._state !== 'playing') return;

      this.emit('step:start', this.currentStep, step.blockId);

      const preset = getPreset(step.animation.preset as AnimationPresetName);
      const duration = parseTime(step.animation.duration || preset.defaultDuration || '400ms');

      const endTimeout = setTimeout(() => {
        this.emit('step:end', this.currentStep, step.blockId);
        this.runNext();
      }, duration);

      this.timeoutIds.push(endTimeout);
    }, startOffset);

    this.timeoutIds.push(timeout);
  }

  private clearTimeouts(): void {
    for (const id of this.timeoutIds) {
      clearTimeout(id);
    }
    this.timeoutIds = [];
  }

  private emit(type: 'step:start' | 'step:end' | 'timeline:end', stepIndex?: number, blockId?: string): void {
    this.eventHandler?.({ type, stepIndex, blockId });
  }

  destroy(): void {
    this.stop();
    this.eventHandler = undefined;
  }
}

// ── Helper ───────────────────────────────────────────────────

function parseTime(value: string): number {
  const match = value.match(/^([\d.]+)(ms|s)$/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  return match[2] === 's' ? num * 1000 : num;
}

// ── Build a sequence from resolved animations ────────────────

export function buildTimelineFromAnimations(
  animations: { blockId: string; animation: BlockAnimation }[],
  gap?: string,
): TimelineSequence {
  const gapMs = gap ? parseTime(gap) : 0;
  let cumulativeOffset = 0;

  const steps: TimelineStep[] = animations.map((item) => {
    const step: TimelineStep = {
      blockId: item.blockId,
      animation: item.animation,
      startOffset: `${cumulativeOffset}ms`,
    };
    const preset = getPreset(item.animation.preset as AnimationPresetName);
    const stepDuration = parseTime(item.animation.duration || preset.defaultDuration || '400ms');
    cumulativeOffset += stepDuration + gapMs;
    return step;
  });

  return { steps };
}
