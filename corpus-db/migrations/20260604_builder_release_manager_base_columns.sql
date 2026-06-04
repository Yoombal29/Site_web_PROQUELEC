-- Builder Release Manager baseline metadata
-- Idempotent companion migration for environments that applied the first
-- release-manager migration before baseline columns were added.

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS builder_base_content_hash TEXT,
  ADD COLUMN IF NOT EXISTS builder_base_revision INTEGER,
  ADD COLUMN IF NOT EXISTS builder_origin_page_id UUID,
  ADD COLUMN IF NOT EXISTS builder_origin_slug TEXT;
