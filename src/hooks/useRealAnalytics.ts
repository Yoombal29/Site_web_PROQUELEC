
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

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
    queryKey: ["real-analytics"],
    queryFn: async (): Promise<RealAnalyticsData> => {
      // Récupérer les événements analytics
      const { data: events, error: eventsError } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (eventsError) {
        toast.error('Erreur lors de la récupération des analytics.');
        throw eventsError;
      }

      // Récupérer les métriques de performance
      const { data: perfData, error: perfError } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (perfError) {
        toast.error('Erreur lors de la récupération des métriques de performance.');
      }

      // Récupérer les articles de blog pour l'engagement
      const { data: blogPosts, error: blogError } = await supabase
        .from('blog_posts')
        .select('title, id')
        .limit(10);

      if (blogError) {
        toast.error('Erreur lors de la récupération des articles de blog.');
      }

      // Analyser les données
      const pageViews = events?.reduce((acc: any[], event) => {
        if (event.event_type === 'page_view') {
          const page = new URL(event.page_url).pathname;
          const existing = acc.find(p => p.page === page);
          if (existing) {
            existing.views++;
          } else {
            acc.push({ page, views: 1 });
          }
        }
        return acc;
      }, []).slice(0, 10) || [];

      const deviceStats = events?.reduce((acc: any[], event) => {
        if (event.device_type) {
          const existing = acc.find(d => d.device === event.device_type);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ device: event.device_type, count: 1 });
          }
        }
        return acc;
      }, []) || [];

      const countryStats = events?.reduce((acc: any[], event) => {
        if (event.country) {
          const existing = acc.find(c => c.country === event.country);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ country: event.country, count: 1 });
          }
        }
        return acc;
      }, []).slice(0, 10) || [];

      // Calculer les métriques de performance moyennes
      const performanceMetrics = {
        avgLoadTime: perfData?.reduce((sum, p) => sum + p.load_time, 0) / (perfData?.length || 1) || 0,
        avgFCP: perfData?.reduce((sum, p) => sum + p.first_contentful_paint, 0) / (perfData?.length || 1) || 0,
        avgTTI: perfData?.reduce((sum, p) => sum + p.time_to_interactive, 0) / (perfData?.length || 1) || 0,
      };

      // Simuler l'engagement blog (à améliorer avec de vraies métriques)
      const blogEngagement = blogPosts?.map(post => ({
        title: post.title,
        views: Math.floor(Math.random() * 500) + 100,
        comments: Math.floor(Math.random() * 20) + 1,
      })) || [];

      // Activité utilisateur par jour (basée sur les événements)
      const userActivity = events?.reduce((acc: any[], event) => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        const existing = acc.find(a => a.date === date);
        if (existing) {
          existing.activeUsers++;
        } else {
          acc.push({ date, activeUsers: 1 });
        }
        return acc;
      }, []).slice(-7) || [];

      const popularContent = [
        ...pageViews.map(p => ({ title: p.page, type: 'page', engagement: p.views })),
        ...blogEngagement.map(b => ({ title: b.title, type: 'blog', engagement: b.views }))
      ].sort((a, b) => b.engagement - a.engagement).slice(0, 10);

      return {
        pageViews,
        blogEngagement,
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
