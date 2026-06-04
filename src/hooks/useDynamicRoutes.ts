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

interface PageRecord {
  path?: string;
  slug: string;
  title: string;
  content?: string;
  status?: string;
  is_published?: boolean;
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
  menu_order?: number;
  created_at: string;
  updated_at: string;
}

const isLocalHost = () => (
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
);

const normalizePagesResponse = (responseData: unknown): PageRecord[] => {
  const rows = Array.isArray(responseData)
    ? responseData
    : (responseData as { rows?: unknown[]; data?: unknown[] })?.rows
      || (responseData as { rows?: unknown[]; data?: unknown[] })?.data
      || [];

  return rows.filter((page): page is PageRecord => {
    if (!page || typeof page !== 'object') return false;
    const candidate = page as Partial<PageRecord>;
    return typeof candidate.slug === 'string' && typeof candidate.title === 'string';
  });
};

const fetchPagesFrom = async (url: string): Promise<PageRecord[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Failed to fetch pages from ${url}: ${response.status} ${body.slice(0, 180)}`);
  }

  return normalizePagesResponse(await response.json());
};

const fetchPages = async (): Promise<PageRecord[]> => {
  try {
    return await fetchPagesFrom('/api/pages');
  } catch (error) {
    if (!isLocalHost()) throw error;

    console.warn('[DynamicRoutes] /api/pages failed through current origin, trying local API:', error);
    return fetchPagesFrom('http://127.0.0.1:3010/api/pages');
  }
};

const isPublished = (page: PageRecord) => {
  if (page.status) return page.status === 'published';
  return page.is_published !== false;
};

const toDynamicRoute = (page: PageRecord): DynamicRoute => ({
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
});

export function useDynamicRoutes() {
  return useQuery({
    queryKey: ["dynamic-routes"],
    queryFn: async (): Promise<DynamicRoute[]> => {
      try {
        const data = await fetchPages();

        return data
          .filter(isPublished)
          .sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0))
          .map(toDynamicRoute);
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
        const allPages = await fetchPages();
        const data = allPages.find((page) => page.slug === slug && isPublished(page));

        if (!data) {
          return null;
        }

        return toDynamicRoute(data);
      } catch (error) {
        console.warn('Error in useDynamicPage:', error);
        return null;
      }
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}
