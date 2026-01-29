-- Create pages table with all required fields
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  meta_robots TEXT DEFAULT 'index,follow',
  featured_image TEXT,
  template TEXT DEFAULT 'default',
  show_hero BOOLEAN DEFAULT true,
  show_footer BOOLEAN DEFAULT true,
  custom_css TEXT,
  custom_js TEXT,
  header_html TEXT,
  footer_html TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_background_image TEXT,
  hero_cta_text TEXT,
  hero_cta_link TEXT,
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMPTZ,
  unpublish_date TIMESTAMPTZ,
  menu_order INTEGER DEFAULT 0,
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  author TEXT,
  reading_time INTEGER DEFAULT 0,
  parent_id UUID REFERENCES pages(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_is_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_pages_menu_order ON pages(menu_order);
CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to published pages
CREATE POLICY "Public can read published pages" ON pages
  FOR SELECT USING (is_published = true);

-- Create policies for authenticated users (admin)
CREATE POLICY "Authenticated users can manage all pages" ON pages
  FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();