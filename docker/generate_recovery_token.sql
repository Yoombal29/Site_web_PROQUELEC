
DO $$
DECLARE
  u_id UUID;
  v_recovery_token TEXT;
BEGIN
  -- Récupérer l'ID de l'utilisateur
  SELECT id INTO u_id FROM auth.users WHERE email = 'oumarkebe@proquelec.sn';
  
  -- Générer un token de récupération
  v_recovery_token := encode(gen_random_bytes(32), 'hex');
  
  -- Mettre à jour l'utilisateur avec le token de récupération
  UPDATE auth.users 
  SET recovery_token = v_recovery_token,
      recovery_sent_at = now()
  WHERE id = u_id;
  
  -- Afficher le token pour construire le lien
  RAISE NOTICE 'Token de récupération: %', v_recovery_token;
  RAISE NOTICE 'User ID: %', u_id;
END $$;
