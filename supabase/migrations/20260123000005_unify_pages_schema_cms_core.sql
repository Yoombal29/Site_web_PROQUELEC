-- CMS Core Migration: Unify Pages Schema for 2026+ Content Platform

-- 1. Standardize CMS Columns
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS workflow_status TEXT CHECK (workflow_status IN ('draft', 'review', 'approved', 'published')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS is_sticky BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS comment_status TEXT CHECK (comment_status IN ('open', 'closed')) DEFAULT 'closed',
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS plugins_active TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS language_code TEXT DEFAULT 'fr',
ADD COLUMN IF NOT EXISTS translation_of UUID REFERENCES pages(id) ON DELETE SET NULL;

-- 2. Ensure JSONB Columns for Design & SEO (if not already present via previous partial migrations)
-- We use JSONB for future-proofing and schema-driven interpretation.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'design_options') THEN
        ALTER TABLE pages ADD COLUMN design_options JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'seo_options') THEN
        ALTER TABLE pages ADD COLUMN seo_options JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 3. Create Audit Trail Table for Block-level tracking
CREATE TABLE IF NOT EXISTS page_audit_trail (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id),
    change_type TEXT NOT NULL, -- 'content_update', 'status_change', 'design_update'
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Block Versions Table for "Time Travel"
CREATE TABLE IF NOT EXISTS page_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content_blocks JSONB NOT NULL,
    design_options JSONB,
    seo_options JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 5. Indexes for Performance & Search
CREATE INDEX IF NOT EXISTS idx_pages_workflow_status ON pages(workflow_status);
CREATE INDEX IF NOT EXISTS idx_pages_content_blocks ON pages USING GIN (content_blocks);
CREATE INDEX IF NOT EXISTS idx_pages_language_code ON pages(language_code);
CREATE INDEX IF NOT EXISTS idx_page_audit_trail_page_id ON page_audit_trail(page_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);

-- 6. RLS Policies Update for Granular Governance
-- Ensure admins can do everything, but reviewers can only update status
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can manage all pages" ON pages;
DROP POLICY IF EXISTS "Public can read published pages" ON pages;

-- Policy for Public: only published pages in the correct language
CREATE POLICY "Public can read published pages" ON pages
    FOR SELECT USING (is_published = true AND workflow_status = 'published');

-- Policy for Admin: Total Control
CREATE POLICY "Admins have total control" ON pages
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy for Editor/User Role: Can update but not delete if they are authorized
-- (Assuming we have a user_roles table or similar logic)
CREATE POLICY "Authenticated users can read all pages in admin" ON pages
    FOR SELECT TO authenticated USING (true);

-- 7. Trigger for Automatic Updating of published_at
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.workflow_status = 'published' AND (OLD.workflow_status IS NULL OR OLD.workflow_status != 'published')) THEN
        NEW.published_at = NOW();
        NEW.is_published = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_published_at ON pages;
CREATE TRIGGER trigger_set_published_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION set_published_at();
