-- Ajout des colonnes manquantes dans site_settings si nécessaire
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='site_description') THEN
        ALTER TABLE site_settings ADD COLUMN site_description text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='contact_email') THEN
        ALTER TABLE site_settings ADD COLUMN contact_email text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='contact_phone') THEN
        ALTER TABLE site_settings ADD COLUMN contact_phone text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='address') THEN
        ALTER TABLE site_settings ADD COLUMN address text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='social_links') THEN
        ALTER TABLE site_settings ADD COLUMN social_links jsonb DEFAULT '{}';
    END IF;
END $$;

-- Insertion/Mise à jour des settings
INSERT INTO site_settings (id, site_name, site_description) 
VALUES (1, 'PROQUELEC SÉNÉGAL', 'Promotion de la Qualité des Installations Électriques au Sénégal')
ON CONFLICT (id) DO UPDATE SET site_description = EXCLUDED.site_description;

-- Correction des accents sur la page d'accueil (Version imbriquée pour éviter l'erreur Postgres)
UPDATE pages 
SET title = 'Accueil - PROQUELEC Sénégal',
    content = REPLACE(
                REPLACE(
                  REPLACE(content, 'S?curit?', 'Sécurité'), 
                '?lectriques', 'électriques'),
              'Qualit?', 'Qualité')
WHERE slug = 'home';

-- S'assurer que cover_image_url existe pour blog_posts (au cas où le rename a échoué)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='featured_image') THEN
        ALTER TABLE blog_posts RENAME COLUMN featured_image TO cover_image_url;
    END IF;
END $$;
