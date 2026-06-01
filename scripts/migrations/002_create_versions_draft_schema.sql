-- Migration Plan Phase 7
-- Objectif: Ajouter le support des brouillons (drafts), la configuration de thème globale, le statut de workflow et l'historique de versions
-- Auteur: Assistant (pour PROQUELEC)
-- Date: 2026-05-30

-- 1. Mise à jour de la table PAGES --
ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS draft_json JSONB,
ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

-- 2. Création de la table PAGE_VERSIONS (Historique) --
CREATE TABLE IF NOT EXISTS public.page_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    version_name VARCHAR(255) NOT NULL,
    structure_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- 3. Création de l'index de performance pour les versions --
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id
ON public.page_versions(page_id);
