
-- Créer une table pour stocker l'état du mode construction
CREATE TABLE public.construction_mode (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insérer l'état initial
INSERT INTO public.construction_mode (is_enabled) VALUES (TRUE);

-- Politiques RLS pour le mode construction
ALTER TABLE public.construction_mode ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage construction mode"
ON public.construction_mode
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view construction mode"
ON public.construction_mode
FOR SELECT
USING (TRUE);

-- Améliorer la table analytics_events pour de vraies données
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS os TEXT;

-- Créer une table pour les métriques de performance
CREATE TABLE public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  load_time INTEGER NOT NULL,
  dom_content_loaded INTEGER NOT NULL,
  first_contentful_paint INTEGER NOT NULL,
  time_to_interactive INTEGER NOT NULL,
  connection_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert performance metrics"
ON public.performance_metrics
FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Admins can view performance metrics"
ON public.performance_metrics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Créer une table pour les certifications électriques
CREATE TABLE public.electrical_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  validity_period INTEGER DEFAULT 24, -- en mois
  required_training_hours INTEGER DEFAULT 40,
  certification_body TEXT,
  cost DECIMAL(10,2),
  requirements TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.electrical_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active certifications"
ON public.electrical_certifications
FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Admins can manage certifications"
ON public.electrical_certifications
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Table pour les formations professionnelles
CREATE TABLE public.professional_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_hours INTEGER NOT NULL,
  level TEXT CHECK (level IN ('débutant', 'intermédiaire', 'avancé', 'expert')),
  certification_id UUID REFERENCES public.electrical_certifications(id),
  price DECIMAL(10,2),
  max_participants INTEGER DEFAULT 12,
  instructor_name TEXT,
  location TEXT,
  equipment_provided BOOLEAN DEFAULT FALSE,
  prerequisites TEXT[],
  learning_objectives TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.professional_training ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active training"
ON public.professional_training
FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Admins can manage training"
ON public.professional_training
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Table pour les inscriptions aux formations
CREATE TABLE public.training_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES public.professional_training(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  participant_phone TEXT,
  company_name TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  special_requirements TEXT,
  UNIQUE(training_id, user_id)
);

ALTER TABLE public.training_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their registrations"
ON public.training_registrations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create registrations"
ON public.training_registrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all registrations"
ON public.training_registrations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Table pour les équipements électriques
CREATE TABLE public.electrical_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('protection', 'mesure', 'installation', 'maintenance', 'sécurité')),
  brand TEXT,
  model TEXT,
  specifications JSONB,
  price DECIMAL(10,2),
  rental_price_daily DECIMAL(10,2),
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'rented', 'maintenance', 'discontinued')),
  description TEXT,
  safety_instructions TEXT[],
  certification_standards TEXT[],
  image_url TEXT,
  manual_url TEXT,
  is_rental BOOLEAN DEFAULT FALSE,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.electrical_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available equipment"
ON public.electrical_equipment
FOR SELECT
USING (availability_status = 'available');

CREATE POLICY "Admins can manage equipment"
ON public.electrical_equipment
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Table pour les normes électriques
CREATE TABLE public.electrical_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('installation', 'sécurité', 'mesure', 'protection', 'maintenance')),
  version TEXT,
  publication_date DATE,
  effective_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'superseded', 'withdrawn')),
  superseded_by UUID REFERENCES public.electrical_standards(id),
  document_url TEXT,
  summary TEXT,
  key_changes TEXT[],
  applicable_sectors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.electrical_standards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active standards"
ON public.electrical_standards
FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can manage standards"
ON public.electrical_standards
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Active les réplications pour le temps réel
ALTER TABLE public.construction_mode REPLICA IDENTITY FULL;
ALTER TABLE public.performance_metrics REPLICA IDENTITY FULL;
ALTER TABLE public.electrical_certifications REPLICA IDENTITY FULL;
ALTER TABLE public.professional_training REPLICA IDENTITY FULL;
ALTER TABLE public.training_registrations REPLICA IDENTITY FULL;
ALTER TABLE public.electrical_equipment REPLICA IDENTITY FULL;
ALTER TABLE public.electrical_standards REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication pour le temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE public.construction_mode;
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.electrical_certifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.professional_training;
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.electrical_equipment;
ALTER PUBLICATION supabase_realtime ADD TABLE public.electrical_standards;
