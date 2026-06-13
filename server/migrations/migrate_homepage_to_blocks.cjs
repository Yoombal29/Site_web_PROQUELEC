const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let counter = 0;
function nid() { counter++; return `n${counter}_${Date.now().toString(36)}`; }

function heroBlock(title, subtitle, badge) {
  const id = nid();
  return {
    [id]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: {
        html: `<section class="py-20 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
          <div class="absolute inset-0 opacity-5" style="background-image:url('https://www.transparenttextures.com/patterns/cubes.png')"></div>
          <div class="max-w-6xl mx-auto text-center relative z-10">
            ${badge ? `<span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border rounded-full mb-6" style="border-color:#3b82f6;color:#60a5fa">${badge}</span>` : ''}
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">${title}</h1>
            <p class="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">${subtitle}</p>
          </div>
        </section>`,
        padding: 0,
        globalCss: '',
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'Bannière',
      linkedNodes: {},
    },
  };
}

function statsBlock(title, stats) {
  const id = nid();
  const items = stats.map(s => `<div class="text-center p-6">
    <div class="text-4xl md:text-5xl font-bold mb-2" style="color:#3b82f6">${s.value}${s.suffix || ''}</div>
    <div class="text-sm font-medium text-slate-400 uppercase tracking-wider">${s.label}</div>
    ${s.description ? `<div class="text-xs text-slate-500 mt-1">${s.description}</div>` : ''}
  </div>`).join('');
  return {
    [id]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: {
        html: `<section class="py-16 px-4" style="background:#0f172a">
          <div class="max-w-6xl mx-auto">
            ${title ? `<h2 class="text-3xl font-bold text-white text-center mb-10">${title}</h2>` : ''}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">${items}</div>
          </div>
        </section>`,
        padding: 0,
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'Statistiques',
      linkedNodes: {},
    },
  };
}

function featureGridBlock(title, subtitle, features) {
  const id = nid();
  const items = features.map(f => `<div class="p-6 rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-shadow">
    <h3 class="text-lg font-bold text-slate-900 mb-2">${f.title}</h3>
    <p class="text-sm text-slate-600">${f.description}</p>
  </div>`).join('');
  return {
    [id]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: {
        html: `<section class="py-16 px-4" style="background:#f8fafc">
          <div class="max-w-6xl mx-auto">
            ${title ? `<h2 class="text-3xl font-bold text-slate-900 text-center mb-4">${title}</h2>` : ''}
            ${subtitle ? `<p class="text-center text-slate-500 mb-10 max-w-3xl mx-auto">${subtitle}</p>` : ''}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${items}</div>
          </div>
        </section>`,
        padding: 0,
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'Grille services',
      linkedNodes: {},
    },
  };
}

function audienceGridBlock(title, subtitle, audiences) {
  const id = nid();
  const items = audiences.map((a, i) => {
    const icons = ['🏠', '💼', '🏛️', '🤝'];
    const colors = ['#dbeafe', '#d1fae5', '#fef3c7', '#f3e8ff'];
    const textColors = ['#2563eb', '#059669', '#d97706', '#9333ea'];
    return `<div class="p-6 rounded-xl border border-slate-200 text-center hover:shadow-lg transition-shadow" style="background:${colors[i]};border-color:transparent">
      <div class="text-3xl mb-3">${icons[i]}</div>
      <h3 class="text-lg font-bold mb-2" style="color:${textColors[i]}">${a.title}</h3>
      <p class="text-sm text-slate-600">${a.description}</p>
    </div>`;
  }).join('');
  return {
    [id]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: {
        html: `<section class="py-16 px-4 bg-white">
          <div class="max-w-6xl mx-auto">
            ${title ? `<h2 class="text-3xl font-bold text-slate-900 text-center mb-4">${title}</h2>` : ''}
            ${subtitle ? `<p class="text-center text-slate-500 mb-10">${subtitle}</p>` : ''}
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">${items}</div>
          </div>
        </section>`,
        padding: 0,
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'Publics cibles',
      linkedNodes: {},
    },
  };
}

function columnsBlock(title, subtitle, description, image, features) {
  const id = nid();
  const featList = features?.length
    ? `<ul class="mt-6 space-y-3">${features.map(f => `<li class="flex items-start gap-3"><span class="text-blue-500 mt-0.5">✓</span><span class="text-slate-700">${f.title}</span></li>`).join('')}</ul>`
    : '';
  return {
    [id]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: {
        html: `<section class="py-16 px-4 bg-white">
          <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              ${title ? `<h2 class="text-3xl font-bold text-slate-900 mb-3">${title}</h2>` : ''}
              ${subtitle ? `<p class="text-blue-600 font-semibold mb-3">${subtitle}</p>` : ''}
              ${description ? `<p class="text-slate-600 mb-4">${description}</p>` : ''}
              ${featList}
            </div>
            <div>${image ? `<img src="${image}" alt="${title || ''}" class="w-full rounded-xl shadow-lg" />` : ''}</div>
          </div>
        </section>`,
        padding: 0,
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'Texte + Image',
      linkedNodes: {},
    },
  };
}

function ctaBlock(title, desc, buttonText, buttonLink = '/contact', bgColor = '#0f172a', accentColor = '#3b82f6') {
  const id = nid();
  return {
    [id]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: {
        html: `<section class="py-20 px-4 relative overflow-hidden" style="background:${bgColor}">
          <div class="absolute inset-0 opacity-5" style="background-image:url('https://www.transparenttextures.com/patterns/hexellence.png')"></div>
          <div class="max-w-4xl mx-auto text-center relative z-10">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">${title}</h2>
            <p class="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">${desc}</p>
            <a href="${buttonLink}" class="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl transition-all hover:opacity-90" style="background:${accentColor}">${buttonText}</a>
          </div>
        </section>`,
        padding: 0,
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'Appel à action',
      linkedNodes: {},
    },
  };
}

function buildPage(title, blocks) {
  const result = {};
  const rootNodes = [];
  for (const block of blocks) {
    const keys = Object.keys(block);
    for (const key of keys) {
      result[key] = block[key];
      rootNodes.push(key);
    }
  }
  result['ROOT'] = {
    type: { resolvedName: 'ContainerBlock' },
    nodes: rootNodes,
    props: { padding: 0, maxWidth: '100%' },
    custom: {},
    hidden: false,
    isCanvas: true,
    displayName: `Page: ${title}`,
    linkedNodes: {},
  };
  return result;
}

const homeContent = buildPage('Accueil', [
  heroBlock('PORTAIL PROQUELEC', 'Sécurité, qualité et formation pour les installations électriques au Sénégal.', 'PORTAIL OFFICIEL'),
  statsBlock('PROQUELEC en chiffres', [
    { value: '1500+', label: 'Professionnels certifiés', description: 'Électriciens et installateurs formés et agréés' },
    { value: '300+', label: 'Entreprises partenaires', description: 'Entreprises engagées dans la qualité électrique' },
    { value: '98%', label: 'Taux de conformité', description: 'Des installations contrôlées conformes aux normes' },
    { value: '50+', label: 'Experts techniques', description: 'Ingénieurs et techniciens à votre service' },
  ]),
  featureGridBlock('Des Services Sur-Mesure', 'Que vous soyez indépendant, une entreprise ou un expert membre, PROQUELEC vous accompagne avec des outils dédiés.', [
    { title: 'Électriciens & Artisans', description: 'Normes gratuites, calculateurs pro et générateur de schémas pour vos dossiers techniques.' },
    { title: 'Entreprises & Installateurs', description: 'Gérez vos chantiers, certifications et bénéficiez d\'une visibilité accrue sur l\'annuaire national.' },
    { title: 'Membres & Experts', description: 'Participez à la vie de l\'institution, veille normative en avant-première et support prioritaire.' },
  ]),
  columnsBlock(
    'Une plateforme d\'orientation opérationnelle',
    'Le portail centralise les informations utiles et réduit les demandes incomplètes.',
    '',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
    [
      { title: 'Comprendre les démarches' },
      { title: 'Préparer les documents' },
      { title: 'Identifier le bon interlocuteur' },
      { title: 'Suivre les services numériques' },
    ]
  ),
  columnsBlock(
    'La Référence Nationale',
    'Sécurité, Qualité, Formation',
    "PROQUELEC est l'organisme de référence au Sénégal pour la certification des installations électriques, la formation des professionnels et la normalisation du secteur. Agréé par l'État sénégalais, nous accompagnons chaque acteur de la filière électrique vers l'excellence et la conformité.",
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
    []
  ),
  audienceGridBlock('Un espace pour chaque public', 'Accédez directement aux démarches et ressources adaptées.', [
    { title: 'Ménages', description: 'Prévention, diagnostic logement et conseils pratiques.' },
    { title: 'Professionnels', description: 'Outils, formations, labels et documentation technique.' },
    { title: 'Autorités', description: 'Réglementation, audits, reporting et programmes publics.' },
    { title: 'Partenaires', description: 'Collaborations, événements et projets communs.' },
  ]),
  statsBlock('Indicateurs', [
    { value: '14', label: 'Régions ciblées' },
    { value: '24', label: 'Orientation initiale', suffix: 'h' },
    { value: '4', label: 'Espaces publics' },
    { value: '100', label: 'Dynamique CMS', suffix: '%' },
  ]),
  ctaBlock('Rejoignez la communauté PROQUELEC', 'Inscrivez-vous gratuitement et accédez à tous nos services, outils et formations.', 'Créer un compte', '/connexion?mode=inscription', '#0f172a', '#3b82f6'),
]);

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Migration du contenu HomePage vers HtmlBlock...\n');
    const json = JSON.stringify(homeContent);
    const res = await client.query(
      "UPDATE public.pages SET structure_json = $1, updated_at = NOW(), render_engine = 'raw' WHERE slug = 'home' RETURNING id, title",
      [json]
    );
    if (res.rows.length > 0) {
      const blockCount = Object.keys(homeContent).length - 1;
      console.log(`   ✅ "home" (${res.rows[0].title}) — ${blockCount} blocs HtmlBlock`);
    }
    console.log('\n✅ Migration HomePage terminée !');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => { console.error('❌', err); process.exit(1); });
