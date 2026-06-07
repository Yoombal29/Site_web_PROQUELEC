-- ============================================================
-- Migration: Builder RBAC Permissions
-- Ajoute les permissions granulaires pour le God Mode Builder
-- Seul le superadmin (oumarkebe@proquelec.sn) peut les modifier
-- ============================================================

-- 1. Insertion des permissions builder.*
INSERT INTO public.permissions (name, description, category) VALUES
  ('builder.access',           'Accéder au God Mode Builder',                        'builder'),
  ('builder.edit_content',     'Modifier les textes et images dans le builder',       'builder'),
  ('builder.edit_styles',      'Modifier couleurs, marges et typographie',            'builder'),
  ('builder.add_blocks',       'Glisser-déposer de nouveaux blocs',                  'builder'),
  ('builder.delete_blocks',    'Supprimer des blocs existants',                      'builder'),
  ('builder.publish',          'Publier / enregistrer définitivement une page',       'builder'),
  ('builder.manage_templates', 'Créer, modifier et supprimer des templates',          'builder'),
  ('builder.god_mode',         'Accès JSON brut, import HTML et mode expert complet', 'builder')
ON CONFLICT (name) DO NOTHING;

-- 2. SUPERADMIN : toutes les permissions builder
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'superadmin', id FROM public.permissions WHERE category = 'builder'
ON CONFLICT (role, permission_id) DO NOTHING;

-- 3. ADMIN : toutes sauf god_mode
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions
WHERE name IN (
  'builder.access',
  'builder.edit_content',
  'builder.edit_styles',
  'builder.add_blocks',
  'builder.delete_blocks',
  'builder.publish',
  'builder.manage_templates'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- 4. SECONDARY_ADMIN : accès + édition contenu seulement
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'secondary_admin', id FROM public.permissions
WHERE name IN ('builder.access', 'builder.edit_content')
ON CONFLICT (role, permission_id) DO NOTHING;

-- 5. PARTNER / ELECTRICIEN / ENTREPRISE / MEMBRE / USER : aucun accès builder
-- (pas d'insertion = pas d'accès)

-- 6. Index de performance
CREATE INDEX IF NOT EXISTS idx_permissions_builder ON public.permissions(category) WHERE category = 'builder';

DO $$
BEGIN
  RAISE NOTICE '✅ Builder RBAC permissions installed successfully';
  RAISE NOTICE '   superadmin → toutes les permissions builder (god_mode inclus)';
  RAISE NOTICE '   admin       → toutes sauf god_mode';
  RAISE NOTICE '   secondary_admin → access + edit_content uniquement';
END $$;
