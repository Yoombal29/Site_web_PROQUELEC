-- Migration: Ajouter colonnes pour rapport IA dans inspections
-- Date: 2026-02-14
-- Description: Stockage des rapports générés par l'IA

ALTER TABLE public.inspections 
ADD COLUMN IF NOT EXISTS ai_report TEXT,
ADD COLUMN IF NOT EXISTS ai_report_generated_at TIMESTAMPTZ;

COMMENT ON COLUMN public.inspections.ai_report IS 'Rapport explicatif généré par Gemini AI';
COMMENT ON COLUMN public.inspections.ai_report_generated_at IS 'Date de génération du rapport IA';
