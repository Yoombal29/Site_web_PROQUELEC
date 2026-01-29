
-- ========================================================
-- SETUP SECOND ADMIN ROLE
-- ========================================================

-- Note: L'utilisateur admin2@proquelec.sn doit être créé via l'interface d'authentification (Sign Up) 
-- ou via le dashboard Supabase. Ce script prépare l'attribution automatique du rôle.

-- On essaye de récupérer l'ID de l'utilisateur s'il existe déjà
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin2@proquelec.sn';
    
    IF v_user_id IS NOT NULL THEN
        -- Si l'utilisateur existe, on lui assigne le rôle s'il ne l'a pas déjà
        IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_user_id AND role = 'secondary_admin') THEN
            INSERT INTO public.user_roles (user_id, role)
            VALUES (v_user_id, 'secondary_admin');
        END IF;
    END IF;
END $$;
