-- Add design_options column to pages table (like WordPress post_meta)
-- This allows storing flexible design customizations per page

ALTER TABLE pages ADD COLUMN IF NOT EXISTS design_options JSONB DEFAULT jsonb_build_object(
  'layout', 'default',
  'hero_enabled', true,
  'hero_height', 'medium',
  'hero_overlay', 0.3,
  'hero_alignment', 'center',
  'content_width', 'default',
  'sidebar_enabled', false,
  'sidebar_position', 'right',
  'footer_cta_enabled', true,
  'background_color', '#ffffff',
  'accent_color', '#0066cc',
  'text_color', '#333333',
  'heading_font', 'sans-serif',
  'body_font', 'sans-serif',
  'custom_css', '',
  'custom_sections', '[]'::jsonb
);

-- Add layout_type column for template selection
ALTER TABLE pages ADD COLUMN IF NOT EXISTS layout_type TEXT DEFAULT 'standard' CHECK (layout_type IN (
  'standard',
  'blog',
  'landing',
  'gallery',
  'testimonials',
  'pricing',
  'contact',
  'services',
  'team',
  'portfolio'
));

-- Add seo_options column (like WordPress Yoast meta)
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_options JSONB DEFAULT jsonb_build_object(
  'focus_keyword', '',
  'meta_description', '',
  'canonical_url', '',
  'og_image', '',
  'og_title', '',
  'og_description', '',
  'twitter_card', 'summary',
  'schema_type', 'WebPage'
);

-- Create index for better query performance on JSONB
CREATE INDEX IF NOT EXISTS idx_pages_design_options ON pages USING GIN (design_options);
CREATE INDEX IF NOT EXISTS idx_pages_layout_type ON pages(layout_type);

-- Create view for easier querying pages with their design
CREATE OR REPLACE VIEW pages_with_design AS
SELECT 
  *,
  (design_options->>'layout')::text as primary_layout,
  (design_options->>'sidebar_enabled')::boolean as has_sidebar,
  (design_options->>'background_color')::text as bg_color
FROM pages;
