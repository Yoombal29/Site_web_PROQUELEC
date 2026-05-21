-- Migration Plan Phase 1
-- Objectif: Ajouter le support du Builder (structure_json) et de la bibliothèque de composants
-- Auteur: Assistant (pour PROQUELEC)
-- Date: 2026-02-11

-- 1. Mise à jour de la table PAGES --
ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS structure_json JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS version_id UUID,
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS og_image VARCHAR(255);

-- 2. Création de la table PAGE_COMPONENTS (Bibliothèque) --
CREATE TABLE IF NOT EXISTS public.page_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    thumbnail_url VARCHAR(255),
    default_structure JSONB NOT NULL,
    schema_props JSONB DEFAULT '{}',
    is_global BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Création de la table PAGE_VERSIONS (Historique) --
CREATE TABLE IF NOT EXISTS public.page_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    structure_json JSONB NOT NULL,
    theme_config JSONB,
    commit_message VARCHAR(255),
    author_id UUID, -- Peut être NULL si système
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Mise à jour de la table MENU_ITEMS (Sync) --
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS linked_page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL;

-- 5. Trigger : Auto-Update Menu URL quand Page Slug change --
CREATE OR REPLACE FUNCTION update_menu_url_on_page_slug_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.slug IS DISTINCT FROM NEW.slug THEN
        UPDATE public.menu_items
        SET url = '/' || NEW.slug
        WHERE linked_page_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_menu_slug ON public.pages;

CREATE TRIGGER trg_update_menu_slug
AFTER UPDATE OF slug ON public.pages
FOR EACH ROW
EXECUTE FUNCTION update_menu_url_on_page_slug_change();
