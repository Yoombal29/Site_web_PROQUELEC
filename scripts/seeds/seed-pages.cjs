// Seed pages — home page, about, services, contact
'use strict';

const { upsert, getPool, closePool } = require('./seed-utils.cjs');

const PAGE_HOME_ID = '10000000-0000-0000-0000-000000000001';
const PAGE_SERVICES_ID = '10000000-0000-0000-0000-000000000002';
const PAGE_ABOUT_ID = '10000000-0000-0000-0000-000000000003';
const PAGE_CONTACT_ID = '10000000-0000-0000-0000-000000000004';

function heroBlock() {
  return {
    id: 'block-hero-001',
    type: 'hero',
    content: {
      title: 'PROQUELEC Sénégal',
      subtitle: 'La première plateforme dédiée aux professionnels de l\'électricité au Sénégal',
      cta_text: 'Découvrir nos services',
      cta_link: '/services',
    },
    style: {
      backgroundColor: '#1e3a8a',
      color: '#ffffff',
      padding: '80px 20px',
      textAlign: 'center',
    },
  };
}

function servicesBlock() {
  return {
    id: 'block-services-001',
    type: 'section',
    content: { title: 'Nos Services' },
    style: { padding: '60px 20px', backgroundColor: '#f8fafc' },
    children: [
      {
        id: 'block-srv-1',
        type: 'card',
        content: { title: 'Annuaire des Électriciens', text: 'Trouvez un électricien qualifié près de chez vous.' },
        style: { padding: '20px', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
      },
      {
        id: 'block-srv-2',
        type: 'card',
        content: { title: 'Formations Certifiantes', text: 'Accédez à des formations agréées par l\'État.' },
        style: { padding: '20px', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
      },
      {
        id: 'block-srv-3',
        type: 'card',
        content: { title: 'Observatoire de l\'Énergie', text: 'Suivez les indicateurs clés du secteur électrique sénégalais.' },
        style: { padding: '20px', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
      },
    ],
  };
}

function statsBlock() {
  return {
    id: 'block-stats-001',
    type: 'stats',
    content: {
      items: [
        { label: 'Électriciens', value: '1 200+' },
        { label: 'Formations', value: '45' },
        { label: 'Entreprises', value: '350' },
        { label: 'Normes', value: '100%' },
      ],
    },
    style: { padding: '60px 20px', backgroundColor: '#1e3a8a', color: '#ffffff' },
  };
}

function ctaBlock() {
  return {
    id: 'block-cta-001',
    type: 'section',
    content: { title: 'Prêt à rejoindre la communauté ?' },
    style: { padding: '60px 20px', textAlign: 'center' },
    children: [
      {
        id: 'block-cta-btn',
        type: 'button',
        content: { text: 'Créer un compte', link: '/auth?register' },
        style: { backgroundColor: '#f59e0b', color: '#ffffff', padding: '12px 32px', borderRadius: '6px', fontSize: '16px' },
      },
    ],
  };
}

async function seed() {
  console.log('[seed] 📄 Pages...');

  const contentBlocks = [heroBlock(), servicesBlock(), statsBlock(), ctaBlock()];

  // ── Home Page ──
  await upsert('pages', {
    id: PAGE_HOME_ID,
    title: 'Accueil',
    slug: '/',
    content: JSON.stringify(contentBlocks),
    content_blocks: JSON.stringify(contentBlocks),
    template: 'default',
    is_published: true,
    workflow_status: 'published',
    show_hero: false,
    show_footer: true,
    language_code: 'fr',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: null,
    updated_by: null,
  }, 'id');
  console.log('  ✅ Home page');

  // ── Services Page ──
  const servicesBlocks = [
    {
      id: 'block-serv-hero',
      type: 'hero',
      content: { title: 'Nos Services', subtitle: 'Découvrez l\'ensemble de nos prestations pour les professionnels de l\'électricité' },
      style: { backgroundColor: '#1e3a8a', color: '#ffffff', padding: '60px 20px', textAlign: 'center' },
    },
  ];

  await upsert('pages', {
    id: PAGE_SERVICES_ID,
    title: 'Services',
    slug: '/services',
    content: JSON.stringify(servicesBlocks),
    content_blocks: JSON.stringify(servicesBlocks),
    template: 'default',
    is_published: true,
    workflow_status: 'published',
    language_code: 'fr',
    created_at: new Date(),
    updated_at: new Date(),
  }, 'id');
  console.log('  ✅ Services page');

  // ── About Page ──
  const aboutBlocks = [
    {
      id: 'block-about-hero',
      type: 'hero',
      content: { title: 'À Propos', subtitle: 'PROQUELEC — Plateforme de référence pour le secteur électrique sénégalais' },
      style: { backgroundColor: '#1e3a8a', color: '#ffffff', padding: '60px 20px', textAlign: 'center' },
    },
  ];

  await upsert('pages', {
    id: PAGE_ABOUT_ID,
    title: 'À Propos',
    slug: '/a-propos',
    content: JSON.stringify(aboutBlocks),
    content_blocks: JSON.stringify(aboutBlocks),
    template: 'default',
    is_published: true,
    workflow_status: 'published',
    language_code: 'fr',
    created_at: new Date(),
    updated_at: new Date(),
  }, 'id');
  console.log('  ✅ About page');

  // ── Contact Page ──
  const contactBlocks = [
    {
      id: 'block-contact-hero',
      type: 'hero',
      content: { title: 'Contactez-nous', subtitle: 'Une question ? Une suggestion ? N\'hésitez pas à nous écrire.' },
      style: { backgroundColor: '#1e3a8a', color: '#ffffff', padding: '60px 20px', textAlign: 'center' },
    },
  ];

  await upsert('pages', {
    id: PAGE_CONTACT_ID,
    title: 'Contact',
    slug: '/contact',
    content: JSON.stringify(contactBlocks),
    content_blocks: JSON.stringify(contactBlocks),
    template: 'default',
    is_published: true,
    workflow_status: 'published',
    language_code: 'fr',
    show_footer: false,
    created_at: new Date(),
    updated_at: new Date(),
  }, 'id');
  console.log('  ✅ Contact page');

  return { homePageId: PAGE_HOME_ID };
}

module.exports = { seed };
