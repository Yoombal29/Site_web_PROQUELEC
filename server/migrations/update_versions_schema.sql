-- Mise à jour du schéma pour le versioning intelligent
ALTER TABLE office_document_versions ADD COLUMN IF NOT EXISTS content_hash TEXT;
