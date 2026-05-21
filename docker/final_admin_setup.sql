
UPDATE auth.users 
SET role = 'authenticated', 
    aud = 'authenticated', 
    raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"authenticated"}'::jsonb 
WHERE id = '4da8f7c4-1699-47bc-b5c8-ad19b2771822';

INSERT INTO public.user_roles (user_id, role, status)
VALUES ('4da8f7c4-1699-47bc-b5c8-ad19b2771822', 'admin', 'active')
ON CONFLICT (user_id, role) DO UPDATE SET status = 'active';

-- Also ensure construction mode is disabled
UPDATE public.site_settings SET value = 'false' WHERE key = 'construction_mode';
UPDATE public.construction_mode SET is_enabled = false WHERE id = 1;

-- Grant all permissions on items that might be needed
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
