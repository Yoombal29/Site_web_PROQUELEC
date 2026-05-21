-- Phase 7.1: Permissions & ACL System
-- Database schema for user groups, permissions, and document access control

-- ============================================
-- 1. USER GROUPS
-- ============================================

CREATE TABLE IF NOT EXISTS user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_groups_name ON user_groups(name);

-- ============================================
-- 2. GROUP MEMBERSHIP
-- ============================================

CREATE TABLE IF NOT EXISTS user_group_members (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, group_id)
);

CREATE INDEX idx_group_members_user ON user_group_members(user_id);
CREATE INDEX idx_group_members_group ON user_group_members(group_id);

-- ============================================
-- 3. DOCUMENT PERMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS document_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  permission_type VARCHAR(50) NOT NULL CHECK (permission_type IN ('user', 'group')),
  permission_target UUID NOT NULL, -- user_id or group_id
  access_level VARCHAR(50) NOT NULL CHECK (access_level IN ('read', 'write', 'delete', 'admin')),
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id, permission_type, permission_target)
);

CREATE INDEX idx_doc_permissions_document ON document_permissions(document_id);
CREATE INDEX idx_doc_permissions_target ON document_permissions(permission_target);

-- ============================================
-- 4. DEFAULT GROUPS
-- ============================================

-- Insert default groups
INSERT INTO user_groups (name, description) VALUES
  ('Administrateurs', 'Accès complet à tous les documents'),
  ('Managers', 'Accès en lecture/écriture aux documents de leur équipe'),
  ('Techniciens', 'Accès en lecture aux documents techniques'),
  ('Invités', 'Accès en lecture uniquement')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to check if user has permission on document
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_document_id UUID,
  p_required_level VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
  v_user_groups UUID[];
BEGIN
  -- Get user's groups
  SELECT ARRAY_AGG(group_id) INTO v_user_groups
  FROM user_group_members
  WHERE user_id = p_user_id;

  -- Check direct user permission
  SELECT EXISTS (
    SELECT 1 FROM document_permissions
    WHERE document_id = p_document_id
      AND permission_type = 'user'
      AND permission_target = p_user_id
      AND (
        access_level = p_required_level
        OR (p_required_level = 'read' AND access_level IN ('write', 'delete', 'admin'))
        OR (p_required_level = 'write' AND access_level IN ('delete', 'admin'))
        OR (p_required_level = 'delete' AND access_level = 'admin')
      )
  ) INTO v_has_permission;

  -- If no direct permission, check group permissions
  IF NOT v_has_permission AND v_user_groups IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM document_permissions
      WHERE document_id = p_document_id
        AND permission_type = 'group'
        AND permission_target = ANY(v_user_groups)
        AND (
          access_level = p_required_level
          OR (p_required_level = 'read' AND access_level IN ('write', 'delete', 'admin'))
          OR (p_required_level = 'write' AND access_level IN ('delete', 'admin'))
          OR (p_required_level = 'delete' AND access_level = 'admin')
        )
    ) INTO v_has_permission;
  END IF;

  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. ROW LEVEL SECURITY (Optional)
-- ============================================

-- Enable RLS on media_files (if not already enabled)
-- ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see documents they have permission to read
-- CREATE POLICY media_files_select_policy ON media_files
--   FOR SELECT
--   USING (
--     user_has_permission(auth.uid(), id, 'read')
--     OR uploaded_by = auth.uid() -- Owner always has access
--   );

-- ============================================
-- 7. AUDIT TRIGGER
-- ============================================

-- Log permission changes to audit_logs (if audit table exists)
CREATE OR REPLACE FUNCTION log_permission_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
    VALUES (NEW.granted_by, 'grant_permission', 'document', NEW.document_id, 
            jsonb_build_object('target', NEW.permission_target, 'level', NEW.access_level));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
    VALUES (OLD.granted_by, 'revoke_permission', 'document', OLD.document_id,
            jsonb_build_object('target', OLD.permission_target, 'level', OLD.access_level));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CREATE TRIGGER permission_audit_trigger
--   AFTER INSERT OR DELETE ON document_permissions
--   FOR EACH ROW EXECUTE FUNCTION log_permission_change();

COMMIT;
