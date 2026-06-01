-- ========================================================
-- PROQUELEC BUILDER : RUNTIME PERSISTENCE LAYER
-- ========================================================
-- Ajoute la couche de persistance native pour les 15+
-- engines du runtime builder (History, Data, Plugins,
-- Templates, Exports, Collaboration, etc.)
-- ========================================================

-- ========================================================
-- 1. ENRICHISSEMENT DE LA TABLE PAGES
-- ========================================================
-- Le builder devient multi-engine : chaque page porte
-- l'état déclaratif complet de tous les sous-systèmes.
-- ========================================================

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS layout_tree JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bindings JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS animation_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS published_snapshot_id UUID;

COMMENT ON COLUMN public.pages.layout_tree IS 'Arbre de layout computed (position, taille, zIndex) produit par le Layout Engine';
COMMENT ON COLUMN public.pages.theme_config IS 'Surcharges de design tokens pour la page (primary.500, spacing.xl, etc.)';
COMMENT ON COLUMN public.pages.bindings IS 'Configuration des data bindings {{path}} par node_id';
COMMENT ON COLUMN public.pages.animation_config IS 'Configuration des animations (presets, déclencheurs, stagger)';
COMMENT ON COLUMN public.pages.published_snapshot_id IS 'Référence au snapshot publié (pour rollback rapide)';

-- ========================================================
-- 2. BUILDER SNAPSHOTS (History Engine persistence)
-- ========================================================
-- Persiste la timeline d'historique du builder.
-- Débloque : timeline persistante, restore serveur,
-- version compare, collaboration.
-- ========================================================

CREATE TABLE IF NOT EXISTS public.builder_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    snapshot JSONB NOT NULL,
    snapshot_type VARCHAR(50) NOT NULL DEFAULT 'manual',
    metadata JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builder_snapshots_page_id ON public.builder_snapshots(page_id);
CREATE INDEX IF NOT EXISTS idx_builder_snapshots_type ON public.builder_snapshots(snapshot_type);
CREATE INDEX IF NOT EXISTS idx_builder_snapshots_created_at ON public.builder_snapshots(created_at DESC);

COMMENT ON TABLE public.builder_snapshots IS 'Snapshots de l''état complet du builder pour le History Engine';
COMMENT ON COLUMN public.builder_snapshots.snapshot_type IS 'Type: manual, auto, publish, ai_generated, collaboration_merge';
COMMENT ON COLUMN public.builder_snapshots.metadata IS 'Métadonnées : version engine, plugins actifs, durée d''édition';

-- ========================================================
-- 3. BUILDER TEMPLATES (AI & presets)
-- ========================================================
-- Templates réutilisables pour la génération AI,
-- les landing pages, dashboards, presets.
-- ========================================================

CREATE TABLE IF NOT EXISTS public.builder_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    preview_image TEXT,
    blocks JSONB NOT NULL DEFAULT '[]',
    layout_tree JSONB DEFAULT '[]',
    theme_config JSONB DEFAULT '{}',
    animation_config JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_system BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builder_templates_category ON public.builder_templates(category);
CREATE INDEX IF NOT EXISTS idx_builder_templates_tags ON public.builder_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_builder_templates_blocks ON public.builder_templates USING GIN(blocks jsonb_path_ops);

COMMENT ON TABLE public.builder_templates IS 'Templates de pages/blocs pour l''AI Generator et les presets';
COMMENT ON COLUMN public.builder_templates.is_system IS 'Template système (non modifiable) ou utilisateur';

-- Seed des templates système par défaut
INSERT INTO public.builder_templates (name, category, description, blocks, tags, is_system) VALUES
(
    'Hero – PROQUELEC',
    'hero',
    'Section hero standard avec titre, sous-titre et CTA',
    '[{"id":"hero-1","type":"Hero","props":{"title":"Sécurité & Qualité","subtitle":"Expertise en conformité électrique","ctaText":"Découvrir","ctaLink":"/services","backgroundImage":"","overlay":true},"children":[]}]',
    ARRAY['hero', 'accueil', 'landing'],
    true
),
(
    'Dashboard – Observatoire',
    'dashboard',
    'Tableau de bord avec stats et graphiques',
    '[{"id":"dash-1","type":"Stats","props":{"columns":3,"stat1":"1 200+","label1":"Inspections","stat2":"98%","label2":"Conformité","stat3":"50","label3":"Experts"},"children":[]},{"id":"dash-2","type":"Grid","props":{"columns":2,"gap":"lg"},"children":[{"id":"dash-2-1","type":"Card","props":{"title":"Dossiers récents","variant":"elevated"},"children":[]},{"id":"dash-2-2","type":"Card","props":{"title":"Alertes","variant":"outlined"},"children":[]}]}]',
    ARRAY['dashboard', 'observatoire', 'stats'],
    true
),
(
    'Page Contact',
    'landing',
    'Page contact avec formulaire et carte',
    '[{"id":"contact-1","type":"Columns","props":{"columns":2,"gap":"xl"},"children":[{"id":"contact-1-1","type":"Form","props":{"fields":[{"type":"text","label":"Nom","required":true},{"type":"email","label":"Email","required":true},{"type":"textarea","label":"Message","required":true}],"submitLabel":"Envoyer","style":{"padding":"lg"}},"children":[]},{"id":"contact-1-2","type":"Card","props":{"title":"Nos coordonnées","variant":"flat"},"children":[]}]}]',
    ARRAY['contact', 'formulaire', 'landing'],
    true
)
ON CONFLICT DO NOTHING;

-- ========================================================
-- 4. BUILDER COMPONENTS (blocs réutilisables)
-- ========================================================
-- Sections et blocs réutilisables, créés par l'utilisateur.
-- Complète la table system page_components existante.
-- ========================================================

CREATE TABLE IF NOT EXISTS public.builder_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'custom',
    schema JSONB NOT NULL DEFAULT '[]',
    preview_image TEXT,
    version INTEGER DEFAULT 1,
    is_global BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builder_components_category ON public.builder_components(category);
CREATE INDEX IF NOT EXISTS idx_builder_components_global ON public.builder_components(is_global);
CREATE INDEX IF NOT EXISTS idx_builder_components_tags ON public.builder_components USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_builder_components_schema ON public.builder_components USING GIN(schema jsonb_path_ops);

COMMENT ON TABLE public.builder_components IS 'Composants/blocs réutilisables créés par les utilisateurs (user saved blocks)';
COMMENT ON COLUMN public.builder_components.is_global IS 'Accessible à tous les utilisateurs (admin only)';

-- ========================================================
-- 5. BUILDER BINDINGS (Data Engine persistence)
-- ========================================================
-- Persistance déclarative des data bindings.
-- Chaque binding lie un node_id du builder à une source
-- de données (API, query SQL, contexte, store).
-- ========================================================

CREATE TABLE IF NOT EXISTS public.builder_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    node_id VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_config JSONB NOT NULL DEFAULT '{}',
    mapping JSONB DEFAULT '{}',
    refresh_interval INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builder_bindings_page_id ON public.builder_bindings(page_id);
CREATE INDEX IF NOT EXISTS idx_builder_bindings_node_id ON public.builder_bindings(page_id, node_id);
CREATE INDEX IF NOT EXISTS idx_builder_bindings_source_type ON public.builder_bindings(source_type);
CREATE INDEX IF NOT EXISTS idx_builder_bindings_config ON public.builder_bindings USING GIN(source_config jsonb_path_ops);

COMMENT ON TABLE public.builder_bindings IS 'Liaisons entre nodes du builder et sources de données (API, query, static, context)';
COMMENT ON COLUMN public.builder_bindings.source_type IS 'Type: api, query, static, context, store';
COMMENT ON COLUMN public.builder_bindings.source_config IS 'Configuration : URL, params, query SQL, chemin store';
COMMENT ON COLUMN public.builder_bindings.mapping IS 'Transformation des données avant injection dans le bloc';
COMMENT ON COLUMN public.builder_bindings.refresh_interval IS 'Intervalle de rafraîchissement en secondes (0 = pas de refresh)';

-- ========================================================
-- 6. BUILDER PLUGINS (Plugin System persistence)
-- ========================================================
-- Configuration persistante des plugins du builder :
-- activation, paramètres, ordre de chargement.
-- ========================================================

CREATE TABLE IF NOT EXISTS public.builder_plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0.0',
    enabled BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}',
    dependencies TEXT[] DEFAULT '{}',
    load_order INTEGER DEFAULT 0,
    author VARCHAR(255),
    homepage TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builder_plugins_enabled ON public.builder_plugins(enabled);
CREATE INDEX IF NOT EXISTS idx_builder_plugins_order ON public.builder_plugins(load_order);

COMMENT ON TABLE public.builder_plugins IS 'Plugins du builder : activation, configuration, dépendances';
COMMENT ON COLUMN public.builder_plugins.config IS 'Configuration JSON du plugin (events, commands, panels)';
COMMENT ON COLUMN public.builder_plugins.dependencies IS 'Noms des plugins dont celui-ci dépend';

-- ========================================================
-- 7. BUILDER EXPORTS (Export Engine history)
-- ========================================================
-- Historique des exports générés : React TSX, HTML,
-- JSON, PDF. Utile pour le cache, le publishing pipeline,
-- et l'audit.
-- ========================================================

CREATE TABLE IF NOT EXISTS public.builder_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    snapshot_id UUID REFERENCES public.builder_snapshots(id) ON DELETE SET NULL,
    format VARCHAR(20) NOT NULL,
    output_path TEXT,
    output_size INTEGER,
    content_hash TEXT,
    metadata JSONB DEFAULT '{}',
    generated_by UUID,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builder_exports_page_id ON public.builder_exports(page_id);
CREATE INDEX IF NOT EXISTS idx_builder_exports_format ON public.builder_exports(format);
CREATE INDEX IF NOT EXISTS idx_builder_exports_generated_at ON public.builder_exports(generated_at DESC);

COMMENT ON TABLE public.builder_exports IS 'Historique des exports générés par le Export Engine';
COMMENT ON COLUMN public.builder_exports.format IS 'Format: react, html, json, pdf';
COMMENT ON COLUMN public.builder_exports.content_hash IS 'SHA256 du contenu exporté (pour cache/déduplication)';
COMMENT ON COLUMN public.builder_exports.metadata IS 'Options d''export, engine version, durée de génération';

-- ========================================================
-- 8. BUILDER COLLABORATION (Yjs persistence)
-- ========================================================
-- Persistance de l'état CRDT Yjs pour la collaboration
-- temps réel. Permet la reprise de session et l'historique
-- de collaboration.
-- ========================================================

CREATE TABLE IF NOT EXISTS public.builder_collaboration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE UNIQUE,
    ydoc_state BYTEA,
    awareness JSONB DEFAULT '{}',
    last_synced_at TIMESTAMPTZ,
    connected_peers INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builder_collaboration_page_id ON public.builder_collaboration(page_id);
CREATE INDEX IF NOT EXISTS idx_builder_collaboration_synced ON public.builder_collaboration(last_synced_at);

COMMENT ON TABLE public.builder_collaboration IS 'État CRDT Yjs persistant pour la collaboration temps réel';
COMMENT ON COLUMN public.builder_collaboration.ydoc_state IS 'Snapshot binaire Yjs (état CRDT complet)';
COMMENT ON COLUMN public.builder_collaboration.awareness IS 'Métadonnées de présence : curseurs, sélections, utilisateurs connectés';

-- ========================================================
-- 9. GIN INDEXES POUR PERFORMANCE JSONB
-- ========================================================

CREATE INDEX IF NOT EXISTS idx_pages_content_blocks ON public.pages USING GIN(content_blocks jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_pages_layout_tree ON public.pages USING GIN(layout_tree jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_pages_bindings ON public.pages USING GIN(bindings jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_pages_theme_config ON public.pages USING GIN(theme_config jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_pages_animation_config ON public.pages USING GIN(animation_config jsonb_path_ops);

-- ========================================================
-- 10. TRIGGERS : MISE À JOUR AUTOMATIQUE
-- ========================================================

CREATE OR REPLACE FUNCTION update_builder_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_builder_templates_updated_at ON public.builder_templates;
CREATE TRIGGER trg_builder_templates_updated_at
    BEFORE UPDATE ON public.builder_templates
    FOR EACH ROW EXECUTE FUNCTION update_builder_updated_at();

DROP TRIGGER IF EXISTS trg_builder_components_updated_at ON public.builder_components;
CREATE TRIGGER trg_builder_components_updated_at
    BEFORE UPDATE ON public.builder_components
    FOR EACH ROW EXECUTE FUNCTION update_builder_updated_at();

DROP TRIGGER IF EXISTS trg_builder_bindings_updated_at ON public.builder_bindings;
CREATE TRIGGER trg_builder_bindings_updated_at
    BEFORE UPDATE ON public.builder_bindings
    FOR EACH ROW EXECUTE FUNCTION update_builder_updated_at();

DROP TRIGGER IF EXISTS trg_builder_plugins_updated_at ON public.builder_plugins;
CREATE TRIGGER trg_builder_plugins_updated_at
    BEFORE UPDATE ON public.builder_plugins
    FOR EACH ROW EXECUTE FUNCTION update_builder_updated_at();

DROP TRIGGER IF EXISTS trg_builder_collaboration_updated_at ON public.builder_collaboration;
CREATE TRIGGER trg_builder_collaboration_updated_at
    BEFORE UPDATE ON public.builder_collaboration
    FOR EACH ROW EXECUTE FUNCTION update_builder_updated_at();

-- ========================================================
-- 11. VALIDATION : VÉRIFICATION DES INDEX
-- ========================================================
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('builder_snapshots', 'builder_templates', 'builder_components', 'builder_bindings', 'builder_plugins', 'builder_exports', 'builder_collaboration');

    RAISE NOTICE '✅ Builder persistence: %/7 tables created', table_count;

    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname LIKE 'idx_builder_%';

    RAISE NOTICE '✅ Builder persistence: % indexes created', index_count;
END $$;
