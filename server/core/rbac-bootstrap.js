const CORE_PERMISSIONS = [
  ['projects.view', 'View project details', 'projects'],
  ['projects.create', 'Create new projects', 'projects'],
  ['projects.edit', 'Edit project information', 'projects'],
  ['projects.delete', 'Delete projects', 'projects'],
  ['projects.transition', 'Change project regulatory status', 'projects'],
  ['inspections.view', 'View inspection reports', 'inspections'],
  ['inspections.create', 'Create new inspections', 'inspections'],
  ['inspections.edit', 'Edit inspection results', 'inspections'],
  ['inspections.validate', 'Validate inspection reports', 'inspections'],
  ['inspections.delete', 'Delete inspections', 'inspections'],
  ['audit.view', 'View audit trail', 'audit'],
  ['audit.export', 'Export audit logs', 'audit'],
  ['documents.upload', 'Upload documents', 'documents'],
  ['documents.delete', 'Delete documents', 'documents'],
  ['admin.users', 'Manage users', 'admin'],
  ['admin.settings', 'Manage system settings', 'admin'],
  ['admin.permissions', 'Manage permissions', 'admin'],
];

async function ensureCoreRbac(pool) {
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await pool.query(`
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
  `);

  await pool.query(
    `
      INSERT INTO public.permissions (name, description, category)
      SELECT name, description, category
      FROM UNNEST($1::text[], $2::text[], $3::text[]) AS p(name, description, category)
      ON CONFLICT (name) DO UPDATE SET
        description = COALESCE(public.permissions.description, EXCLUDED.description),
        category = COALESCE(public.permissions.category, EXCLUDED.category)
    `,
    [
      CORE_PERMISSIONS.map(([name]) => name),
      CORE_PERMISSIONS.map(([, description]) => description),
      CORE_PERMISSIONS.map(([, , category]) => category),
    ],
  );

  await pool.query(`
    INSERT INTO public.role_permissions (role, permission_id)
    SELECT roles.role_name, p.id
    FROM public.permissions p
    CROSS JOIN (VALUES ('admin'), ('superadmin')) AS roles(role_name)
    WHERE p.name = ANY($1::text[])
    ON CONFLICT (role, permission_id) DO NOTHING
  `, [CORE_PERMISSIONS.map(([name]) => name)]);

  await pool.query(`
    INSERT INTO public.role_permissions (role, permission_id)
    SELECT 'installer', p.id
    FROM public.permissions p
    WHERE p.name IN (
      'projects.view',
      'projects.create',
      'projects.edit',
      'inspections.view',
      'inspections.create',
      'inspections.edit',
      'documents.upload',
      'audit.view'
    )
    ON CONFLICT (role, permission_id) DO NOTHING;

    INSERT INTO public.role_permissions (role, permission_id)
    SELECT 'client', p.id
    FROM public.permissions p
    WHERE p.name IN ('projects.view', 'inspections.view', 'documents.upload', 'audit.view')
    ON CONFLICT (role, permission_id) DO NOTHING;

    INSERT INTO public.role_permissions (role, permission_id)
    SELECT 'authority', p.id
    FROM public.permissions p
    WHERE p.name IN (
      'projects.view',
      'projects.transition',
      'inspections.view',
      'inspections.validate',
      'audit.view',
      'audit.export'
    )
    ON CONFLICT (role, permission_id) DO NOTHING;

    DELETE FROM public.user_permissions up
    USING public.users u, public.permissions p
    WHERE up.user_id = u.id
      AND up.permission_id = p.id
      AND up.granted = false
      AND u.role IN ('admin', 'superadmin')
      AND p.name = 'admin.permissions';

    CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);
    CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);
  `);

  console.log('[RBAC] Core permissions bootstrap complete');
}

module.exports = {
  ensureCoreRbac,
};
