import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandRegistry, CommandBus } from '../registry';
import type { Command, CommandHandler } from '../types';

describe('CommandRegistry', () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  it('should register and retrieve a handler', () => {
    const handler: CommandHandler = {
      type: 'TEST',
      execute: vi.fn(),
    };
    registry.register(handler);
    expect(registry.getHandler('TEST')).toBe(handler);
  });

  it('should return undefined for unknown type', () => {
    expect(registry.getHandler('UNKNOWN')).toBeUndefined();
  });

  it('should unregister a handler', () => {
    const handler: CommandHandler = {
      type: 'TEST',
      execute: vi.fn(),
    };
    registry.register(handler);
    registry.unregister('TEST');
    expect(registry.getHandler('TEST')).toBeUndefined();
  });

  it('should return registered types', () => {
    registry.register({ type: 'A', execute: vi.fn() });
    registry.register({ type: 'B', execute: vi.fn() });
    expect(registry.getRegisteredTypes()).toEqual(['A', 'B']);
  });
});

describe('CommandBus', () => {
  let registry: CommandRegistry;
  let bus: CommandBus;

  beforeEach(() => {
    registry = new CommandRegistry();
    bus = new CommandBus(registry);
  });

  it('should execute a registered command', () => {
    const execute = vi.fn();
    registry.register({ type: 'TEST', execute });

    const command: Command = { type: 'TEST', payload: { foo: 'bar' }, timestamp: Date.now() };
    const result = bus.execute(command);

    expect(result.success).toBe(true);
    expect(execute).toHaveBeenCalledWith(command);
  });

  it('should return error for unregistered command', () => {
    const command: Command = { type: 'UNKNOWN', payload: {}, timestamp: Date.now() };
    const result = bus.execute(command);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should capture error when handler throws', () => {
    registry.register({
      type: 'THROW',
      execute: () => { throw new Error('Boom!'); },
    });

    const command: Command = { type: 'THROW', payload: {}, timestamp: Date.now() };
    const result = bus.execute(command);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Boom!');
  });

  it('should add silent commands to history', () => {
    registry.register({ type: 'TEST', execute: vi.fn() });
    bus.execute({ type: 'TEST', payload: {}, timestamp: 1, silent: true });
    expect(bus.getHistory()).toHaveLength(0);
  });

  it('should track command history', () => {
    registry.register({ type: 'TEST', execute: vi.fn() });
    bus.execute({ type: 'TEST', payload: {}, timestamp: 1 });
    bus.execute({ type: 'TEST', payload: {}, timestamp: 2 });
    expect(bus.getHistory()).toHaveLength(2);
    expect(bus.getHistoryIndex()).toBe(1);
  });

  it('should limit history to maxHistory', () => {
    registry.register({ type: 'TEST', execute: vi.fn() });
    bus.setMaxHistory(3);
    for (let i = 0; i < 5; i++) {
      bus.execute({ type: 'TEST', payload: { i }, timestamp: i });
    }
    expect(bus.getHistory()).toHaveLength(3);
    expect(bus.getHistory()[0].payload).toEqual({ i: 2 });
  });

  describe('undo/redo', () => {
    let executed: string[];

    beforeEach(() => {
      executed = [];
      registry.register({
        type: 'TEST',
        execute: (cmd) => { executed.push(`exec:${cmd.payload}`); },
        undo: (cmd) => { executed.push(`undo:${cmd.payload}`); },
      });
    });

    it('should undo last command', () => {
      bus.execute({ type: 'TEST', payload: 'a', timestamp: 1 });
      bus.execute({ type: 'TEST', payload: 'b', timestamp: 2 });

      bus.undo();
      expect(executed).toEqual(['exec:a', 'exec:b', 'undo:b']);
      expect(bus.getHistoryIndex()).toBe(0);
    });

    it('should redo after undo', () => {
      bus.execute({ type: 'TEST', payload: 'a', timestamp: 1 });
      bus.execute({ type: 'TEST', payload: 'b', timestamp: 2 });
      bus.undo();

      executed.length = 0;
      bus.redo();
      expect(executed).toEqual(['exec:b']);
      expect(bus.getHistoryIndex()).toBe(1);
    });

    it('should return null when nothing to undo', () => {
      expect(bus.undo()).toBeNull();
    });

    it('should return null when nothing to redo', () => {
      expect(bus.redo()).toBeNull();
    });

    it('should canUndo/canRedo reflect state', () => {
      expect(bus.canUndo()).toBe(false);
      expect(bus.canRedo()).toBe(false);

      bus.execute({ type: 'TEST', payload: 'a', timestamp: 1 });
      expect(bus.canUndo()).toBe(true);
      expect(bus.canRedo()).toBe(false);

      bus.undo();
      expect(bus.canUndo()).toBe(false);
      expect(bus.canRedo()).toBe(true);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      registry.register({ type: 'TEST', execute: vi.fn() });
      bus.execute({ type: 'TEST', payload: {}, timestamp: 1 });
      bus.clearHistory();
      expect(bus.getHistory()).toHaveLength(0);
      expect(bus.getHistoryIndex()).toBe(-1);
    });
  });
});
