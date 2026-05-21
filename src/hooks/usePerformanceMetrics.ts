import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  totalBlockingTime: number;
  timeToInteractive: number;
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const collectMetrics = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0;

    // Calculer les vraies métriques (hors simulation)
    const newMetrics: PerformanceMetrics = {
      pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      firstContentfulPaint: fcp,
      largestContentfulPaint: 0, // À compléter si possible
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      totalBlockingTime: 0,
      timeToInteractive: 0
    };

    setMetrics(newMetrics);
    setIsLoading(false);

    // Enregistrer dans l'API locale
    try {
      await fetch("/api/performance-metrics", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_url: window.location.pathname,
          load_time: Math.round(newMetrics.pageLoadTime),
          dom_content_loaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart) : 0,
          first_contentful_paint: Math.round(fcp),
          time_to_interactive: Math.round(newMetrics.timeToInteractive),
          connection_type: (navigator as unknown).connection?.effectiveType || null
        })
      });
    } catch (e) {

      // ignore
    }}, []);

  useEffect(() => {
    // Attendre que la page soit complètement chargée
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, [collectMetrics]);

  const getScoreColor = (value: number, thresholds: {good: number;needsImprovement: number;}) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.needsImprovement) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (value: number, thresholds: {good: number;needsImprovement: number;}) => {
    if (value <= thresholds.good) return 'Bon';
    if (value <= thresholds.needsImprovement) return 'À améliorer';
    return 'Mauvais';
  };

  // Fonction pour récupérer les métriques stockées
  const fetchStoredMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("/api/performance-metrics", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch metrics");
      const data = await res.json();
      setIsLoading(false);
      return { data, error: null };
    } catch (error) {
      setIsLoading(false);
      return { data: null, error };
    }
  }, []);

  return {
    metrics,
    isLoading,
    refreshMetrics: collectMetrics,
    fetchStoredMetrics,
    getScoreColor,
    getScoreLabel
  };
}