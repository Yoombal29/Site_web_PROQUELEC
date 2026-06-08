-- Builder Release Manager hardening
-- Adds health metadata, audit trail, rollback/purge fields and fine-grained permissions.
-- Idempotent for local and VPS deployments.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.builder_release_candidates
  ADD COLUMN IF NOT EXISTS package_health JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS validation_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS publish_reason TEXT,
  ADD COLUMN IF NOT EXISTS forced BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rejected_by UUID,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reject_reason TEXT,
  ADD COLUMN IF NOT EXISTS rollback_by UUID,
  ADD COLUMN IF NOT EXISTS rollback_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rollback_reason TEXT,
  ADD COLUMN IF NOT EXISTS deleted_by UUID,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delete_reason TEXT;

ALTER TABLE public.builder_release_candidates
  DROP CONSTRAINT IF EXISTS builder_release_candidates_status_check;

ALTER TABLE public.builder_release_candidates
  ADD CONSTRAINT builder_release_candidates_status_check
  CHECK (status IN (
    'candidate',
    'conflict',
    'published',
    'rejected',
    'invalid',
    'quarantined',
    'rolled_back'
  ));

CREATE INDEX IF NOT EXISTS idx_builder_release_candidates_deleted_at
  ON public.builder_release_candidates(deleted_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_builder_release_candidates_status_active
  ON public.builder_release_candidates(status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.builder_release_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_candidate_id UUID REFERENCES public.builder_release_candidates(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_id UUID,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builder_release_events_candidate
  ON public.builder_release_events(release_candidate_id, created_at DESC);

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

INSERT INTO public.permissions (name, description, category) VALUES
  ('builder.release.view', 'Voir le release manager du builder', 'builder'),
  ('builder.release.create', 'Importer, exporter et rejeter des candidats builder', 'builder'),
  ('builder.release.publish', 'Publier un candidat builder sans conflit', 'builder'),
  ('builder.release.force', 'Forcer la publication d''un candidat builder en conflit', 'builder'),
  ('builder.release.rollback', 'Restaurer la version precedant une publication builder', 'builder'),
  ('builder.release.purge', 'Supprimer l''historique des candidats builder traites', 'builder')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT role_name, p.id
FROM public.permissions p
CROSS JOIN (VALUES ('admin'), ('superadmin')) AS roles(role_name)
WHERE p.name IN (
  'builder.release.view',
  'builder.release.create',
  'builder.release.publish',
  'builder.release.force',
  'builder.release.rollback',
  'builder.release.purge'
)
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'secondary_admin', p.id
FROM public.permissions p
WHERE p.name IN ('builder.release.view', 'builder.release.create')
ON CONFLICT (role, permission_id) DO NOTHING;
