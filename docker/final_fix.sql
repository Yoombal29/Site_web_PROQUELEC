
-- 1. Désactiver RLS partout dans public
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- 2. Donner les droits aux rôles standards
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Réparer l'utilisateur admin oumarkebe
UPDATE auth.users 
SET role = 'authenticated', 
    aud = 'authenticated', 
    email_confirmed_at = now(),
    raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"authenticated"}'::jsonb 
WHERE email = 'oumarkebe@proquelec.sn';

-- 4. Inserer le rôle admin
INSERT INTO public.user_roles (user_id, role, status)
SELECT id, 'admin', 'active' FROM auth.users WHERE email = 'oumarkebe@proquelec.sn'
ON CONFLICT (user_id, role) DO UPDATE SET status = 'active';

-- 5. S'assurer que le mode construction est désactivé
UPDATE public.construction_mode SET is_enabled = false WHERE id = 1;
