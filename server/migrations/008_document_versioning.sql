-- Phase 7.2: Document Versioning (Full Implementation)
-- Add version tracking columns to media_files table

-- ============================================
-- 1. ADD VERSION COLUMNS
-- ============================================

ALTER TABLE media_files 
  ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS parent_version_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_latest BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS version_comment TEXT,
  ADD COLUMN IF NOT EXISTS version_created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS version_created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_media_versions ON media_files(parent_version_id);
CREATE INDEX IF NOT EXISTS idx_media_latest ON media_files(is_latest) WHERE is_latest = true;

-- ============================================
-- 3. UPDATE EXISTING RECORDS
-- ============================================

-- Mark all existing files as version 1.0 and latest
UPDATE media_files 
SET version = '1.0', 
    is_latest = true,
    version_created_at = uploaded_at
WHERE version IS NULL OR version = '';

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to get version history for a document
CREATE OR REPLACE FUNCTION get_document_versions(p_document_id UUID)
RETURNS TABLE (
  id UUID,
  version VARCHAR(20),
  is_latest BOOLEAN,
  version_comment TEXT,
  version_created_at TIMESTAMP,
  version_created_by_name VARCHAR(255),
  file_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mf.id,
    mf.version,
    mf.is_latest,
    mf.version_comment,
    mf.version_created_at,
    u.username as version_created_by_name,
    mf.file_size
  FROM media_files mf
  LEFT JOIN users u ON mf.version_created_by = u.id
  WHERE mf.id = p_document_id 
     OR mf.parent_version_id = p_document_id
     OR mf.id IN (
       SELECT parent_version_id FROM media_files WHERE id = p_document_id
     )
  ORDER BY mf.version_created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to increment version number
CREATE OR REPLACE FUNCTION increment_version(current_version VARCHAR(20))
RETURNS VARCHAR(20) AS $$
DECLARE
  major INT;
  minor INT;
BEGIN
  -- Parse version (assumes format X.Y)
  major := SPLIT_PART(current_version, '.', 1)::INT;
  minor := SPLIT_PART(current_version, '.', 2)::INT;
  
  -- Increment minor version
  minor := minor + 1;
  
  RETURN major || '.' || minor;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGER FOR VERSION MANAGEMENT
-- ============================================

-- Automatically mark old versions as not latest when new version is created
CREATE OR REPLACE FUNCTION update_version_latest()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_version_id IS NOT NULL THEN
    -- Mark all previous versions as not latest
    UPDATE media_files 
    SET is_latest = false 
    WHERE (id = NEW.parent_version_id OR parent_version_id = NEW.parent_version_id)
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER version_latest_trigger
  AFTER INSERT ON media_files
  FOR EACH ROW
  WHEN (NEW.parent_version_id IS NOT NULL)
  EXECUTE FUNCTION update_version_latest();

COMMIT;
