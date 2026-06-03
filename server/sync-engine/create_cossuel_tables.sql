-- Script minimal pour créer les tables COSSUEL utilisées par le sync-engine
-- Exécuter avec psql en pointant vers la base (ex: psql "postgresql://user@127.0.0.1:5437/proquelec" -f create_cossuel_tables.sql)

BEGIN;

-- Table des dossiers synchronisés
CREATE TABLE IF NOT EXISTS public.cossuel_dossiers (
  id TEXT PRIMARY KEY,
  region TEXT,
  status TEXT,
  installation_type TEXT,
  submission_date DATE,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des logs de synchronisation
CREATE TABLE IF NOT EXISTS public.cossuel_sync_logs (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  records_processed INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  details TEXT
);

-- Table des stats journalières
CREATE TABLE IF NOT EXISTS public.cossuel_stats_daily (
  date DATE PRIMARY KEY,
  total_dossiers INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMIT;
