-- ========================================================
-- DIAGNOSTIC: Verify current state of ALL numeric columns
-- ========================================================

-- Check ALL numeric columns in pages table
SELECT 
    column_name,
    data_type,
    numeric_precision,
    numeric_scale,
    CONCAT(data_type, '(', numeric_precision, ',', numeric_scale, ')') as full_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'pages'
  AND data_type IN ('numeric', 'decimal')
ORDER BY column_name;
