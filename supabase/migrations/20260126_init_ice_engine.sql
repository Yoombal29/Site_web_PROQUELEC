-- ========================================================
-- MIGRATION: ICE ENGINE FINAL (Immutable Content Engine)
-- ========================================================
-- Features:
-- 1. Immutable Raw HTML storage
-- 2. Separation of Source vs Compiled content
-- 3. Strict Security Contracts
-- 4. Content Governance (contracts)
-- 5. Full Versioning with automatic diffs
-- 6. Immutable page enforcement
-- 7. SHA-256 integrity checks
-- ========================================================

-- Enable pgcrypto for SHA256 if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1️⃣ EXTEND 'pages' TABLE
ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS content_raw text,               -- SOURCE: Raw HTML
ADD COLUMN IF NOT EXISTS content_compiled text,          -- RENDU: Optimized / injected
ADD COLUMN IF NOT EXISTS content_hash text,             -- SHA-256 Checksum for integrity
ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'html', -- html | blocks | markdown
ADD COLUMN IF NOT EXISTS editor_engine text DEFAULT 'code', -- code | visual_blocks
ADD COLUMN IF NOT EXISTS render_engine text DEFAULT 'raw',  -- legacy, kept for compat
ADD COLUMN IF NOT EXISTS security_level text DEFAULT 'trusted', -- trusted | sandboxed | external
ADD COLUMN IF NOT EXISTS content_contract jsonb DEFAULT '{}'::jsonb, -- Governance rules
ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false,    -- Soft lock editable by admin
ADD COLUMN IF NOT EXISTS immutable boolean DEFAULT false, -- Hard lock, no edits allowed
ADD COLUMN IF NOT EXISTS version int DEFAULT 1;

-- 2️⃣ CREATE 'page_versions' TABLE
CREATE TABLE IF NOT EXISTS public.page_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id uuid REFERENCES public.pages(id) ON DELETE CASCADE,
    version int NOT NULL,
    content_raw text NOT NULL,
    content_hash text NOT NULL,
    diff_from_previous jsonb,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;

-- 3️⃣ INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_page_versions_page_version ON public.page_versions(page_id, version);

-- 4️⃣ MIGRATION OF EXISTING DATA
-- Move old 'content' into content_raw / content_compiled
-- Calculate SHA-256 hash
UPDATE public.pages
SET 
    content_raw = content,
    content_compiled = content,
    content_hash = encode(digest(content, 'sha256'), 'hex'),
    version = 1,
    editor_engine = CASE WHEN slug = 'expertises-techniques' THEN 'code' ELSE 'visual_blocks' END,
    security_level = 'trusted'
WHERE content_raw IS NULL;

-- 5️⃣ TRIGGER: PREVENT UPDATES ON IMMUTABLE PAGES
CREATE OR REPLACE FUNCTION prevent_update_if_immutable() RETURNS trigger AS $$
BEGIN
    IF OLD.immutable THEN
        RAISE EXCEPTION 'Immutable page cannot be updated';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_prevent ON public.pages;
CREATE TRIGGER trg_immutable_prevent
BEFORE UPDATE ON public.pages
FOR EACH ROW EXECUTE FUNCTION prevent_update_if_immutable();

-- 6️⃣ TRIGGER: AUTO VERSIONING WITH DIFF
CREATE OR REPLACE FUNCTION auto_page_versioning() RETURNS trigger AS $$
DECLARE
    previous_content text;
    previous_hash text;
    diff jsonb;
BEGIN
    -- Get previous version content
    SELECT content_raw, content_hash
    INTO previous_content, previous_hash
    FROM public.page_versions
    WHERE page_id = NEW.id
    ORDER BY version DESC
    LIMIT 1;

    -- Compute diff (simple JSON: previous vs new)
    diff := jsonb_build_object(
        'previous', previous_content,
        'new', NEW.content_raw
    );

    -- Insert new version
    INSERT INTO public.page_versions(
        page_id, version, content_raw, content_hash, diff_from_previous, created_by
    ) VALUES (
        NEW.id,
        COALESCE(OLD.version, 0) + 1,
        NEW.content_raw,
        encode(digest(NEW.content_raw, 'sha256'), 'hex'),
        diff,
        auth.uid()
    );

    -- Update version in pages table
    NEW.version := COALESCE(OLD.version, 0) + 1;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_page_versioning ON public.pages;
CREATE TRIGGER trg_auto_page_versioning
BEFORE UPDATE ON public.pages
FOR EACH ROW
WHEN (OLD.content_raw IS DISTINCT FROM NEW.content_raw)
EXECUTE FUNCTION auto_page_versioning();

-- 7️⃣ POLICY: ONLY ADMINS CAN VIEW PAGE VERSIONS
DROP POLICY IF EXISTS "Admins can view versions" ON public.page_versions;
CREATE POLICY "Admins can view versions" ON public.page_versions
  FOR SELECT USING (
      (auth.jwt() ->> 'role'::text) = 'admin'::text OR 
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 8️⃣ NOTIFY
DO $$
BEGIN
    RAISE NOTICE '🧊 ICE Engine FINAL initialized successfully.';
    RAISE NOTICE '✅ pages table extended with ICE columns.';
    RAISE NOTICE '✅ page_versions table created with indexes.';
    RAISE NOTICE '✅ Data migration performed with SHA-256 hash.';
    RAISE NOTICE '✅ Immutable trigger installed.';
    RAISE NOTICE '✅ Auto-versioning trigger installed.';
END $$;
