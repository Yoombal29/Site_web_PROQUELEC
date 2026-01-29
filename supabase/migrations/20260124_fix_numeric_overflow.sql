BEGIN;

-- 1. Drop the view depending on the column (must drop before altering dependent columns)
DROP VIEW IF EXISTS public.pages_with_design;

-- 2. Change reading_time to INTEGER (max 2 billion)
ALTER TABLE public.pages 
ALTER COLUMN reading_time TYPE INTEGER;

-- 3. Change visit_count if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'visit_count') THEN
        ALTER TABLE public.pages ALTER COLUMN visit_count TYPE INTEGER;
    END IF;
END $$;

-- 4. Recreate the view (definition taken from 20260123000001_add_design_options.sql)
CREATE OR REPLACE VIEW public.pages_with_design AS
SELECT 
  *,
  (design_options->>'layout')::text as primary_layout,
  (design_options->>'sidebar_enabled')::boolean as has_sidebar,
  (design_options->>'background_color')::text as bg_color
FROM public.pages;

COMMIT;
