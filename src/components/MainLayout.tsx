import React, { useEffect } from 'react';
import { CommandPalette } from './CommandPalette';
import { LanguageSwitcher } from './LanguageSwitcher';
import { RuntimeBanner } from '@/engine/runtime';

import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
declare global { interface Window { __LAST_REDIRECT_REASON?: string; } }

// DEBUG: Surveille les redirections vers /connexion
function useNavDebug() {
  const loc = useLocation();
  const previousUrlRef = React.useRef(typeof window !== 'undefined' ? window.location.href : '');

  React.useEffect(() => {
    const currentUrl = window.location.href;
    if (loc.pathname === '/connexion') {
      const tokenPresent = !!localStorage.getItem('token');
      const reason =
        window.__LAST_REDIRECT_REASON ||
        (tokenPresent
          ? 'Route protegee: session non valide malgre un token local'
          : 'Route protegee: aucun token local');
      const previousPage =
        previousUrlRef.current && previousUrlRef.current !== currentUrl
          ? previousUrlRef.current
          : document.referrer || '(direct)';

      console.log('%c[DEBUG] Redirection vers /connexion', 'color:red;font-size:16px;font-weight:bold');
      console.log('  Page precedente:', previousPage);
      console.log('  Token present:', tokenPresent);
      console.log('  Raison declaree:', reason);
      console.log('  Stack:', new Error().stack);
    }
    previousUrlRef.current = currentUrl;
  }, [loc.hash, loc.pathname, loc.search]);
}

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  useNavDebug();
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
        try {
          const payload = JSON.parse(e.data);
          invalidateAllPages(payload);
        } catch {
          queryClient.invalidateQueries({ queryKey: ['pages'] });
        }
      });
      es.addEventListener('page:updated', (e: unknown) => {
        try {
          const payload = JSON.parse(e.data);
          invalidateAllPages(payload);
        } catch {
          invalidateAllPages(null);
        }
      });
      es.addEventListener('page:deleted', (e: unknown) => {
        try {
          const payload = JSON.parse(e.data);
          queryClient.invalidateQueries({ queryKey: ['dynamic-routes'] });
          queryClient.invalidateQueries({ queryKey: ['pages'] });
        } catch {
          queryClient.invalidateQueries({ queryKey: ['pages'] });
        }
      });

      es.addEventListener('theme:updated', (e: unknown) => {
        try {
          const payload = JSON.parse(e.data);
          queryClient.invalidateQueries({ queryKey: ['liveSettings'] });
          queryClient.invalidateQueries({ queryKey: ['theme-settings'] });
        } catch {
          queryClient.invalidateQueries({ queryKey: ['liveSettings'] });
        }
      });

      const mediaHandler = (e: unknown) => {
        try {
          const payload = JSON.parse(e.data);
          queryClient.invalidateQueries({ queryKey: ['media-files'] });
          queryClient.invalidateQueries({ queryKey: ['gallery-items'] });
        } catch {
          queryClient.invalidateQueries({ queryKey: ['media-files'] });
        }
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
      try {
        if (es) es.close();
      } catch (_e) {
        /* ignore close errors */
      }
    };
  }, [queryClient]);

  return (
    <>
      <RuntimeBanner />
      <CommandPalette />
      <div className="fixed top-4 right-4 z-40">
        <LanguageSwitcher />
      </div>
      {children}
    </>
  );
};
