/**
 * Types Canoniques pour le Système CMS PROQUELEC (Gutenberg-style)
 * Utilisés pour le contrat de données entre API locale ↔ UI ↔ Renderer
 */

export type WorkflowStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type CommentStatus = 'open' | 'closed';

// Registre des Sections Personnalisées
export interface CustomSection {
  id: string;
  type: 'text' | 'image' | 'gallery' | 'testimonials' | 'cta' | 'stats' | 'features';
  title: string;
  content: string;
  position: number;
  enabled: boolean;
  settings?: unknown;
}

// Contrat de Bloc Versionné
export interface ContentBlock<T = unknown> {
  id: string;
  type: string;
  version: number; // Important pour la compatibilité future
  data: T;
  settings?: {
    isVisible?: boolean;
    customClass?: string;
    anchor?: string;
  };
}

// Options de Design (BeTheme Style)
export interface PageDesignOptions {
  theme_id?: string;
  layout: 'default' | 'full-width' | 'boxed' | 'card';
  hero_enabled: boolean;
  hero_height: 'small' | 'medium' | 'large' | 'fullscreen';
  hero_overlay: number;
  hero_alignment: 'left' | 'center' | 'right';
  content_width: 'default' | 'narrow' | 'wide' | 'full';
  sidebar_enabled: boolean;
  sidebar_position: 'left' | 'right';
  footer_cta_enabled: boolean;
  background_color: string;
  accent_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
  custom_css?: string;
  custom_sections: CustomSection[];
}

// Options SEO Avancées
export interface PageSeoOptions {
  focus_keyword: string;
  meta_description: string;
  canonical_url: string;
  og_image: string;
  og_title: string;
  og_description: string;
  twitter_card: 'summary' | 'summary_large_image';
  schema_type: string;
  language?: string;
}

// Registre des Plugins
export interface CmsPlugin {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  version: string;
  category: string;
  icon?: string;
  settings_schema: unknown;
  default_settings: unknown;
  is_active_globally: boolean;
  created_at: string;
}

// Registre des Thèmes (BeTheme Style)
export interface CmsTheme {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  preview_image?: string;
  category: string;
  design_config: Partial<PageDesignOptions>;
  header_config: unknown;
  footer_config: unknown;
  is_premium: boolean;
  created_at: string;
}

// Enregistrement de Page complet (Synchronisé avec la DB)
export interface PageRecord {
  id: string;
  title: string;
  slug: string;
  content: string; // Legacy field for plain text fallback
  excerpt?: string;
  content_blocks: ContentBlock[];
  workflow_status: WorkflowStatus;
  is_published: boolean;
  is_sticky: boolean;
  comment_status: CommentStatus;
  published_at?: string;
  meta_description?: string;
  meta_keywords?: string;
  featured_image?: string;
  design_options: PageDesignOptions;
  seo_options: PageSeoOptions;
  plugins_active: string[];
  language_code: string;
  translation_of?: string;
  created_at: string;
  updated_at: string;
  author?: string;
}