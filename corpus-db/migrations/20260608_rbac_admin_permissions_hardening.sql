-- RBAC hardening for admin permissions.
-- This migration is intentionally idempotent because scripts/auto-migrate.js
-- only reads corpus-db/migrations, while some RBAC SQL lives in server/migrations.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT true,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES public.users(id),
    UNIQUE(user_id, permission_id)
);

INSERT INTO public.permissions (name, description, category) VALUES
    ('projects.view', 'View project details', 'projects'),
    ('projects.create', 'Create new projects', 'projects'),
    ('projects.edit', 'Edit project information', 'projects'),
    ('projects.delete', 'Delete projects', 'projects'),
    ('projects.transition', 'Change project regulatory status', 'projects'),
    ('inspections.view', 'View inspection reports', 'inspections'),
    ('inspections.create', 'Create new inspections', 'inspections'),
    ('inspections.edit', 'Edit inspection results', 'inspections'),
    ('inspections.validate', 'Validate inspection reports', 'inspections'),
    ('inspections.delete', 'Delete inspections', 'inspections'),
    ('audit.view', 'View audit trail', 'audit'),
    ('audit.export', 'Export audit logs', 'audit'),
    ('documents.upload', 'Upload documents', 'documents'),
    ('documents.delete', 'Delete documents', 'documents'),
    ('admin.users', 'Manage users', 'admin'),
    ('admin.settings', 'Manage system settings', 'admin'),
    ('admin.permissions', 'Manage permissions', 'admin'),
    ('builder.access', 'Accéder au God Mode Builder', 'builder'),
    ('builder.edit_content', 'Modifier les textes et images dans le builder', 'builder'),
    ('builder.edit_styles', 'Modifier couleurs, marges et typographie', 'builder'),
    ('builder.add_blocks', 'Glisser-déposer de nouveaux blocs', 'builder'),
    ('builder.delete_blocks', 'Supprimer des blocs existants', 'builder'),
    ('builder.publish', 'Publier / enregistrer définitivement une page', 'builder'),
    ('builder.manage_templates', 'Créer, modifier et supprimer des templates', 'builder'),
    ('builder.god_mode', 'Accès JSON brut, import HTML et mode expert complet', 'builder')
ON CONFLICT (name) DO NOTHING;

-- Admin and superadmin must never lose access to the RBAC administration page.
INSERT INTO public.role_permissions (role, permission_id)
SELECT role_name, p.id
FROM public.permissions p
CROSS JOIN (VALUES ('admin'), ('superadmin')) AS roles(role_name)
WHERE p.name IN (
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'projects.transition',
    'inspections.view',
    'inspections.create',
    'inspections.edit',
    'inspections.validate',
    'inspections.delete',
    'audit.view',
    'audit.export',
    'documents.upload',
    'documents.delete',
    'admin.users',
    'admin.settings',
    'admin.permissions'
)
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'superadmin', id FROM public.permissions WHERE category = 'builder'
ON CONFLICT (role, permission_id) DO NOTHING;

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

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'secondary_admin', id FROM public.permissions
WHERE name IN ('builder.access', 'builder.edit_content')
ON CONFLICT (role, permission_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);
