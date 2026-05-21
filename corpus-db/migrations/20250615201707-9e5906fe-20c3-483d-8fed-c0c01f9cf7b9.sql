
-- Table unique : un seul set de paramètres généraux pour le site
CREATE TABLE public.site_settings (
  id SERIAL PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'PROQUELEC',
  slogan TEXT NOT NULL DEFAULT 'Sécurité · Qualité · Formation',
  logo_url TEXT DEFAULT NULL,
  favicon_url TEXT DEFAULT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verrouillage : Une seule ligne utilisée par l’application (clé primaire PK=1)
INSERT INTO public.site_settings (site_name, slogan) VALUES ('PROQUELEC', 'Sécurité · Qualité · Formation');

-- Activer la RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS : Seuls les admins peuvent voir/modifier
CREATE POLICY "Admins can select site settings"
  ON public.site_settings
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
