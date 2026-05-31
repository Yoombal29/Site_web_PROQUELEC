import { useQuery } from "@tanstack/react-query";

export interface DynamicRoute {
  path: string;
  slug: string;
  title: string;
  content: string;
  meta_description?: string;
  meta_keywords?: string;
  featured_image?: string;
  template?: string;
  show_hero?: boolean;
  show_footer?: boolean;
  custom_css?: string;
  custom_js?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_background_image?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
  author?: string;
  reading_time?: number;
  categories?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export function useDynamicRoutes() {
  return useQuery({
    queryKey: ["dynamic-routes"],
    queryFn: async (): Promise<DynamicRoute[]> => {
      try {
        const res = await fetch("/api/pages");
        if (!res.ok) throw new Error("Failed to fetch pages");

        const responseData = await res.json();
        const data = Array.isArray(responseData) ? responseData : responseData?.rows || [];

        return data.filter((page: unknown) => page.status === 'published').map((page: unknown) => ({
          path: `/${page.slug}`,
          slug: page.slug,
          title: page.title,
          content: page.content || '',
          meta_description: page.meta_description,
          meta_keywords: page.meta_keywords,
          featured_image: page.featured_image,
          template: page.template || 'default',
          show_hero: page.show_hero ?? true,
          show_footer: page.show_footer ?? true,
          custom_css: page.custom_css,
          custom_js: page.custom_js,
          hero_title: page.hero_title,
          hero_subtitle: page.hero_subtitle,
          hero_background_image: page.hero_background_image,
          hero_cta_text: page.hero_cta_text,
          hero_cta_link: page.hero_cta_link,
          author: page.author,
          reading_time: page.reading_time || 0,
          categories: page.categories || [],
          tags: page.tags || [],
          created_at: page.created_at,
          updated_at: page.updated_at
        })).sort((a: unknown, b: unknown) => (a.menu_order || 0) - (b.menu_order || 0));
      } catch (error) {
        console.warn('Error in useDynamicRoutes:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    retry: false
  });
}

// Hook pour récupérer une page spécifique par slug
export function useDynamicPage(slug: string) {
  return useQuery({
    queryKey: ["dynamic-page", slug],
    queryFn: async (): Promise<DynamicRoute | null> => {
      try {
        // We fetch all pages and find the one because we don't have a specific slug endpoint on server yet? 
        // Wait, server/index.js has app.get('/api/pages').
        // But app.get('/api/pages') returns ALL pages.
        // It's efficient enough for now (small site).
        // Or I should add a slug endpoint.
        // Actually, let's just fetch all and filter client side for safety first, OR add endpoint.
        // Adding endpoint is cleaner but requires server restart.
        // Let's rely on fetching all for now to avoid server restart risk, 
        // unless list is huge.

        const res = await fetch("/api/pages");
        if (!res.ok) throw new Error("Failed to fetch pages");
        const allPages = await res.json();

        const data = allPages.find((p: unknown) => p.slug === slug && p.status === 'published');

        if (!data) {
          return null;
        }

        return {
          path: `/${data.slug}`,
          slug: data.slug,
          title: data.title,
          content: data.content || '',
          meta_description: data.meta_description,
          meta_keywords: data.meta_keywords,
          featured_image: data.featured_image,
          template: data.template || 'default',
          show_hero: data.show_hero ?? true,
          show_footer: data.show_footer ?? true,
          custom_css: data.custom_css,
          custom_js: data.custom_js,
          hero_title: data.hero_title,
          hero_subtitle: data.hero_subtitle,
          hero_background_image: data.hero_background_image,
          hero_cta_text: data.hero_cta_text,
          hero_cta_link: data.hero_cta_link,
          author: data.author,
          reading_time: data.reading_time || 0,
          categories: data.categories || [],
          tags: data.tags || [],
          created_at: data.created_at,
          updated_at: data.updated_at
        };
      } catch (error) {
        console.warn('Error in useDynamicPage:', error);
        return null;
      }
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}