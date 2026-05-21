-- ========================================================
-- MIGRATION: CRÉATION DU SYSTÈME DE MODE CONSTRUCTION
-- ========================================================

DO $$
BEGIN
    -- 🏗️ 1. TABLE
    CREATE TABLE IF NOT EXISTS public.construction_mode (
        id SERIAL PRIMARY KEY,
        is_enabled BOOLEAN DEFAULT false,
        message TEXT DEFAULT 'Site en maintenance. Revenez bientôt.',
        estimated_end_date TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- 📝 2. INITIAL ROW
    IF NOT EXISTS (SELECT 1 FROM public.construction_mode WHERE id = 1) THEN
        INSERT INTO public.construction_mode (id, is_enabled) VALUES (1, false);
    END IF;

    -- 📑 3. ENSURE OTHER SYSTEM TABLES EXIST (Safety check for 500 errors)
    CREATE TABLE IF NOT EXISTS public.menu_items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        parent_id INTEGER REFERENCES public.menu_items(id) ON DELETE CASCADE,
        menu_order INTEGER DEFAULT 0,
        menu_type TEXT DEFAULT 'main',
        is_active BOOLEAN DEFAULT true,
        icon_name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

END $$;
