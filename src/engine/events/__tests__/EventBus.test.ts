import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '../bus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('basic emit/on/off', () => {
    it('should call a registered listener on emit', () => {
      const handler = vi.fn();
      bus.on('block:created', handler);
      bus.emit('block:created', { block: { id: '1', type: 'hero', content: {} } } as any);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should pass payload to the listener', () => {
      const handler = vi.fn();
      const payload = { id: '1', previousId: null } as any;
      bus.on('block:selected', handler);
      bus.emit('block:selected', payload);
      expect(handler).toHaveBeenCalledWith(payload, 'block:selected');
    });

    it('should support unsubscribe via returned function', () => {
      const handler = vi.fn();
      const unsubscribe = bus.on('block:created', handler);
      unsubscribe();
      bus.emit('block:created', { block: { id: '1', type: 'hero', content: {} } } as any);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should support off() to remove listener', () => {
      const handler = vi.fn();
      bus.on('block:created', handler);
      bus.off('block:created', handler);
      bus.emit('block:created', { block: { id: '1', type: 'hero', content: {} } } as any);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should not throw when off is called for unregistered event', () => {
      const handler = vi.fn();
      expect(() => bus.off('block:created', handler)).not.toThrow();
    });
  });

  describe('once', () => {
    it('should only call listener once', () => {
      const handler = vi.fn();
      bus.once('block:created', handler);
      bus.emit('block:created', { block: { id: '1', type: 'hero', content: {} } } as any);
      bus.emit('block:created', { block: { id: '2', type: 'section', content: {} } } as any);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('wildcard listeners', () => {
    it('should call onAny handler for all events', () => {
      const handler = vi.fn();
      bus.onAny(handler);
      bus.emit('block:created', { block: { id: '1', type: 'hero', content: {} } } as any);
      bus.emit('block:deleted', { id: '1', block: { id: '1', type: 'hero', content: {} } } as any);
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should call onceAny only once', () => {
      const handler = vi.fn();
      bus.onceAny(handler);
      bus.emit('block:created', { block: { id: '1', type: 'hero', content: {} } } as any);
      bus.emit('block:deleted', { id: '1', block: { id: '1', type: 'hero', content: {} } } as any);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear', () => {
    it('should clear all listeners for a specific event', () => {
      const handler = vi.fn();
      bus.on('block:created', handler);
      bus.clear('block:created');
      bus.emit('block:created', { block: { id: '1', type: 'hero', content: {} } } as any);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should clear all listeners when called without event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      bus.on('block:created', handler1);
      bus.on('block:deleted', handler2);
      bus.clear();
      bus.emit('block:created', { block: { id: '1', type: 'hero', content: {} } } as any);
      bus.emit('block:deleted', { id: '1', block: { id: '1', type: 'hero', content: {} } } as any);
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('middleware', () => {
    it('should run middleware before listeners', () => {
      const order: string[] = [];
      bus.use((_event, _payload, next) => {
        order.push('middleware');
        next();
      });
      bus.on('block:created', () => { order.push('handler'); });
      bus.emit('block:created', { block: { id: '1', type: 'hero', content: {} } } as any);
      expect(order).toEqual(['middleware', 'handler']);
    });

    it('should call middleware before handler', () => {
      const order: string[] = [];
      bus.use((_event, _payload, next) => {
        order.push('middleware');
        next();
      });
      bus.on('block:created', () => { order.push('handler'); });
      bus.emit('block:created', { block: { id: '1', type: 'hero', content: {} } } as any);
      expect(order).toEqual(['middleware', 'handler']);
    });

    it('should allow middleware to prevent handler execution', () => {
      const handler = vi.fn();
      bus.use((_event, _payload, _next) => {
        // Don't call next() — swallow the event
      });
      bus.on('block:created', handler);
      bus.emit('block:created', { block: { id: '1', type: 'hero', content: {} } } as any);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should support middleware unsubscribe', () => {
      const middlewareFn = vi.fn();
      const handler = vi.fn();
      const unuse = bus.use(middlewareFn);
      unuse();
      bus.on('block:created', handler);
      bus.emit('block:created', { block: { id: '1', type: 'hero', content: {} } } as any);
      expect(middlewareFn).not.toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('should return correct count for a specific event', () => {
      bus.on('block:created', () => {});
      bus.on('block:created', () => {});
      expect(bus.listenerCount('block:created')).toBe(2);
    });

    it('should include wildcard listeners in total count', () => {
      bus.on('block:created', () => {});
      bus.on('block:deleted', () => {});
      bus.onAny(() => {});
      expect(bus.listenerCount()).toBe(3);
    });
  });

  describe('reset', () => {
    it('should clear everything', () => {
      const handler = vi.fn();
      bus.on('block:created', handler);
      bus.use(() => {});
      bus.reset();
      expect(bus.listenerCount()).toBe(0);
    });
  });
});
