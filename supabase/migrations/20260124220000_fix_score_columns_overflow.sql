-- ========================================================
-- FIX NUMERIC OVERFLOW IN SCORE COLUMNS (AUTOMATIC VIEW DETECTION)
-- ========================================================
-- These 5 columns were defined as NUMERIC(3,2) which can only 
-- store values between -9.99 and 9.99. This caused overflow 
-- errors when scores >= 10 were submitted.
--
-- Upgrading to NUMERIC(10,2) to support scores 0-100 or larger.
-- 
-- This migration AUTOMATICALLY finds and drops ALL views that
-- depend on the pages table, then recreates the known ones.
-- ========================================================

BEGIN;

-- ======================================================
-- Step 1: AUTOMATICALLY DROP ALL VIEWS depending on pages
-- ======================================================
DO $$
DECLARE
    view_record RECORD;
    drop_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Finding all views that depend on table "pages"...';
    RAISE NOTICE '';
    
    -- Find all VIEWS (not tables) that reference the pages table
    -- IMPORTANT: Select view_name, not table_name!
    FOR view_record IN 
        SELECT DISTINCT view_name
        FROM information_schema.view_table_usage
        WHERE view_schema = 'public'
          AND table_schema = 'public'
          AND table_name = 'pages'
    LOOP
        RAISE NOTICE '  ⚠ Dropping view: %', view_record.view_name;
        EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', view_record.view_name);
        drop_count := drop_count + 1;
    END LOOP;
    
    IF drop_count = 0 THEN
        RAISE NOTICE '  ℹ No views found depending on pages table';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '✓ Dropped % dependent view(s)', drop_count;
    END IF;
    RAISE NOTICE '';
END $$;

-- ======================================================
-- Step 2: ALTER the 5 score columns
-- ======================================================
ALTER TABLE public.pages ALTER COLUMN ab_test_weight TYPE NUMERIC(10, 2);
ALTER TABLE public.pages ALTER COLUMN engagement_score TYPE NUMERIC(10, 2);
ALTER TABLE public.pages ALTER COLUMN seo_score TYPE NUMERIC(10, 2);
ALTER TABLE public.pages ALTER COLUMN performance_score TYPE NUMERIC(10, 2);
ALTER TABLE public.pages ALTER COLUMN accessibility_score TYPE NUMERIC(10, 2);

-- ======================================================
-- Step 3: RECREATE the known essential view
-- ======================================================
-- This view is defined in migration 20260123000001_add_design_options.sql
CREATE OR REPLACE VIEW public.pages_with_design AS
SELECT 
  *,
  (design_options->>'layout')::text as primary_layout,
  (design_options->>'sidebar_enabled')::boolean as has_sidebar,
  (design_options->>'background_color')::text as bg_color
FROM public.pages;

-- ======================================================
-- Step 4: VERIFY the changes
-- ======================================================
DO $$
DECLARE
    r RECORD;
    view_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    RAISE NOTICE '📊 Updated Score Columns:';
    FOR r IN 
        SELECT column_name, 
               numeric_precision, 
               numeric_scale
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pages'
          AND column_name IN ('ab_test_weight', 'engagement_score', 'seo_score', 'performance_score', 'accessibility_score')
        ORDER BY column_name
    LOOP
        RAISE NOTICE '  ✓ % : NUMERIC(%, %)', 
                     r.column_name, 
                     r.numeric_precision, 
                     r.numeric_scale;
    END LOOP;
    
    RAISE NOTICE '';
    
    -- Check recreated views
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'public' 
      AND table_name = 'pages_with_design';
      
    IF view_count > 0 THEN
        RAISE NOTICE '✓ View "pages_with_design" recreated';
    ELSE
        RAISE WARNING '⚠ View "pages_with_design" was NOT recreated';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 All score columns now accept 0-99,999,999.99';
    RAISE NOTICE '🎉 Numeric field overflow error RESOLVED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

COMMIT;
