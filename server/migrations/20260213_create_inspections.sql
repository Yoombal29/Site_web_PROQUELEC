-- Migration: 20260213_create_inspections.sql
-- Description: Core Inspection Engine for PROQUELEC DIGITAL CORE. 
-- Transforms static PDF reports into dynamic, queryable compliance data.

-- 1. INSPECTION TEMPLATES (Checklists de Base)
-- Ex: "Contrôle Résidentiel Neuf", "Audit Sécurité ERP", "Rénovation Partielle"
CREATE TABLE IF NOT EXISTS public.checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'residentiel', -- residentiel, tertiaire, industriel
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHECKLIST ITEMS (Questions Unitaires)
-- Ex: "Mesure de la prise de terre", "Continuité des masses", "Section des conducteurs"
CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES public.checklists(id) ON DELETE CASCADE,
    
    section TEXT, -- "Mise à la terre", "Tableau de répartition", "Prises de courant"
    question TEXT NOT NULL,
    description TEXT, -- Aide pour l'inspecteur (Cortex tips)
    
    input_type TEXT DEFAULT 'boolean', -- boolean, number, text, photo, select
    reference_norme TEXT, -- "NS 01-001 Art. 5.4.2"
    
    criticality_weight INT DEFAULT 1, -- 1=Mineur, 5=Majeur, 10=Critique
    order_index INT DEFAULT 0
);

-- 3. INSPECTIONS (Le Rapport Réel)
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id), -- Lien Projet Électrique
    inspector_id UUID REFERENCES public.users(id),
    
    checklist_id UUID REFERENCES public.checklists(id),
    
    status TEXT DEFAULT 'draft', -- draft, submitted, validated, rejected
    inspection_date TIMESTAMPTZ DEFAULT NOW(),
    
    overall_score INT, -- Calculé (0-100)
    risk_level TEXT, -- low, medium, high, critical
    
    location_gps JSONB, -- { lat, lng }
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INSPECTION RESULTS (Réponses Unitaires)
CREATE TABLE IF NOT EXISTS public.inspection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE,
    checklist_item_id UUID REFERENCES public.checklist_items(id),
    
    value JSONB, -- { "answer": true/false, "measure": "45.2", "unit": "Ohm" }
    is_compliant BOOLEAN,
    
    images JSONB DEFAULT '[]', -- Liste URL photos preuves
    inspector_comment TEXT,
    
    ai_validation_status TEXT DEFAULT 'pending' -- pending, approved, flagged (par Cortex)
);

-- 5. FINDINGS (Non-Conformités Détectées)
CREATE TABLE IF NOT EXISTS public.findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE,
    related_item_id UUID REFERENCES public.checklist_items(id),
    
    severity TEXT DEFAULT 'minor', -- minor, major, critical
    description TEXT NOT NULL,
    recommendation TEXT, -- Suggéré par IA ou Expert
    
    status TEXT DEFAULT 'open', -- open, fixed, waived
    image_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED DATA (Exemple de Checklist Résidentiel)
INSERT INTO public.checklists (title, category, description) 
VALUES ('Contrôle Conformité Résidentiel (NS 01-001)', 'residentiel', 'Inspection standard pour habitation neuve ou rénovée.')
ON CONFLICT DO NOTHING;

-- On pourrait insérer des items ici, mais on le fera via API ou un script dédié plus tard.
