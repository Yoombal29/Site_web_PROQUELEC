-- ========================================================
-- MIGRATION: SOVEREIGNTY FINAL CLEANUP
-- ========================================================
-- 1. Ensure Local Realtime Publication exists
-- 2. Fix Pages schema for legacy content compatibility
-- 3. Fix ICE Engine auto-versioning
-- ========================================================

-- 1️⃣ CREATE LOCAL PUBLICATION
-- Replaces 'proquelec_realtime' for 100% sovereign environment
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'proquelec_realtime') THEN
        CREATE PUBLICATION proquelec_realtime;
    END IF;
END $$;

-- 2️⃣ FIX PAGES SCHEMA
-- Adding columns used by some legacy content migrations
ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS hero_description TEXT,
ADD COLUMN IF NOT EXISTS hero_badge TEXT,
ADD COLUMN IF NOT EXISTS hero_gradient TEXT,
ADD COLUMN IF NOT EXISTS hero_buttons JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS content_sections JSONB DEFAULT '[]'::jsonb;

-- 3️⃣ FIX ICE ENGINE AUTO-VERSIONING
-- Ensuring the function handles missing hashes correctly and doesn't crash
CREATE OR REPLACE FUNCTION auto_page_versioning() RETURNS trigger AS $$
DECLARE
    previous_content text;
    previous_hash text;
    diff jsonb;
BEGIN
    -- Safeguard: Only run if content_raw changed
    IF (TG_OP = 'UPDATE' AND OLD.content_raw IS NOT DISTINCT FROM NEW.content_raw) THEN
        RETURN NEW;
    END IF;

    -- Get previous version content (if exists)
    SELECT content_raw, content_hash
    INTO previous_content, previous_hash
    FROM public.page_versions
    WHERE page_id = NEW.id
    ORDER BY version DESC
    LIMIT 1;

    IF NOT FOUND THEN
        previous_content := NULL;
        previous_hash := NULL;
    END IF;

    -- Compute diff
    diff := jsonb_build_object(
        'previous', COALESCE(previous_content, ''),
        'new', COALESCE(NEW.content_raw, '')
    );

    -- Insert new version
    INSERT INTO public.page_versions(
        page_id, version, content_raw, content_hash, diff_from_previous, created_by
    ) VALUES (
        NEW.id,
        COALESCE(OLD.version, 0) + 1,
        COALESCE(NEW.content_raw, ''),
        encode(digest(COALESCE(NEW.content_raw, ''), 'sha256'), 'hex'),
        diff,
        auth.uid()
    );

    -- Update version in pages table
    NEW.version := COALESCE(OLD.version, 0) + 1;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4️⃣ ATTACH TABLES TO LOCAL PUBLICATION
-- Ensuring realtime continues to work locally
DO $$
DECLARE
    tbl_name TEXT;
BEGIN
    FOR tbl_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'construction_mode', 'performance_metrics', 'electrical_certifications',
            'professional_training', 'training_registrations', 'electrical_equipment',
            'electrical_standards', 'pages'
        )
    LOOP
        BEGIN
            EXECUTE 'ALTER PUBLICATION proquelec_realtime ADD TABLE public.' || tbl_name || ';';
        EXCEPTION WHEN OTHERS THEN
            -- Table might already be in publication
        END;
    END LOOP;
    
    RAISE NOTICE '✅ Sovereignty Final Cleanup Completed.';
END $$;
