-- Migration: 20260611_event_registrations.sql
-- Description: Creates the event_registrations table for inline registration management.

CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by event
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(status);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_event_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_event_registrations_updated_at ON public.event_registrations;
CREATE TRIGGER trg_event_registrations_updated_at
    BEFORE UPDATE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_event_registrations_updated_at();

COMMENT ON TABLE public.event_registrations IS 'Inscriptions aux événements PROQUELEC et partenaires';
COMMENT ON COLUMN public.event_registrations.status IS 'pending | confirmed | cancelled';
