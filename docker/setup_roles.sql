
-- Création des rôles standards Authentification pour la compatibilité
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
  
  -- Permissions de base pour le fonctionnement de l'API
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
  
  -- Autoriser l'accès aux tables publiques
  GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

  -- Autoriser l'accès à la table des rôles pour la vérification admin
  GRANT SELECT ON public.user_roles TO authenticated;
  
  -- Très important : accorder ces rôles à l'utilisateur de connexion de l'API (postgres)
  -- pour que l'API puisse utiliser ces rôles
  GRANT anon, authenticated, service_role TO postgres;
  
END $$;
