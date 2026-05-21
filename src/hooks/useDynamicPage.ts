import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface DynamicPageData {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  meta_robots: string | null;
  featured_image: string | null;
  template: string | null;
  show_hero: boolean | null;
  show_footer: boolean | null;
  custom_css: string | null;
  custom_js: string | null;
  header_html: string | null;
  footer_html: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_background_image: string | null;
  hero_cta_text: string | null;
  hero_cta_link: string | null;
  publish_date: string | null;
  unpublish_date: string | null;
  categories: string[] | null;
  tags: string[] | null;
  author: string | null;
  reading_time: number | null;
  parent_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_published: boolean | null;
  menu_order: number | null;
}

export function useDynamicPage(slug: string) {
  return useQuery({
    queryKey: ["dynamic-page", slug],
    queryFn: async (): Promise<DynamicPageData | null> => {
      try {
        const data = await apiFetch<DynamicPageData>(`/api/pages/${slug}`);
        return data;
      } catch (error) {
        console.error("Error fetching dynamic page:", error);
        return null;
      }
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
