-- Migration: Ajouter les colonnes manquantes pour la section audience de la page d'accueil
-- Date: 2026-02-10

DO $$
BEGIN
    -- Titre et Sous-titre de la section
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'audience_section_title') THEN
        ALTER TABLE site_settings ADD COLUMN audience_section_title TEXT DEFAULT 'Des Services Sur-Mesure';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'audience_section_subtitle') THEN
        ALTER TABLE site_settings ADD COLUMN audience_section_subtitle TEXT DEFAULT 'Que vous soyez indépendant, une entreprise ou un expert membre, PROQUELEC vous accompagne avec des outils dédiés.';
    END IF;

    -- Électriciens
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'audience_title_electrician') THEN
        ALTER TABLE site_settings ADD COLUMN audience_title_electrician TEXT DEFAULT 'Électriciens';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'audience_subtitle_electrician') THEN
        ALTER TABLE site_settings ADD COLUMN audience_subtitle_electrician TEXT DEFAULT 'Indépendants & Artisans';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'audience_desc_electrician') THEN
        ALTER TABLE site_settings ADD COLUMN audience_desc_electrician TEXT DEFAULT 'Accédez aux normes gratuites, nos calculateurs pro et le générateur de schémas pour vos dossiers.';
    END IF;

    -- Professionnels (Entreprises)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'audience_title_company') THEN
        ALTER TABLE site_settings ADD COLUMN audience_title_company TEXT DEFAULT 'Professionnels';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'audience_subtitle_company') THEN
        ALTER TABLE site_settings ADD COLUMN audience_subtitle_company TEXT DEFAULT 'Entreprises & Installateurs';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'audience_desc_company') THEN
        ALTER TABLE site_settings ADD COLUMN audience_desc_company TEXT DEFAULT 'Gérez vos chantiers, vos certifications et bénéficiez d''une visibilité accrue sur l''annuaire national.';
    END IF;

    -- Membres
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'audience_title_member') THEN
        ALTER TABLE site_settings ADD COLUMN audience_title_member TEXT DEFAULT 'Membres';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'audience_subtitle_member') THEN
        ALTER TABLE site_settings ADD COLUMN audience_subtitle_member TEXT DEFAULT 'Association & Experts';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'audience_desc_member') THEN
        ALTER TABLE site_settings ADD COLUMN audience_desc_member TEXT DEFAULT 'Participez à la vie de l''institution, bénéficiez d''un support prioritaire et de la veille normative en avant-première.';
    END IF;

END $$;

SELECT '✅ Migration audience_settings terminée avec succès !' as status;
