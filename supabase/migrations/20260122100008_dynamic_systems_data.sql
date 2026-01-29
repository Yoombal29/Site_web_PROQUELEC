-- Données d'exemple pour les systèmes dynamiques
-- À exécuter après avoir créé les tables dans dynamic_systems.sql

-- ===========================================
-- COMPOSANTS DYNAMIQUES D'EXEMPLE
-- ===========================================

-- Hero principal
INSERT INTO dynamic_components (name, component_type, title, subtitle, content, settings) VALUES (
  'hero-principal',
  'hero',
  'Bienvenue chez PROQUELEC',
  'Promotion de la Qualité des Installations Électriques',
  '{
    "badge": "🏆 Depuis 2005 - Référence en Sénégal",
    "description": "Découvrez nos services de formation, certification et audit pour garantir la sécurité et la conformité de vos installations électriques.",
    "backgroundImage": "/images/hero-proquelec.jpg",
    "ctaText": "Découvrir les services",
    "ctaLink": "/about",
    "secondaryCtaText": "Nos formations",
    "secondaryCtaLink": "/formations"
  }',
  '{
    "variant": "gradient",
    "showSearch": true,
    "searchPlaceholder": "Rechercher une formation, certification...",
    "gradient": "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
  }'
);

-- Liens rapides
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

-- Fonctionnalités
INSERT INTO dynamic_components (name, component_type, title, subtitle, content, settings) VALUES (
  'formation-feature',
  'feature',
  'Formations Professionnelles',
  'Des formations adaptées aux besoins du marché sénégalais',
  '{"icon": "book", "link": "/formations"}',
  '{"className": "text-center p-6"}'
);

INSERT INTO dynamic_components (name, component_type, title, subtitle, content, settings) VALUES (
  'certification-feature',
  'feature',
  'Certifications Reconnuues',
  'Certifications conformes aux normes internationales',
  '{"icon": "award", "link": "/certifications"}',
  '{"className": "text-center p-6"}'
);

INSERT INTO dynamic_components (name, component_type, title, subtitle, content, settings) VALUES (
  'audit-feature',
  'feature',
  'Services d''Audit',
  'Évaluation complète de vos installations électriques',
  '{"icon": "check-circle", "link": "/audit"}',
  '{"className": "text-center p-6"}'
);

-- Newsletter
INSERT INTO dynamic_components (name, component_type, title, subtitle, content, settings) VALUES (
  'newsletter-signup',
  'newsletter',
  'Restez informé',
  'Recevez nos actualités et offres spéciales',
  '{"placeholder": "Votre adresse email"}',
  '{"variant": "card", "className": "py-16 bg-blue-50"}'
);

-- Témoignages
INSERT INTO dynamic_components (name, component_type, title, content, settings) VALUES (
  'testimonial-entreprise',
  'testimonial',
  'Excellente formation',
  '{
    "quote": "La formation dispensée par PROQUELEC nous a permis d''améliorer significativement la qualité de nos installations électriques.",
    "author": "M. Diallo, Directeur Technique",
    "company": "SENELEC"
  }',
  '{"className": "max-w-2xl mx-auto"}'
);

-- ===========================================
-- FORMULAIRES DYNAMIQUES D'EXEMPLE
-- ===========================================

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
);

-- ===========================================
-- CONFIGURATION DE THÈME DYNAMIQUE
-- ===========================================

INSERT INTO theme_configurations (name, colors, fonts, spacing, breakpoints, is_active) VALUES (
  'theme-principal',
  '{
    "primary": "#1e40af",
    "secondary": "#64748b",
    "accent": "#f59e0b",
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
);

-- ===========================================
-- INTÉGRATIONS EXTERNES D'EXEMPLE
-- ===========================================

-- Google Analytics (désactivé par défaut pour la démo)
INSERT INTO external_integrations (name, type, provider, config, is_active) VALUES (
  'google-analytics-demo',
  'analytics',
  'google-analytics',
  '{"measurementId": "GA-DEMO-ID"}',
  false
);

-- Matomo Analytics
INSERT INTO external_integrations (name, type, provider, config, is_active) VALUES (
  'matomo-analytics',
  'analytics',
  'matomo',
  '{"trackerUrl": "https://analytics.proquelec.sn/matomo.js"}',
  false
);

-- Intercom Chat
INSERT INTO external_integrations (name, type, provider, config, is_active) VALUES (
  'intercom-chat',
  'crm',
  'intercom',
  '{"appId": "demo-app-id"}',
  false
);

-- Facebook Pixel
INSERT INTO external_integrations (name, type, provider, config, is_active) VALUES (
  'facebook-pixel',
  'social',
  'facebook-pixel',
  '{"pixelId": "DEMO_PIXEL_ID"}',
  false
);

-- ===========================================
-- WORKFLOWS D'EXEMPLE
-- ===========================================

INSERT INTO workflows (name, description, steps, triggers, is_active) VALUES (
  'contact-form-workflow',
  'Workflow de traitement des formulaires de contact',
  '[
    {
      "id": "validate-form",
      "name": "Validation du formulaire",
      "type": "condition",
      "config": {
        "condition": "email",
        "operator": "contains",
        "value": "@"
      },
      "nextSteps": ["send-confirmation", "send-error"]
    },
    {
      "id": "send-confirmation",
      "name": "Envoi de confirmation",
      "type": "notification",
      "config": {
        "type": "email",
        "template": "contact-confirmation",
        "data": {
          "title": "Message reçu",
          "message": "Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais."
        }
      },
      "nextSteps": ["notify-admin"]
    },
    {
      "id": "notify-admin",
      "name": "Notification administrateur",
      "type": "notification",
      "config": {
        "type": "email",
        "recipients": ["admin@proquelec.sn"],
        "template": "admin-notification",
        "data": {
          "title": "Nouveau message de contact",
          "message": "Un nouveau message a été soumis via le formulaire de contact."
        }
      }
    },
    {
      "id": "send-error",
      "name": "Envoi d''erreur",
      "type": "notification",
      "config": {
        "type": "email",
        "template": "form-error",
        "data": {
          "title": "Erreur de validation",
          "message": "Votre message n''a pas pu être envoyé. Vérifiez votre adresse email."
        }
      }
    }
  ]',
  '[{"type": "form_submission", "form_name": "contact-principal"}]',
  true
);

-- ===========================================
-- VÉRIFICATION
-- ===========================================

SELECT
  '✅ Données d''exemple insérées avec succès' as status,
  (SELECT COUNT(*) FROM dynamic_components) as composants_dynamiques,
  (SELECT COUNT(*) FROM dynamic_forms) as formulaires_dynamiques,
  (SELECT COUNT(*) FROM theme_configurations WHERE is_active = true) as themes_actifs,
  (SELECT COUNT(*) FROM external_integrations WHERE is_active = true) as integrations_actives,
  (SELECT COUNT(*) FROM workflows WHERE is_active = true) as workflows_actifs;