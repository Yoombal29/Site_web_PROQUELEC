/**
 * useToolAnalytics.ts
 * Hook pour tracker l'utilisation des outils
 * Stocke en localStorage les statistiques d'usage
 */
import { useCallback } from 'react';

export type ToolEvent = {
  toolId: string;
  toolName: string;
  action: 'open' | 'calculate' | 'export' | 'premium_blocked' | 'demo_try';
  timestamp: string;
};

const STORAGE_KEY = 'proquelec_tool_analytics';

export function useToolAnalytics() {
  const getEvents = useCallback((): ToolEvent[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }, []);

  const trackEvent = useCallback((event: Omit<ToolEvent, 'timestamp'>) => {
    try {
      const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      events.push({ ...event, timestamp: new Date().toISOString() });
      // Garder max 500 events
      if (events.length > 500) events.splice(0, events.length - 500);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // Silently fail
    }
  }, []);

  const getStats = useCallback(() => {
    const events = getEvents();
    const byTool: Record<string, { opens: number; exports: number; blocked: number }> = {};
    const byDay: Record<string, number> = {};

    events.forEach((e) => {
      if (!byTool[e.toolId]) {
        byTool[e.toolId] = { opens: 0, exports: 0, blocked: 0 };
      }
      if (e.action === 'open') byTool[e.toolId].opens++;
      if (e.action === 'export') byTool[e.toolId].exports++;
      if (e.action === 'premium_blocked') byTool[e.toolId].blocked++;

      const day = e.timestamp.split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    return {
      totalEvents: events.length,
      byTool,
      byDay,
      uniqueTools: Object.keys(byTool).length,
    };
  }, [getEvents]);

  const clearStats = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { trackEvent, getStats, getEvents, clearStats };
}
