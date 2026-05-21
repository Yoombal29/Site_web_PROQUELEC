-- ========================================================
-- MIGRATION: CONFIGURATION AUDIENCE OFFERS (HOMEPAGE)
-- ========================================================

DO $$
BEGIN
    -- 🏗️ 1. AJOUT DES COLONNES DE CONFIGURATION DANS SITE_SETTINGS
    -- Section Title & Subtitle
    ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS audience_section_title TEXT DEFAULT 'Des Services Sur-Mesure';
    ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS audience_section_subtitle TEXT DEFAULT 'Que vous soyez indépendant, une entreprise ou un expert membre, PROQUELEC vous accompagne avec des outils dédiés.';

    -- Électriciens
    ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS audience_title_electrician TEXT DEFAULT 'Électriciens';
    ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS audience_subtitle_electrician TEXT DEFAULT 'Indépendants & Artisans';
    ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS audience_desc_electrician TEXT DEFAULT 'Accédez aux normes gratuites, nos calculateurs pro et le générateur de schémas pour vos dossiers.';

    -- Professionnels
    ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS audience_title_company TEXT DEFAULT 'Professionnels';
    ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS audience_subtitle_company TEXT DEFAULT 'Entreprises & Installateurs';
    ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS audience_desc_company TEXT DEFAULT 'Gérez vos chantiers, vos certifications et bénéficiez d''une visibilité accrue sur l''annuaire national.';

    -- Membres
    ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS audience_title_member TEXT DEFAULT 'Membres';
    ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS audience_subtitle_member TEXT DEFAULT 'Association & Experts';
    ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS audience_desc_member TEXT DEFAULT 'Participez à la vie de l''institution, bénéficiez d''un support prioritaire et de la veille normative en avant-première.';

    -- 📝 2. MISE À JOUR DES VALEURS PAR DÉFAUT POUR LA LIGNE 1 SI DÉJÀ EXISTANTE
    UPDATE public.site_settings 
    SET 
        audience_section_title = COALESCE(audience_section_title, 'Des Services Sur-Mesure'),
        audience_section_subtitle = COALESCE(audience_section_subtitle, 'Que vous soyez indépendant, une entreprise ou un expert membre, PROQUELEC vous accompagne avec des outils dédiés.'),
        audience_title_electrician = COALESCE(audience_title_electrician, 'Électriciens'),
        audience_subtitle_electrician = COALESCE(audience_subtitle_electrician, 'Indépendants & Artisans'),
        audience_desc_electrician = COALESCE(audience_desc_electrician, 'Accédez aux normes gratuites, nos calculateurs pro et le générateur de schémas pour vos dossiers.'),
        audience_title_company = COALESCE(audience_title_company, 'Professionnels'),
        audience_subtitle_company = COALESCE(audience_subtitle_company, 'Entreprises & Installateurs'),
        audience_desc_company = COALESCE(audience_desc_company, 'Gérez vos chantiers, vos certifications et bénéficiez d''une visibilité accrue sur l''annuaire national.'),
        audience_title_member = COALESCE(audience_title_member, 'Membres'),
        audience_subtitle_member = COALESCE(audience_subtitle_member, 'Association & Experts'),
        audience_desc_member = COALESCE(audience_desc_member, 'Participez à la vie de l''institution, bénéficiez d''un support prioritaire et de la veille normative en avant-première.')
    WHERE id = 1;

END $$;
