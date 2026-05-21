-- ========================================================
-- OBSERVARTOIRE PROQUELEC : RBAC MINISTÈRE
-- ========================================================

-- 1. Ajouter le rôle 'ministere' s'il n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Si le type enum n'existe pas encore (peu probable ici)
        CREATE TYPE user_role AS ENUM ('admin', 'user', 'partner', 'ministere');
    ELSE
        -- Tenter d'ajouter la valeur à l'enum existant
        BEGIN
            ALTER TYPE user_role ADD VALUE 'ministere';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- 2. Créer les permissions spécifiques pour l'Observatoire
INSERT INTO public.permissions (name, category, description) 
VALUES 
    ('view_observatoire_national', 'observatoire', 'Accès à la vue nationale de l''Observatoire (Dashboard DG/Ministère)'),
    ('view_cossuel_details', 'observatoire', 'Accès aux détails des dossiers synchronisés de COSSUEL'),
    ('export_observatoire_reports', 'observatoire', 'Droit d''exporter les rapports PDF pour le Ministère')
ON CONFLICT (name) DO NOTHING;

-- 3. Assigner les permissions au rôle 'ministere' et 'admin'
DO $$
DECLARE
    role_name TEXT := 'ministere';
    perm record;
BEGIN
    FOR perm IN SELECT id FROM public.permissions WHERE category = 'observatoire' LOOP
        INSERT INTO public.role_permissions (role, permission_id)
        VALUES (role_name, perm.id), ('admin', perm.id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 4. Créer un utilisateur "Ministère" de test (optionnel mais utile pour la vérification)
-- L'administrateur pourra créer ces comptes via l'interface
