-- Phase 7.3: Audit Trail System
-- Complete audit logging for compliance and forensic tracking

-- ============================================
-- 1. CREATE AUDIT_LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'upload', 'download', 'delete', 'update', 'view', 'share', 'approve', 'reject'
  resource_type VARCHAR(50) NOT NULL, -- 'document', 'folder', 'permission', 'workflow', 'user', 'group'
  resource_id UUID NOT NULL,
  metadata JSONB, -- Additional context (old_value, new_value, etc.)
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- ============================================
-- 3. AUDIT HELPER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION log_audit(
  p_user_id UUID,
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50),
  p_resource_id UUID,
  p_metadata JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_metadata, p_ip_address, p_user_agent)
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. AUTOMATIC AUDIT TRIGGERS
-- ============================================

-- Trigger for media_files changes
CREATE OR REPLACE FUNCTION audit_media_files()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit(
      NEW.uploaded_by,
      'upload',
      'document',
      NEW.id,
      jsonb_build_object('filename', NEW.file_name, 'size', NEW.file_size)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_audit(
      NEW.uploaded_by,
      'update',
      'document',
      NEW.id,
      jsonb_build_object('old_name', OLD.file_name, 'new_name', NEW.file_name)
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit(
      OLD.uploaded_by,
      'delete',
      'document',
      OLD.id,
      jsonb_build_object('filename', OLD.file_name)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER media_files_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON media_files
  FOR EACH ROW EXECUTE FUNCTION audit_media_files();

-- Trigger for permission changes
CREATE OR REPLACE FUNCTION audit_permissions()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit(
      NEW.granted_by,
      'grant_permission',
      'permission',
      NEW.id,
      jsonb_build_object(
        'document_id', NEW.document_id,
        'target_type', NEW.permission_type,
        'target_id', NEW.permission_target,
        'access_level', NEW.access_level
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit(
      OLD.granted_by,
      'revoke_permission',
      'permission',
      OLD.id,
      jsonb_build_object(
        'document_id', OLD.document_id,
        'target_type', OLD.permission_type,
        'target_id', OLD.permission_target,
        'access_level', OLD.access_level
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER permissions_audit_trigger
  AFTER INSERT OR DELETE ON document_permissions
  FOR EACH ROW EXECUTE FUNCTION audit_permissions();

-- ============================================
-- 5. AUDIT QUERY HELPERS
-- ============================================

-- Get audit trail for a specific document
CREATE OR REPLACE FUNCTION get_document_audit_trail(p_document_id UUID)
RETURNS TABLE (
  id UUID,
  action VARCHAR(100),
  username VARCHAR(255),
  created_at TIMESTAMP,
  metadata JSONB,
  ip_address INET
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    u.username,
    al.created_at,
    al.metadata,
    al.ip_address
  FROM audit_logs al
  LEFT JOIN users u ON al.user_id = u.id
  WHERE al.resource_type = 'document' 
    AND al.resource_id = p_document_id
  ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get recent activity for a user
CREATE OR REPLACE FUNCTION get_user_activity(p_user_id UUID, p_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id UUID,
  created_at TIMESTAMP,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.resource_type,
    al.resource_id,
    al.created_at,
    al.metadata
  FROM audit_logs al
  WHERE al.user_id = p_user_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMIT;
