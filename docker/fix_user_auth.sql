
UPDATE auth.users 
SET role = 'authenticated', 
    aud = 'authenticated', 
    raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"authenticated"}'::jsonb 
WHERE email = 'oumarkebe@proquelec.sn';

INSERT INTO public.user_roles (user_id, role, status) 
SELECT id, 'admin', 'active' FROM auth.users WHERE email = 'oumarkebe@proquelec.sn'
ON CONFLICT (user_id, role) DO UPDATE SET status = 'active';

UPDATE public.construction_mode SET is_enabled = false WHERE id = 1;
