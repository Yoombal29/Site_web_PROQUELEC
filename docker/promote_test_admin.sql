
UPDATE auth.users 
SET role = 'authenticated', 
    aud = 'authenticated', 
    raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"authenticated"}'::jsonb 
WHERE email = 'test@proquelec.sn';

INSERT INTO public.user_roles (user_id, role, status) 
SELECT id, 'admin', 'active' FROM auth.users WHERE email = 'test@proquelec.sn'
ON CONFLICT (user_id, role) DO UPDATE SET status = 'active';
