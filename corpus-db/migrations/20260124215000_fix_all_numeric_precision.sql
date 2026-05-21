-- ========================================================
-- FIX ALL NUMERIC(3,2) COLUMNS IN PAGES TABLE
-- ========================================================
-- This migration identifies and fixes any NUMERIC columns
-- with precision 3 and scale 2, which can only store -9.99 to 9.99

-- Step 1: Identify all NUMERIC(3,2) columns (for logging)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT column_name, 
               numeric_precision, 
               numeric_scale
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pages'
          AND data_type IN ('numeric', 'decimal')
          AND numeric_precision = 3
          AND numeric_scale = 2
    LOOP
        RAISE NOTICE 'Found column with NUMERIC(3,2): %', r.column_name;
        
        -- Fix each column by changing to NUMERIC(10,2)
        EXECUTE format('ALTER TABLE public.pages ALTER COLUMN %I TYPE NUMERIC(10, 2)', r.column_name);
        
        RAISE NOTICE 'Fixed column % to NUMERIC(10,2)', r.column_name;
    END LOOP;
    
    -- If no columns found, log that too
    IF NOT FOUND THEN
        RAISE NOTICE 'No NUMERIC(3,2) columns found in pages table';
    END IF;
END $$;

-- Step 2: List all remaining numeric columns for verification
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '=== All NUMERIC columns in pages table ===';
    FOR r IN 
        SELECT column_name, 
               data_type,
               numeric_precision, 
               numeric_scale
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pages'
          AND data_type IN ('numeric', 'decimal')
        ORDER BY column_name
    LOOP
        RAISE NOTICE 'Column: % | Type: %(%, %)', 
                     r.column_name, 
                     r.data_type, 
                     r.numeric_precision, 
                     r.numeric_scale;
    END LOOP;
END $$;
