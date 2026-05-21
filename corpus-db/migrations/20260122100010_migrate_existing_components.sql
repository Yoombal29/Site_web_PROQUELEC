-- Migration pour transformer les composants existants en composants dynamiques
-- À exécuter après avoir créé les tables dans dynamic_systems.sql

-- ===========================================
-- NETTOYAGE DES DONNÉES EXISTANTES
-- ===========================================

-- Supprimer les anciens composants dynamiques d'exemple s'ils existent
DELETE FROM dynamic_components WHERE name IN (
  'hero-principal',
  'quick-links',
  'formation-feature',
  'certification-feature',
  'audit-feature',
  'newsletter-signup',
  'testimonial-entreprise'
);

-- Supprimer les composants qui pourraient être créés à nouveau
DELETE FROM dynamic_components WHERE name IN (
  'hero-index',
  'hero-about',
  'why-quality-section',
  'quick-links',
  'latest-news',
  'partner-logos',
  'newsletter-signup',
  'about-values',
  'about-milestones'
);

-- Supprimer les formulaires qui pourraient être créés à nouveau
DELETE FROM dynamic_forms WHERE name = 'contact-principal';

-- Supprimer les thèmes qui pourraient être créés à nouveau
DELETE FROM theme_configurations WHERE name = 'theme-proquelec';

-- ===========================================
-- EXTRACTION DES COMPOSANTS DEPUIS LES PAGES EXISTANTES
-- ===========================================

-- Composant Hero de la page Index
INSERT INTO dynamic_components (name, component_type, title, subtitle, content, settings) VALUES (
  'hero-index',
  'hero',
  'Bienvenue chez PROQUELEC',
  'Promotion de la Qualité des Installations Électriques',
  '{
    "badge": "🏆 Depuis 2005 - Référence en Sénégal",
    "description": "Découvrez nos services de formation, certification et audit pour garantir la sécurité et la conformité de vos installations électriques.",
    "ctaText": "Découvrir les services",
    "ctaLink": "/about",
    "secondaryCtaText": "Nos formations",
    "secondaryCtaLink": "/formations"
  }',
  '{
    "variant": "gradient",
    "showSearch": true,
    "searchPlaceholder": "Rechercher une formation, certification...",
    "gradient": "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900",
    "className": "pt-0"
  }'
) ON CONFLICT (name) DO NOTHING;

-- Composant Hero de la page About
INSERT INTO dynamic_components (name, component_type, title, subtitle, content, settings) VALUES (
  'hero-about',
  'hero',
  'À propos de PROQUELEC',
  'Promotion de la Qualité des Installations Électriques',
  '{
    "badge": "💼 Qui sommes-nous ?",
    "description": "Depuis 2005, nous nous engageons à garantir la sécurité et la conformité des installations électriques au Sénégal et en Afrique de l''Ouest.",
    "ctaText": "Nos valeurs",
    "ctaLink": "#values",
    "secondaryCtaText": "Notre histoire",
    "secondaryCtaLink": "#history"
  }',
  '{
    "variant": "default",
    "showSearch": false,
    "className": "bg-proqgray"
  }'
) ON CONFLICT (name) DO NOTHING;

-- Section "Pourquoi la qualité électrique ?" de la page Index
INSERT INTO dynamic_components (name, component_type, title, content, settings) VALUES (
  'why-quality-section',
  'feature',
  'Pourquoi la qualité des installations électriques ?',
  '{
    "features": [
      {
        "icon": "bolt",
        "title": "Sécurité",
        "description": "Réduire les risques d''incendie et d''accident grâce à des installations conformes et contrôlées."
      },
      {
        "icon": "check-circle",
        "title": "Qualité",
        "description": "Assurer la fiabilité, la performance et la longévité de vos équipements électriques."
      },
      {
        "icon": "clock",
        "title": "Conformité",
        "description": "Respecter les normes internationales et locales pour vos projets au Sénégal."
      }
    ]
  }',
  '{
    "layout": "grid",
    "columns": 3,
    "className": "py-16 bg-white/80",
    "containerClass": "max-w-5xl mx-auto px-4 text-center"
  }'
);

-- Composant QuickLinks
INSERT INTO dynamic_components (name, component_type, title, content, settings) VALUES (
  'quick-links',
  'cta',
  'Accès rapide',
  '{
    "links": [
      {"label": "Formations", "href": "/formations", "icon": "book"},
      {"label": "Certifications", "href": "/certifications", "icon": "award"},
      {"label": "Audit", "href": "/audit", "icon": "check-circle"},
      {"label": "Contact", "href": "/contact", "icon": "mail"}
    ]
  }',
  '{"layout": "grid", "columns": 4}'
);

-- Composant LatestNews
INSERT INTO dynamic_components (name, component_type, title, subtitle, content, settings) VALUES (
  'latest-news',
  'feature',
  'Actualités et Événements',
  'Restez informé des dernières nouvelles du secteur électrique',
  '{"source": "database", "maxItems": 3}',
  '{"className": "py-16 bg-gray-50"}'
);

-- Composant PartnerLogos
INSERT INTO dynamic_components (name, component_type, title, content, settings) VALUES (
  'partner-logos',
  'gallery',
  'Nos Partenaires',
  '{
    "logos": [
      {"name": "SENELEC", "image": "/images/partners/senelec.png"},
      {"name": "Ministère de l''Énergie", "image": "/images/partners/ministere.png"},
      {"name": "IEC", "image": "/images/partners/iec.png"}
    ]
  }',
  '{"layout": "grid", "className": "py-16 bg-white"}'
);

-- Composant NewsletterSignup
INSERT INTO dynamic_components (name, component_type, title, subtitle, content, settings) VALUES (
  'newsletter-signup',
  'newsletter',
  'Restez informé',
  'Recevez nos actualités et offres spéciales',
  '{"placeholder": "Votre adresse email"}',
  '{"variant": "banner", "className": "py-16"}'
);

-- ===========================================
-- VALEURS DE LA PAGE ABOUT
-- ===========================================

INSERT INTO dynamic_components (name, component_type, title, content, settings) VALUES (
  'about-values',
  'feature',
  'Nos Valeurs',
  '{
    "values": [
      {
        "icon": "shield",
        "title": "Sécurité",
        "description": "Promouvoir des installations électriques sûres et fiables"
      },
      {
        "icon": "award",
        "title": "Qualité",
        "description": "Assurer la conformité aux normes internationales"
      },
      {
        "icon": "trending-up",
        "title": "Excellence",
        "description": "Reconnaître et valoriser les professionnels de qualité"
      },
      {
        "icon": "lightbulb",
        "title": "Innovation",
        "description": "Promouvoir les meilleures pratiques du secteur"
      }
    ]
  }',
  '{
    "layout": "grid",
    "columns": 2,
    "className": "py-16 bg-white",
    "sectionId": "values"
  }'
);

-- ===========================================
-- JALONS HISTORIQUES DE LA PAGE ABOUT
-- ===========================================

INSERT INTO dynamic_components (name, component_type, title, content, settings) VALUES (
  'about-milestones',
  'feature',
  'Notre Histoire',
  '{
    "milestones": [
      {"year": "1995", "event": "Fondation de PROQUELEC"},
      {"year": "2000", "event": "Mise en place des premiers labels de certification"},
      {"year": "2010", "event": "Expansion des services de formation professionnelle"},
      {"year": "2020", "event": "Digitalisation complète des processus"},
      {"year": "2024", "event": "Modernisation de la plateforme web"}
    ]
  }',
  '{
    "layout": "timeline",
    "className": "py-16 bg-gray-50",
    "sectionId": "history"
  }'
);

-- ===========================================
-- FORMULAIRES EXISTANTS
-- ===========================================

-- Formulaire de contact principal (remplacement du composant NewsletterSignup)
INSERT INTO dynamic_forms (name, title, description, fields, settings, submit_action) VALUES (
  'contact-principal',
  'Contactez-nous',
  'Une question ? N''hésitez pas à nous contacter',
  '[
    {
      "name": "nom",
      "type": "text",
      "label": "Nom complet",
      "placeholder": "Votre nom",
      "required": true
    },
    {
      "name": "email",
      "type": "email",
      "label": "Adresse email",
      "placeholder": "votre@email.com",
      "required": true
    },
    {
      "name": "telephone",
      "type": "tel",
      "label": "Téléphone",
      "placeholder": "+221 XX XXX XX XX"
    },
    {
      "name": "sujet",
      "type": "select",
      "label": "Sujet",
      "required": true,
      "options": [
        {"value": "formation", "label": "Demande de formation"},
        {"value": "certification", "label": "Certification"},
        {"value": "audit", "label": "Audit électrique"},
        {"value": "partenariat", "label": "Partenariat"},
        {"value": "autre", "label": "Autre"}
      ]
    },
    {
      "name": "message",
      "type": "textarea",
      "label": "Message",
      "placeholder": "Votre message...",
      "required": true
    },
    {
      "name": "newsletter",
      "type": "checkbox",
      "label": "S''inscrire à la newsletter"
    }
  ]',
  '{
    "submitText": "Envoyer le message",
    "emailRecipient": "contact@proquelec.sn",
    "emailSubject": "Nouveau message depuis le site web"
  }',
  'email'
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- CONFIGURATION DE THÈME ACTUELLE
-- ===========================================

-- Thème basé sur les couleurs utilisées dans le projet
INSERT INTO theme_configurations (name, colors, fonts, spacing, breakpoints, is_active) VALUES (
  'theme-proquelec',
  '{
    "primary": "#1e40af",
    "secondary": "#64748b",
    "accent": "#f59e0b",
    "proqblue": "#1e40af",
    "proqgray": "#f8f9fa",
    "background": "#ffffff",
    "surface": "#f8fafc",
    "text": "#1e293b",
    "text-secondary": "#64748b",
    "border": "#e2e8f0",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444"
  }',
  '{
    "heading": "Inter, sans-serif",
    "body": "Roboto, sans-serif",
    "mono": "JetBrains Mono, monospace"
  }',
  '{
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem"
  }',
  '{
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1536px"
  }',
  true
) ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- VÉRIFICATION
-- ===========================================

SELECT
  '✅ Migration des composants existants terminée' as status,
  (SELECT COUNT(*) FROM dynamic_components) as composants_dynamiques,
  (SELECT COUNT(*) FROM dynamic_forms) as formulaires_dynamiques,
  (SELECT COUNT(*) FROM theme_configurations WHERE is_active = true) as themes_actifs;
