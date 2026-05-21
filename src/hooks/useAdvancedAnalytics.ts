
import { useState, useEffect, useCallback } from 'react';

interface AnalyticsEvent {
  event_type: string;
  page_url: string;
  user_agent: string;
  referrer: string;
  session_id: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
}

interface PageView {
  page_url: string;
  title: string;
  duration: number;
  scroll_depth: number;
  exit_rate: number;
}

interface UserBehavior {
  clicks: number;
  scroll_depth: number;
  time_on_page: number;
  interactions: Array<{
    type: string;
    element: string;
    timestamp: number;
  }>;
}

export function useAdvancedAnalytics() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [pageStartTime] = useState(Date.now());
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    clicks: 0,
    scroll_depth: 0,
    time_on_page: 0,
    interactions: []
  });

  // Tracking des événements - using local API
  const trackEvent = useCallback(async (eventType: string, metadata?: Record<string, unknown>) => {
    try {
      const event: AnalyticsEvent = {
        event_type: eventType,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        session_id: sessionId,
        metadata
      };

      // Send to local analytics API
      await fetch('/api/analytics-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...event,
          created_at: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Erreur tracking:', error);
    }
  }, [sessionId]);

  // Tracking des vues de page
  const trackPageView = useCallback(async (title?: string) => {
    await trackEvent('page_view', {
      page_title: title || document.title,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      screen_resolution: `${screen.width}x${screen.height}`,
      color_depth: screen.colorDepth,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }, [trackEvent]);

  // Tracking du scroll
  const trackScroll = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollDepth = Math.round(scrollTop / documentHeight * 100);

    setUserBehavior((prev) => ({
      ...prev,
      scroll_depth: Math.max(prev.scroll_depth, scrollDepth)
    }));
  }, []);

  // Tracking des interactions
  const trackInteraction = useCallback((type: string, element: string) => {
    const interaction = {
      type,
      element,
      timestamp: Date.now()
    };

    setUserBehavior((prev) => ({
      ...prev,
      clicks: type === 'click' ? prev.clicks + 1 : prev.clicks,
      interactions: [...prev.interactions, interaction]
    }));
  }, []);

  // Performance metrics
  const getPerformanceMetrics = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');

    return {
      page_load_time: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0,
      dom_content_loaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart) : 0,
      first_contentful_paint: paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0,
      time_to_interactive: navigation ? Math.round(navigation.domInteractive - navigation.fetchStart) : 0,
      connection_type: (navigator as unknown).connection?.effectiveType || 'unknown'
    };
  }, []);

  // Configuration des listeners d'événements
  useEffect(() => {
    // Tracking initial de la page
    trackPageView();

    // Listeners pour les interactions
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const elementInfo = `${target.tagName.toLowerCase()}${target.className ? '.' + target.className.split(' ').join('.') : ''}`;
      trackInteraction('click', elementInfo);
    };

    const handleScroll = () => {
      trackScroll();
    };

    // Tracking de la sortie de page
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - pageStartTime;
      trackEvent('page_exit', {
        time_on_page: timeOnPage,
        scroll_depth: userBehavior.scroll_depth,
        interactions_count: userBehavior.interactions.length,
        performance_metrics: getPerformanceMetrics()
      });
    };

    // Tracking de visibilité
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackEvent('page_hidden');
      } else {
        trackEvent('page_visible');
      }
    };

    // Ajout des listeners
    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Tracking périodique du temps passé
    const timeInterval = setInterval(() => {
      setUserBehavior((prev) => ({
        ...prev,
        time_on_page: Date.now() - pageStartTime
      }));
    }, 10000); // Toutes les 10 secondes

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(timeInterval);
    };
  }, [trackPageView, trackEvent, trackScroll, trackInteraction, pageStartTime, userBehavior.scroll_depth, userBehavior.interactions.length, getPerformanceMetrics]);

  return {
    sessionId,
    userBehavior,
    trackEvent,
    trackPageView,
    trackInteraction,
    getPerformanceMetrics
  };
}