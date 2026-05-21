
-- ========================================================
-- ADVANCED RBAC & EVENTS SYSTEM MIGRATION
-- ========================================================

-- Rôles (secondary_admin, partner) déjà ajoutés via 20260122115500_update_enums.sql

-- 2. Create Partners table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    contact_email TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Extend Events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'published'));
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organizer_type TEXT DEFAULT 'proquelec' CHECK (organizer_type IN ('proquelec', 'partner'));
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Enable RLS for Partners
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Partners
-- Everyone can view verified partners
CREATE POLICY "Public can view partners" ON public.partners
    FOR SELECT USING (is_verified = true);

-- Authenticated partners can manage their own profile (pending validation)
CREATE POLICY "Partners can manage their own profile" ON public.partners
    FOR ALL USING (auth.uid() = owner_id);

-- Admins can do everything
CREATE POLICY "Admins manage everything on partners" ON public.partners
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- 6. Updated RLS Policies for Events
DROP POLICY IF EXISTS "Public can read published pages" ON public.events; -- Cleanup old if exists

CREATE POLICY "Public can view published events" ON public.events
    FOR SELECT USING (status = 'published');

CREATE POLICY "Partners can manage own events" ON public.events
    FOR ALL USING (
        organizer_type = 'partner' AND 
        author_id = auth.uid() AND
        (status = 'draft' OR status = 'pending') -- Cannot self-publish or delete once published without admin?
    );

CREATE POLICY "Secondary admins manage Proquelec events" ON public.events
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'secondary_admin') AND
        organizer_type = 'proquelec'
    );

CREATE POLICY "Admins manage everything on events" ON public.events
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- 7. Audit improvements trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
