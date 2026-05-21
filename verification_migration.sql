-- À exécuter dans votre client PostgreSQL (ex: pgAdmin ou DBeaver)
-- Assurez-vous d'être connecté à la base de données proquelec
-- ===========================================

-- 1. VÉRIFICATION DES TABLES
SELECT 'Vérification des tables...' as etape;
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('pages', 'page_sections', 'form_submissions', 'notifications')
ORDER BY tablename;

-- 2. VÉRIFICATION DE LA STRUCTURE DE LA TABLE PAGES
SELECT 'Structure de la table pages...' as etape;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pages' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VÉRIFICATION DES INDEX
SELECT 'Vérification des index...' as etape;
SELECT
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('pages', 'page_sections', 'form_submissions', 'notifications')
ORDER BY tablename, indexname;

-- 4. VÉRIFICATION DES POLITIQUES RLS
SELECT 'Vérification des politiques RLS...' as etape;
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. VÉRIFICATION DES TRIGGERS
SELECT 'Vérification des triggers...' as etape;
SELECT
    event_object_table,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
    AND event_object_table IN ('pages', 'page_sections', 'form_submissions', 'notifications')
ORDER BY event_object_table, trigger_name;

-- 6. VÉRIFICATION DES DONNÉES INSÉRÉES
SELECT 'Vérification des pages créées...' as etape;
SELECT
    slug,
    title,
    is_published,
    menu_order,
    created_at
FROM pages
ORDER BY menu_order;

-- 7. VÉRIFICATION DE LA FONCTION update_updated_at_column
SELECT 'Vérification de la fonction update_updated_at_column...' as etape;
SELECT
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name = 'update_updated_at_column';

-- 8. COMPTE RENDU FINAL
SELECT 'RAPPORT FINAL DE VÉRIFICATION' as titre;
SELECT
    'Tables créées' as element,
    COUNT(*) as nombre
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('pages', 'page_sections', 'form_submissions', 'notifications')

UNION ALL

SELECT
    'Index créés' as element,
    COUNT(*) as nombre
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('pages', 'page_sections', 'form_submissions', 'notifications')

UNION ALL

SELECT
    'Politiques RLS' as element,
    COUNT(*) as nombre
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT
    'Triggers créés' as element,
    COUNT(*) as nombre
FROM information_schema.triggers
WHERE event_object_schema = 'public'
    AND event_object_table IN ('pages', 'page_sections', 'form_submissions', 'notifications')

UNION ALL

SELECT
    'Pages insérées' as element,
    COUNT(*) as nombre
FROM pages;

-- Message de confirmation
SELECT 'Vérification terminée ! Comparez ces résultats avec votre fichier complete_migration.sql' as status;