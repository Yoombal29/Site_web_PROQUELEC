-- ========================================================
-- FIX OVERFLOW IN calculate_seo_score FUNCTION
-- ========================================================
-- The function 'calculate_seo_score' had a local variable declared 
-- as DECIMAL(3,2), limiting the score to 9.99 maximum.
-- Attempts to add +20 to the score caused the "numeric field overflow" error.
--
-- This migration redefines the function with NUMERIC(10,2) variable.
-- ========================================================

CREATE OR REPLACE FUNCTION public.calculate_seo_score(page_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
  -- FIXED: Changed from DECIMAL(3,2) to NUMERIC(10,2) to allow scores up to 100
  score NUMERIC(10,2) := 0.00;
  page_record RECORD;
BEGIN
  SELECT * INTO page_record FROM pages WHERE id = page_id;

  IF page_record.title IS NOT NULL AND length(trim(page_record.title)) > 0 THEN
    score := score + 20;
  END IF;

  IF page_record.meta_description IS NOT NULL AND length(page_record.meta_description) BETWEEN 120 AND 160 THEN
    score := score + 20;
  END IF;

  IF page_record.slug IS NOT NULL AND length(page_record.slug) > 0 THEN
    score := score + 15;
  END IF;

  IF page_record.featured_image IS NOT NULL THEN
    score := score + 10;
  END IF;

  IF page_record.content IS NOT NULL AND length(page_record.content) > 300 THEN
    score := score + 25;
  END IF;

  -- Verify array fields exist before checking length
  IF page_record.categories IS NOT NULL AND array_length(page_record.categories, 1) > 0 THEN
    score := score + 5;
  END IF;

  IF page_record.tags IS NOT NULL AND array_length(page_record.tags, 1) > 0 THEN
    score := score + 5;
  END IF;

  RETURN LEAST(score, 100.00);
END;
$function$;

-- Verify the fix by running it on a random page (if any exist)
DO $$
DECLARE
    test_id UUID;
    result NUMERIC;
BEGIN
    SELECT id INTO test_id FROM public.pages LIMIT 1;
    
    IF test_id IS NOT NULL THEN
        -- This would have failed before
        result := public.calculate_seo_score(test_id);
        RAISE NOTICE 'Function test successful! Calculated score: %', result;
    ELSE
        RAISE NOTICE 'No pages found to test function, but definition is updated.';
    END IF;
END $$;
