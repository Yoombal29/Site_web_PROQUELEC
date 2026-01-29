-- Correction des slugs pour correspondre aux menus
-- 1. Renommer 'trainings' en 'formations' pour correspondre aux QuickLinks et au nouveau Header
UPDATE public.pages SET slug = 'formations' WHERE slug = 'trainings';

-- 2. Créer la page 'expertises-techniques' si elle n'existe pas
INSERT INTO public.pages (
    title,
    slug,
    content,
    meta_description,
    is_published,
    show_hero,
    hero_title,
    hero_subtitle,
    template
) VALUES (
    'Expertises & Solutions',
    'expertises-techniques',
    '<h2>Nos Expertises Techniques</h2><p>PROQUELEC apporte des solutions concrètes pour la sécurité et la performance de vos installations.</p><ul><li>Audit de conformité</li><li>Conseil en efficacité énergétique</li><li>Dimensionnement de projets</li></ul>',
    'Découvrez l''expertise technique de PROQUELEC au Sénégal.',
    true,
    true,
    'Expertises & Solutions',
    'L''excellence technique au service de votre sécurité',
    'default'
) ON CONFLICT (slug) DO NOTHING;

-- 3. Créer la page 'legal' si elle n'existe pas (en backup de la page React)
INSERT INTO public.pages (
    title,
    slug,
    content,
    meta_description,
    is_published,
    template
) VALUES (
    'Mentions Légales',
    'legal',
    '<h2>Mentions Légales</h2><p>Contenu des mentions légales de PROQUELEC SENEGAL...</p>',
    'Mentions légales et conditions d''utilisation.',
    true,
    'default'
) ON CONFLICT (slug) DO NOTHING;
