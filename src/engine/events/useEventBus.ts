import { useEffect, useCallback, useRef } from 'react';
import { eventBus } from './bus';
import type { BuilderEventName, BuilderEventMap, EventHandler, WildcardHandler } from './types';

export function useEventBus<E extends BuilderEventName>(
  event: E,
  handler: EventHandler<E>,
  deps: unknown[] = [],
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const wrapped: EventHandler<E> = (payload, name) => {
      handlerRef.current(payload, name);
    };
    const unsubscribe = eventBus.on(event, wrapped);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
}

export function useEventBusOnce<E extends BuilderEventName>(
  event: E,
  handler: EventHandler<E>,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const wrapped: EventHandler<E> = (payload, name) => {
      handlerRef.current(payload, name);
    };
    const unsubscribe = eventBus.once(event, wrapped);
    return unsubscribe;
  }, [event]);
}

export function useWildcardEventBus(
  handler: WildcardHandler,
  deps: unknown[] = [],
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const wrapped: WildcardHandler = (payload, name) => {
      handlerRef.current(payload, name);
    };
    const unsubscribe = eventBus.onAny(wrapped);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);
}

export function useEmitEvent(): <E extends BuilderEventName>(
  event: E,
  payload: BuilderEventMap[E],
) => void {
  return useCallback(
    <E extends BuilderEventName>(event: E, payload: BuilderEventMap[E]) => {
      eventBus.emit(event, payload);
    },
    [],
  );
}
