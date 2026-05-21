-- Script SQL complet et robuste pour créer la table pages dans 
-- Version améliorée avec validations et sécurité renforcée
-- À exécuter dans le SQL Editor de  (https://.com/dashboard/project/yyuhwuaqsbhwtiotyauu/sql)

-- ===========================================
-- PRÉPARATION : Supprimer les dépendances existantes
-- ===========================================

-- Supprimer les triggers existants
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Public can read published pages" ON pages;
DROP POLICY IF EXISTS "Authenticated users can manage all pages" ON pages;

-- Supprimer les indexes existants
DROP INDEX IF EXISTS idx_pages_slug;
DROP INDEX IF EXISTS idx_pages_is_published;
DROP INDEX IF EXISTS idx_pages_menu_order;
DROP INDEX IF EXISTS idx_pages_parent_id;
DROP INDEX IF EXISTS idx_pages_created_at;
DROP INDEX IF EXISTS idx_pages_updated_at;

-- Supprimer la table si elle existe
DROP TABLE IF EXISTS pages CASCADE;

-- ===========================================
-- CRÉATION DE LA TABLE PAGES
-- ===========================================

CREATE TABLE pages (
  -- Identifiant unique
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contenu principal
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  slug TEXT NOT NULL UNIQUE CHECK (length(trim(slug)) > 0 AND slug ~ '^[a-z0-9-]+$'),
  content TEXT,

  -- Métadonnées SEO
  meta_description TEXT CHECK (length(meta_description) <= 160),
  meta_keywords TEXT,
  meta_robots TEXT DEFAULT 'index,follow' CHECK (meta_robots IN ('index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow')),

  -- Médias
  featured_image TEXT,

  -- Template et affichage
  template TEXT DEFAULT 'default' CHECK (template IN ('default', 'full-width', 'sidebar-left', 'sidebar-right', 'landing')),
  show_hero BOOLEAN DEFAULT true,
  show_footer BOOLEAN DEFAULT true,

  -- Personnalisation
  custom_css TEXT,
  custom_js TEXT,
  header_html TEXT,
  footer_html TEXT,

  -- Section hero
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_background_image TEXT,
  hero_cta_text TEXT,
  hero_cta_link TEXT,

  -- Statut et publication
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMPTZ,
  unpublish_date TIMESTAMPTZ CHECK (unpublish_date IS NULL OR unpublish_date > publish_date),

  -- Organisation
  menu_order INTEGER DEFAULT 0 CHECK (menu_order >= 0),
  parent_id UUID REFERENCES pages(id) ON DELETE SET NULL,

  -- Taxonomies
  categories TEXT[] DEFAULT '{}' CHECK (array_length(categories, 1) <= 10),
  tags TEXT[] DEFAULT '{}' CHECK (array_length(tags, 1) <= 20),

  -- Métadonnées
  author TEXT,
  reading_time INTEGER DEFAULT 0 CHECK (reading_time >= 0),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- ===========================================
  -- CHAMPS PRÉPARATOIRES POUR FONCTIONNALITÉS FUTURES
  -- ===========================================

  -- Workflow et approbation (futur)
  workflow_status TEXT DEFAULT 'draft' CHECK (workflow_status IN ('draft', 'review', 'approved', 'published', 'archived')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  -- Versioning avancé (futur)
  version_number INTEGER DEFAULT 1 CHECK (version_number > 0),
  is_latest_version BOOLEAN DEFAULT true,

  -- Multilingue (futur)
  language_code TEXT DEFAULT 'fr' CHECK (length(language_code) = 2),
  translations JSONB DEFAULT '{}',

  -- Analytics et tracking (futur)
  view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
  unique_views INTEGER DEFAULT 0 CHECK (unique_views >= 0),
  conversion_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (conversion_rate >= 0 AND conversion_rate <= 100),
  last_viewed_at TIMESTAMPTZ,

  -- A/B Testing (futur)
  is_ab_test_variant BOOLEAN DEFAULT false,
  ab_test_group TEXT,
  ab_test_weight DECIMAL(3,2) DEFAULT 1.00 CHECK (ab_test_weight > 0 AND ab_test_weight <= 1),

  -- Planification avancée (futur)
  publish_schedule JSONB DEFAULT '{}', -- Pour publication récurrente
  unpublish_schedule JSONB DEFAULT '{}',

  -- Intégrations (futur)
  webhook_urls TEXT[] DEFAULT '{}',
  external_id TEXT, -- Pour synchronisation avec autres systèmes
  api_metadata JSONB DEFAULT '{}',

  -- Performance et cache (futur)
  cache_ttl INTEGER DEFAULT 3600 CHECK (cache_ttl >= 0), -- TTL en secondes
  is_cached BOOLEAN DEFAULT false,
  last_cached_at TIMESTAMPTZ,

  -- Audit et sécurité (futur)
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  revision_history JSONB DEFAULT '[]', -- Historique des modifications
  security_level TEXT DEFAULT 'public' CHECK (security_level IN ('public', 'authenticated', 'admin')),

  -- Médias avancés (futur)
  media_gallery JSONB DEFAULT '[]', -- Galerie d'images/vidéos
  featured_video TEXT,
  attachments JSONB DEFAULT '[]',

  -- Métriques avancées (futur)
  engagement_score DECIMAL(3,2) DEFAULT 0.00 CHECK (engagement_score >= 0 AND engagement_score <= 5),
  seo_score DECIMAL(3,2) DEFAULT 0.00 CHECK (seo_score >= 0 AND seo_score <= 100),
  performance_score DECIMAL(3,2) DEFAULT 0.00 CHECK (performance_score >= 0 AND performance_score <= 100),

  -- Champs personnalisés (futur)
  custom_fields JSONB DEFAULT '{}',
  custom_settings JSONB DEFAULT '{}',

  -- Géolocalisation (futur)
  geo_targeting JSONB DEFAULT '{}', -- Pays, régions cibles

  -- Accessibilité (futur)
  accessibility_score DECIMAL(3,2) DEFAULT 0.00 CHECK (accessibility_score >= 0 AND accessibility_score <= 100),
  alt_texts JSONB DEFAULT '{}', -- Textes alternatifs pour images

  -- Champs réservés pour évolutions futures
  reserved_field_1 TEXT,
  reserved_field_2 TEXT,
  reserved_field_3 JSONB DEFAULT '{}',
  reserved_field_4 JSONB DEFAULT '{}',
  reserved_timestamp_1 TIMESTAMPTZ,
  reserved_timestamp_2 TIMESTAMPTZ,
  reserved_boolean_1 BOOLEAN DEFAULT false,
  reserved_boolean_2 BOOLEAN DEFAULT false,
  reserved_integer_1 INTEGER DEFAULT 0,
  reserved_integer_2 INTEGER DEFAULT 0
);

-- ===========================================
-- INDEXES POUR LES PERFORMANCES
-- ===========================================

-- Index pour les recherches fréquentes
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_is_published ON pages(is_published);
CREATE INDEX idx_pages_menu_order ON pages(menu_order);
CREATE INDEX idx_pages_parent_id ON pages(parent_id);

-- Index pour les tris et filtres
CREATE INDEX idx_pages_created_at ON pages(created_at DESC);
CREATE INDEX idx_pages_updated_at ON pages(updated_at DESC);

-- Index pour les recherches full-text (optionnel mais recommandé)
CREATE INDEX idx_pages_title_content ON pages USING gin(to_tsvector('french', title || ' ' || coalesce(content, '')));

-- ===========================================
-- INDEXES POUR FONCTIONNALITÉS FUTURES
-- ===========================================

-- Workflow et versioning
CREATE INDEX idx_pages_workflow_status ON pages(workflow_status);
CREATE INDEX idx_pages_version_number ON pages(version_number);
CREATE INDEX idx_pages_is_latest_version ON pages(is_latest_version);
CREATE INDEX idx_pages_approved_by ON pages(approved_by);

-- Multilingue
CREATE INDEX idx_pages_language_code ON pages(language_code);

-- Analytics et tracking
CREATE INDEX idx_pages_view_count ON pages(view_count DESC);
CREATE INDEX idx_pages_last_viewed_at ON pages(last_viewed_at DESC);

-- A/B Testing
CREATE INDEX idx_pages_ab_test_group ON pages(ab_test_group) WHERE is_ab_test_variant = true;

-- Sécurité et audit
CREATE INDEX idx_pages_created_by ON pages(created_by);
CREATE INDEX idx_pages_updated_by ON pages(updated_by);
CREATE INDEX idx_pages_security_level ON pages(security_level);

-- Performance
CREATE INDEX idx_pages_cache_ttl ON pages(cache_ttl) WHERE is_cached = true;
CREATE INDEX idx_pages_last_cached_at ON pages(last_cached_at DESC);

-- Métriques
CREATE INDEX idx_pages_engagement_score ON pages(engagement_score DESC);
CREATE INDEX idx_pages_seo_score ON pages(seo_score DESC);
CREATE INDEX idx_pages_performance_score ON pages(performance_score DESC);

-- Géolocalisation (GIN index pour JSONB)
CREATE INDEX idx_pages_geo_targeting ON pages USING gin(geo_targeting);

-- Champs personnalisés (GIN index pour JSONB)
CREATE INDEX idx_pages_custom_fields ON pages USING gin(custom_fields);
CREATE INDEX idx_pages_custom_settings ON pages USING gin(custom_settings);

-- Médias avancés
CREATE INDEX idx_pages_media_gallery ON pages USING gin(media_gallery);
CREATE INDEX idx_pages_attachments ON pages USING gin(attachments);

-- Historique et métadonnées
CREATE INDEX idx_pages_revision_history ON pages USING gin(revision_history);
CREATE INDEX idx_pages_api_metadata ON pages USING gin(api_metadata);

-- ===========================================
-- SÉCURITÉ : ROW LEVEL SECURITY
-- ===========================================

-- Activer RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture publique des pages publiées
CREATE POLICY "Public can read published pages" ON pages
  FOR SELECT
  USING (
    is_published = true
    AND workflow_status IN ('approved', 'published')
    AND security_level = 'public'
    AND (publish_date IS NULL OR publish_date <= NOW())
    AND (unpublish_date IS NULL OR unpublish_date > NOW())
  );

-- Politique pour les utilisateurs authentifiés (contenu protégé)
CREATE POLICY "Authenticated users can read protected content" ON pages
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND security_level IN ('public', 'authenticated')
    AND (
      is_published = true
      OR workflow_status IN ('approved', 'published')
      OR created_by = auth.uid()
    )
  );

-- Politique pour les administrateurs (accès complet)
CREATE POLICY "Admins can manage all pages" ON pages
  FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND (
      auth.jwt() ->> 'role' = 'admin'
      OR created_by = auth.uid()
      OR security_level IN ('public', 'authenticated')
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (
      auth.jwt() ->> 'role' = 'admin'
      OR created_by = auth.uid()
    )
  );

-- Politique pour les relecteurs (workflow)
CREATE POLICY "Reviewers can update workflow status" ON pages
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND workflow_status IN ('draft', 'review')
    AND (
      auth.jwt() ->> 'role' IN ('admin', 'reviewer')
      OR approved_by = auth.uid()
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (
      auth.jwt() ->> 'role' IN ('admin', 'reviewer')
      OR approved_by = auth.uid()
    )
  );

-- ===========================================
-- TRIGGERS ET FONCTIONS
-- ===========================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer automatiquement le slug depuis le titre
CREATE OR REPLACE FUNCTION generate_page_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Générer un slug basique depuis le titre
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'));
    NEW.slug := regexp_replace(NEW.slug, '\s+', '-', 'g');
    NEW.slug := trim(NEW.slug, '-');

    -- Éviter les slugs vides
    IF NEW.slug = '' THEN
      NEW.slug := 'page-' || NEW.id;
    END IF;
  END IF;

  -- Définir created_by si c'est un nouvel enregistrement
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = auth.uid();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer le slug automatiquement
CREATE TRIGGER generate_page_slug_trigger
  BEFORE INSERT ON pages
  FOR EACH ROW
  EXECUTE FUNCTION generate_page_slug();

-- ===========================================
-- FONCTIONS POUR FONCTIONNALITÉS FUTURES
-- ===========================================

-- Fonction pour calculer le score SEO automatiquement
CREATE OR REPLACE FUNCTION calculate_seo_score(page_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  score DECIMAL(3,2) := 0.00;
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

  IF array_length(page_record.categories, 1) > 0 THEN
    score := score + 5;
  END IF;

  IF array_length(page_record.tags, 1) > 0 THEN
    score := score + 5;
  END IF;

  RETURN LEAST(score, 100.00);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les métriques automatiquement
CREATE OR REPLACE FUNCTION update_page_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculer le temps de lecture estimé (mots / 200)
  IF NEW.content IS NOT NULL THEN
    NEW.reading_time := GREATEST(1, ROUND(length(regexp_replace(NEW.content, '<[^>]*>', '', 'g')) / 200.0));
  END IF;

  -- Calculer le score SEO
  NEW.seo_score := calculate_seo_score(NEW.id);

  -- Mettre à jour la version
  IF TG_OP = 'UPDATE' THEN
    NEW.version_number := OLD.version_number + 1;
    -- Marquer l'ancienne version comme non-latest
    UPDATE pages SET is_latest_version = false WHERE id = OLD.id AND is_latest_version = true;
    NEW.is_latest_version = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour les métriques
CREATE TRIGGER update_page_metrics_trigger
  BEFORE INSERT OR UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_page_metrics();

-- Fonction pour archiver automatiquement les anciennes versions
CREATE OR REPLACE FUNCTION archive_old_versions()
RETURNS TRIGGER AS $$
BEGIN
  -- Archiver les versions de plus de 30 jours
  UPDATE pages
  SET workflow_status = 'archived'
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND is_latest_version = false
    AND workflow_status != 'archived';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour archiver automatiquement (tous les jours à minuit)
CREATE OR REPLACE FUNCTION setup_archive_schedule()
RETURNS void AS $$
BEGIN
  -- Cette fonction peut être appelée par un cron job externe
  -- ou un Edge Function de 
  NULL;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ===========================================

-- Insérer une page d'exemple si la table est vide
INSERT INTO pages (
  title,
  slug,
  content,
  meta_description,
  meta_keywords,
  is_published,
  author,
  reading_time,
  categories,
  tags,
  workflow_status,
  language_code,
  custom_fields,
  media_gallery,
  geo_targeting,
  security_level
) VALUES (
  'Bienvenue sur PROQUELEC',
  'bienvenue',
  '<h1>Bienvenue sur le site de PROQUELEC</h1><p>Contenu de la page d''accueil...</p>',
  'Page d''accueil du site PROQUELEC - Solutions électriques professionnelles',
  'électricité, installation, dépannage, professionnel',
  true,
  'Admin',
  2,
  ARRAY['accueil', 'entreprise'],
  ARRAY['bienvenue', 'proquelec', 'électricité'],
  'published',
  'fr',
  '{"contact_email": "contact@proquelec.fr", "phone": "01 23 45 67 89"}',
  '[{"url": "/images/hero-proquelec.jpg", "alt": "Équipe PROQUELEC", "type": "image"}]',
  '{"countries": ["FR", "BE", "LU"], "regions": ["ile-de-france", "hauts-de-france"]}',
  'public'
) ON CONFLICT (slug) DO NOTHING;

-- Page exemple avec workflow
INSERT INTO pages (
  title,
  slug,
  content,
  is_published,
  workflow_status,
  categories,
  tags,
  security_level
) VALUES (
  'Services Électriques Professionnels',
  'services-electriques',
  '<h1>Nos Services</h1><p>Description détaillée de nos services...</p>',
  false,
  'review',
  ARRAY['services'],
  ARRAY['électricité', 'installation', 'dépannage'],
  'public'
) ON CONFLICT (slug) DO NOTHING;

-- Page exemple multilingue (futur)
INSERT INTO pages (
  title,
  slug,
  content,
  language_code,
  translations,
  is_published,
  workflow_status
) VALUES (
  'About PROQUELEC',
  'about-proquelec',
  '<h1>About Us</h1><p>English version of about page...</p>',
  'en',
  '{"fr": {"title": "À propos de PROQUELEC", "content": "<h1>À propos</h1><p>Version française...</p>"}}',
  true,
  'published'
) ON CONFLICT (slug) DO NOTHING;

-- ===========================================
-- VUES ET FONCTIONS UTILITAIRES (FUTUR)
-- ===========================================

-- Vue pour les pages publiées avec métriques
CREATE OR REPLACE VIEW published_pages_with_metrics AS
SELECT
  id,
  title,
  slug,
  meta_description,
  view_count,
  unique_views,
  engagement_score,
  seo_score,
  performance_score,
  last_viewed_at,
  created_at,
  updated_at
FROM pages
WHERE is_published = true
  AND workflow_status = 'published'
  AND security_level = 'public'
  AND (publish_date IS NULL OR publish_date <= NOW())
  AND (unpublish_date IS NULL OR unpublish_date > NOW());

-- Vue pour le workflow d'approbation
CREATE OR REPLACE VIEW pages_pending_review AS
SELECT
  id,
  title,
  slug,
  author,
  workflow_status,
  created_at,
  updated_at,
  created_by,
  updated_by
FROM pages
WHERE workflow_status = 'review'
ORDER BY updated_at DESC;

-- Vue pour les statistiques générales
CREATE OR REPLACE VIEW pages_statistics AS
SELECT
  COUNT(*) as total_pages,
  COUNT(CASE WHEN is_published THEN 1 END) as published_pages,
  COUNT(CASE WHEN workflow_status = 'draft' THEN 1 END) as draft_pages,
  COUNT(CASE WHEN workflow_status = 'review' THEN 1 END) as review_pages,
  COUNT(CASE WHEN workflow_status = 'archived' THEN 1 END) as archived_pages,
  AVG(seo_score) as avg_seo_score,
  AVG(engagement_score) as avg_engagement_score,
  SUM(view_count) as total_views,
  SUM(unique_views) as total_unique_views
FROM pages;

-- Fonction pour obtenir les pages similaires (recommandation)
CREATE OR REPLACE FUNCTION get_similar_pages(target_page_id UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  similarity_score DECIMAL(3,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.slug,
    (
      -- Calcul de similarité basé sur les catégories et tags communs
      CASE
        WHEN array_length(p.categories, 1) > 0 AND array_length(tp.categories, 1) > 0
        THEN (
          SELECT COUNT(*)::DECIMAL /
                 GREATEST(array_length(p.categories, 1), array_length(tp.categories, 1))
          FROM unnest(p.categories) AS pc
          WHERE pc = ANY(tp.categories)
        )
        ELSE 0
      END +
      CASE
        WHEN array_length(p.tags, 1) > 0 AND array_length(tp.tags, 1) > 0
        THEN (
          SELECT COUNT(*)::DECIMAL /
                 GREATEST(array_length(p.tags, 1), array_length(tp.tags, 1))
          FROM unnest(p.tags) AS pt
          WHERE pt = ANY(tp.tags)
        )
        ELSE 0
      END
    ) / 2 as similarity_score
  FROM pages p
  CROSS JOIN (SELECT categories, tags FROM pages WHERE id = target_page_id) tp
  WHERE p.id != target_page_id
    AND p.is_published = true
    AND p.workflow_status = 'published'
  ORDER BY similarity_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- VÉRIFICATION ET STATUT
-- ===========================================

-- Vérifier que la table a été créée correctement
DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'pages';

  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename = 'pages' AND schemaname = 'public';

  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'pages' AND schemaname = 'public';

  IF table_count > 0 THEN
    RAISE NOTICE '✅ Table pages créée avec succès !';
    RAISE NOTICE '📊 Indexes créés: %', index_count;
    RAISE NOTICE '🔒 Politiques RLS: %', policy_count;
  ELSE
    RAISE EXCEPTION '❌ Erreur : la table pages n''a pas été créée';
  END IF;
END $$;

-- Afficher le résumé final
SELECT
  '🎉 Table pages créée avec succès - Prête pour le futur !' as status,
  COUNT(*) as total_pages,
  COUNT(CASE WHEN is_published THEN 1 END) as pages_publiees,
  ROUND(AVG(seo_score), 2) as score_seo_moyen,
  ROUND(AVG(engagement_score), 2) as score_engagement_moyen
FROM pages;