
-- ========================================================
-- UPDATE ENUMS (SEPARATE TRANSACTION)
-- ========================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'secondary_admin') THEN
        ALTER TYPE public.app_role ADD VALUE 'secondary_admin';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'partner') THEN
        ALTER TYPE public.app_role ADD VALUE 'partner';
    END IF;
END $$;
