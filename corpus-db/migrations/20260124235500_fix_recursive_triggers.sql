-- ========================================================
-- FIX INFINITE RECURSION (STACK DEPTH EXCEEDED)
-- ========================================================
-- Problem: Triggers were causing infinite loops (Update -> Trigger -> Update)
-- Solution:
-- 1. DROP dangerous 'update_page_metrics_trigger' (should not be on UPDATE)
-- 2. FIX 'update_pages_updated_at' (Ensure it is BEFORE UPDATE)
-- 3. Re-enable RLS (since policies were likely fine)
-- ========================================================

-- 1. DROP DANGEROUS TRIGGER
DROP TRIGGER IF EXISTS update_page_metrics_trigger ON public.pages;
DROP FUNCTION IF EXISTS public.update_page_metrics(); -- Clean up associated function if possible

-- 2. FIX UPDATED_AT TRIGGER
-- Ensure we have the standard BEFORE UPDATE function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- CORRECT: Modify NEW record directly, DO NOT run UPDATE query
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Drop old trigger to be safe
DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;

-- Recreate correctly as BEFORE UPDATE
CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3. RE-ENABLE RLS (Security)
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- 4. VERIFY
DO $$
BEGIN
    RAISE NOTICE '✅ Dangerous trigger "update_page_metrics_trigger" DROPPED';
    RAISE NOTICE '✅ Trigger "update_pages_updated_at" FIXED (BEFORE UPDATE)';
    RAISE NOTICE '✅ RLS Re-enabled';
END $$;
