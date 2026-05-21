-- RBAC: Granular Permissions System for Authority 2.0
-- This migration creates a flexible permission system that goes beyond simple role checks.
-- Each critical action is protected by a specific permission (e.g., projects.edit, inspections.validate).

-- 1. Permissions Table (Master List)
CREATE TABLE IF NOT EXISTS public.permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'projects.edit', 'inspections.validate'
    description TEXT,
    category VARCHAR(50), -- e.g., 'projects', 'inspections', 'audit'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Role Permissions (Default Permissions per Role)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL, -- 'admin', 'installer', 'client', 'authority'
    permission_id INTEGER REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

-- 3. User Permissions (Override/Additional Permissions per User)
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT true, -- true = grant, false = revoke (override role permission)
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES public.users(id),
    UNIQUE(user_id, permission_id)
);

-- 4. Seed Default Permissions
INSERT INTO public.permissions (name, description, category) VALUES
    -- Projects
    ('projects.view', 'View project details', 'projects'),
    ('projects.create', 'Create new projects', 'projects'),
    ('projects.edit', 'Edit project information', 'projects'),
    ('projects.delete', 'Delete projects', 'projects'),
    ('projects.transition', 'Change project regulatory status', 'projects'),
    
    -- Inspections
    ('inspections.view', 'View inspection reports', 'inspections'),
    ('inspections.create', 'Create new inspections', 'inspections'),
    ('inspections.edit', 'Edit inspection results', 'inspections'),
    ('inspections.validate', 'Validate inspection reports', 'inspections'),
    ('inspections.delete', 'Delete inspections', 'inspections'),
    
    -- Audit
    ('audit.view', 'View audit trail', 'audit'),
    ('audit.export', 'Export audit logs', 'audit'),
    
    -- Documents
    ('documents.upload', 'Upload documents', 'documents'),
    ('documents.delete', 'Delete documents', 'documents'),
    
    -- Admin
    ('admin.users', 'Manage users', 'admin'),
    ('admin.settings', 'Manage system settings', 'admin'),
    ('admin.permissions', 'Manage permissions', 'admin')
ON CONFLICT (name) DO NOTHING;

-- 5. Assign Default Permissions to Roles

-- ADMIN: Full Access
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- INSTALLER: Project & Inspection Management
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'installer', id FROM public.permissions 
WHERE name IN (
    'projects.view', 'projects.create', 'projects.edit',
    'inspections.view', 'inspections.create', 'inspections.edit',
    'documents.upload', 'audit.view'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- CLIENT: Read-Only Access
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'client', id FROM public.permissions 
WHERE name IN (
    'projects.view', 'inspections.view', 'documents.upload', 'audit.view'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- AUTHORITY: Validation & Transition Powers
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'authority', id FROM public.permissions 
WHERE name IN (
    'projects.view', 'projects.transition',
    'inspections.view', 'inspections.validate',
    'audit.view', 'audit.export'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);

-- Success Message
DO $$
BEGIN
    RAISE NOTICE '✅ RBAC Permissions System Installed Successfully';
    RAISE NOTICE '   - Permissions Table Created';
    RAISE NOTICE '   - Role Permissions Mapped';
    RAISE NOTICE '   - Ready for Granular Access Control';
END $$;
