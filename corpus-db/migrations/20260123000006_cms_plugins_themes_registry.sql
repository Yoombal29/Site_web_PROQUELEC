-- CMS Plugins & Themes Registry Migration

-- 1. CMS Plugins Table
CREATE TABLE IF NOT EXISTS cms_plugins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    version TEXT NOT NULL DEFAULT '1.0.0',
    category TEXT DEFAULT 'general',
    author TEXT DEFAULT 'PROQUELEC',
    icon TEXT,
    settings_schema JSONB DEFAULT '{}'::jsonb, -- JSON Schema for plugin settings
    default_settings JSONB DEFAULT '{}'::jsonb,
    is_active_globally BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CMS Themes Table (BeTheme Style)
CREATE TABLE IF NOT EXISTS cms_themes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    preview_image TEXT,
    category TEXT DEFAULT 'corporate', -- BTP, Engineering, Security, etc.
    design_config JSONB NOT NULL, -- Corresponds to PageDesignOptions
    header_config JSONB DEFAULT '{}'::jsonb,
    footer_config JSONB DEFAULT '{}'::jsonb,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Seed some default Plugins
INSERT INTO cms_plugins (name, display_name, description, category, icon)
VALUES 
('seo-pro', 'SEO Pro Advanced', 'Analyseur de mots-clés et optimisation sémantique en temps-réel.', 'seo', 'Search'),
('stats-live', 'Statistiques Live', 'Tableau de bord analytics intégré directement dans l''éditeur.', 'analytics', 'BarChart3'),
('payment-africa', 'Paiement Afrique', 'Passerelle de paiement Orange Money, Wave, Paydunya.', 'ecommerce', 'DollarSign'),
('form-builder', 'FormBuilder Advanced', 'Créateur de formulaires complexes par drag & drop.', 'tools', 'Layout')
ON CONFLICT (name) DO NOTHING;

-- 4. Seed some default Themes (BeTheme Style)
INSERT INTO cms_themes (name, display_name, description, category, design_config)
VALUES 
('btp-modern', 'BTP Modern Excellence', 'Design épuré et professionnel pour les entreprises de construction.', 'construction', '{
    "layout": "default",
    "hero_enabled": true,
    "hero_height": "medium",
    "hero_overlay": 0.3,
    "hero_alignment": "left",
    "content_width": "default",
    "sidebar_enabled": false,
    "background_color": "#f8f9fa",
    "accent_color": "#ff6b00",
    "text_color": "#212529",
    "heading_font": "Outfit",
    "body_font": "Inter"
}'),
('security-pro', 'Sécurité & Protection', 'Thème sombre et robuste pour les services de sécurité électrique.', 'security', '{
    "layout": "full-width",
    "hero_enabled": true,
    "hero_height": "large",
    "hero_overlay": 0.5,
    "hero_alignment": "center",
    "content_width": "wide",
    "sidebar_enabled": true,
    "sidebar_position": "right",
    "background_color": "#0a0a0a",
    "accent_color": "#e63946",
    "text_color": "#f1faee",
    "heading_font": "Roboto",
    "body_font": "Open Sans"
}')
ON CONFLICT (name) DO NOTHING;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_cms_plugins_category ON cms_plugins(category);
CREATE INDEX IF NOT EXISTS idx_cms_themes_category ON cms_themes(category);
