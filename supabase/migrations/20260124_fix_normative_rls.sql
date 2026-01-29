-- VÉRIFICATION ET CORRECTION DES PERMISSIONS RLS
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier si les articles existent
SELECT COUNT(*) as total_articles FROM normative_articles;
SELECT COUNT(*) as total_books FROM normative_books;

-- 2. Afficher quelques articles pour vérifier
SELECT 
  na.article_ref,
  na.chapter_ref,
  nb.ref_code,
  LEFT(na.content_exact, 100) as preview
FROM normative_articles na
JOIN normative_books nb ON na.book_id = nb.id
LIMIT 5;

-- 3. ACTIVER L'ACCÈS PUBLIC EN LECTURE (CRITIQUE pour les tests)
-- Désactiver RLS temporairement pour les tests
ALTER TABLE normative_books DISABLE ROW LEVEL SECURITY;
ALTER TABLE normative_articles DISABLE ROW LEVEL SECURITY;

-- OU créer des policies publiques (plus sécurisé)
-- DROP POLICY IF EXISTS "Public read access" ON normative_books;
-- DROP POLICY IF EXISTS "Public read access" ON normative_articles;

-- CREATE POLICY "Public read access" ON normative_books
--   FOR SELECT USING (true);

-- CREATE POLICY "Public read access" ON normative_articles
--   FOR SELECT USING (true);
