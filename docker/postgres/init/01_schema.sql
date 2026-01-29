-- PROQUELEC SOUVERAIN - INITIAL SCHEMA V1.0

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Tables structure

-- 1. Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id SERIAL PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'PROQUELEC',
  slogan TEXT NOT NULL DEFAULT 'Sécurité · Qualité · Formation',
  logo_url TEXT DEFAULT NULL,
  favicon_url TEXT DEFAULT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Pages (Cœur du CMS)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
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
  design_options JSONB DEFAULT '{}',
  seo_options JSONB DEFAULT '{}',
  content_blocks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Normative Books (Coran Technique)
CREATE TABLE IF NOT EXISTS public.normative_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    domain TEXT,
    validity_scope TEXT,
    version TEXT DEFAULT '1.0',
    is_locked BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Normative Articles
CREATE TABLE IF NOT EXISTS public.normative_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES normative_books(id) ON DELETE CASCADE,
    chapter_ref TEXT NOT NULL,
    article_ref TEXT NOT NULL,
    content_exact TEXT NOT NULL,
    safety_objective TEXT,
    application_conditions TEXT,
    prohibitions TEXT[],
    formulas JSONB DEFAULT '{}',
    safety_thresholds JSONB DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    keywords tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Blog Categories
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- 6. Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID, -- Removed FK to auth.users for local portability
  category_id INT REFERENCES public.blog_categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  target TEXT DEFAULT '_self',
  parent_id UUID REFERENCES menu_items(id),
  menu_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  menu_type TEXT DEFAULT 'main',
  icon TEXT,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Training
CREATE TABLE IF NOT EXISTS public.professional_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    level TEXT,
    duration TEXT,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Triggers for all tables
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
