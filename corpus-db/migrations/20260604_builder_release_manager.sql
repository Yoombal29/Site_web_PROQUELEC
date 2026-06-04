-- Builder Release Manager
-- Promotion locale -> VPS sans écrasement silencieux des modifications serveur.
-- Idempotent.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS builder_revision INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS builder_content_hash TEXT,
  ADD COLUMN IF NOT EXISTS builder_base_content_hash TEXT,
  ADD COLUMN IF NOT EXISTS builder_base_revision INTEGER,
  ADD COLUMN IF NOT EXISTS builder_origin_page_id UUID,
  ADD COLUMN IF NOT EXISTS builder_origin_slug TEXT,
  ADD COLUMN IF NOT EXISTS builder_last_release_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS builder_last_release_by UUID,
  ADD COLUMN IF NOT EXISTS builder_source_environment TEXT;

UPDATE public.pages
SET builder_revision = COALESCE(builder_revision, version, version_number, 1)
WHERE builder_revision IS NULL;

CREATE TABLE IF NOT EXISTS public.builder_release_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  target_slug TEXT NOT NULL,
  package JSONB NOT NULL,
  package_hash TEXT NOT NULL,
  base_hash TEXT,
  base_revision INTEGER,
  current_hash TEXT,
  current_revision INTEGER,
  status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate', 'conflict', 'published', 'rejected')),
  conflict_reason TEXT,
  diff_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_by UUID,
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_builder_release_candidates_status
  ON public.builder_release_candidates(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_builder_release_candidates_target_page
  ON public.builder_release_candidates(target_page_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_builder_release_candidates_slug
  ON public.builder_release_candidates(target_slug, created_at DESC);

CREATE TABLE IF NOT EXISTS public.builder_page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'builder',
  action TEXT NOT NULL DEFAULT 'snapshot',
  release_candidate_id UUID REFERENCES public.builder_release_candidates(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builder_page_revisions_page_revision
  ON public.builder_page_revisions(page_id, revision DESC);

CREATE INDEX IF NOT EXISTS idx_builder_page_revisions_hash
  ON public.builder_page_revisions(content_hash);
