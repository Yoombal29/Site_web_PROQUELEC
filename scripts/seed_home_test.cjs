const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const TEST_STRUCTURE = [
  {
    id: 'home-hero-banner',
    type: 'HeroBanner',
    version: 1,
    enabled: true,
    props: {
      parallax: true,
      autoplayInterval: 8000,
    },
    metadata: {
      label: 'Carrousel Hero (Accueil)',
      description: 'Test builder seed',
    },
  },
  {
    id: 'home-intro-text',
    type: 'text-block',
    enabled: true,
    content: {
      title: 'PROQUELEC, la référence sénégalaise de la qualité électrique',
      html: '<p>PROQUELEC accompagne les entreprises, les collectivités, les habitats et les industries dans l’audit, la conformité, la certification et la formation électrique. Nous veillons à des installations durables, sûres et conformes aux normes sénégalaises et internationales.</p>',
    },
  },
  {
    id: 'home-what-we-do',
    type: 'columns',
    enabled: true,
    style: {
      gap: '24px',
      className: 'py-10',
    },
    children: [
      {
        id: 'home-card-audit',
        type: 'card',
        enabled: true,
        content: {
          title: 'Audit énergétique & sécurité',
          subtitle: 'Analyse complète de vos installations.',
          text: 'Nos équipes détectent les non-conformités, les risques d’électrocution et les dérives de consommation pour sécuriser votre site.',
          items: [],
        },
        style: {
          className: 'bg-white shadow-lg rounded-xl p-6',
        },
      },
      {
        id: 'home-card-certification',
        type: 'card',
        enabled: true,
        content: {
          title: 'Certification & conformité',
          subtitle: 'Des attestations reconnues.',
          text: 'Bénéficiez de rapports clairs, de recommandations opérationnelles et de certificats conformes aux référentiels en vigueur.',
          items: [],
        },
        style: {
          className: 'bg-white shadow-lg rounded-xl p-6',
        },
      },
      {
        id: 'home-card-training',
        type: 'card',
        enabled: true,
        content: {
          title: 'Formation professionnelle',
          subtitle: 'Renforcez les compétences de vos équipes.',
          text: 'Formations pratiques pour électriciens, techniciens et responsables de chantier sur les bonnes pratiques électriques.',
          items: [],
        },
        style: {
          className: 'bg-white shadow-lg rounded-xl p-6',
        },
      },
    ],
  },
  {
    id: 'home-core-values',
    type: 'text-block',
    enabled: true,
    content: {
      title: 'Ce qui fait notre force',
      html: '<ul class="list-disc list-inside space-y-3"><li><strong>Présence locale</strong> : une expertise adaptée aux contextes sénégalais.</li><li><strong>Indépendance</strong> : des diagnostics objectifs et transparents.</li><li><strong>Innovation</strong> : des outils d’analyse modernes pour évaluer l’efficacité énergétique.</li><li><strong>Accompagnement</strong> : un suivi post-audit pour la mise en œuvre des recommandations.</li></ul>',
    },
  },
  {
    id: 'home-vision-mission',
    type: 'VisionMission',
    enabled: true,
    props: {
      title: 'Notre mission : sécuriser l’électricité au Sénégal',
      subtitle: 'Une transition énergétique maîtrisée et une qualité d’installation irréprochable.',
      description: 'PROQUELEC mobilise l’expertise technique, la formation et l’accompagnement pour améliorer durablement la sécurité électrique des bâtiments, des infrastructures et des industries.',
      missionTitle: 'Notre mission',
      missionDesc: 'Prévenir les risques électriques et garantir une conformité durable.',
      visionTitle: 'Notre vision',
      visionDesc: 'Un Sénégal où chaque installation est sûre, fiable et performante.',
    },
  },
  {
    id: 'home-stats',
    type: 'stats',
    enabled: true,
    content: {
      items: [
        { icon: '⚡', value: '500+', label: 'installations auditées' },
        { icon: '🏢', value: '120+', label: 'clients accompagnés' },
        { icon: '🌍', value: '15', label: 'villes couvertes au Sénégal' },
      ],
    },
  },
  {
    id: 'home-partner-logos',
    type: 'PartnerLogos',
    enabled: true,
  },
  {
    id: 'home-audience-offers',
    type: 'AudienceOffers',
    enabled: true,
  },
  {
    id: 'home-latest-news',
    type: 'LatestNews',
    enabled: true,
  },
  {
    id: 'home-case-studies',
    type: 'html',
    enabled: true,
    content: {
      html: '<section class="py-16 bg-white"><div class="max-w-6xl mx-auto px-6"><div class="text-center mb-10"><h2 class="text-3xl md:text-4xl font-bold mb-4">Nos réalisations en qualité électrique</h2><p class="text-lg text-slate-700">Des audits industriels aux installations publiques, PROQUELEC accompagne chaque projet pour garantir une performance durable.</p></div><div class="grid gap-6 md:grid-cols-3"><div class="rounded-3xl border border-slate-200 p-6 shadow-sm"><h3 class="text-xl font-semibold mb-3">Collectivités</h3><p class="text-sm leading-6 text-slate-600">Sécurisation de réseaux et mise en conformité des écoles, centres de santé et bâtiments municipaux.</p></div><div class="rounded-3xl border border-slate-200 p-6 shadow-sm"><h3 class="text-xl font-semibold mb-3">Industries</h3><p class="text-sm leading-6 text-slate-600">Audit d’usines et exploitation énergétique efficace pour réduire les risques et les coûts.</p></div><div class="rounded-3xl border border-slate-200 p-6 shadow-sm"><h3 class="text-xl font-semibold mb-3">Entreprises</h3><p class="text-sm leading-6 text-slate-600">Accompagnement sur les postes de travail, les installations neuves et la conformité des locaux.</p></div></div></div></section>',
    },
  },
  {
    id: 'home-testimonials',
    type: 'html',
    enabled: true,
    content: {
      html: '<section class="py-16 bg-slate-50"><div class="max-w-6xl mx-auto px-6"><div class="text-center mb-10"><h2 class="text-3xl md:text-4xl font-bold mb-4">Témoignages clients</h2><p class="text-lg text-slate-700">Ils nous font confiance pour garantir la sécurité et la conformité de leurs installations électriques.</p></div><div class="space-y-6"><div class="rounded-3xl bg-white p-8 shadow-lg border border-slate-200"><p class="text-slate-700 mb-4">« Grâce à PROQUELEC, notre usine a réduit ses risques électriques et optimisé ses consommations. Leur diagnostic est fiable et très professionnel. »</p><p class="font-semibold">— Abdoulaye, responsable maintenance</p></div><div class="rounded-3xl bg-white p-8 shadow-lg border border-slate-200"><p class="text-slate-700 mb-4">« L’audit a permis de sécuriser notre site et d’obtenir la conformité réglementaire rapidement. L’équipe est réactive et experte. »</p><p class="font-semibold">— Aïcha, directrice administrative</p></div></div></div></section>',
    },
  },
  {
    id: 'home-tools-cta',
    type: 'html',
    enabled: true,
    content: {
      html: '<section class="py-16 bg-slate-50"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl md:text-4xl font-bold mb-4">Découvrez nos ressources PROQUELEC</h2><p class="text-lg opacity-80 mb-8">Guides, diagnostics en ligne et outils dédiés à la performance électrique de vos installations.</p><div class="flex flex-wrap justify-center gap-4"><a href="/outils" class="inline-block px-8 py-3 bg-blue-600 text-white rounded-full">Voir les outils</a><a href="/contact-premium" class="inline-block px-8 py-3 border border-blue-600 text-blue-600 rounded-full">Nous contacter</a></div></div></section>',
    },
  },
];

(async () => {
  const client = await pool.connect();
  try {
    console.log('[Seed Test] Désactivation temporaire des triggers...');
    await client.query('BEGIN');
    await client.query('SET LOCAL session_replication_role = replica');
    await client.query(
      "UPDATE public.pages SET structure_json = $1::jsonb, updated_at = NOW() WHERE slug = 'home'",
      [JSON.stringify(TEST_STRUCTURE)]
    );
    await client.query('COMMIT');
    console.log('[Seed Test] Mise à jour de la page home effectuée.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Seed Test] Échec de la mise à jour :', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
