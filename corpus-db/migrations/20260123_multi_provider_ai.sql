-- Migration: Multi-Provider AI Support
-- Date: 2026-01-23
-- Description: Add columns to support multiple AI providers (OpenAI, Gemini, Ollama)

-- Update ai_config table to support multiple providers
ALTER TABLE ai_config
ADD COLUMN IF NOT EXISTS openai_api_key TEXT,
ADD COLUMN IF NOT EXISTS openai_model TEXT DEFAULT 'gpt-4o-mini',
ADD COLUMN IF NOT EXISTS default_provider TEXT DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS ollama_endpoint TEXT DEFAULT 'http://localhost:11434',
ADD COLUMN IF NOT EXISTS gemini_model TEXT DEFAULT 'gemini-1.5-flash-latest',
ADD COLUMN IF NOT EXISTS model_version TEXT DEFAULT '1.0';

-- Set default configuration if no row exists
INSERT INTO ai_config (
    id,
    default_provider,
    gemini_model,
    openai_model,
    model_version,
    temperature,
    max_tokens
)
VALUES (
    1,
    'openai',
    'gemini-1.5-flash-latest',
    'gpt-4o-mini',
    '1.0',
    0.3,
    4000
)
ON CONFLICT (id) DO UPDATE SET
    default_provider = COALESCE(ai_config.default_provider, 'openai'),
    gemini_model = COALESCE(ai_config.gemini_model, 'gemini-1.5-flash-latest'),
    openai_model = COALESCE(ai_config.openai_model, 'gpt-4o-mini');

-- Add provider column to ai_requests_log to track which provider was used
ALTER TABLE ai_requests_log
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'gemini';

-- Create index for provider analytics
CREATE INDEX IF NOT EXISTS idx_ai_requests_provider ON ai_requests_log(provider);

COMMENT ON COLUMN ai_config.default_provider IS 'Default AI provider: openai, gemini, or ollama';
COMMENT ON COLUMN ai_config.openai_model IS 'OpenAI model to use (e.g., gpt-4o-mini, gpt-4o)';
COMMENT ON COLUMN ai_config.gemini_model IS 'Gemini model to use (e.g., gemini-1.5-flash-latest)';
COMMENT ON COLUMN ai_config.ollama_endpoint IS 'Ollama server endpoint for local models';
