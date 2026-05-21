
UPDATE auth.users 
SET role = 'authenticated', 
    aud = 'authenticated', 
    raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"authenticated"}'::jsonb 
WHERE email = 'oumarkebe@proquelec.sn';

INSERT INTO public.user_roles (user_id, role, status) 
VALUES ('7439baf5-e917-42f9-a991-d67ad7347a93', 'admin', 'active')
ON CONFLICT (user_id, role) DO UPDATE SET status = 'active';
