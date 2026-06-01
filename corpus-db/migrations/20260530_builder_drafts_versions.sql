-- Migration: Builder Drafts, Theme Config & Named Versions
-- Phase 7 - God Builder Infrastructure
-- Auteur: Assistant (PROQUELEC)
-- Date: 2026-05-30
-- Idempotent: OUI

-- 1. Mise à jour de la table PAGES: draft_json, theme_config, status --
ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS draft_json JSONB;

ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}'::jsonb;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'pages' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.pages ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
    END IF;
END $$;

-- 2. Création de la table PAGE_VERSIONS (Historique nommé) --
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

-- 4. Assurer que la colonne version_name existe (migration idempotente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'page_versions' AND column_name = 'version_name'
    ) THEN
        ALTER TABLE public.page_versions ADD COLUMN version_name VARCHAR(255) NOT NULL DEFAULT 'Auto';
    END IF;
END $$;

-- 5. Assurer que la colonne structure_json existe dans page_versions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'page_versions' AND column_name = 'structure_json'
    ) THEN
        ALTER TABLE public.page_versions ADD COLUMN structure_json JSONB;
    END IF;
END $$;
