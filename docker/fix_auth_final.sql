
-- 1. Désactiver RLS sur TOUTES les tables publiques de force
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- 2. Réparer l'utilisateur admin oumarkebe@proquelec.sn
-- S'assurer que role et aud sont 'authenticated' pour que le JWT soit valide
UPDATE auth.users 
SET role = 'authenticated', 
    aud = 'authenticated', 
    email_confirmed_at = now(),
    raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"authenticated"}'::jsonb 
WHERE email = 'oumarkebe@proquelec.sn';

-- 3. S'assurer que la ligne dans user_roles existe et est correcte
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'oumarkebe@proquelec.sn';
    
    IF v_user_id IS NOT NULL THEN
        -- Supprimer les doublons potentiels si on a fait des bêtises avant
        DELETE FROM public.user_roles WHERE user_id = v_user_id;
        
        -- Insérer la ligne admin unique
        INSERT INTO public.user_roles (user_id, role, status)
        VALUES (v_user_id, 'admin', 'active');
    END IF;
END $$;

-- 4. Nettoyage mode construction
DELETE FROM public.construction_mode WHERE id > 1;
INSERT INTO public.construction_mode (id, is_enabled)
VALUES (1, false)
ON CONFLICT (id) DO UPDATE SET is_enabled = false;
