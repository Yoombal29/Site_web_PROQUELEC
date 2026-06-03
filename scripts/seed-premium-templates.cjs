#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────
 * SEED PREMIUM TEMPLATES — PROQUELEC
 * Injecte des templates de page premium dans la base,
 * prêts à être utilisés par le God Mode Builder.
 * ─────────────────────────────────────────────────────────
 *
 * Usage: node scripts/seed-premium-templates.cjs [--dry-run]
 *
 * Chaque template est une structure Craft.js complète
 * avec des designs épurés et modernes.
 * ─────────────────────────────────────────────────────────
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'proquelec',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
};

const DRY_RUN = process.argv.includes('--dry-run');

// ── Premium Templates (Craft.js structures) ────────────

function premiumHero(accentColor = '#2563eb') {
  return {
    ROOT: {
      type: 'div',
      nodes: ['hero_container'],
      props: { style: {} },
      linkedNodes: {},
    },
    hero_container: {
      type: 'ContainerBlock',
      nodes: ['hero_section', 'hero_text', 'hero_buttons'],
      props: { padding: 80, paddingY: 60, backgroundColor: '#f8fafc', maxWidth: '100%' },
      parent: 'ROOT',
      linkedNodes: {},
    },
    hero_section: {
      type: 'HeroBlock',
      nodes: [],
      props: {
        headline: 'Titre Principal',
        subheadline: 'Sous-titre élégant pour captiver votre audience',
        badgeText: 'PREMIUM',
        ctaLabel: 'Commencer',
        ctaHref: '#',
        accentColor,
        showStats: false,
      },
      parent: 'hero_container',
      linkedNodes: {},
    },
    hero_text: {
      type: 'TextBlock',
      nodes: [],
      props: {
        text: '<p style="font-size:1.1rem;color:#64748b;line-height:1.8">Description convaincante de votre offre ou service. Mettez en avant les bénéfices clés pour engager vos visiteurs.</p>',
        fontSize: 16,
        lineHeight: 1.8,
        color: '#475569',
      },
      parent: 'hero_container',
      linkedNodes: {},
    },
    hero_buttons: {
      type: 'ButtonBlock',
      nodes: [],
      props: {
        label: 'En savoir plus →',
        href: '#',
        backgroundColor: accentColor,
        textColor: '#ffffff',
        size: 'large',
        fullWidth: false,
        rounded: true,
      },
      parent: 'hero_container',
      linkedNodes: {},
    },
  };
}

function premiumFeatures(accentColor = '#2563eb') {
  return {
    ROOT: {
      type: 'div',
      nodes: ['features_section'],
      props: { style: {} },
      linkedNodes: {},
    },
    features_section: {
      type: 'ContainerBlock',
      nodes: ['features_header', 'features_grid'],
      props: { padding: 64, paddingY: 48, backgroundColor: '#ffffff', maxWidth: '1200px' },
      parent: 'ROOT',
      linkedNodes: {},
    },
    features_header: {
      type: 'TextBlock',
      nodes: [],
      props: {
        text: '<h2 style="text-align:center;font-size:2rem;font-weight:800;color:#0f172a">Nos Services Premium</h2><p style="text-align:center;font-size:1.1rem;color:#64748b;margin-top:0.5rem">Découvrez comment nous pouvons vous accompagner</p>',
        fontSize: 16,
        textAlign: 'center',
        color: '#475569',
      },
      parent: 'features_section',
      linkedNodes: {},
    },
    features_grid: {
      type: 'ColumnsBlock',
      nodes: ['feature_1', 'feature_2', 'feature_3'],
      props: { columns: 3, gap: 24 },
      parent: 'features_section',
      linkedNodes: {},
    },
    feature_1: {
      type: 'IconBoxBlock',
      nodes: [],
      props: {
        icon: 'Zap',
        title: 'Performance',
        text: 'Solutions optimisées pour des résultats mesurables et durables.',
        layout: 'card',
        accentColor,
        backgroundColor: '#f8fafc',
        textColor: '#334155',
      },
      parent: 'features_grid',
      linkedNodes: {},
    },
    feature_2: {
      type: 'IconBoxBlock',
      nodes: [],
      props: {
        icon: 'Shield',
        title: 'Sécurité',
        text: 'Protection et conformité aux normes les plus exigeantes.',
        layout: 'card',
        accentColor: '#059669',
        backgroundColor: '#f0fdf4',
        textColor: '#334155',
      },
      parent: 'features_grid',
      linkedNodes: {},
    },
    feature_3: {
      type: 'IconBoxBlock',
      nodes: [],
      props: {
        icon: 'Users',
        title: 'Expertise',
        text: 'Une équipe de professionnels qualifiés à votre service.',
        layout: 'card',
        accentColor: '#d97706',
        backgroundColor: '#fffbeb',
        textColor: '#334155',
      },
      parent: 'features_grid',
      linkedNodes: {},
    },
  };
}

function premiumAbout() {
  return {
    ROOT: { type: 'div', nodes: ['about_container'], props: { style: {} }, linkedNodes: {} },
    about_container: {
      type: 'ContainerBlock',
      nodes: ['about_hero', 'about_mission', 'about_values', 'about_team', 'about_cta'],
      props: { padding: 0, backgroundColor: '#ffffff', maxWidth: '100%' },
      parent: 'ROOT',
      linkedNodes: {},
    },
    about_hero: {
      type: 'HeroBlock',
      nodes: [],
      props: {
        headline: 'À Propos de Nous',
        subheadline: 'Notre histoire, notre mission, notre engagement',
        badgeText: 'QUI SOMMES-NOUS',
        ctaLabel: 'Notre équipe',
        ctaHref: '#equipe',
        accentColor: '#1e3a5f',
        showStats: true,
      },
      parent: 'about_container',
      linkedNodes: {},
    },
    about_mission: {
      type: 'ColumnsBlock',
      nodes: ['mission_text', 'mission_image'],
      props: { columns: 2, gap: 48 },
      parent: 'about_container',
      linkedNodes: {},
    },
    mission_text: {
      type: 'TextBlock',
      nodes: [],
      props: {
        text: '<h2 style="font-size:1.8rem;font-weight:700;color:#0f172a">Notre Mission</h2><p style="font-size:1rem;color:#475569;line-height:1.8;margin-top:1rem">Depuis notre création, nous nous engageons à fournir des services d\'excellence dans le domaine de l\'ingénierie électrique. Notre équipe d\'experts met son savoir-faire au service de la qualité et de la sécurité des installations.</p><p style="font-size:1rem;color:#475569;line-height:1.8;margin-top:1rem">Nous croyons en une approche transparente, innovante et centrée sur le client.</p>',
        fontSize: 16,
        lineHeight: 1.8,
        color: '#475569',
      },
      parent: 'about_container',
      linkedNodes: {},
    },
    mission_image: {
      type: 'ImageBlock',
      nodes: [],
      props: {
        src: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&q=80',
        alt: 'Notre équipe au travail',
        height: 400,
        objectFit: 'cover',
      },
      parent: 'about_container',
      linkedNodes: {},
    },
    about_values: {
      type: 'ContainerBlock',
      nodes: ['values_header', 'values_grid'],
      props: { padding: 64, backgroundColor: '#f8fafc', maxWidth: '1200px' },
      parent: 'about_container',
      linkedNodes: {},
    },
    values_header: {
      type: 'TextBlock',
      nodes: [],
      props: {
        text: '<h2 style="text-align:center;font-size:2rem;font-weight:800;color:#0f172a">Nos Valeurs</h2>',
        fontSize: 16,
        textAlign: 'center',
      },
      parent: 'about_container',
      linkedNodes: {},
    },
    values_grid: {
      type: 'ColumnsBlock',
      nodes: ['value_1', 'value_2', 'value_3', 'value_4'],
      props: { columns: 4, gap: 16 },
      parent: 'about_container',
      linkedNodes: {},
    },
    value_1: {
      type: 'CardBlock',
      nodes: [],
      props: {
        title: 'Excellence',
        subtitle: 'Qualité',
        text: 'La recherche constante de la qualité dans chaque projet.',
        icon: 'Star',
        backgroundColor: '#ffffff',
        accentColor: '#2563eb',
      },
      parent: 'about_container',
      linkedNodes: {},
    },
    value_2: {
      type: 'CardBlock',
      nodes: [],
      props: {
        title: 'Innovation',
        subtitle: 'Modernité',
        text: 'Des solutions à la pointe de la technologie.',
        icon: 'Lightbulb',
        backgroundColor: '#ffffff',
        accentColor: '#059669',
      },
      parent: 'about_container',
      linkedNodes: {},
    },
    value_3: {
      type: 'CardBlock',
      nodes: [],
      props: {
        title: 'Intégrité',
        subtitle: 'Éthique',
        text: 'Une conduite irréprochable en toutes circonstances.',
        icon: 'Shield',
        backgroundColor: '#ffffff',
        accentColor: '#d97706',
      },
      parent: 'about_container',
      linkedNodes: {},
    },
    value_4: {
      type: 'CardBlock',
      nodes: [],
      props: {
        title: 'Engagement',
        subtitle: 'Dévouement',
        text: 'Un engagement total envers nos clients et partenaires.',
        icon: 'Heart',
        backgroundColor: '#ffffff',
        accentColor: '#dc2626',
      },
      parent: 'about_container',
      linkedNodes: {},
    },
    about_team: {
      type: 'TeamMembersGridBlock',
      nodes: [],
      props: {
        members: [
          {
            name: 'Mamadou Diop',
            role: 'Directeur Général',
            photo: '',
            bio: "20+ ans d'expérience dans le secteur électrique.",
          },
          {
            name: 'Aïssatou Diallo',
            role: 'Directrice Technique',
            photo: '',
            bio: 'Experte en conformité et normes électriques.',
          },
        ],
        columns: 3,
        gap: 24,
      },
      parent: 'about_container',
      linkedNodes: {},
    },
    about_cta: {
      type: 'CallToActionBlock',
      nodes: [],
      props: {
        title: 'Prêt à collaborer avec nous ?',
        description: 'Contactez notre équipe pour discuter de votre projet',
        buttonText: 'Nous contacter',
        buttonUrl: '/contact',
        bgColor: '#1e3a5f',
        textColor: '#ffffff',
        buttonBg: '#2563eb',
        layout: 'center',
        padding: 64,
      },
      parent: 'about_container',
      linkedNodes: {},
    },
  };
}

function premiumContact() {
  return {
    ROOT: { type: 'div', nodes: ['contact_container'], props: { style: {} }, linkedNodes: {} },
    contact_container: {
      type: 'ContainerBlock',
      nodes: ['contact_hero', 'contact_info', 'contact_form'],
      props: { padding: 0, backgroundColor: '#ffffff', maxWidth: '100%' },
      parent: 'ROOT',
      linkedNodes: {},
    },
    contact_hero: {
      type: 'HeroBlock',
      nodes: [],
      props: {
        headline: 'Contactez-Nous',
        subheadline: "Une équipe d'experts à votre écoute",
        badgeText: 'CONTACT',
        ctaLabel: '',
        ctaHref: '',
        accentColor: '#2563eb',
        showStats: false,
      },
      parent: 'contact_container',
      linkedNodes: {},
    },
    contact_info: {
      type: 'ColumnsBlock',
      nodes: ['contact_address', 'contact_phone', 'contact_email', 'contact_hours'],
      props: { columns: 4, gap: 16 },
      parent: 'contact_container',
      linkedNodes: {},
    },
    contact_address: {
      type: 'AddressBlock',
      nodes: [],
      props: {
        company: 'PROQUELEC',
        street: "Route de l'Aéroport",
        city: 'Dakar, Sénégal',
        phone: '+221 33 000 00 00',
        email: 'contact@proquelec.sn',
      },
      parent: 'contact_container',
      linkedNodes: {},
    },
    contact_phone: {
      type: 'CardBlock',
      nodes: [],
      props: {
        title: 'Téléphone',
        subtitle: 'Appelez-nous',
        text: '+221 33 000 00 00',
        icon: 'Phone',
        backgroundColor: '#f8fafc',
        accentColor: '#2563eb',
      },
      parent: 'contact_container',
      linkedNodes: {},
    },
    contact_email: {
      type: 'CardBlock',
      nodes: [],
      props: {
        title: 'Email',
        subtitle: 'Écrivez-nous',
        text: 'contact@proquelec.sn',
        icon: 'Mail',
        backgroundColor: '#f8fafc',
        accentColor: '#059669',
      },
      parent: 'contact_container',
      linkedNodes: {},
    },
    contact_hours: {
      type: 'CardBlock',
      nodes: [],
      props: {
        title: 'Horaires',
        subtitle: 'Disponibilité',
        text: 'Lun-Ven: 8h-18h',
        icon: 'Clock',
        backgroundColor: '#f8fafc',
        accentColor: '#d97706',
      },
      parent: 'contact_container',
      linkedNodes: {},
    },
    contact_form: {
      type: 'FormBlock',
      nodes: [],
      props: {
        title: 'Envoyez-nous un message',
        subtitle: 'Remplissez le formulaire ci-dessous',
        submitText: 'Envoyer',
        backgroundColor: '#f8fafc',
      },
      parent: 'contact_container',
      linkedNodes: {},
    },
  };
}

function premiumServices() {
  return {
    ROOT: { type: 'div', nodes: ['services_root'], props: { style: {} }, linkedNodes: {} },
    services_root: {
      type: 'ContainerBlock',
      nodes: ['svc_hero', 'svc_grid', 'svc_process', 'svc_pricing', 'svc_faq'],
      props: { padding: 0, backgroundColor: '#ffffff', maxWidth: '100%' },
      parent: 'ROOT',
      linkedNodes: {},
    },
    svc_hero: {
      type: 'HeroBlock',
      nodes: [],
      props: {
        headline: 'Nos Services',
        subheadline: 'Des solutions complètes pour vos projets électriques',
        badgeText: 'SERVICES',
        ctaLabel: 'Demander un devis',
        ctaHref: '/contact',
        accentColor: '#2563eb',
        showStats: true,
      },
      parent: 'services_root',
      linkedNodes: {},
    },
    svc_grid: {
      type: 'ColumnsBlock',
      nodes: ['svc_item_1', 'svc_item_2', 'svc_item_3', 'svc_item_4', 'svc_item_5', 'svc_item_6'],
      props: { columns: 3, gap: 24 },
      parent: 'services_root',
      linkedNodes: {},
    },
    svc_item_1: {
      type: 'IconBoxBlock',
      nodes: [],
      props: {
        icon: 'Zap',
        title: 'Audit Électrique',
        text: 'Diagnostic complet de vos installations.',
        layout: 'card',
        accentColor: '#2563eb',
        backgroundColor: '#f8fafc',
        textColor: '#334155',
      },
      parent: 'services_root',
      linkedNodes: {},
    },
    svc_item_2: {
      type: 'IconBoxBlock',
      nodes: [],
      props: {
        icon: 'Shield',
        title: 'Conformité',
        text: 'Mise aux normes selon NF C 15-100.',
        layout: 'card',
        accentColor: '#059669',
        backgroundColor: '#f0fdf4',
        textColor: '#334155',
      },
      parent: 'services_root',
      linkedNodes: {},
    },
    svc_item_3: {
      type: 'IconBoxBlock',
      nodes: [],
      props: {
        icon: 'GraduationCap',
        title: 'Formation',
        text: 'Formations professionnelles certifiantes.',
        layout: 'card',
        accentColor: '#d97706',
        backgroundColor: '#fffbeb',
        textColor: '#334155',
      },
      parent: 'services_root',
      linkedNodes: {},
    },
    svc_item_4: {
      type: 'IconBoxBlock',
      nodes: [],
      props: {
        icon: 'BarChart',
        title: 'Diagnostic',
        text: 'Analyse approfondie de vos équipements.',
        layout: 'card',
        accentColor: '#7c3aed',
        backgroundColor: '#f5f3ff',
        textColor: '#334155',
      },
      parent: 'services_root',
      linkedNodes: {},
    },
    svc_item_5: {
      type: 'IconBoxBlock',
      nodes: [],
      props: {
        icon: 'Tool',
        title: 'Maintenance',
        text: 'Entretien préventif et correctif.',
        layout: 'card',
        accentColor: '#0891b2',
        backgroundColor: '#ecfeff',
        textColor: '#334155',
      },
      parent: 'services_root',
      linkedNodes: {},
    },
    svc_item_6: {
      type: 'IconBoxBlock',
      nodes: [],
      props: {
        icon: 'FileText',
        title: 'Consulting',
        text: 'Conseil et assistance technique.',
        layout: 'card',
        accentColor: '#dc2626',
        backgroundColor: '#fef2f2',
        textColor: '#334155',
      },
      parent: 'services_root',
      linkedNodes: {},
    },
    svc_process: {
      type: 'StepsBlock',
      nodes: [],
      props: {
        items: [
          { title: 'Consultation', desc: 'Analyse de vos besoins' },
          { title: 'Proposition', desc: 'Devis personnalisé détaillé' },
          { title: 'Réalisation', desc: 'Mise en œuvre par nos experts' },
          { title: 'Suivi', desc: 'Accompagnement post-service' },
        ],
        accentColor: '#2563eb',
        layout: 'horizontal',
      },
      parent: 'services_root',
      linkedNodes: {},
    },
    svc_faq: {
      type: 'AccordionBlock',
      nodes: [],
      props: {
        title: 'Questions Fréquentes',
        items: [
          {
            title: 'Comment demander un audit ?',
            content: 'Contactez-nous via le formulaire ou par téléphone.',
          },
          {
            title: "Quels sont vos délais d'intervention ?",
            content: 'Sous 48h ouvrées pour une première évaluation.',
          },
          {
            title: 'Proposez-vous des formations ?',
            content: 'Oui, consultez notre catalogue formations.',
          },
        ],
        accentColor: '#2563eb',
      },
      parent: 'services_root',
      linkedNodes: {},
    },
  };
}

function premiumPresentation() {
  return {
    ROOT: { type: 'div', nodes: ['pres_root'], props: { style: {} }, linkedNodes: {} },
    pres_root: {
      type: 'ContainerBlock',
      nodes: ['pres_hero', 'pres_stats', 'pres_timeline', 'pres_gallery', 'pres_cta'],
      props: { padding: 0, backgroundColor: '#ffffff', maxWidth: '100%' },
      parent: 'ROOT',
      linkedNodes: {},
    },
    pres_hero: {
      type: 'HeroBlock',
      nodes: [],
      props: {
        headline: 'Notre Histoire',
        subheadline: "D'une vision à une référence nationale",
        badgeText: 'PRÉSENTATION',
        ctaLabel: 'Découvrir',
        ctaHref: '#timeline',
        accentColor: '#1e3a5f',
        showStats: false,
      },
      parent: 'pres_root',
      linkedNodes: {},
    },
    pres_stats: {
      type: 'StatsBlock',
      nodes: [],
      props: {
        stat1Value: '25+',
        stat1Label: "Années d'expertise",
        stat2Value: '500+',
        stat2Label: 'Projets réalisés',
        stat3Value: '98%',
        stat3Label: 'Clients satisfaits',
        backgroundColor: '#1e3a5f',
        accentColor: '#f59e0b',
      },
      parent: 'pres_root',
      linkedNodes: {},
    },
    pres_timeline: {
      type: 'TimelineBlock',
      nodes: [],
      props: {
        items: [
          { year: '1998', title: 'Création', desc: 'Fondation de PROQUELEC' },
          { year: '2005', title: 'Expansion', desc: 'Ouverture de nouveaux services' },
          { year: '2015', title: 'Innovation', desc: 'Lancement des outils numériques' },
          { year: '2024', title: 'Référence', desc: 'Leader national de la qualité électrique' },
        ],
        accentColor: '#2563eb',
      },
      parent: 'pres_root',
      linkedNodes: {},
    },
    pres_gallery: {
      type: 'GalleryBlock',
      nodes: [],
      props: {
        columns: 3,
        gap: 8,
        rounded: true,
        images: [
          {
            src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
            alt: 'Bureau',
          },
          {
            src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80',
            alt: 'Équipe',
          },
          {
            src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80',
            alt: 'Travail',
          },
        ],
      },
      parent: 'pres_root',
      linkedNodes: {},
    },
    pres_cta: {
      type: 'CallToActionBlock',
      nodes: [],
      props: {
        title: 'Faites partie de notre succès',
        description: 'Rejoignez nos 500+ clients satisfaits',
        buttonText: 'Nous contacter',
        buttonUrl: '/contact',
        bgColor: '#1e3a5f',
        textColor: '#ffffff',
        buttonBg: '#2563eb',
        layout: 'center',
        padding: 64,
      },
      parent: 'pres_root',
      linkedNodes: {},
    },
  };
}

// ── Template registry ──────────────────────────────────
function premiumBlog() {
  return {
    ROOT: { type: 'div', nodes: ['blog_root'], props: { style: {} }, linkedNodes: {} },
    blog_root: {
      type: 'ContainerBlock',
      nodes: ['blog_hero', 'blog_grid', 'blog_cta'],
      props: { padding: 0, backgroundColor: '#ffffff', maxWidth: '100%' },
      parent: 'ROOT',
      linkedNodes: {},
    },
    blog_hero: {
      type: 'HeroBlock',
      nodes: [],
      props: {
        headline: 'Actualités & Événements',
        subheadline: 'Suivez toutes nos actualités',
        badgeText: 'BLOG',
        ctaLabel: "S'abonner",
        ctaHref: '#newsletter',
        accentColor: '#2563eb',
        showStats: false,
      },
      parent: 'blog_root',
      linkedNodes: {},
    },
    blog_grid: {
      type: 'ColumnsBlock',
      nodes: ['blog_card_1', 'blog_card_2', 'blog_card_3'],
      props: { columns: 3, gap: 24 },
      parent: 'blog_root',
      linkedNodes: {},
    },
    blog_card_1: {
      type: 'CardBlock',
      nodes: [],
      props: {
        title: 'Nouvelle norme NFC 15-100',
        subtitle: 'Mise à jour',
        text: 'Découvrez les dernières évolutions de la norme.',
        icon: 'FileText',
        backgroundColor: '#ffffff',
        accentColor: '#2563eb',
      },
      parent: 'blog_root',
      linkedNodes: {},
    },
    blog_card_2: {
      type: 'CardBlock',
      nodes: [],
      props: {
        title: 'Formation certifiante',
        subtitle: 'Inscription',
        text: 'Inscrivez-vous à nos formations professionnelles.',
        icon: 'GraduationCap',
        backgroundColor: '#ffffff',
        accentColor: '#059669',
      },
      parent: 'blog_root',
      linkedNodes: {},
    },
    blog_card_3: {
      type: 'CardBlock',
      nodes: [],
      props: {
        title: 'Audit de conformité',
        subtitle: 'Nouveau service',
        text: 'Un accompagnement personnalisé pour vos installations.',
        icon: 'Shield',
        backgroundColor: '#ffffff',
        accentColor: '#d97706',
      },
      parent: 'blog_root',
      linkedNodes: {},
    },
    blog_cta: {
      type: 'NewsletterBlock',
      nodes: [],
      props: {
        title: 'Restez informé',
        description: 'Recevez nos dernières actualités par email',
        buttonText: "S'abonner",
        placeholder: 'votre@email.com',
        bgColor: '#1e3a5f',
        textColor: '#ffffff',
        accentColor: '#2563eb',
      },
      parent: 'blog_root',
      linkedNodes: {},
    },
  };
}

function premiumFaq() {
  return {
    ROOT: { type: 'div', nodes: ['faq_root'], props: { style: {} }, linkedNodes: {} },
    faq_root: {
      type: 'ContainerBlock',
      nodes: ['faq_hero', 'faq_section'],
      props: { padding: 0, backgroundColor: '#ffffff', maxWidth: '100%' },
      parent: 'ROOT',
      linkedNodes: {},
    },
    faq_hero: {
      type: 'HeroBlock',
      nodes: [],
      props: {
        headline: 'Questions Fréquentes',
        subheadline: 'Tout ce que vous devez savoir',
        badgeText: 'FAQ',
        ctaLabel: '',
        ctaHref: '',
        accentColor: '#2563eb',
        showStats: false,
      },
      parent: 'faq_root',
      linkedNodes: {},
    },
    faq_section: {
      type: 'AccordionBlock',
      nodes: [],
      props: {
        title: 'Nos réponses à vos questions',
        items: [
          {
            title: 'Comment obtenir un diagnostic ?',
            content:
              'Contactez-nous via le formulaire ou par téléphone. Nos experts vous répondent sous 48h.',
          },
          {
            title: 'Quels sont vos tarifs ?',
            content:
              'Nos tarifs varient selon la prestation. Demandez un devis personnalisé gratuit.',
          },
          {
            title: 'Proposez-vous des formations ?',
            content: 'Oui, consultez notre catalogue de formations professionnelles certifiantes.',
          },
          {
            title: 'Comment devenir membre ?',
            content: 'Créez un compte sur notre plateforme et choisissez votre profil.',
          },
          {
            title: 'Quelles normes appliquez-vous ?',
            content:
              'Nous appliquons la NS 01-001, NFC 15-100, IEC 60364 et toutes les normes en vigueur.',
          },
        ],
        accentColor: '#2563eb',
      },
      parent: 'faq_root',
      linkedNodes: {},
    },
  };
}

function premiumLegal() {
  return {
    ROOT: { type: 'div', nodes: ['legal_root'], props: { style: {} }, linkedNodes: {} },
    legal_root: {
      type: 'ContainerBlock',
      nodes: ['legal_hero', 'legal_content'],
      props: { padding: 0, backgroundColor: '#ffffff', maxWidth: '100%' },
      parent: 'ROOT',
      linkedNodes: {},
    },
    legal_hero: {
      type: 'HeroBlock',
      nodes: [],
      props: {
        headline: 'Mentions Légales',
        subheadline: 'Informations légales et crédits',
        badgeText: 'LÉGAL',
        ctaLabel: '',
        ctaHref: '',
        accentColor: '#1e3a5f',
        showStats: false,
      },
      parent: 'legal_root',
      linkedNodes: {},
    },
    legal_content: {
      type: 'ContainerBlock',
      nodes: ['legal_identity', 'legal_hosting', 'legal_rights', 'legal_contact'],
      props: { padding: 48, backgroundColor: '#ffffff', maxWidth: '800px' },
      parent: 'legal_root',
      linkedNodes: {},
    },
    legal_identity: {
      type: 'TextBlock',
      nodes: [],
      props: {
        text: "<h2>Éditeur du site</h2><p><strong>PROQUELEC</strong><br>Promotion de la Qualité des Installations Électriques au Sénégal<br>Association d'Utilité Publique<br>Route de l'Aéroport, Lotissement Mermoz<br>BP 1234 Dakar, Sénégal</p>",
        fontSize: 15,
        lineHeight: 1.8,
        color: '#334155',
      },
      parent: 'legal_root',
      linkedNodes: {},
    },
    legal_hosting: {
      type: 'TextBlock',
      nodes: [],
      props: {
        text: '<h2>Hébergement</h2><p>Site hébergé par nos propres infrastructures sécurisées au Sénégal.</p>',
        fontSize: 15,
        lineHeight: 1.8,
        color: '#334155',
      },
      parent: 'legal_root',
      linkedNodes: {},
    },
    legal_rights: {
      type: 'TextBlock',
      nodes: [],
      props: {
        text: "<h2>Propriété intellectuelle</h2><p>L'ensemble des contenus du site (textes, images, vidéos, normes) est protégé par le droit d'auteur. Toute reproduction est soumise à autorisation préalable.</p>",
        fontSize: 15,
        lineHeight: 1.8,
        color: '#334155',
      },
      parent: 'legal_root',
      linkedNodes: {},
    },
    legal_contact: {
      type: 'AddressBlock',
      nodes: [],
      props: {
        company: 'PROQUELEC',
        street: "Route de l'Aéroport",
        city: 'Dakar, Sénégal',
        phone: '+221 33 000 00 00',
        email: 'contact@proquelec.sn',
      },
      parent: 'legal_root',
      linkedNodes: {},
    },
  };
}

function premiumTeam() {
  return {
    ROOT: { type: 'div', nodes: ['team_root'], props: { style: {} }, linkedNodes: {} },
    team_root: {
      type: 'ContainerBlock',
      nodes: ['team_hero', 'team_grid'],
      props: { padding: 0, backgroundColor: '#ffffff', maxWidth: '100%' },
      parent: 'ROOT',
      linkedNodes: {},
    },
    team_hero: {
      type: 'HeroBlock',
      nodes: [],
      props: {
        headline: 'Notre Équipe',
        subheadline: 'Des experts à votre service',
        badgeText: 'ÉQUIPE',
        ctaLabel: '',
        ctaHref: '',
        accentColor: '#1e3a5f',
        showStats: true,
      },
      parent: 'team_root',
      linkedNodes: {},
    },
    team_grid: {
      type: 'TeamMembersGridBlock',
      nodes: [],
      props: {
        members: [
          {
            name: 'Mamadou Diop',
            role: 'Directeur Général',
            photo: '',
            bio: "25 ans d'expérience dans le secteur électrique. Fondateur de PROQUELEC.",
          },
          {
            name: 'Aïssatou Diallo',
            role: 'Directrice Technique',
            photo: '',
            bio: 'Experte en conformité électrique et normalisation.',
          },
          {
            name: 'Oumar Sall',
            role: 'Responsable Formation',
            photo: '',
            bio: 'Pédagogue passionné par la transmission des savoirs techniques.',
          },
          {
            name: 'Fatou Ndiaye',
            role: 'Chargée de Communication',
            photo: '',
            bio: 'Stratège digitale au service de la sécurité électrique.',
          },
          {
            name: 'Ibrahima Ba',
            role: 'Inspecteur Principal',
            photo: '',
            bio: 'Expert en diagnostics et audits de conformité.',
          },
          {
            name: 'Mariam Touré',
            role: 'Assistante Administrative',
            photo: '',
            bio: 'Gestion des adhésions et du support client.',
          },
        ],
        columns: 3,
        gap: 24,
      },
      parent: 'team_root',
      linkedNodes: {},
    },
  };
}

const PREMIUM_TEMPLATES = [
  {
    name: "Page d'accueil premium",
    description:
      'Template complet avec hero, services, chiffres, actualités et partenaires — design épuré et professionnel.',
    category: 'accueil',
    tags: ['premium', 'accueil', 'hero', 'complet'],
    thumbnail: '',
    themeConfig: {
      primaryColor: '#1e3a5f',
      secondaryColor: '#2563eb',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '12px',
      spacingScale: '1',
    },
    factory: () => ({
      ...premiumHero('#1e3a5f'),
      ...{
        stats_block: {
          type: 'StatsBlock',
          nodes: [],
          props: {
            stat1Value: '25+',
            stat1Label: 'Années',
            stat2Value: '500+',
            stat2Label: 'Projets',
            stat3Value: '98%',
            stat3Label: 'Satisfaction',
            backgroundColor: '#1e3a5f',
            accentColor: '#f59e0b',
          },
          parent: 'ROOT',
          linkedNodes: {},
        },
      },
    }),
  },
  {
    name: 'À propos premium',
    description: 'Page présentation complète : hero, mission, valeurs, équipe et CTA.',
    category: 'contenu',
    tags: ['premium', 'about', 'equipe', 'valeurs'],
    thumbnail: '',
    factory: premiumAbout,
  },
  {
    name: 'Services premium',
    description: 'Grille de services avec processus, tarification et FAQ.',
    category: 'contenu',
    tags: ['premium', 'services', 'grille', 'processus'],
    thumbnail: '',
    factory: premiumServices,
  },
  {
    name: 'Contact premium',
    description: 'Page contact avec carte, informations et formulaire intégré.',
    category: 'conversion',
    tags: ['premium', 'contact', 'formulaire'],
    thumbnail: '',
    factory: premiumContact,
  },
  {
    name: 'Présentation premium',
    description: 'Page présentation avec timeline, galerie et statistiques.',
    category: 'contenu',
    tags: ['premium', 'presentation', 'timeline', 'galerie'],
    thumbnail: '',
    factory: premiumPresentation,
  },
  {
    name: 'Blog & Actualités premium',
    description: "Page blog avec hero, grille d'articles et inscription newsletter.",
    category: 'contenu',
    tags: ['premium', 'blog', 'actualites', 'newsletter'],
    thumbnail: '',
    factory: premiumBlog,
  },
  {
    name: 'FAQ premium',
    description: 'Page FAQ avec hero et accordéon de questions-réponses.',
    category: 'contenu',
    tags: ['premium', 'faq', 'questions', 'accordeon'],
    thumbnail: '',
    factory: premiumFaq,
  },
  {
    name: 'Mentions Légales premium',
    description: 'Page mentions légales avec identité, hébergement, droits et contact.',
    category: 'contenu',
    tags: ['premium', 'legal', 'mentions', 'cgv'],
    thumbnail: '',
    factory: premiumLegal,
  },
  {
    name: 'Équipe premium',
    description: 'Page équipe avec hero, statistiques et grille des membres.',
    category: 'contenu',
    tags: ['premium', 'equipe', 'membres', 'team'],
    thumbnail: '',
    factory: premiumTeam,
  },
];

// ── Seed templates into DB ─────────────────────────────
async function seedTemplates(pool) {
  console.log('\n── 🎨 Templates Premium ──');

  for (const tpl of PREMIUM_TEMPLATES) {
    const structure = tpl.factory ? tpl.factory() : {};
    const structureJson = JSON.stringify(structure);

    // Check if template exists
    const existing = await pool.query('SELECT id FROM public.page_templates WHERE name = $1', [
      tpl.name,
    ]);

    if (existing.rows.length > 0) {
      if (!DRY_RUN) {
        await pool.query(
          `
          UPDATE public.page_templates SET
            description = $1,
            structure = $2,
            theme_config = $3,
            category = $4,
            tags = $5,
            updated_at = NOW()
          WHERE name = $6
        `,
          [
            tpl.description,
            structureJson,
            JSON.stringify(tpl.themeConfig || {}),
            tpl.category,
            tpl.tags,
            tpl.name,
          ],
        );
      }
      console.log(`  🔄 ${tpl.name.padEnd(30)} → Mis à jour ✓`);
    } else {
      if (!DRY_RUN) {
        await pool.query(
          `
          INSERT INTO public.page_templates
            (name, description, structure, theme_config, category, tags, thumbnail, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        `,
          [
            tpl.name,
            tpl.description,
            structureJson,
            JSON.stringify(tpl.themeConfig || {}),
            tpl.category,
            tpl.tags,
            tpl.thumbnail,
          ],
        );
      }
      console.log(`  ✅ ${tpl.name.padEnd(30)} → Créé ✓`);
    }
  }
}

// ── Main ───────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  PROQUELEC — Seed Templates Premium');
  console.log(`  Mode: ${DRY_RUN ? '🔍 DRY RUN' : '🚀 EXÉCUTION'}`);
  console.log('══════════════════════════════════════════════\n');

  const pool = new Pool(DB_CONFIG);
  try {
    await pool.query('SELECT 1');
    console.log('✅ Connexion DB établie\n');

    await seedTemplates(pool);

    console.log('\n✅ Templates premium injectés avec succès !\n');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await pool.end();
  }
}

main();
