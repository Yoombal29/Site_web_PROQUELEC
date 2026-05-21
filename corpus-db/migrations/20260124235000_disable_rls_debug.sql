-- ========================================================
-- DEBUG: TEMPORARILY DISABLE RLS ON PAGES TABLE
-- ========================================================
-- This will isolate if the "stack depth limit exceeded" error
-- is caused by RLS policies or Triggers.
-- ========================================================

ALTER TABLE public.pages DISABLE ROW LEVEL SECURITY;
