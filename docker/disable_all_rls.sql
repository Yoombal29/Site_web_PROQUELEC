-- Désactivation complète de RLS pour toutes les tables publiques
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = true
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', r.tablename);
        RAISE NOTICE 'RLS désactivé pour: %', r.tablename;
    END LOOP;
END $$;

SELECT 'RLS désactivé sur toutes les tables' AS resultat;
