import React, { useEffect } from "react";
import { CommandPalette } from "./CommandPalette";
import { useQueryClient } from '@tanstack/react-query';

export const MainLayout = ({ children }: {children: React.ReactNode;}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/events');

      const invalidateAllPages = (payload: unknown) => {
        queryClient.invalidateQueries({ queryKey: ['dynamic-routes'] });
        queryClient.invalidateQueries({ queryKey: ['pages'] });
        if (payload && payload.slug) {
          queryClient.invalidateQueries({ queryKey: ['dynamic-page', payload.slug] });
        }
      };

      es.addEventListener('page:created', (e: unknown) => {
        try {const payload = JSON.parse(e.data);invalidateAllPages(payload);} catch {queryClient.invalidateQueries({ queryKey: ['pages'] });}
      });
      es.addEventListener('page:updated', (e: unknown) => {
        try {const payload = JSON.parse(e.data);invalidateAllPages(payload);} catch {invalidateAllPages(null);}
      });
      es.addEventListener('page:deleted', (e: unknown) => {
        try {const payload = JSON.parse(e.data);queryClient.invalidateQueries({ queryKey: ['dynamic-routes'] });queryClient.invalidateQueries({ queryKey: ['pages'] });} catch {queryClient.invalidateQueries({ queryKey: ['pages'] });}
      });

      es.addEventListener('theme:updated', (e: unknown) => {
        try {const payload = JSON.parse(e.data);queryClient.invalidateQueries({ queryKey: ['liveSettings'] });queryClient.invalidateQueries({ queryKey: ['theme-settings'] });} catch {queryClient.invalidateQueries({ queryKey: ['liveSettings'] });}
      });

      const mediaHandler = (e: unknown) => {
        try {const payload = JSON.parse(e.data);queryClient.invalidateQueries({ queryKey: ['media-files'] });queryClient.invalidateQueries({ queryKey: ['gallery-items'] });} catch {queryClient.invalidateQueries({ queryKey: ['media-files'] });}
      };
      es.addEventListener('media:uploaded', mediaHandler);
      es.addEventListener('media:renamed', mediaHandler);
      es.addEventListener('media:deleted', mediaHandler);

      es.addEventListener('cache:purged', (e: unknown) => {
        try {
          const payload = JSON.parse(e.data);
          // conservative: invalidate all live settings & pages
          queryClient.invalidateQueries();

        } catch (err) {
          queryClient.invalidateQueries();
        }
      });

      es.onerror = (err) => {
        // reconnect handled by browser; just log
        console.warn('EventSource error', err);
      };
    } catch (err) {
      console.warn('SSE not available', err);
    }

    return () => {
      try {es && es.close();} catch (e) {}
    };
  }, [queryClient]);

  return (
    <>
            <CommandPalette />
            {children}
        </>);

};