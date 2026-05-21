
-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  u_id UUID;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO u_id FROM auth.users WHERE email = 'oumarkebe@proquelec.sn';
  
  IF u_id IS NULL THEN
    u_id := gen_random_uuid();
    
    -- Insérer dans auth.users
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, created_at, updated_at, 
      raw_app_meta_data, raw_user_meta_data, is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', u_id, 'authenticated', 'authenticated', 
      'oumarkebe@proquelec.sn', crypt('proquelec2026', gen_salt('bf')), 
      now(), now(), now(), 
      '{"provider":"email","providers":["email"]}', '{}', false
    );

    -- Insérer dans auth.identities
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id
    ) VALUES (
      gen_random_uuid(), u_id, format('{"sub":"%s","email":"%s"}', u_id, 'oumarkebe@proquelec.sn')::jsonb, 'email', now(), now(), now(), u_id
    );
    
    RAISE NOTICE 'Utilisateur créé avec ID: %', u_id;
  ELSE
    -- Mettre à jour le mot de passe si l'utilisateur existe déjà
    UPDATE auth.users 
    SET encrypted_password = crypt('proquelec2026', gen_salt('bf')),
        updated_at = now()
    WHERE id = u_id;
    
    RAISE NOTICE 'Mot de passe mis à jour pour l''utilisateur ID: %', u_id;
  END IF;

  -- Assigner le rôle admin dans public.user_roles
  -- Vérifier si la table existe d'abord
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (u_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

END $$;
