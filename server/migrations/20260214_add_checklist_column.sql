-- Migration: Ajouter colonne checklist (jsonb) dans inspections
-- Date: 2026-02-14
-- Description: Stockage de la structure de checklist personnalisée/IA

ALTER TABLE public.inspections 
ADD COLUMN IF NOT EXISTS checklist JSONB;

COMMENT ON COLUMN public.inspections.checklist IS 'Structure complète de la checklist utilisée (utile pour les checklists dynamiques/IA)';
