-- Migration: 20260214_authority_v2.sql (Retry V3)

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS regulatory_status TEXT DEFAULT 'draft';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS compliance_details JSONB DEFAULT '{}';

DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    changes JSONB, -- Unified diff/prev/new
    performed_by UUID, -- Can be null for system actions
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    signature_hash TEXT
);

CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_id, entity_type);
