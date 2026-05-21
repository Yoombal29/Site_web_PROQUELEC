-- 1. Table des Dossiers Synchronisés
CREATE TABLE IF NOT EXISTS public.cossuel_dossiers (
    id TEXT PRIMARY KEY, -- ID COSSUEL original
    reference_proquelec TEXT,
    client_name TEXT,
    region TEXT,
    departement TEXT,
    ville TEXT,
    address TEXT,
    installation_type TEXT, -- Residentiel, Tertiaire, Industriel
    power_subscribed TEXT,
    status TEXT, -- SOUMIS, A_PROGRAMMER, INSPECTE, VALIDE, REJETE, CONFORME, NON_CONFORME
    submission_date TIMESTAMP WITH TIME ZONE,
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour la recherche et les stats
CREATE INDEX IF NOT EXISTS idx_cossuel_region ON public.cossuel_dossiers(region);
CREATE INDEX IF NOT EXISTS idx_cossuel_status ON public.cossuel_dossiers(status);
CREATE INDEX IF NOT EXISTS idx_cossuel_date ON public.cossuel_dossiers(submission_date);

-- 2. Table des Inspections Synchronisées
CREATE TABLE IF NOT EXISTS public.cossuel_inspections (
    id TEXT PRIMARY KEY, -- ID Inspection COSSUEL
    dossier_id TEXT REFERENCES public.cossuel_dossiers(id) ON DELETE CASCADE,
    inspector_name TEXT,
    inspection_date TIMESTAMP WITH TIME ZONE,
    result TEXT, -- CONFORME / NON_CONFORME
    critical_defects_count INTEGER DEFAULT 0,
    defects_details JSONB DEFAULT '[]', -- Liste des anomalies
    report_url TEXT, -- Lien vers le PDF sur COSSUEL
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des Statistiques Journalières (Data Mart pour Dashboard Rapide)
CREATE TABLE IF NOT EXISTS public.cossuel_stats_daily (
    date DATE PRIMARY KEY,
    total_dossiers INTEGER DEFAULT 0,
    total_inspections INTEGER DEFAULT 0,
    compliant_count INTEGER DEFAULT 0,
    non_compliant_count INTEGER DEFAULT 0,
    regions_breakdown JSONB DEFAULT '{}', -- { "Dakar": 10, "Thies": 5 ... }
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Logs de Synchronisation (Audit Trail)
CREATE TABLE IF NOT EXISTS public.cossuel_sync_logs (
    id SERIAL PRIMARY KEY,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    status TEXT, -- SUCCESS, ERROR, WARNING
    records_processed INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    details TEXT
);

-- Vue Analytique pour le Ministère (Simplifiée)
CREATE OR REPLACE VIEW public.view_ministere_stats AS
SELECT 
    d.region,
    COUNT(*) as total_dossiers,
    SUM(CASE WHEN d.status = 'CONFORME' THEN 1 ELSE 0 END) as conformes,
    SUM(CASE WHEN d.status = 'NON_CONFORME' THEN 1 ELSE 0 END) as non_conformes,
    ROUND(
        (SUM(CASE WHEN d.status = 'CONFORME' THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
        2
    ) as taux_conformite
FROM public.cossuel_dossiers d
GROUP BY d.region;

-- Permissions RBAC : Ministère (Lecture Seule)
-- Note: Le rôle 'ministere' doit être créé via l'interface Admin ou un autre script de migration si nécessaire.
-- INSERT INTO public.permissions (name, category, description) VALUES ('view_ministere_dashboard', 'observatory', 'Accès au tableau de bord ministère') ON CONFLICT DO NOTHING;
