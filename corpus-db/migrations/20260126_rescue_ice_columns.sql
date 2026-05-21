-- EMERGENCY RESCUE SCRIPT
-- Run this in proquelec SQL Editor to manually add the missing columns

ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS version int DEFAULT 1;
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS content_raw text;
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS content_compiled text;
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS content_hash text;
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'html';
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS editor_engine text DEFAULT 'code';
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS render_engine text DEFAULT 'raw';
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS security_level text DEFAULT 'trusted';
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS content_contract jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS immutable boolean DEFAULT false;

-- Re-run the update to ensure data is consistent
UPDATE public.pages
SET 
    content_raw = content,
    version = 1,
    editor_engine = 'code'
WHERE slug = 'expertises-techniques' AND content_raw IS NULL;
