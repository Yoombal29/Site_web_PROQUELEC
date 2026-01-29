-- Insert initial page data for existing static pages
-- This migration populates the pages table with content from existing static pages

-- Insert About page
INSERT INTO pages (
  id,
  title,
  slug,
  content,
  meta_description,
  meta_keywords,
  is_published,
  show_hero,
  hero_title,
  hero_subtitle,
  template,
  menu_order
) VALUES (
  gen_random_uuid(),
  'À propos de PROQUELEC',
  'about',
  '<h2>Notre Mission</h2><p>PROQUELEC est l''organisme national de référence pour la qualité et la sécurité des installations électriques au Sénégal. Depuis 1995, nous œuvrons pour promouvoir l''excellence professionnelle et assurer la conformité aux normes internationales.</p><h2>Nos Valeurs</h2><ul><li><strong>Sécurité :</strong> Promouvoir des installations électriques sûres et fiables</li><li><strong>Qualité :</strong> Assurer la conformité aux normes internationales</li><li><strong>Excellence :</strong> Reconnaître et valoriser les professionnels de qualité</li><li><strong>Innovation :</strong> Promouvoir les meilleures pratiques modernes</li></ul>',
  'Découvrez PROQUELEC, l''organisme national de référence pour la qualité et la sécurité des installations électriques au Sénégal.',
  'PROQUELEC, qualité électrique, sécurité installations, Sénégal, normes électriques',
  true,
  true,
  'À propos de PROQUELEC',
  'L''organisme national de référence pour la qualité électrique au Sénégal',
  'default',
  1
) ON CONFLICT (slug) DO NOTHING;

-- Insert Activities page
INSERT INTO pages (
  id,
  title,
  slug,
  content,
  meta_description,
  meta_keywords,
  is_published,
  show_hero,
  hero_title,
  hero_subtitle,
  template,
  menu_order
) VALUES (
  gen_random_uuid(),
  'Nos Activités',
  'activities',
  '<h2>Contrôle de conformité des installations électriques</h2><p>Vérification complète et certifications des installations conformes aux normes.</p><h2>Labellisation : évaluation & délivrance du Label PROQUELEC</h2><p>Attribution du label de qualité après audit rigoureux.</p><h2>Formations et habilitations des professionnels</h2><p>Programmes de formation certifiants pour électriciens et techniciens.</p><h2>Audits énergétiques & diagnostics techniques</h2><p>Analyse approfondie de la performance énergétique de vos installations.</p><h2>Bilan électrique, conseils et sensibilisation des usagers</h2><p>Évaluation complète et recommandations pour optimiser votre utilisation.</p><h2>Accompagnement à la certification électrique</h2><p>Soutien complet dans votre démarche de certification professionnelle.</p><h2>Veille réglementaire et technique</h2><p>Suivi constant des normes et évolutions du secteur électrique.</p>',
  'Découvrez toutes nos activités : contrôle de conformité, labellisation, formations, audits énergétiques et accompagnement à la certification.',
  'activités PROQUELEC, contrôle conformité, labellisation, formations électriques, audits énergétiques',
  true,
  true,
  'Nos Activités',
  'Découvrez l''ensemble de nos services et missions',
  'default',
  2
) ON CONFLICT (slug) DO NOTHING;

-- Insert Labels page
INSERT INTO pages (
  id,
  title,
  slug,
  content,
  meta_description,
  meta_keywords,
  is_published,
  show_hero,
  hero_title,
  hero_subtitle,
  template,
  menu_order
) VALUES (
  gen_random_uuid(),
  'Nos Labels',
  'labels',
  '<h2>Le Label PROQUELEC</h2><p>Le Label PROQUELEC est une marque de qualité qui garantit l''excellence des installations électriques. Il est décerné après un audit rigoureux des compétences et des réalisations des professionnels.</p><h2>Avantages du Label</h2><ul><li>Reconnaissance officielle de votre expertise</li><li>Visibilité accrue auprès des clients</li><li>Accès à des marchés privilégiés</li><li>Garantie de qualité pour vos clients</li></ul><h2>Processus d''obtention</h2><p>Le processus de labellisation comprend plusieurs étapes : candidature, audit documentaire, audit sur site, et délivrance du label.</p>',
  'Découvrez le Label PROQUELEC, marque de qualité pour les professionnels de l''électricité au Sénégal.',
  'Label PROQUELEC, qualité électrique, certification professionnelle, label qualité',
  true,
  true,
  'Nos Labels',
  'Le Label PROQUELEC, garantie d''excellence professionnelle',
  'default',
  3
) ON CONFLICT (slug) DO NOTHING;

-- Insert Documents page
INSERT INTO pages (
  id,
  title,
  slug,
  content,
  meta_description,
  meta_keywords,
  is_published,
  show_hero,
  hero_title,
  hero_subtitle,
  template,
  menu_order
) VALUES (
  gen_random_uuid(),
  'Documents & Ressources',
  'documents',
  '<h2>Centre de Documentation PROQUELEC</h2><p>Accédez à notre bibliothèque complète de documents techniques, guides professionnels, normes et réglementations.</p><h2>Documents Disponibles</h2><ul><li>Mémentos professionnels</li><li>Fiches sécurité</li><li>Feuillets informatifs</li><li>Guides techniques</li><li>Normes de référence</li></ul><h2>Catégories</h2><p>Nos documents sont organisés par catégories pour faciliter votre recherche : guides, fiches techniques, feuillets informatifs et normes.</p>',
  'Téléchargez nos documents techniques, guides professionnels et ressources pour les installations électriques.',
  'documents PROQUELEC, guides électriques, normes sécurité, fiches techniques',
  true,
  true,
  'Documents & Ressources',
  'Bibliothèque complète de documents techniques et professionnels',
  'default',
  4
) ON CONFLICT (slug) DO NOTHING;

-- Insert Events page
INSERT INTO pages (
  id,
  title,
  slug,
  content,
  meta_description,
  meta_keywords,
  is_published,
  show_hero,
  hero_title,
  hero_subtitle,
  template,
  menu_order
) VALUES (
  gen_random_uuid(),
  'Événements',
  'events',
  '<h2>Calendrier des Événements PROQUELEC</h2><p>Découvrez nos conférences, ateliers, webinaires et formations. Restez informé des dernières actualités du secteur électrique.</p><h2>Types d''événements</h2><ul><li>Conférences techniques</li><li>Ateliers pratiques</li><li>Webinaires en ligne</li><li>Journées portes ouvertes</li><li>Salons professionnels</li></ul><h2>Prochains événements</h2><p>Consultez notre calendrier pour connaître les dates des prochains événements et vous inscrire.</p>',
  'Découvrez nos événements : conférences, ateliers, webinaires et formations sur l''électricité au Sénégal.',
  'événements PROQUELEC, conférences électriques, ateliers formation, webinaires',
  true,
  true,
  'Événements',
  'Conférences, ateliers et formations professionnelles',
  'default',
  5
) ON CONFLICT (slug) DO NOTHING;

-- Insert Certifications page
INSERT INTO pages (
  id,
  title,
  slug,
  content,
  meta_description,
  meta_keywords,
  is_published,
  show_hero,
  hero_title,
  hero_subtitle,
  template,
  menu_order
) VALUES (
  gen_random_uuid(),
  'Certifications',
  'certifications',
  '<h2>Programme de Certification PROQUELEC</h2><p>Nos certifications valident vos compétences et garantissent votre expertise professionnelle dans le domaine électrique.</p><h2>Certifications Disponibles</h2><ul><li>Certificat d''électricien qualifié</li><li>Certificat de technicien supérieur</li><li>Certificat de maître électricien</li><li>Certifications spécialisées</li></ul><h2>Avantages des certifications</h2><p>Une certification PROQUELEC est reconnue par l''industrie et ouvre de nombreuses opportunités professionnelles.</p>',
  'Découvrez nos programmes de certification pour valider vos compétences en électricité.',
  'certifications PROQUELEC, certificat électricien, qualification professionnelle',
  true,
  true,
  'Certifications',
  'Validez vos compétences avec nos certifications professionnelles',
  'default',
  6
) ON CONFLICT (slug) DO NOTHING;

-- Insert Trainings page
INSERT INTO pages (
  id,
  title,
  slug,
  content,
  meta_description,
  meta_keywords,
  is_published,
  show_hero,
  hero_title,
  hero_subtitle,
  template,
  menu_order
) VALUES (
  gen_random_uuid(),
  'Formations',
  'trainings',
  '<h2>Centre de Formation PROQUELEC</h2><p>Développez vos compétences avec nos formations professionnelles en électricité, du débutant à l''expert.</p><h2>Formations Disponibles</h2><ul><li>Fondamentaux de l''électricité</li><li>Installation électrique résidentielle</li><li>Installation électrique industrielle</li><li>Maintenance et diagnostic</li><li>Efficacité énergétique</li></ul><h2>Méthodes pédagogiques</h2><p>Nos formations combinent théorie et pratique intensive avec des équipements modernes.</p>',
  'Suivez nos formations professionnelles en électricité. Cours pour débutants, intermédiaires et experts avec certification.',
  'formations électriques, cours électricité, formation professionnelle, PROQUELEC',
  true,
  true,
  'Formations Professionnelles',
  'Développez vos compétences électriques avec nos formations certifiées',
  'default',
  7
) ON CONFLICT (slug) DO NOTHING;

-- Insert Blog page
INSERT INTO pages (
  id,
  title,
  slug,
  content,
  meta_description,
  meta_keywords,
  is_published,
  show_hero,
  hero_title,
  hero_subtitle,
  template,
  menu_order
) VALUES (
  gen_random_uuid(),
  'Blog PROQUELEC',
  'blog',
  '<h2>Actualités du Secteur Électrique</h2><p>Restez informé des dernières nouvelles, évolutions réglementaires et conseils pratiques du monde de l''électricité.</p><h2>Catégories d''articles</h2><ul><li>Actualités réglementaires</li><li>Conseils techniques</li><li>Études de cas</li><li>Innovations technologiques</li><li>Formations et certifications</li></ul><h2>Newsletter</h2><p>Abonnez-vous à notre newsletter pour recevoir nos derniers articles directement dans votre boîte mail.</p>',
  'Actualités, conseils et informations sur l''électricité au Sénégal. Restez informé avec le blog PROQUELEC.',
  'blog PROQUELEC, actualités électriques, conseils électricité, Sénégal',
  true,
  true,
  'Blog PROQUELEC',
  'Actualités et conseils du secteur électrique',
  'default',
  8
) ON CONFLICT (slug) DO NOTHING;

-- Insert Contact page
INSERT INTO pages (
  id,
  title,
  slug,
  content,
  meta_description,
  meta_keywords,
  is_published,
  show_hero,
  hero_title,
  hero_subtitle,
  template,
  menu_order
) VALUES (
  gen_random_uuid(),
  'Contact',
  'contact',
  '<h2>Contactez PROQUELEC</h2><p>Notre équipe est à votre disposition pour répondre à toutes vos questions sur nos services, formations et certifications.</p><h2>Coordonnées</h2><p><strong>Adresse :</strong> Dakar, Sénégal<br><strong>Téléphone :</strong> +221 XX XXX XX XX<br><strong>Email :</strong> contact@proquelec.sn</p><h2>Horaires d''ouverture</h2><p>Lundi - Vendredi : 8h00 - 17h00<br>Samedi : 9h00 - 12h00</p>',
  'Contactez PROQUELEC pour vos questions sur les certifications, formations et services électriques.',
  'contact PROQUELEC, coordonnées, Sénégal, support',
  true,
  true,
  'Contactez-nous',
  'Notre équipe est là pour vous accompagner',
  'default',
  9
) ON CONFLICT (slug) DO NOTHING;