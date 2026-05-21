
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  -- 1. Nettoyage
  DELETE FROM auth.users WHERE email = 'oumarkebe@proquelec.sn';
  
  -- 2. Insertion dans auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin,
    last_sign_in_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'oumarkebe@proquelec.sn',
    public.crypt('1995Proquelec', public.gen_salt('bf', 10)),
    now(), now(), now(),
    '{"provider":"email","providers":["email"],"role":"authenticated"}'::jsonb,
    '{}'::jsonb,
    false,
    now()
  );

  -- 3. Attribution du rôle admin
  DELETE FROM public.user_roles WHERE user_id = u_id OR (user_id IN (SELECT id FROM auth.users WHERE email = 'oumarkebe@proquelec.sn'));
  INSERT INTO public.user_roles (user_id, role, status)
  VALUES (u_id, 'admin', 'active');

  RAISE NOTICE 'Utilisateur oumarkebe@proquelec.sn créé avec succès avec ID %', u_id;
END $$;
