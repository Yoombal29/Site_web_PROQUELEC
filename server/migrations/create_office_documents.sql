-- Extension nécessaire pour gen_random_uuid() si Postgres < 13
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table pour stocker les documents Office (Word, Excel, PowerPoint)
CREATE TABLE IF NOT EXISTS office_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('document', 'spreadsheet', 'presentation')),
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    template_id VARCHAR(100),
    
    -- Relations
    ged_document_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT office_documents_title_check CHECK (char_length(title) > 0)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_office_documents_type ON office_documents(type);
CREATE INDEX IF NOT EXISTS idx_office_documents_created_by ON office_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_office_documents_created_at ON office_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_office_documents_ged ON office_documents(ged_document_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_office_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_office_documents_updated_at ON office_documents;
CREATE TRIGGER trigger_update_office_documents_updated_at
    BEFORE UPDATE ON office_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_office_documents_updated_at();

-- Table pour versioning des documents Office
CREATE TABLE IF NOT EXISTS office_document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES office_documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(document_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_office_versions_document ON office_document_versions(document_id, version_number DESC);

-- Commentaires
COMMENT ON TABLE office_documents IS 'Stockage des documents Office Suite (Word, Excel, PowerPoint)';
COMMENT ON COLUMN office_documents.type IS 'Type de document: document, spreadsheet, ou presentation';
COMMENT ON COLUMN office_documents.content IS 'Contenu du document au format JSON';
COMMENT ON COLUMN office_documents.metadata IS 'Métadonnées additionnelles (tags, catégories, etc.)';
COMMENT ON COLUMN office_documents.template_id IS 'ID du template utilisé pour créer le document';
COMMENT ON COLUMN office_documents.ged_document_id IS 'Lien vers le document dans la GED si exporté';
