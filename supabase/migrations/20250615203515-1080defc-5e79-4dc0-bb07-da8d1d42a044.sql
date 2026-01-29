
-- Supprime l'ancienne politique qui restreint la lecture aux administrateurs
DROP POLICY IF EXISTS "Admins can select site settings" ON public.site_settings;

-- Crée une nouvelle politique pour autoriser la lecture publique des paramètres
CREATE POLICY "Public can read site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);
