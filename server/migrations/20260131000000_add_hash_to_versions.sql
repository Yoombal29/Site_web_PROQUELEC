ALTER TABLE office_document_versions
ADD COLUMN IF NOT EXISTS content_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_office_versions_hash ON office_document_versions(content_hash);
