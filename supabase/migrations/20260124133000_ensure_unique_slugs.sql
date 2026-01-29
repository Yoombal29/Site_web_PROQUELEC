-- Migration : Ensure Slug Uniqueness & Integrity
-- This prevents creating multiple pages with the same slug, which would break routing.

BEGIN;

-- 1. Try to add a UNIQUE constraint to the 'slug' column.
-- First, we need to handle duplicates if any exist (append -dup-ID to slug)
DO $$ 
BEGIN
    -- Check if duplicates exist
    IF EXISTS (
        SELECT slug, COUNT(*) 
        FROM pages 
        GROUP BY slug 
        HAVING COUNT(*) > 1
    ) THEN
        -- Resolve duplicates by appending random suffix or ID
        UPDATE pages p
        SET slug = p.slug || '-' || substr(md5(random()::text), 1, 4)
        WHERE p.id IN (
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rnum
                FROM pages
            ) t WHERE t.rnum > 1
        );
    END IF;
END $$;

-- 2. Now add the constraint safely (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_slug_key') THEN
        ALTER TABLE public.pages ADD CONSTRAINT pages_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 3. Add an index on slug if not exists (UNIQUE constraint creates one, but explicit is fine)
-- CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);

COMMIT;
