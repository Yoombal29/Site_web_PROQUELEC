-- Script de nettoyage pour réinitialiser les systèmes dynamiques
-- À exécuter AVANT de relancer les migrations si elles ont échoué partiellement

-- ===========================================
-- NETTOYAGE COMPLET DES SYSTÈMES DYNAMIQUES
-- ===========================================

-- Supprimer les triggers
DROP TRIGGER IF EXISTS auto_backup_dynamic_components ON dynamic_components;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS migrate_page_to_dynamic(TEXT);
DROP FUNCTION IF EXISTS backup_component(TEXT, TEXT);
DROP FUNCTION IF EXISTS restore_component(TEXT, UUID);
DROP FUNCTION IF EXISTS auto_backup_component();
DROP FUNCTION IF EXISTS list_component_backups(TEXT);
DROP FUNCTION IF EXISTS cleanup_old_backups();

-- Supprimer les tables (dans l'ordre des dépendances)
DROP TABLE IF EXISTS component_backups CASCADE;
DROP TABLE IF EXISTS dynamic_components CASCADE;
DROP TABLE IF EXISTS theme_configurations CASCADE;
DROP TABLE IF EXISTS dynamic_forms CASCADE;
DROP TABLE IF EXISTS external_integrations CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;

-- ===========================================
-- VÉRIFICATION DU NETTOYAGE
-- ===========================================

SELECT
  '✅ Nettoyage terminé - Prêt pour réinstallation' as status,
  CASE WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dynamic_components') THEN 'Table supprimée' ELSE 'Table existe encore' END as dynamic_components_status,
  CASE WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dynamic_forms') THEN 'Table supprimée' ELSE 'Table existe encore' END as dynamic_forms_status,
  CASE WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'theme_configurations') THEN 'Table supprimée' ELSE 'Table existe encore' END as theme_configurations_status;
