import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PageViewStat {
  page: string;
  views: number;
}
interface DeviceStat {
  device: string;
  count: number;
}
interface CountryStat {
  country: string;
  count: number;
}
interface UserActivityStat {
  date: string;
  activeUsers: number;
}

export interface RealAnalyticsData {
  pageViews: { page: string; views: number }[];
  blogEngagement: { title: string; views: number; comments: number }[];
  userActivity: { date: string; activeUsers: number }[];
  popularContent: { title: string; type: string; engagement: number }[];
  performanceMetrics: {
    avgLoadTime: number;
    avgFCP: number;
    avgTTI: number;
  };
  deviceStats: { device: string; count: number }[];
  countryStats: { country: string; count: number }[];
}

export function useRealAnalytics() {
  return useQuery({
    queryKey: ['real-analytics'],
    queryFn: async (): Promise<RealAnalyticsData> => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analytics/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        toast.error('Erreur lors de la récupération des analytics.');
        throw new Error('Failed to fetch analytics');
      }

      const { events, performance: perfData } = await res.json();

      // Analyser les données
      const pageViews =
        events
          ?.reduce((acc: PageViewStat[], event: any) => {
            if (event.event_type === 'page_view') {
              let page = '/';
              try {
                page = new URL(event.page_url).pathname;
              } catch (e) {
                page = event.page_url || '/';
              }
              const existing = acc.find((p) => p.page === page);
              if (existing) {
                existing.views++;
              } else {
                acc.push({ page, views: 1 });
              }
            }
            return acc;
          }, [] as PageViewStat[])
          .slice(0, 10) || [];

      const deviceStats =
        events?.reduce((acc: DeviceStat[], event: any) => {
          if (event.device_type) {
            const existing = acc.find((d) => d.device === event.device_type);
            if (existing) {
              existing.count++;
            } else {
              acc.push({ device: event.device_type, count: 1 });
            }
          }
          return acc;
        }, [] as DeviceStat[]) || [];

      const countryStats =
        events
          ?.reduce((acc: CountryStat[], event: any) => {
            if (event.country) {
              const existing = acc.find((c) => c.country === event.country);
              if (existing) {
                existing.count++;
              } else {
                acc.push({ country: event.country, count: 1 });
              }
            }
            return acc;
          }, [] as CountryStat[])
          .slice(0, 10) || [];

      // Calculer les métriques de performance moyennes
      const performanceMetrics = {
        avgLoadTime:
          perfData?.reduce((sum: number, p: unknown) => sum + (p.load_time || 0), 0) /
            (perfData?.length || 1) || 0,
        avgFCP:
          perfData?.reduce((sum: number, p: unknown) => sum + (p.first_contentful_paint || 0), 0) /
            (perfData?.length || 1) || 0,
        avgTTI:
          perfData?.reduce((sum: number, p: unknown) => sum + (p.time_to_interactive || 0), 0) /
            (perfData?.length || 1) || 0,
      };

      // Activité utilisateur par jour (basée sur les événements)
      const userActivity =
        events
          ?.reduce((acc: UserActivityStat[], event: any) => {
            const date = new Date(event.created_at).toISOString().split('T')[0];
            const existing = acc.find((a) => a.date === date);
            if (existing) {
              existing.activeUsers++;
            } else {
              acc.push({ date, activeUsers: 1 });
            }
            return acc;
          }, [] as UserActivityStat[])
          .slice(-7) || [];

      const popularContent = [
        ...pageViews.map((p) => ({ title: p.page, type: 'page', engagement: p.views })),
      ]
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 10);

      return {
        pageViews,
        blogEngagement: [], // To be populated if needed
        userActivity,
        popularContent,
        performanceMetrics,
        deviceStats,
        countryStats,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
