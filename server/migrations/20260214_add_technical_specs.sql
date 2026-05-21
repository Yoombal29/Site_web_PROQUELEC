-- Migration: 20260214_add_technical_specs.sql
-- Description: Adds a JSONB column to store technical specifications of the project (installation type, power, etc.)

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS technical_info JSONB DEFAULT '{
  "installation_type": "Non spécifié",
  "power_subscribed": "Non spécifié", 
  "voltage_type": "Monophasé"
}';

-- Update existing rows with defaults
UPDATE public.projects 
SET technical_info = '{
  "installation_type": "Non spécifié",
  "power_subscribed": "Non spécifié",
  "voltage_type": "Monophasé"
}' 
WHERE technical_info IS NULL;
