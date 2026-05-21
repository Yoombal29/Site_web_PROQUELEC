-- Migration: 20260213_create_projects.sql
-- Description: Creates the foundation for PROQUELEC ELECTRO-GED 4.0: Projects, Compliance, and Intelligent Document Attributes.

-- 1. Create Projects Table (The core entity)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    reference TEXT UNIQUE, -- ex: "PQ-26-001-DAK"
    location JSONB DEFAULT '{}', -- { city: "Dakar", coords: [14.69, -17.44], address: "..." }
    
    -- Status Workflow: etude -> validation_plan -> chantier -> controle -> certification -> livre
    status TEXT DEFAULT 'etude', 
    
    client_info JSONB DEFAULT '{}', -- { name: "Sci Immo", contact: "..." }
    
    -- Aggregated Intelligence
    compliance_score INT DEFAULT 0, -- Global score 0-100
    risk_level TEXT DEFAULT 'low', -- low, medium, high, critical
    
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enhance Documents (media_files) to become "Intelligent Objects"
-- Linking to Projects
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Business Classification (Not just MIME type)
-- Types: 'plan_architecte', 'schema_unifilaire', 'note_calcul', 'rapport_autocontrole', 'pv_inspection', 'certificat_conformite'
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS doc_category TEXT DEFAULT 'general';

-- Compliance & AI Intelligence
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'pending'; -- pending, compliant, warning, danger
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS ai_analysis_summary TEXT; -- Short AI generated summary
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS ai_issues_count INT DEFAULT 0; -- Number of detected anomalies

-- Versioning & Validity
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS is_latest BOOLEAN DEFAULT true;

-- 3. Create Compliance Reports (Audit Logs by Cortex)
CREATE TABLE IF NOT EXISTS public.compliance_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id),
    document_id UUID REFERENCES public.media_files(id),
    
    audited_at TIMESTAMPTZ DEFAULT NOW(),
    auditor_ai_model TEXT DEFAULT 'CORTEX-V1-EXPERT',
    
    findings JSONB, -- List of anomalies found: [{ code: 'NS-01-001-5.4', severity: 'high', message: 'Terre > 50 Ohm' }]
    score INT,
    
    recommendations TEXT
);

-- 4. Digital Certificates (Blockchain-Ready Stub)
CREATE TABLE IF NOT EXISTS public.digital_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id),
    
    certificate_number TEXT UNIQUE NOT NULL, -- "CERT-PQ-2026-X8Y9"
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    
    holder_name TEXT,
    installation_type TEXT,
    
    qr_code_data TEXT, -- Content for QR Code generation
    signature_hash TEXT, -- Cryptographic signature of the certificate content
    
    status TEXT DEFAULT 'active' -- active, revoked, expired
);
