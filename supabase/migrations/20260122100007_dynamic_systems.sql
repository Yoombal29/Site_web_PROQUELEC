-- Table pour les composants dynamiques
CREATE TABLE dynamic_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  component_type TEXT NOT NULL CHECK (component_type IN ('hero', 'newsletter', 'contact', 'gallery', 'testimonial', 'cta', 'feature', 'page')),
  title TEXT,
  subtitle TEXT,
  content JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les configurations de thème
CREATE TABLE theme_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  colors JSONB DEFAULT '{}',
  fonts JSONB DEFAULT '{}',
  spacing JSONB DEFAULT '{}',
  breakpoints JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les formulaires dynamiques
CREATE TABLE dynamic_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  fields JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  submit_action TEXT CHECK (submit_action IN ('email', 'database', 'webhook', 'api')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les intégrations externes
CREATE TABLE external_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('analytics', 'crm', 'payment', 'email', 'social', 'api')),
  provider TEXT,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les workflows
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  steps JSONB DEFAULT '[]',
  triggers JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour les performances
CREATE INDEX idx_dynamic_components_type ON dynamic_components(component_type);
CREATE INDEX idx_dynamic_components_active ON dynamic_components(is_active);
CREATE INDEX idx_theme_configurations_active ON theme_configurations(is_active);
CREATE INDEX idx_dynamic_forms_active ON dynamic_forms(is_active);
CREATE INDEX idx_external_integrations_type ON external_integrations(type);
CREATE INDEX idx_external_integrations_active ON external_integrations(is_active);
CREATE INDEX idx_workflows_active ON workflows(is_active);

-- Politiques RLS
ALTER TABLE dynamic_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Politiques d'accès
CREATE POLICY "Public read active components" ON dynamic_components FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage components" ON dynamic_components FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read active themes" ON theme_configurations FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage themes" ON theme_configurations FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read active forms" ON dynamic_forms FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage forms" ON dynamic_forms FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage integrations" ON external_integrations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage workflows" ON workflows FOR ALL USING (auth.role() = 'authenticated');