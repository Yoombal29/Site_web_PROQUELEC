-- ========================================================
-- MIGRATION: CRÉATION DES PAGES MANQUANTES POUR LE MENU
-- ========================================================

DO $$
DECLARE
    p_content text := '<div class="p-20 text-center prose lg:prose-xl mx-auto"><h2>Page en cours de développement</h2><p>Le contenu de cette section est en cours de validation technique.</p><a href="/" class="text-proqblue font-bold">Retour à l''accueil</a></div>';
BEGIN

    -- 🔍 1. SOUS-PAGES ACTIONS
    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title)
    VALUES 
    ('Sensibilisation', 'actions/sensibilisation', p_content, p_content, true, 'published', 'Rayonnement & Prévention'),
    ('Mise en conformité', 'actions/conformite', p_content, p_content, true, 'published', 'Mise aux Normes'),
    ('Sécurisation Marchés', 'actions/securisation', p_content, p_content, true, 'published', 'Marchés Sûrs'),
    ('Collectivités locales', 'actions/collectivites', p_content, p_content, true, 'published', 'Services aux Communes')
    ON CONFLICT (slug) DO UPDATE SET is_published = true, status = 'published';

    -- 👨‍🏫 2. SOUS-PAGES FORMATIONS
    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title)
    VALUES 
    ('Formation Artisans', 'formations/artisans', p_content, p_content, true, 'published', 'Parcours Artisan'),
    ('Formation Collectivités', 'formations/collectivites', p_content, p_content, true, 'published', 'Expertise Territoriale'),
    ('Ressources Pédagogiques', 'ressources-pedagogiques', p_content, p_content, true, 'published', 'Outils d''Apprentissage')
    ON CONFLICT (slug) DO UPDATE SET is_published = true, status = 'published';

    -- 📅 3. ÉVÉNEMENTS
    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title)
    VALUES 
    ('Séminaires', 'evenements/seminaires', p_content, p_content, true, 'published', 'Nos Séminaires'),
    ('Ateliers', 'evenements/ateliers', p_content, p_content, true, 'published', 'Ateliers Pratiques'),
    ('Conférences', 'evenements/conferences', p_content, p_content, true, 'published', 'Conférences Normatives')
    ON CONFLICT (slug) DO UPDATE SET is_published = true, status = 'published';

    -- 📰 4. PRESSE & COMM
    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title)
    VALUES 
    ('Communiqués', 'presse/communiques', p_content, p_content, true, 'published', 'Communiqués Officiels'),
    ('Revue de Presse', 'presse/revue', p_content, p_content, true, 'published', 'PROQUELEC dans les Médias'),
    ('FAQ', 'faq', p_content, p_content, true, 'published', 'Questions Fréquentes'),
    ('Publications', 'publications', p_content, p_content, true, 'published', 'Nos Publications')
    ON CONFLICT (slug) DO UPDATE SET is_published = true, status = 'published';

    -- 🖼️ 5. RÉALISATIONS
    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title)
    VALUES 
    ('Galerie Photos', 'galerie', p_content, p_content, true, 'published', 'Notre Galerie'),
    ('Témoignages Clients', 'temoignages', p_content, p_content, true, 'published', 'Paroles d''Acteurs'),
    ('Projets & Réalisations', 'projets', p_content, p_content, true, 'published', 'Nos Réalisations')
    ON CONFLICT (slug) DO UPDATE SET is_published = true, status = 'published';

    -- 🔑 6. PORTAIL
    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title)
    VALUES 
    ('Suivi des Marchés', 'portal/marches', p_content, p_content, true, 'published', 'Dashboard Marchés'),
    ('Espace Formations', 'portal/formations', p_content, p_content, true, 'published', 'Espace Apprenant'),
    ('Tableau de Bord', 'portal/dashboard', p_content, p_content, true, 'published', 'Votre Espace Personnel')
    ON CONFLICT (slug) DO UPDATE SET is_published = true, status = 'published';

    -- 🏢 7. PARTENAIRES
    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title)
    VALUES 
    ('Liste des Partenaires', 'partenaires-liste', p_content, p_content, true, 'published', 'Nos Partenaires')
    ON CONFLICT (slug) DO UPDATE SET is_published = true, status = 'published';

    -- ✅ FORCE PUBLISH ON ABOUT (to fix potential issue)
    UPDATE pages SET is_published = true, status = 'published' WHERE slug = 'about';

END $$;
