-- ===========================================
-- MIGRATIONS COMPLETES POUR PROQUELEC
-- À exécuter dans Supabase Studio > SQL Editor
-- ===========================================

-- 1. Créer la fonction update_updated_at_column si elle n'existe pas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Créer la table pages (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  meta_robots TEXT DEFAULT 'index,follow',
  featured_image TEXT,
  template TEXT DEFAULT 'default',
  show_hero BOOLEAN DEFAULT true,
  show_footer BOOLEAN DEFAULT true,
  custom_css TEXT,
  custom_js TEXT,
  header_html TEXT,
  footer_html TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_background_image TEXT,
  hero_cta_text TEXT,
  hero_cta_link TEXT,
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMPTZ,
  unpublish_date TIMESTAMPTZ,
  menu_order INTEGER DEFAULT 0,
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  author TEXT,
  reading_time INTEGER DEFAULT 0,
  parent_id UUID REFERENCES pages(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer les index pour pages
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_is_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_pages_menu_order ON pages(menu_order);
CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id);

-- 4. Créer la table page_sections
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('hero', 'content', 'features', 'testimonials', 'cta', 'gallery', 'contact', 'newsletter', 'custom')),
  title TEXT,
  content TEXT,
  image_url TEXT,
  settings JSONB DEFAULT '{}',
  section_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Index pour page_sections
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_section_type ON page_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_page_sections_section_order ON page_sections(section_order);
CREATE INDEX IF NOT EXISTS idx_page_sections_is_visible ON page_sections(is_visible);

-- 6. Créer les autres tables nécessaires
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID,
  form_name TEXT,
  data JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT,
  recipient_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 7. Index pour les autres tables
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON form_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 8. Activer RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 9. Politiques de sécurité
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pages' AND policyname = 'Public can read published pages') THEN
        CREATE POLICY "Public can read published pages" ON pages
          FOR SELECT USING (is_published = true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pages' AND policyname = 'Authenticated users can manage all pages') THEN
        CREATE POLICY "Authenticated users can manage all pages" ON pages
          FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_sections' AND policyname = 'Public can read visible page sections') THEN
        CREATE POLICY "Public can read visible page sections" ON page_sections
          FOR SELECT USING (is_visible = true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_sections' AND policyname = 'Authenticated users can manage page sections') THEN
        CREATE POLICY "Authenticated users can manage page sections" ON page_sections
          FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_submissions' AND policyname = 'Users can insert their own form submissions') THEN
        CREATE POLICY "Users can insert their own form submissions" ON form_submissions
          FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_submissions' AND policyname = 'Admins can read all form submissions') THEN
        CREATE POLICY "Admins can read all form submissions" ON form_submissions
          FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can read their own notifications') THEN
        CREATE POLICY "Users can read their own notifications" ON notifications
          FOR SELECT USING (auth.uid() = recipient_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Admins can manage all notifications') THEN
        CREATE POLICY "Admins can manage all notifications" ON notifications
          FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 10. Triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pages_updated_at') THEN
        CREATE TRIGGER update_pages_updated_at
          BEFORE UPDATE ON pages
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_page_sections_updated_at') THEN
        CREATE TRIGGER update_page_sections_updated_at
          BEFORE UPDATE ON page_sections
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_form_submissions_updated_at') THEN
        CREATE TRIGGER update_form_submissions_updated_at
          BEFORE UPDATE ON form_submissions
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notifications_updated_at') THEN
        CREATE TRIGGER update_notifications_updated_at
          BEFORE UPDATE ON notifications
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 11. Insérer les données des pages existantes

-- Page À propos
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

-- Page Activités
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

-- Page Labels
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
  '<h2>Le Label PROQUELEC</h2><p>Le Label PROQUELEC est une marque de qualité qui garantit l''excellence des installations électriques. Il est décerné après un audit rigoureux des compétences et des réalisations des professionnels.</p><h2>Avantages du Label</h2><ul><li><strong>Sécurité Renforcée :</strong> Garantie d''installations électriques conformes aux normes de sécurité internationales</li><li><strong>Reconnaissance Officielle :</strong> Label reconnu par les autorités et les professionnels du secteur électrique</li><li><strong>Avantage Concurrentiel :</strong> Différenciation sur le marché et confiance accrue des clients</li><li><strong>Réseau Professionnel :</strong> Intégration dans un réseau d''entreprises certifiées et reconnues</li></ul><h2>Critères d''Obtention</h2><h3>Sécurité Électrique</h3><ul><li>Conformité aux normes NF C 15-100 et NFC 16-600</li><li>Installation de dispositifs de protection (DDR, disjoncteurs)</li><li>Mise à la terre et protection contre les surtensions</li><li>Maintenance préventive et contrôles réguliers</li></ul><h3>Expertise Technique</h3><ul><li>Qualification professionnelle des intervenants</li><li>Formation continue et mise à jour des compétences</li><li>Utilisation de matériaux et équipements certifiés</li><li>Documentation technique complète et traçable</li></ul><h3>Suivi et Contrôle</h3><ul><li>Audits réguliers par des organismes indépendants</li><li>Suivi des performances et satisfaction client</li><li>Procédures de réclamation et amélioration continue</li><li>Transparence dans les processus et résultats</li></ul><h2>Témoignages</h2><p><strong>SENELEC Services :</strong> "Le label PROQUELEC nous a permis de renforcer notre crédibilité auprès de nos clients institutionnels." - Mamadou Diallo, Directeur Technique</p><p><strong>Electro Dakar :</strong> "L''obtention du label a été un tournant pour notre entreprise. La méthodologie est rigoureuse et professionnelle." - Fatou Sow, Gérante</p><p><strong>Techno Élec SARL :</strong> "Le processus d''audit est transparent et les recommandations toujours constructives pour notre amélioration." - Ibrahima Ndiaye, Responsable Qualité</p>',
  'Découvrez le Label PROQUELEC, marque de qualité pour les professionnels de l''électricité au Sénégal.',
  'Label PROQUELEC, qualité électrique, certification professionnelle, label qualité',
  true,
  true,
  'Nos Labels',
  'Le Label PROQUELEC, garantie d''excellence professionnelle',
  'default',
  3
) ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  meta_description = EXCLUDED.meta_description,
  meta_keywords = EXCLUDED.meta_keywords,
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle;

-- Page Documents
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
  '<h2>Centre de Documentation PROQUELEC</h2><p>Accédez à notre bibliothèque complète de documents techniques, guides professionnels, normes et réglementations.</p><h2>Documents Disponibles</h2><ul><li><strong>Mémentos professionnels :</strong> Guides complets pour les électriciens</li><li><strong>Fiches sécurité :</strong> Informations essentielles sur la sécurité électrique</li><li><strong>Feuillets informatifs :</strong> Documents de synthèse sur les normes</li><li><strong>Guides techniques :</strong> Manuels détaillés pour installations</li><li><strong>Normes de référence :</strong> Textes réglementaires officiels</li></ul><h2>Catégories</h2><p>Nos documents sont organisés par catégories pour faciliter votre recherche : guides, fiches techniques, feuillets informatifs et normes.</p><h2>Téléchargement</h2><p>Tous nos documents sont disponibles gratuitement au téléchargement après inscription.</p>',
  'Téléchargez nos documents techniques, guides professionnels et ressources pour les installations électriques.',
  'documents PROQUELEC, guides électriques, normes sécurité, fiches techniques',
  true,
  true,
  'Documents & Ressources',
  'Bibliothèque complète de documents techniques et professionnels',
  'default',
  4
) ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  meta_description = EXCLUDED.meta_description,
  meta_keywords = EXCLUDED.meta_keywords,
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle;

-- Page Événements
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
  '<h2>Calendrier des Événements PROQUELEC</h2><p>Découvrez nos conférences, ateliers, webinaires et formations. Restez informé des dernières actualités du secteur électrique.</p><h2>Types d''événements</h2><ul><li><strong>Conférences techniques :</strong> Échanges d''expertise sur les normes et innovations</li><li><strong>Ateliers pratiques :</strong> Sessions de formation intensive</li><li><strong>Webinaires en ligne :</strong> Formations à distance accessibles</li><li><strong>Journées portes ouvertes :</strong> Visites de nos installations</li><li><strong>Salons professionnels :</strong> Participation aux événements du secteur</li></ul><h2>Prochains événements</h2><p>Consultez notre calendrier pour connaître les dates des prochains événements et vous inscrire.</p><h2>Inscription</h2><p>L''inscription aux événements est gratuite pour nos membres. Contactez-nous pour plus d''informations.</p>',
  'Découvrez nos événements : conférences, ateliers, webinaires et formations sur l''électricité au Sénégal.',
  'événements PROQUELEC, conférences électriques, ateliers formation, webinaires',
  true,
  true,
  'Événements',
  'Conférences, ateliers et formations professionnelles',
  'default',
  5
) ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  meta_description = EXCLUDED.meta_description,
  meta_keywords = EXCLUDED.meta_keywords,
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle;

-- Page Certifications
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

-- Page Formations
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

-- Page Blog
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

-- Page Contact
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

-- Message de confirmation
SELECT 'Migrations terminées avec succès ! Toutes les tables et données ont été créées.' as status;