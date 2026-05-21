-- Migration pour enrichir le contenu de la page contact
-- Cette migration ajoute du contenu riche pour la page contact dans la table pages

UPDATE pages
SET
  title = 'Contact | PROQUELEC Sénégal',
  meta_description = 'Contactez PROQUELEC pour vos questions sur la sécurité électrique, les certifications et les services. Nous sommes là pour vous aider.',
  meta_keywords = 'contact PROQUELEC, sécurité électrique, formations, certifications, Sénégal',
  hero_title = 'Parlons de votre projet',
  hero_subtitle = 'Nous sommes là pour vous aider',
  hero_description = 'Une question sur nos formations, certifications ou services ? Notre équipe est à votre disposition pour vous accompagner dans vos démarches.',
  hero_badge = '📞 NOUS CONTACTER',
  hero_gradient = 'bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800',
  hero_buttons = '[
    {
      "label": "Envoyer un message",
      "href": "#contact-form",
      "variant": "primary"
    },
    {
      "label": "Voir nos services",
      "href": "/trainings",
      "variant": "secondary"
    }
  ]'::jsonb,
  content_sections = '[
    {
      "type": "contact_info",
      "title": "Nos coordonnées",
      "subtitle": "Plusieurs moyens de nous contacter selon vos besoins",
      "data": [
        {
          "icon": "Mail",
          "title": "Email",
          "content": "contact@proquelec.sn",
          "href": "mailto:contact@proquelec.sn",
          "color": "#3b82f6"
        },
        {
          "icon": "Phone",
          "title": "Téléphone",
          "content": "+221 33 xxx xxxx",
          "href": "tel:+22133xxxxxx",
          "color": "#10b981"
        },
        {
          "icon": "MapPin",
          "title": "Siège Social",
          "content": "Dakar, Sénégal",
          "href": "#",
          "color": "#f59e0b"
        },
        {
          "icon": "Clock",
          "title": "Horaires",
          "content": "Lun - Ven : 08:00 - 17:00\\nSamedi : 09:00 - 13:00\\nDimanche : Fermé",
          "href": "#",
          "color": "#dc2626"
        }
      ]
    },
    {
      "type": "contact_form",
      "title": "Envoyez-nous un message",
      "subtitle": "Remplissez le formulaire ci-dessous et nous vous répondrons sous 24h",
      "quick_actions": [
        {
          "icon": "MessageCircle",
          "title": "Chat en direct",
          "description": "Obtenez une réponse immédiate",
          "action": "Ouvrir le chat"
        },
        {
          "icon": "FileText",
          "title": "Documentation",
          "description": "Consultez nos guides et FAQ",
          "action": "Voir la documentation"
        },
        {
          "icon": "Users",
          "title": "Support technique",
          "description": "Assistance spécialisée",
          "action": "Contacter le support"
        }
      ]
    },
    {
      "type": "map_section",
      "title": "Notre localisation",
      "subtitle": "Situés au cœur de Dakar, nous sommes facilement accessibles",
      "map_embed": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.752449237558!2d-17.5579!3d14.7167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec172c40177d8e9%3A0x123456789!2sImmueble%20Coumba%20Castel%20Dakar!5e0!3m2!1sfr!2ssn!4v1234567890",
      "address": "Immeubles Coumba Castel Dakar | 4e étage | Dakar, Sénégal"
    },
    {
      "type": "cta_section",
      "title": "Besoin d''une assistance immédiate ?",
      "subtitle": "Consultez notre FAQ ou utilisez notre chat en direct pour une réponse instantanée.",
      "buttons": [
        {
          "label": "Ouvrir le chat en direct",
          "variant": "primary"
        },
        {
          "label": "Consulter la FAQ",
          "variant": "secondary"
        }
      ]
    }
  ]'::jsonb,
  updated_at = NOW()
WHERE slug = 'contact';

-- Si la page contact n'existe pas encore, l'insérer
INSERT INTO pages (
  slug,
  title,
  meta_description,
  meta_keywords,
  hero_title,
  hero_subtitle,
  hero_description,
  hero_badge,
  hero_gradient,
  hero_buttons,
  content_sections,
  created_at,
  updated_at
) VALUES (
  'contact',
  'Contact | PROQUELEC Sénégal',
  'Contactez PROQUELEC pour vos questions sur la sécurité électrique, les certifications et les services. Nous sommes là pour vous aider.',
  'contact PROQUELEC, sécurité électrique, formations, certifications, Sénégal',
  'Parlons de votre projet',
  'Nous sommes là pour vous aider',
  'Une question sur nos formations, certifications ou services ? Notre équipe est à votre disposition pour vous accompagner dans vos démarches.',
  '📞 NOUS CONTACTER',
  'bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800',
  '[
    {
      "label": "Envoyer un message",
      "href": "#contact-form",
      "variant": "primary"
    },
    {
      "label": "Voir nos services",
      "href": "/trainings",
      "variant": "secondary"
    }
  ]'::jsonb,
  '[
    {
      "type": "contact_info",
      "title": "Nos coordonnées",
      "subtitle": "Plusieurs moyens de nous contacter selon vos besoins",
      "data": [
        {
          "icon": "Mail",
          "title": "Email",
          "content": "contact@proquelec.sn",
          "href": "mailto:contact@proquelec.sn",
          "color": "#3b82f6"
        },
        {
          "icon": "Phone",
          "title": "Téléphone",
          "content": "+221 33 xxx xxxx",
          "href": "tel:+22133xxxxxx",
          "color": "#10b981"
        },
        {
          "icon": "MapPin",
          "title": "Siège Social",
          "content": "Dakar, Sénégal",
          "href": "#",
          "color": "#f59e0b"
        },
        {
          "icon": "Clock",
          "title": "Horaires",
          "content": "Lun - Ven : 08:00 - 17:00\\nSamedi : 09:00 - 13:00\\nDimanche : Fermé",
          "href": "#",
          "color": "#dc2626"
        }
      ]
    },
    {
      "type": "contact_form",
      "title": "Envoyez-nous un message",
      "subtitle": "Remplissez le formulaire ci-dessous et nous vous répondrons sous 24h",
      "quick_actions": [
        {
          "icon": "MessageCircle",
          "title": "Chat en direct",
          "description": "Obtenez une réponse immédiate",
          "action": "Ouvrir le chat"
        },
        {
          "icon": "FileText",
          "title": "Documentation",
          "description": "Consultez nos guides et FAQ",
          "action": "Voir la documentation"
        },
        {
          "icon": "Users",
          "title": "Support technique",
          "description": "Assistance spécialisée",
          "action": "Contacter le support"
        }
      ]
    },
    {
      "type": "map_section",
      "title": "Notre localisation",
      "subtitle": "Situés au cœur de Dakar, nous sommes facilement accessibles",
      "map_embed": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.752449237558!2d-17.5579!3d14.7167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec172c40177d8e9%3A0x123456789!2sImmueble%20Coumba%20Castel%20Dakar!5e0!3m2!1sfr!2ssn!4v1234567890",
      "address": "Immeubles Coumba Castel Dakar | 4e étage | Dakar, Sénégal"
    },
    {
      "type": "cta_section",
      "title": "Besoin d''une assistance immédiate ?",
      "subtitle": "Consultez notre FAQ ou utilisez notre chat en direct pour une réponse instantanée.",
      "buttons": [
        {
          "label": "Ouvrir le chat en direct",
          "variant": "primary"
        },
        {
          "label": "Consulter la FAQ",
          "variant": "secondary"
        }
      ]
    }
  ]'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;
