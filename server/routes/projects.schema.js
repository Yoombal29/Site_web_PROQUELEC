let schemaReadyPromise = null;

async function ensureProjectsSchema(pool) {
  if (!schemaReadyPromise) {
    schemaReadyPromise = ensureProjectsSchemaOnce(pool).catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }
  return schemaReadyPromise;
}

async function ensureProjectsSchemaOnce(pool) {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS public.projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      reference TEXT UNIQUE,
      location JSONB NOT NULL DEFAULT '{}'::jsonb,
      status TEXT NOT NULL DEFAULT 'etude',
      client_info JSONB NOT NULL DEFAULT '{}'::jsonb,
      compliance_score INT NOT NULL DEFAULT 0,
      risk_level TEXT NOT NULL DEFAULT 'low',
      technical_info JSONB NOT NULL DEFAULT '{
        "installation_type": "Non specifie",
        "power_subscribed": "Non specifie",
        "voltage_type": "Monophase"
      }'::jsonb,
      regulatory_status TEXT NOT NULL DEFAULT 'draft',
      compliance_details JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS reference TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS location JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'etude';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_info JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS compliance_score INT DEFAULT 0;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'low';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS technical_info JSONB DEFAULT '{
      "installation_type": "Non specifie",
      "power_subscribed": "Non specifie",
      "voltage_type": "Monophase"
    }'::jsonb;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS regulatory_status TEXT DEFAULT 'draft';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS compliance_details JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS created_by UUID;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

    UPDATE public.projects
    SET
      location = COALESCE(location, '{}'::jsonb),
      status = COALESCE(status, 'etude'),
      client_info = COALESCE(client_info, '{}'::jsonb),
      compliance_score = COALESCE(compliance_score, 0),
      risk_level = COALESCE(risk_level, 'low'),
      technical_info = COALESCE(technical_info, '{
        "installation_type": "Non specifie",
        "power_subscribed": "Non specifie",
        "voltage_type": "Monophase"
      }'::jsonb),
      regulatory_status = COALESCE(regulatory_status, 'draft'),
      compliance_details = COALESCE(compliance_details, '{}'::jsonb),
      created_at = COALESCE(created_at, NOW()),
      updated_at = COALESCE(updated_at, NOW());

    CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_regulatory_status ON public.projects(regulatory_status);

    CREATE TABLE IF NOT EXISTS public.audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entity_type TEXT,
      entity_id UUID,
      action TEXT NOT NULL,
      changes JSONB DEFAULT '{}'::jsonb,
      performed_by UUID,
      performed_at TIMESTAMPTZ DEFAULT NOW(),
      metadata JSONB DEFAULT '{}'::jsonb,
      signature_hash TEXT
    );

    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_type TEXT;
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_id UUID;
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS changes JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS performed_by UUID;
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS performed_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS signature_hash TEXT;

    UPDATE public.audit_logs
    SET
      changes = COALESCE(changes, '{}'::jsonb),
      metadata = COALESCE(metadata, '{}'::jsonb),
      performed_at = COALESCE(performed_at, NOW());

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'resource_type'
      ) THEN
        EXECUTE 'ALTER TABLE public.audit_logs ALTER COLUMN resource_type DROP NOT NULL';
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'resource_id'
      ) THEN
        EXECUTE 'ALTER TABLE public.audit_logs ALTER COLUMN resource_id DROP NOT NULL';
      END IF;

      IF to_regclass('public.media_files') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS project_id UUID';
        EXECUTE 'ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS doc_category TEXT DEFAULT ''general''';
        EXECUTE 'ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT ''pending''';
        EXECUTE 'ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS ai_analysis_summary TEXT';
        EXECUTE 'ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS ai_issues_count INT DEFAULT 0';
        EXECUTE 'ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS version INT DEFAULT 1';
        EXECUTE 'ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS is_latest BOOLEAN DEFAULT true';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_media_files_project_id ON public.media_files(project_id)';
      END IF;

      IF to_regclass('public.permissions') IS NOT NULL THEN
        INSERT INTO public.permissions (name, description, category) VALUES
          ('projects.view', 'View project details', 'projects'),
          ('projects.create', 'Create new projects', 'projects'),
          ('projects.edit', 'Edit project information', 'projects'),
          ('projects.delete', 'Delete projects', 'projects'),
          ('projects.transition', 'Change project regulatory status', 'projects')
        ON CONFLICT (name) DO NOTHING;
      END IF;

      IF to_regclass('public.permissions') IS NOT NULL
        AND to_regclass('public.role_permissions') IS NOT NULL THEN
        INSERT INTO public.role_permissions (role, permission_id)
        SELECT role_name, p.id
        FROM public.permissions p
        CROSS JOIN (VALUES ('admin'), ('superadmin')) AS roles(role_name)
        WHERE p.name IN (
          'projects.view',
          'projects.create',
          'projects.edit',
          'projects.delete',
          'projects.transition'
        )
        ON CONFLICT (role, permission_id) DO NOTHING;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_audit_logs_project_entity ON public.audit_logs(entity_type, entity_id, performed_at DESC);
  `);
}

module.exports = {
  ensureProjectsSchema,
};
