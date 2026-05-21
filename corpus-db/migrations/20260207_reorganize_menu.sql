-- ========================================================
-- MIGRATION: REORGANISATION DU MENU ET PAGES (v1)
-- ========================================================

DO $$
DECLARE
    -- IDs des menus racines
    m_accueil uuid;
    m_qui_sommes_nous uuid;
    m_utilite_publique uuid;
    m_nos_actions uuid;
    m_formation uuid;
    m_normes uuid;
    m_projets uuid;
    m_actualites uuid;
    m_partenaires uuid;
    m_contact uuid;
    m_portal uuid;
BEGIN
    -- 1️⃣ NETTOYAGE
    DELETE FROM menu_items;

    -- 2️⃣ CRÉATION DES PAGES MANQUANTES (SI BESOIN)
    -- Utilitaire publique
    INSERT INTO pages (title, slug, content, content_raw, is_published, editor_engine)
    VALUES ('Utilité Publique', 'utilite-publique', '<h1>Utilité Publique</h1><p>PROQUELEC sert toute la nation.</p>', '{"blocks": []}', true, 'visual_blocks')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO pages (title, slug, content, content_raw, is_published, editor_engine)
    VALUES ('Espace Autorités', 'espace-autorites', '<h1>Espace Autorités</h1>', '{"blocks": []}', true, 'visual_blocks')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO pages (title, slug, content, content_raw, is_published, editor_engine)
    VALUES ('Espace Ménages', 'espace-menages', '<h1>Espace Ménages</h1>', '{"blocks": []}', true, 'visual_blocks')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO pages (title, slug, content, content_raw, is_published, editor_engine)
    VALUES ('Espace Professionnels', 'espace-professionnels', '<h1>Espace Professionnels</h1>', '{"blocks": []}', true, 'visual_blocks')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO pages (title, slug, content, content_raw, is_published, editor_engine)
    VALUES ('Nos Actions', 'nos-actions', '<h1>Nos Actions</h1>', '{"blocks": []}', true, 'visual_blocks')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO pages (title, slug, content, content_raw, is_published, editor_engine)
    VALUES ('Normes & Ressources', 'normes-ressources', '<h1>Normes & Ressources</h1>', '{"blocks": []}', true, 'visual_blocks')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO pages (title, slug, content, content_raw, is_published, editor_engine)
    VALUES ('Projets & Réalisations', 'projets', '<h1>Projets & Réalisations</h1>', '{"blocks": []}', true, 'visual_blocks')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO pages (title, slug, content, content_raw, is_published, editor_engine)
    VALUES ('Partenaires', 'partenaires-liste', '<h1>Nos Partenaires</h1>', '{"blocks": []}', true, 'visual_blocks')
    ON CONFLICT (slug) DO NOTHING;

    -- 3️⃣ INSERTION DU MENU PRINCIPAL
    -- 1. ACCUEIL
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('ACCUEIL', '/', 1, 'main') RETURNING id INTO m_accueil;

    -- 2. QUI SOMMES-NOUS ?
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('QUI SOMMES-NOUS ?', '/about', 2, 'main') RETURNING id INTO m_qui_sommes_nous;
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Présentation de PROQUELEC', '/about#presentation', m_qui_sommes_nous, 1, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Historique', '/about#history', m_qui_sommes_nous, 2, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Vision & Valeurs', '/about#values', m_qui_sommes_nous, 3, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Équipe dirigeante', '/about#team', m_qui_sommes_nous, 4, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Gouvernance', '/about#governance', m_qui_sommes_nous, 5, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Partenaires institutionnels', '/about#partners', m_qui_sommes_nous, 6, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Rapport annuel', '/documents#report', m_qui_sommes_nous, 7, 'main');

    -- 3. UTILITÉ PUBLIQUE
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('UTILITÉ PUBLIQUE', '/utilite-publique', 3, 'main') RETURNING id INTO m_utilite_publique;
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Pour les Autorités', '/espace-autorites', m_utilite_publique, 1, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Pour les Ménages', '/espace-menages', m_utilite_publique, 2, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Pour les Professionnels', '/espace-professionnels', m_utilite_publique, 3, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Pour les Collectivités locales', '/collectivites', m_utilite_publique, 4, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Pour les Marchés', '/marches', m_utilite_publique, 5, 'main');

    -- 4. NOS ACTIONS
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('NOS ACTIONS', '/nos-actions', 4, 'main') RETURNING id INTO m_nos_actions;
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Sensibilisation', '/actions/sensibilisation', m_nos_actions, 1, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Diagnostics électriques', '/actions/diagnostics', m_nos_actions, 2, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Mise en conformité', '/actions/conformite', m_nos_actions, 3, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Sécurisation marchés', '/actions/securisation', m_nos_actions, 4, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Collectivités', '/actions/collectivites', m_nos_actions, 5, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Études & Expertises', '/expertises-techniques', m_nos_actions, 6, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Projets réalisés', '/projets', m_nos_actions, 7, 'main');

    -- 5. FORMATION & CERTIFICATION
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('FORMATION & CERTIFICATION', '/formations', 5, 'main') RETURNING id INTO m_formation;
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Catalogue', '/formations', m_formation, 1, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Calendrier', '/formations#calendrier', m_formation, 2, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Inscription', '/formations#inscription', m_formation, 3, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Certification Électriciens', '/certifications', m_formation, 4, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Form. Collectivités', '/formations/collectivites', m_formation, 5, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Form. Artisans', '/formations/artisans', m_formation, 6, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Ressources Pédago.', '/ressources-pedagogiques', m_formation, 7, 'main');

    -- 6. NORMES & RESSOURCES
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('NORMES & RESSOURCES', '/normes-ressources', 6, 'main') RETURNING id INTO m_normes;
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Normes électriques', '/normative-corpus', m_normes, 1, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Guides pratiques', '/documents#guides', m_normes, 2, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Mementos', '/documents#mementos', m_normes, 3, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Conseils ménages', '/conseils-menages', m_normes, 4, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('FAQ', '/faq', m_normes, 5, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Publications', '/publications', m_normes, 6, 'main');

    -- 7. PROJETS & RÉALISATIONS
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('PROJETS & RÉALISATIONS', '/projets', 7, 'main') RETURNING id INTO m_projets;
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Marchés sécurisés', '/projets#marches-securises', m_projets, 1, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Partenariat SENELEC', '/partenariat-senelec', m_projets, 2, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Études majeures', '/expertises-techniques', m_projets, 3, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Photos Avant/Après', '/galerie', m_projets, 4, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Témoignages', '/temoignages', m_projets, 5, 'main');

    -- 8. ACTUALITÉS & ÉVÉNEMENTS
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('ACTUALITÉS & ÉVÉNEMENTS', '/blog', 8, 'main') RETURNING id INTO m_actualites;
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Anniversaire PROQUELEC', '/evenements/anniversaire', m_actualites, 1, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Séminaires', '/evenements/seminaires', m_actualites, 2, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Ateliers', '/evenements/ateliers', m_actualites, 3, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Conférences', '/evenements/conferences', m_actualites, 4, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Communiqués', '/presse/communiques', m_actualites, 5, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Revue de Presse', '/presse/revue', m_actualites, 6, 'main');

    -- 9. PARTENAIRES
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('PARTENAIRES', '/partenaires-liste', 9, 'main') RETURNING id INTO m_partenaires;
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Institutionnels', '/partenaires#institutionnels', m_partenaires, 1, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Techniques', '/partenaires#techniques', m_partenaires, 2, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Financiers', '/partenaires#financiers', m_partenaires, 3, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Privés', '/partenaires#prives', m_partenaires, 4, 'main');

    -- 10. CONTACT
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('CONTACT', '/contact', 10, 'main') RETURNING id INTO m_contact;
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Formulaire', '/contact#form', m_contact, 1, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Email / Tél', '/contact#info', m_contact, 2, 'main');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Diagnostic / Conseil', '/contact?sujet=diagnostic', m_contact, 3, 'main');

    -- 🔹 MENU SECONDAIRE / FOOTER
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('Espace Autorités', '/espace-autorites', 1, 'footer');
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('Espace Ménages', '/espace-menages', 2, 'footer');
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('Espace Professionnels', '/espace-professionnels', 3, 'footer');
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('Espace Partenaires', '/espace-partenaires', 4, 'footer');
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('Espace Presse', '/presse', 5, 'footer');

    -- 🚀 PORTAIL
    INSERT INTO menu_items (title, url, menu_order, menu_type) VALUES ('PORTAIL PROQUELEC', '#', 11, 'secondary') RETURNING id INTO m_portal;
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Connexion', '/auth', m_portal, 1, 'secondary');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Marchés Sécurisés', '/portal/marches', m_portal, 2, 'secondary');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Dashboard', '/portal/dashboard', m_portal, 3, 'secondary');
    INSERT INTO menu_items (title, url, parent_id, menu_order, menu_type) VALUES ('Espace Formations', '/portal/formations', m_portal, 4, 'secondary');

END $$;
