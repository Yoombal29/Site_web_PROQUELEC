-- Migration: Ajouter les colonnes manquantes à site_settings
-- Date: 2024-01-22

-- Ajouter les colonnes manquantes si elles n'existent pas
DO $$
BEGIN
    -- Vérifier et ajouter chaque colonne une par une
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'primary_color') THEN
        ALTER TABLE site_settings ADD COLUMN primary_color TEXT DEFAULT '#2376df';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'secondary_color') THEN
        ALTER TABLE site_settings ADD COLUMN secondary_color TEXT DEFAULT '#ffffff';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'text_color') THEN
        ALTER TABLE site_settings ADD COLUMN text_color TEXT DEFAULT '#333333';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'background_color') THEN
        ALTER TABLE site_settings ADD COLUMN background_color TEXT DEFAULT '#ffffff';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'font_family') THEN
        ALTER TABLE site_settings ADD COLUMN font_family TEXT DEFAULT 'Inter, sans-serif';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'logo_url') THEN
        ALTER TABLE site_settings ADD COLUMN logo_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'favicon_url') THEN
        ALTER TABLE site_settings ADD COLUMN favicon_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'meta_description') THEN
        ALTER TABLE site_settings ADD COLUMN meta_description TEXT DEFAULT 'PROQUELEC - Organisme national de référence pour la qualité et la sécurité des installations électriques au Sénégal';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'meta_keywords') THEN
        ALTER TABLE site_settings ADD COLUMN meta_keywords TEXT DEFAULT 'PROQUELEC, qualité électrique, sécurité installations, Sénégal, normes électriques';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_email') THEN
        ALTER TABLE site_settings ADD COLUMN contact_email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_phone') THEN
        ALTER TABLE site_settings ADD COLUMN contact_phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'address') THEN
        ALTER TABLE site_settings ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'social_facebook') THEN
        ALTER TABLE site_settings ADD COLUMN social_facebook TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'social_linkedin') THEN
        ALTER TABLE site_settings ADD COLUMN social_linkedin TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'social_twitter') THEN
        ALTER TABLE site_settings ADD COLUMN social_twitter TEXT;
    END IF;

    -- Mettre à jour les paramètres par défaut si la table est vide
    IF NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1) THEN
        INSERT INTO site_settings (
            site_name,
            slogan,
            primary_color,
            secondary_color,
            text_color,
            background_color,
            font_family,
            meta_description,
            meta_keywords
        ) VALUES (
            'PROQUELEC',
            'Information · Sensibilisation · Conseil',
            '#2376df',
            '#ffffff',
            '#333333',
            '#ffffff',
            'Inter, sans-serif',
            'PROQUELEC - Organisme national de référence pour la qualité et la sécurité des installations électriques au Sénégal',
            'PROQUELEC, qualité électrique, sécurité installations, Sénégal, normes électriques, certifications, formations'
        );
    END IF;

END $$;

-- Créer un index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_site_settings_id ON site_settings(id);

-- Message de confirmation
SELECT '✅ Migration site_settings terminée avec succès !' as status;
