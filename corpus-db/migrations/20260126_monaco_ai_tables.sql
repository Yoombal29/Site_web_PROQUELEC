-- Tables pour Monaco + AI Assistant
-- Phase 1 : Core

-- Table de configuration AI (mode local vs externe)
CREATE TABLE IF NOT EXISTS ai_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text CHECK (mode IN ('local', 'external')) DEFAULT 'external',
  external_provider text CHECK (external_provider IN ('gemini', 'openai', 'anthropic')) DEFAULT 'gemini',
  external_api_key text,
  local_model_path text,
  vector_db_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Initialisation avec mode externe (Gemini)
INSERT INTO ai_config (mode, external_provider) 
VALUES ('external', 'gemini')
ON CONFLICT DO NOTHING;

-- Table de log des requêtes AI (rate limiting + audit)
CREATE TABLE IF NOT EXISTS ai_requests_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  page_id uuid REFERENCES pages(id),
  prompt text NOT NULL,
  generated_code text,
  ai_mode text,
  ai_provider text,
  created_at timestamptz DEFAULT now()
);

-- Index pour rate limiting (requêtes par utilisateur dans les dernières 60 secondes)
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_time 
ON ai_requests_log(user_id, created_at);

-- Index pour audit par page
CREATE INDEX IF NOT EXISTS idx_ai_requests_page 
ON ai_requests_log(page_id, created_at DESC);

-- Ajouter colonne ai_history dans page_versions (si pas déjà fait)
ALTER TABLE page_versions 
ADD COLUMN IF NOT EXISTS ai_history jsonb DEFAULT '[]'::jsonb;

COMMENT ON TABLE ai_config IS 'Configuration du mode AI (local vs externe)';
COMMENT ON TABLE ai_requests_log IS 'Historique des requêtes AI pour rate limiting et audit';
COMMENT ON COLUMN page_versions.ai_history IS 'Historique des interactions AI pour contexte continu';
