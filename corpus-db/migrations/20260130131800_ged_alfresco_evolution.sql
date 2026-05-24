-- PHASE 5: GED EVOLUTION (Document Management Enhancements)
-- Enhancing media_files for intelligence and structure
COMMENT ON COLUMN public.media_files.folder_path IS 'Virtual hierarchical path for document organization (e.g., /02_TECHNIQUE/Plans)';
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS project_id TEXT; -- Link to specific chantiers
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS is_latest BOOLEAN DEFAULT true;

-- 2. Status & Governance
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'; -- draft, pending_review, approved, obsolete
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'; -- For custom attributes like 'Montant HT', 'Fournisseur'

-- 3. Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_media_files_project_folder ON public.media_files (project_id, folder_path);
CREATE INDEX IF NOT EXISTS idx_media_files_status ON public.media_files (status);

-- 4. Initial Folder Structure Seed (Mock for validation)
-- Note: These are 'virtual' folders handled via folder_path
