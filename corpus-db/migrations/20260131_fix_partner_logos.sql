-- Fix schema issues and broken partner logos
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='partners' AND column_name='updated_at') THEN
        ALTER TABLE public.partners ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Fix broken partner logos and update with modern Unsplash IDs
UPDATE public.partners 
SET logo_url = 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=200'
WHERE name = 'SENELEC';

UPDATE public.partners 
SET logo_url = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200'
WHERE name = 'FISUEL';

UPDATE public.partners 
SET logo_url = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200'
WHERE name = 'CNC';

-- Also ensure they are active and displayed correctly
UPDATE public.partners
SET is_active = true,
    display_order = CASE 
        WHEN name = 'SENELEC' THEN 1
        WHEN name = 'FISUEL' THEN 2
        WHEN name = 'CNC' THEN 3
        ELSE 10
    END;
