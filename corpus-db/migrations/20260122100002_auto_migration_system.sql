-- Script de migration automatique des pages existantes
-- Ce script transforme les composants codés en dur en composants dynamiques

-- ===========================================
-- FONCTION DE MIGRATION AUTOMATIQUE
-- ===========================================

CREATE OR REPLACE FUNCTION migrate_page_to_dynamic(page_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  component_record RECORD;
  component_count INTEGER := 0;
  result_text TEXT := '';
BEGIN
  -- Vérifier si la page existe dans les composants dynamiques
  SELECT COUNT(*) INTO component_count
  FROM dynamic_components
  WHERE name = 'page-' || page_slug;

  IF component_count > 0 THEN
    RETURN 'Page déjà migrée: ' || page_slug;
  END IF;

  -- Créer un composant dynamique pour la page
  INSERT INTO dynamic_components (
    name,
    component_type,
    title,
    content,
    settings
  ) VALUES (
    'page-' || page_slug,
    'feature',
    'Page ' || page_slug,
    jsonb_build_object(
      'slug', page_slug,
      'migrated_from', 'static_page',
      'migration_date', NOW()
    ),
    jsonb_build_object(
      'is_dynamic', true,
      'original_components', '[]'::jsonb
    )
  );

  result_text := 'Page migrée: ' || page_slug || ' -> composant dynamique créé';

  RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- MIGRATION DES PAGES EXISTANTES
-- ===========================================

-- Migrer les pages principales
SELECT migrate_page_to_dynamic('index');
SELECT migrate_page_to_dynamic('about');
SELECT migrate_page_to_dynamic('formations');
SELECT migrate_page_to_dynamic('certifications');
SELECT migrate_page_to_dynamic('contact');

-- ===========================================
-- CRÉATION D'UN SYSTÈME DE SAUVEGARDE
-- ===========================================

-- Table pour sauvegarder les anciennes configurations
CREATE TABLE IF NOT EXISTS component_backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  component_name TEXT NOT NULL,
  backup_data JSONB,
  backup_date TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT
);

-- Fonction pour sauvegarder un composant avant modification
CREATE OR REPLACE FUNCTION backup_component(component_name_param TEXT, reason_param TEXT DEFAULT 'Modification manuelle')
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO component_backups (component_name, backup_data, reason)
  SELECT
    name,
    jsonb_build_object(
      'title', title,
      'subtitle', subtitle,
      'content', content,
      'settings', settings,
      'is_active', is_active,
      'display_order', display_order
    ),
    reason_param
  FROM dynamic_components
  WHERE name = component_name_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- FONCTION DE RESTAURATION
-- ===========================================

CREATE OR REPLACE FUNCTION restore_component(component_name_param TEXT, backup_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  backup_record RECORD;
BEGIN
  -- Trouver la sauvegarde la plus récente si aucun ID spécifié
  IF backup_id IS NULL THEN
    SELECT * INTO backup_record
    FROM component_backups
    WHERE component_name = component_name_param
    ORDER BY backup_date DESC
    LIMIT 1;
  ELSE
    SELECT * INTO backup_record
    FROM component_backups
    WHERE id = backup_id;
  END IF;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Restaurer le composant
  UPDATE dynamic_components
  SET
    title = backup_record.backup_data->>'title',
    subtitle = backup_record.backup_data->>'subtitle',
    content = backup_record.backup_data->'content',
    settings = backup_record.backup_data->'settings',
    is_active = (backup_record.backup_data->>'is_active')::boolean,
    display_order = (backup_record.backup_data->>'display_order')::integer,
    updated_at = NOW()
  WHERE name = component_name_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- TRIGGER DE SAUVEGARDE AUTOMATIQUE
-- ===========================================

CREATE OR REPLACE FUNCTION auto_backup_component()
RETURNS TRIGGER AS $$
BEGIN
  -- Sauvegarder automatiquement avant modification
  PERFORM backup_component(OLD.name, 'Modification automatique');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux composants dynamiques
DROP TRIGGER IF EXISTS auto_backup_dynamic_components ON dynamic_components;
CREATE TRIGGER auto_backup_dynamic_components
  BEFORE UPDATE ON dynamic_components
  FOR EACH ROW
  EXECUTE FUNCTION auto_backup_component();

-- ===========================================
-- FONCTIONS UTILITAIRES
-- ===========================================

-- Fonction pour lister les sauvegardes d'un composant
CREATE OR REPLACE FUNCTION list_component_backups(component_name_param TEXT)
RETURNS TABLE (
  id UUID,
  backup_date TIMESTAMPTZ,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT cb.id, cb.backup_date, cb.reason
  FROM component_backups cb
  WHERE cb.component_name = component_name_param
  ORDER BY cb.backup_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les anciennes sauvegardes (garde seulement les 10 plus récentes par composant)
CREATE OR REPLACE FUNCTION cleanup_old_backups()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  WITH ranked_backups AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY component_name ORDER BY backup_date DESC) as rn
    FROM component_backups
  )
  DELETE FROM component_backups
  WHERE id IN (
    SELECT id FROM ranked_backups WHERE rn > 10
  );

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- VÉRIFICATION FINALE
-- ===========================================

SELECT
  '✅ Migration automatique configurée' as status,
  (SELECT COUNT(*) FROM dynamic_components WHERE name LIKE 'page-%') as pages_migreees,
  (SELECT COUNT(*) FROM component_backups) as sauvegardes_existantes;

-- ===========================================
-- EXEMPLE D'UTILISATION
-- ===========================================

/*
-- Sauvegarder manuellement un composant
SELECT backup_component('hero-index', 'Sauvegarde avant modification majeure');

-- Restaurer un composant
SELECT restore_component('hero-index');

-- Lister les sauvegardes
SELECT * FROM list_component_backups('hero-index');

-- Nettoyer les anciennes sauvegardes
SELECT cleanup_old_backups();
*/
