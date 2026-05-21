
-- ========================================================
-- PARTNER VALIDATION SYSTEM
-- ========================================================

-- 1. Add status to user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'rejected'));

-- Par défaut, les nouveaux partenaires seront en 'pending'
-- Les admins existants restent 'active'
UPDATE public.user_roles SET status = 'active' WHERE role = 'admin' AND status IS NULL;

-- 2. Update RLS policies for events to account for status
DROP POLICY IF EXISTS "Partners can manage own events" ON public.events;
CREATE POLICY "Partners can manage own events" ON public.events
    FOR ALL USING (
        organizer_type = 'partner' AND 
        author_id = auth.uid() AND
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'partner' AND status = 'active')
    );

-- 3. Function to handle partner signup (if needed for auto-insert)
CREATE OR REPLACE FUNCTION public.handle_new_partner_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- This would be called from a custom registration logic if not using upsert from frontend
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
