-- ============================================================================
-- FIX : ACCÈS PUBLICS ET NETTOYAGE PARAMÈTRES (v2)
-- ============================================================================

-- 1. Nettoyage des doublons dans site_settings (on garde l'ID 1 si possible)
DELETE FROM site_settings WHERE id NOT IN (
    SELECT id FROM site_settings LIMIT 1
);

-- 2. Sécurité RLS pour les tables manquantes ou protégées sans politique
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique partners" ON partners;
CREATE POLICY "Lecture publique partners" ON partners FOR SELECT USING (true);

ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique quick_links" ON quick_links;
CREATE POLICY "Lecture publique quick_links" ON quick_links FOR SELECT USING (true);

ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique theme_settings" ON theme_settings;
CREATE POLICY "Lecture publique theme_settings" ON theme_settings FOR SELECT USING (true);

-- 3. Vérification de blog_posts et ses relations
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique blog_categories" ON blog_categories;
CREATE POLICY "Lecture publique blog_categories" ON blog_categories FOR SELECT USING (true);

-- 4. Recharger le cache PostgREST
NOTIFY pgrst, 'reload schema';
