
import { useRealAnalytics } from "./useRealAnalytics";

export interface AnalyticsData {
  pageViews: { page: string; views: number }[];
  blogEngagement: { title: string; views: number; comments: number }[];
  userActivity: { date: string; activeUsers: number }[];
  popularContent: { title: string; type: string; engagement: number }[];
}

export function useAnalytics() {
  const { data: realData, isLoading, error } = useRealAnalytics();

  const getPageAnalytics = async (pageId: string) => {
    // Simulation d'un appel API pour les analytics d'une page spécifique
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Retourner des données mock pour éviter l'erreur
    return {
      views: Math.floor(Math.random() * 1000) + 100,
      uniqueVisitors: Math.floor(Math.random() * 500) + 50,
      avgTime: `${Math.floor(Math.random() * 300) + 30}s`,
      bounceRate: `${Math.floor(Math.random() * 50) + 10}%`
    };
  };

  const trackEvent = (event: string, data?: any) => {
    // Simulation du tracking d'événement
    console.log('Event tracked:', event, data);
  };

  return {
    data: realData ? {
      pageViews: realData.pageViews,
      blogEngagement: realData.blogEngagement,
      userActivity: realData.userActivity,
      popularContent: realData.popularContent,
    } : undefined,
    isLoading,
    error,
    getPageAnalytics,
    trackEvent
  };
}
