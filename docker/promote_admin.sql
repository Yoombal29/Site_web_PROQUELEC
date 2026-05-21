
BEGIN;

UPDATE auth.users 
SET role = 'authenticated', 
    aud = 'authenticated', 
    email_confirmed_at = now(),
    raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"authenticated"}'::jsonb 
WHERE email = 'oumarkebe@proquelec.sn';

-- Supprimer les rôles orphelins éventuels avant insertion
DELETE FROM public.user_roles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'oumarkebe@proquelec.sn');

INSERT INTO public.user_roles (user_id, role, status) 
SELECT id, 'admin', 'active' 
FROM auth.users 
WHERE email = 'oumarkebe@proquelec.sn';

COMMIT;
