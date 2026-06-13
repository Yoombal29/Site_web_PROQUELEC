/**
 * migrate_orphan_tsx_to_blocks.js
 * Migre le contenu statique de 15 fichiers TSX orphelins vers des blocs Builder
 * (HtmlBlock principalement) dans la base de données, puis supprime les TSX.
 *
 * Usage: node server/migrations/migrate_orphan_tsx_to_blocks.js
 * Puis:   node server/migrations/cleanup_orphan_tsx.js
 */
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

function statsBlock(stats) {
  const id = nid();
  const items = stats.map(s => `<div class="text-center p-6">
    <div class="text-4xl md:text-5xl font-bold mb-2" style="color:#3b82f6">${s.value}</div>
    <div class="text-sm font-medium text-slate-400 uppercase tracking-wider">${s.label}</div>
    ${s.desc ? `<div class="text-xs text-slate-500 mt-1">${s.desc}</div>` : ''}
  </div>`).join('');
  return {
    [id]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: {
        html: `<section class="py-16 px-4" style="background:#0f172a">
          <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">${items}</div>
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

function featureGridBlock(title, features, cols = 3) {
  const id = nid();
  const items = features.map(f => `<div class="p-6 rounded-xl border transition-shadow hover:shadow-lg" style="background:#f8fafc;border-color:#e2e8f0">
    <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-xl" style="background:${f.color || '#dbeafe'};color:${f.textColor || '#2563eb'}">${f.icon || '✦'}</div>
    <h3 class="text-lg font-semibold text-slate-900 mb-2">${f.title}</h3>
    <p class="text-sm text-slate-600">${f.desc}</p>
  </div>`).join('');
  return {
    [id]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: {
        html: `<section class="py-16 px-4 bg-white">
          <div class="max-w-6xl mx-auto">
            ${title ? `<h2 class="text-3xl font-bold text-slate-900 text-center mb-12">${title}</h2>` : ''}
            <div class="grid grid-cols-1 md:grid-cols-${cols} gap-6">${items}</div>
          </div>
        </section>`,
        padding: 0,
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'Grille de fonctionnalités',
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

function sectionBlock(title, html, bgColor = '#ffffff') {
  const id = nid();
  return {
    [id]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: {
        html: `<section class="py-16 px-4" style="background:${bgColor}">
          <div class="max-w-6xl mx-auto">
            ${title ? `<h2 class="text-3xl font-bold text-slate-900 mb-10 text-center">${title}</h2>` : ''}
            ${html}
          </div>
        </section>`,
        padding: 0,
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: title || 'Section',
      linkedNodes: {},
    },
  };
}

function accordionBlock(items) {
  const id = nid();
  const rows = items.map((item, i) => `<details class="group border-b border-slate-200 py-4" ${i === 0 ? 'open' : ''}>
    <summary class="flex items-center justify-between cursor-pointer text-lg font-semibold text-slate-900 list-none">
      <span>${item.title}</span>
      <span class="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
    </summary>
    <div class="mt-3 text-slate-600 leading-relaxed">${item.content}</div>
    ${item.tags ? `<div class="mt-3 flex flex-wrap gap-2">${item.tags.map(t => `<span class="px-3 py-1 text-xs font-medium rounded-full" style="background:#e0f2fe;color:#0369a1">${t}</span>`).join('')}</div>` : ''}
  </details>`).join('');
  return {
    [id]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: {
        html: `<section class="py-16 px-4 bg-white"><div class="max-w-4xl mx-auto">${rows}</div></section>`,
        padding: 0,
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'Accordéon',
      linkedNodes: {},
    },
  };
}

function stepsBlock(steps) {
  const id = nid();
  const items = steps.map((s, i) => `<div class="flex gap-6 ${i > 0 ? 'mt-8' : ''}">
    <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style="background:#3b82f6">${String(i + 1).padStart(2, '0')}</div>
    <div>
      <h3 class="text-xl font-semibold text-slate-900 mb-2">${s.title}</h3>
      <p class="text-slate-600">${s.desc}</p>
    </div>
  </div>`).join('');
  return {
    [id]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: {
        html: `<section class="py-16 px-4 bg-white"><div class="max-w-4xl mx-auto">${items}</div></section>`,
        padding: 0,
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'Étapes',
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

// ═══════════════════════════════════════════════════════
// PAGE DATA: chaque page = [slug, title, blocks]
// ═══════════════════════════════════════════════════════

const PAGES = [];

// ── 1. News.tsx → /actualites ──
PAGES.push(['actualites', 'Actualités PROQUELEC', buildPage('Actualités', [
  heroBlock('Actualités PROQUELEC', 'Restez informé des actualités, événements et nouveautés de PROQUELEC', 'Actualités'),
  sectionBlock('', `<div class="space-y-8 max-w-4xl mx-auto">${[
    { title: 'Nouvelle Formation Électrique', date: '22 Janvier 2026', desc: 'PROQUELEC annonce le lancement de sa nouvelle formation spécialisée en installations électriques basse tension. Cette formation complète couvre les dernières normes et techniques de l\'industrie, avec une approche pratique et modulable adaptée aux professionnels de tous les niveaux.', link: '/formations', label: 'Découvrir nos formations →' },
    { title: 'Certification ISO Obtenue', date: '15 Janvier 2026', desc: 'PROQUELEC a obtenu sa certification ISO 9001:2015 pour la qualité de ses services et formations. Cette reconnaissance témoigne de notre engagement envers l\'excellence et la satisfaction de nos clients.', link: '/certifications', label: 'En savoir plus sur nos certifications →' },
    { title: 'Conférence Énergie & Conformité', date: '8 Janvier 2026', desc: 'Rejoignez-nous pour une conférence interactive sur les audits énergétiques et la conformité réglementaire. Des experts du secteur électrique partageront leurs insights sur les meilleures pratiques et les évolutions normatives.', link: '/events', label: 'Voir tous les événements →' },
    { title: 'Ressources Techniques Mises à Jour', date: '1 Janvier 2026', desc: 'Les mémentos techniques et guides pratiques ont été mis à jour selon les dernières normes 2025. Consultez nos ressources pour rester à jour sur les normes d\'installation.', link: '/documents', label: 'Accéder aux documents →' },
  ].map(a => `<article class="p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow bg-white">
    <time class="text-sm text-blue-600 font-medium">${a.date}</time>
    <h3 class="text-2xl font-bold text-slate-900 mt-2 mb-3">${a.title}</h3>
    <p class="text-slate-600 mb-4 leading-relaxed">${a.desc}</p>
    <a href="${a.link}" class="text-blue-600 font-semibold hover:text-blue-800 transition-colors">${a.label}</a>
  </article>`).join('')}</div>`),
  ctaBlock('Rester Informé', 'Inscrivez-vous à notre newsletter pour recevoir les actualités directement dans votre boîte mail.', 'S\'inscrire à la Newsletter', '#', '#1e40af', '#2563eb'),
])]);

// ── 2. PressPage.tsx → /presse ──
PAGES.push(['presse', 'Espace Presse', buildPage('Espace Presse', [
  heroBlock('Espace Presse', 'Retrouvez nos derniers communiqués, dossiers de presse et ressources multimédias pour les professionnels de l\'information.', 'Espace Médias'),
  sectionBlock('Communiqués Récents', `<div class="grid grid-cols-1 md:grid-cols-3 gap-6">${[
    { title: 'PROQUELEC lance sa nouvelle plateforme d\'innovation', date: '12 Octobre 2023', excerpt: 'Une avancée majeure pour le secteur électrique en Côte d\'Ivoire avec le lancement du Lab Expert.', cat: 'Innovation', img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop' },
    { title: 'Partenariat stratégique pour la sécurité électrique', date: '05 Septembre 2023', excerpt: 'Signature d\'un accord historique visant à renforcer les normes de sécurité dans les zones rurales.', cat: 'Partenariat', img: 'https://images.unsplash.com/photo-1521791136064-7986c2923216?q=80&w=800&auto=format&fit=crop' },
    { title: 'Rapport Annuel 2022 : Une croissance soutenue', date: '20 Août 2023', excerpt: 'PROQUELEC annonce des résultats records et un impact social sans précédent pour l\'année écoulée.', cat: 'Finance', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop' },
  ].map(a => `<div class="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-shadow">
    <img src="${a.img}" alt="${a.title}" class="w-full h-48 object-cover" loading="lazy" />
    <div class="p-6">
      <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full text-blue-700 bg-blue-100 mb-3">${a.cat}</span>
      <time class="block text-sm text-slate-500 mb-2">${a.date}</time>
      <h3 class="text-lg font-bold text-slate-900 mb-2">${a.title}</h3>
      <p class="text-sm text-slate-600">${a.excerpt}</p>
    </div>
  </div>`).join('')}</div>`),
  sectionBlock('Kit Médias & Contact', `<div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
    <div class="p-8 rounded-2xl text-white" style="background:#1e3a5f">
      <h3 class="text-2xl font-bold mb-4">Kit Médias</h3>
      <p class="text-slate-300 mb-6">Téléchargez nos ressources officielles pour vos articles et publications.</p>
      <ul class="space-y-3">${[
        { name: 'Dossier de Presse 2023', size: '4.2 MB', type: 'PDF' },
        { name: 'Pack Logos Haute Résolution', size: '12.5 MB', type: 'ZIP' },
        { name: 'Photos de Direction', size: '8.1 MB', type: 'JPG' },
        { name: 'Infographies Clés', size: '3.7 MB', type: 'PDF' },
      ].map(item => `<li class="flex items-center justify-between p-3 rounded-lg" style="background:rgba(255,255,255,0.1)">
        <span class="font-medium">${item.name}</span>
        <span class="text-xs text-slate-300">${item.type} · ${item.size}</span>
      </li>`).join('')}</ul>
    </div>
    <div class="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <h3 class="text-2xl font-bold text-slate-900 mb-4">Contact Presse</h3>
      <p class="text-slate-600 mb-6">Notre équipe est à votre disposition pour toute demande.</p>
      <div class="space-y-4">
        <div><span class="text-sm text-slate-500 block">E-mail de contact</span><a href="mailto:presse@proquelec.ci" class="text-blue-600 font-semibold">presse@proquelec.ci</a></div>
        <div><span class="text-sm text-slate-500 block">Ligne Directe</span><span class="text-slate-900 font-semibold">+225 07 00 00 00 00</span></div>
        <blockquote class="italic text-sm text-slate-500 mt-4 p-4 rounded-lg bg-slate-50 border-l-4 border-blue-500">"Nous nous engageons à répondre à toutes les sollicitations médiatiques sous 24h ouvrées."</blockquote>
      </div>
    </div>
  </div>`),
])]);

// ── 3. Certifications.tsx → /certifications ──
PAGES.push(['certifications', 'Certifications Professionnelles', buildPage('Certifications', [
  heroBlock('Validez Votre<br/>Savoir-Faire.', 'Rejoignez les meilleurs professionnels du Sénégal. Obtenez un label reconnu qui atteste de votre rigueur et de votre conformité technique.', 'Excellence Normative'),
  statsBlock([
    { value: '4', label: 'Niveaux de certification' },
    { value: '100%', label: 'Reconnu nationalement' },
    { value: '2 ans', label: 'Validité du certificat' },
    { value: 'QUALI-ELEC', label: "Label d'excellence" },
  ]),
  featureGridBlock('Avantages de la Certification', [
    { title: 'Reconnaissance Nationale', desc: 'Votre certification PROQUELEC est reconnue par les institutions, collectivités, et opérateurs privés comme gage de qualité et de conformité.', color: '#dbeafe', textColor: '#2563eb', icon: '📈' },
    { title: 'Accès aux Marchés Publics', desc: 'La certification QUALI-ELEC est souvent exigée dans les appels d\'offre publics. Elle vous ouvre les portes des grands projets institutionnels.', color: '#d1fae5', textColor: '#059669', icon: '🛡️' },
    { title: 'Confiance des Clients', desc: 'Affichez votre label de conformité et inspirez confiance à vos clients. Une installation certifiée, c\'est une garantie de sécurité supplémentaire.', color: '#fef3c7', textColor: '#d97706', icon: '⭐' },
    { title: 'Avantage Concurrentiel', desc: 'Distinguez-vous de la concurrence. Être certifié PROQUELEC, c\'est prouver votre engagement envers l\'excellence et les normes de sécurité.', color: '#f3e8ff', textColor: '#9333ea', icon: '⚡' },
    { title: 'Formation Continue', desc: 'Le processus de certification inclut des formations régulières pour maintenir vos compétences à jour face aux évolutions réglementaires.', color: '#ccfbf1', textColor: '#0d9488', icon: '📚' },
    { title: 'Réseau Professionnel', desc: 'Rejoignez la communauté des professionnels certifiés PROQUELEC et bénéficiez d\'un réseau d\'échange et de recommandations.', color: '#fce7f3', textColor: '#db2777', icon: '🤝' },
  ]),
  sectionBlock('Niveaux de Certification', `<div class="max-w-4xl mx-auto space-y-4">${[
    { title: 'QUALI-ELEC Artisan — Niveau Artisan', content: 'Certification destinée aux artisans-électriciens indépendants. Atteste de la maîtrise des règles d\'installation conformes à la norme NS 01-001 et du décret de conformité n°1333 (2017). Idéale pour les travaux résidentiels et petits commerces.', tags: ['Reconnaissance Nationale', 'Accès Marchés Publics', 'Badge de Qualité'] },
    { title: 'QUALI-ELEC Pro — Niveau Professionnel', content: 'Pour les électriciens et techniciens en entreprise. Couvre l\'habilitation BT complète (B0 à BR/BC/BS), la maîtrise des installations industrielles et tertiaires, et la gestion des systèmes de protection différentielle.' },
    { title: 'QUALI-ELEC Expert — Niveau Expert', content: 'Certification haute tension pour les chargés de travaux HT (H1, H2, HC). Inclut la maîtrise des réseaux HTA/BT, des postes de transformation, et des opérations sous tension ou au voisinage de pièces nues.' },
    { title: 'Label Entreprise — Label Corporate', content: 'Qualification de l\'entreprise dans son ensemble. Audit des processus qualité, formation des équipes, et délivrance d\'un label de conformité PROQUELEC valable 2 ans, renouvelable avec suivi annuel.' },
  ].map(a => `<details class="group border-b border-slate-200 py-4">
    <summary class="flex items-center justify-between cursor-pointer text-lg font-semibold text-slate-900 list-none">
      <span>${a.title}</span>
      <span class="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
    </summary>
    <div class="mt-3 text-slate-600 leading-relaxed">${a.content}</div>
    ${a.tags ? `<div class="mt-3 flex flex-wrap gap-2">${a.tags.map(t => `<span class="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">${t}</span>`).join('')}</div>` : ''}
  </details>`).join('')}</div>`),
  stepsBlock([
    { title: 'Dépôt du Dossier', desc: 'Soumettez vos documents administratifs et techniques via le portail PROQUELEC ou en agence.' },
    { title: 'Audit Technique', desc: 'Nos inspecteurs réalisent un audit approfondi de vos installations ou de vos compétences techniques.' },
    { title: 'Validation Commission', desc: 'Examen final par notre comité technique national pour garantir l\'excellence et la conformité.' },
    { title: 'Délivrance Label', desc: 'Remise officielle de votre certificat et activation de votre profil certifié sur le registre PROQUELEC.' },
  ]),
  sectionBlock('Documents Requis', `<ul class="max-w-2xl mx-auto space-y-3">${[
    'Copie de la carte d\'identité nationale ou passeport',
    'Justificatif de domicile professionnel',
    'Diplôme ou attestation de compétences électriques',
    'Rapport des dernières installations réalisées',
    'Attestation d\'assurance responsabilité civile professionnelle',
    'Formulaire de candidature complété et signé',
  ].map(d => `<li class="flex items-center gap-3 text-slate-700"><span class="text-blue-500">✓</span>${d}</li>`).join('')}</ul>`),
  ctaBlock('Prêt pour le<br/>Label d\'Excellence ?', 'Élevez votre carrière professionnelle et garantissez la sécurité des installations électriques au Sénégal.', 'Démarrer ma certification', '/contact'),
])]);

// ── 4. FormationCertification.tsx → /formation-certification ──
PAGES.push(['formation-certification', 'Formation & Certification', buildPage('Formation & Certification', [
  heroBlock("L'Expertise se<br/>Transmet.", 'Formez-vous aux normes de demain et certifiez vos compétences pour garantir la sécurité de tous.', 'Académie PROQUELEC'),
  statsBlock([
    { value: '+10 000', label: 'Artisans formés' },
    { value: '100%', label: 'Taux de satisfaction' },
    { value: '20+', label: 'Modules de formation' },
    { value: 'Gratuit', label: 'Pour artisans éligibles' },
  ]),
  featureGridBlock('Catalogue de Formation', [
    { title: 'Habilitation Électrique', desc: 'Formation complète aux niveaux B0, H0, B1, B2, H1, H2, BR, BC, HC. Conforme aux normes NF C 18-510.', color: '#dbeafe', textColor: '#2563eb', icon: '⚡' },
    { title: 'Sécurité des Installations', desc: 'Maîtrisez les règles de sécurité IEC 60364. Protection des biens et des personnes contre les risques électriques.', color: '#d1fae5', textColor: '#059669', icon: '🛡️' },
    { title: 'Audit Énergétique', desc: 'Techniques de diagnostic et d\'optimisation des consommations électriques. Réduire les pertes et améliorer l\'efficacité.', color: '#fef3c7', textColor: '#d97706', icon: '⚡' },
    { title: 'Normes & Réglementation', desc: 'Compréhension et application des normes NS 01-001, NF C 15-100, NF C 14-100 et décret n° 1333 de 2017.', color: '#f3e8ff', textColor: '#9333ea', icon: '📋' },
    { title: 'Formation des Formateurs', desc: 'Devenez formateur agréé PROQUELEC. Transmission des savoirs et pédagogie adaptée aux électriciens.', color: '#ccfbf1', textColor: '#0d9488', icon: '👥' },
    { title: 'QUALI-ELEC Premium', desc: 'Préparation à la certification nationale d\'excellence. Accès privilégié aux marchés publics et privés au Sénégal.', color: '#fce7f3', textColor: '#db2777', icon: '⭐' },
  ]),
  sectionBlock('Sessions de Formation — Calendrier 2025', `<div class="overflow-x-auto max-w-5xl mx-auto">
    <table class="w-full text-left border-collapse">
      <thead><tr class="border-b-2 border-slate-200 text-slate-500 text-sm">${['Période', 'Formation', 'Durée', 'Places', 'Lieu', 'Statut'].map(h => `<th class="pb-3 font-semibold">${h}</th>`).join('')}</tr></thead>
      <tbody>${[
        ['Juillet 2025', 'Habilitation Électrique B0/H0', '3 jours', '20', 'Dakar Centre', 'Ouvert'],
        ['Août 2025', 'Sécurité & Normes NS 01-001', '2 jours', '15', 'Thiès', 'Ouvert'],
        ['Septembre 2025', 'Certification QUALI-ELEC', '5 jours', '12', 'Dakar', 'Complet'],
        ['Octobre 2025', 'Audit Énergétique Avancé', '4 jours', '10', 'Saint-Louis', 'Ouvert'],
        ['Novembre 2025', 'Formation Artisans (Module 1-4)', '5 jours', '25', 'Dakar Centre', 'Ouvert'],
        ['Décembre 2025', 'Habilitation HT - H1/H2/HC', '3 jours', '8', 'Dakar', 'Ouvert'],
      ].map(r => `<tr class="border-b border-slate-100 hover:bg-slate-50">
        ${r.map((c, i) => `<td class="py-4 ${i === 5 ? (c === 'Ouvert' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold') : 'text-slate-700'}">${c}</td>`).join('')}
      </tr>`).join('')}</tbody>
    </table>
  </div>`),
  stepsBlock([
    { title: 'Choisir votre formation', desc: 'Consultez notre catalogue et identifiez la formation adaptée à votre niveau et vos besoins.' },
    { title: 'Remplir le formulaire', desc: 'Complétez votre dossier d\'inscription en ligne ou en agence avec vos informations professionnelles.' },
    { title: 'Validation & Paiement', desc: 'Votre dossier est traité sous 48h. Réglez les frais de formation (exonérés pour les artisans éligibles).' },
    { title: 'Confirmation & Accueil', desc: 'Recevez votre convocation et rejoignez votre session. Le matériel pédagogique est fourni.' },
  ]),
  sectionBlock('Formation pour Collectivités', `<div class="max-w-5xl mx-auto">
    <p class="text-lg text-slate-600 text-center mb-10 max-w-3xl mx-auto">Des programmes sur-mesure destinés aux mairies, gouvernances, ministères et établissements publics pour garantir la conformité et la sécurité des installations électriques dans les bâtiments publics.</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${[
      { title: 'Audit des bâtiments', tag: 'Mairies & Ministères', desc: 'Évaluation des installations électriques de vos bâtiments publics selon les normes en vigueur.' },
      { title: 'Formation des équipes', tag: 'In-situ', desc: 'Programme de formation de vos agents d\'entretien et techniciens aux bonnes pratiques.' },
      { title: 'Plan de mise en conformité', tag: 'Compliance', desc: 'Rapport détaillé et accompagnement pour mettre vos installations aux normes réglementaires.' },
    ].map(c => `<div class="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
      <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full text-blue-700 bg-blue-100 mb-3">${c.tag}</span>
      <h3 class="text-lg font-bold text-slate-900 mb-2">${c.title}</h3>
      <p class="text-sm text-slate-600">${c.desc}</p>
    </div>`).join('')}</div>
  </div>`),
  sectionBlock('Formation Artisans-Électriciens', `<div class="max-w-5xl mx-auto">
    <p class="text-lg text-slate-600 mb-8">Depuis 2005, PROQUELEC forme gratuitement les artisans-électriciens sur le territoire national. Plus de 10 000 artisans ont bénéficié de ce programme.</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">${[
      'Améliorer la qualité des installations domestiques',
      'Garantir la protection des personnes et équipements',
      'Instaurer une culture de la sécurité électrique',
      'Réduire les accidents et incendies d\'origine électrique',
    ].map(o => `<div class="flex items-center gap-3 text-slate-700"><span class="text-emerald-500 text-xl">✓</span>${o}</div>`).join('')}</div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">${[
      { value: '5 718', label: 'Artisans formés<br/>Dakar' },
      { value: '1 380', label: 'Formés avec<br/>Senelec' },
      { value: '381', label: 'Formés avec<br/>Sonatel' },
      { value: '100%', label: 'Taux de<br/>satisfaction' },
    ].map(s => `<div class="text-center p-4 rounded-xl bg-slate-50 border border-slate-200"><div class="text-3xl font-bold text-blue-600">${s.value}</div><div class="text-sm text-slate-500 mt-1">${s.label}</div></div>`).join('')}</div>
  </div>`),
  featureGridBlock('Ressources Pédagogiques', [
    { title: 'Mémentos Techniques', desc: 'Documents synthétiques pour rappel rapide des bonnes pratiques (NS 01-001, Protection, Caractéristiques générales).', color: '#dbeafe', textColor: '#2563eb', icon: '📄' },
    { title: 'Guides Détaillés', desc: 'Guides complets pour appliquer les normes (Marchés, Ménages à faible revenu, Vérifications, Matériels).', color: '#d1fae5', textColor: '#059669', icon: '📖' },
    { title: 'Feuillets Techniques', desc: 'Informations rapides et précises pour résoudre les problèmes techniques (Prises, Mise à la terre, Liaisons).', color: '#fef3c7', textColor: '#d97706', icon: '📝' },
    { title: 'Supports de Cours', desc: 'Supports de formation officiels pour les artisans, techniciens et formateurs agréés PROQUELEC.', color: '#f3e8ff', textColor: '#9333ea', icon: '📚' },
    { title: 'Guides de Certification', desc: 'Tout ce qu\'il faut savoir pour préparer et réussir votre certification QUALI-ELEC ou habilitation.', color: '#ccfbf1', textColor: '#0d9488', icon: '🎯' },
    { title: 'Bibliothèque Normative', desc: 'Textes de référence des normes nationales et internationales (NS, NF, IEC) applicables au Sénégal.', color: '#fce7f3', textColor: '#db2777', icon: '📚' },
  ]),
  ctaBlock('Valorisez Votre Expertise', 'Obtenez la certification QUALI-ELEC et distinguez-vous sur le marché par votre professionnalisme et votre conformité aux normes.', 'Nous contacter', '/contact'),
])]);

// ── 5. Trainings.tsx → /formations ──
PAGES.push(['formations', 'Espace Formations', buildPage('Formations', [
  heroBlock('Propulsez Votre<br/>Expertise Technique.', 'Le centre de formation PROQUELEC accompagne les professionnels du Sénégal vers la maîtrise totale des normes et de la sécurité électrique.', 'Académie Nationale'),
  featureGridBlock('Domaines d\'Excellence', [
    { title: 'Normes Électriques', desc: 'Maîtrisez la norme SN 01-015 et garantissez des installations 100% conformes et sécurisées.', color: '#dbeafe', textColor: '#2563eb', icon: '📖' },
    { title: 'Efficacité Énergétique', desc: 'Apprenez à optimiser la consommation énergétique pour des bâtiments durables et économiques.', color: '#d1fae5', textColor: '#059669', icon: '⚡' },
    { title: 'Habilitation Électrique', desc: 'Obtenez les certifications nécessaires pour intervenir en toute sécurité sur les installations.', color: '#fef3c7', textColor: '#d97706', icon: '🛡️' },
  ]),
  sectionBlock("L'Excellence Reconnue par les Professionnels", `<div class="max-w-6xl mx-auto">
    <p class="text-center text-slate-600 mb-10">Depuis plus de deux décennies, nous formons l'élite des électriciens et techniciens en sécurité énergétique du Sénégal.</p>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">${[
      { value: '25+', label: "Années d'expérience", desc: 'Dans la formation professionnelle.' },
      { value: '10k+', label: 'Professionnels formés', desc: 'À travers tout le territoire.' },
      { value: '50+', label: 'Experts formateurs', desc: 'Des ingénieurs certifiés et reconnus.' },
      { value: '100%', label: 'Taux de satisfaction', desc: 'Nos apprenants recommandent PROQUELEC.' },
    ].map(s => `<div class="text-center p-6 rounded-xl bg-slate-50 border border-slate-200">
      <div class="text-3xl font-bold text-blue-600 mb-1">${s.value}</div>
      <div class="font-semibold text-slate-900 text-sm">${s.label}</div>
      <div class="text-xs text-slate-500 mt-1">${s.desc}</div>
    </div>`).join('')}</div>
  </div>`, '#f8fafc'),
  ctaBlock('Prêt à passer au niveau supérieur ?', 'Rejoignez nos prochaines sessions de formation et garantissez la conformité de vos futures installations.', 'Voir le Calendrier', '/formation-certification'),
])]);

// ── 6. Blog.tsx → /blog ──
PAGES.push(['blog', 'Blog - PROQUELEC', buildPage('Blog', [
  heroBlock('Blog PROQUELEC', 'Actualités, conseils techniques et informations sur la sécurité électrique au Sénégal.', 'Blog'),
])]);

// ── 7. ActualitesEvenements.tsx → /actualites-evenements ──
PAGES.push(['actualites-evenements', 'Actualités & Événements', buildPage('Actualités & Événements', [
  heroBlock('Au Cœur de<br/>l\'Action.', 'PROQUELEC est sur tous les fronts pour promouvoir la sécurité électrique. Suivez nos actions et nos prises de parole.', 'Espace Média'),
  sectionBlock('Nos Actualités', `<div class="max-w-4xl mx-auto text-center">
    <p class="text-lg text-slate-600">Découvrez nos actualités : anniversaires, séminaires, ateliers techniques, conférences, communiqués et médias. Restez connecté à l'actualité de PROQUELEC.</p>
  </div>`),
  ctaBlock('Presse & Médias', 'Vous êtes journaliste ? Téléchargez notre dossier de presse et contactez notre service communication.', 'Espace Presse', '/presse', '#be123c', '#e11d48'),
])]);

// ── 8. NormesRessources.tsx → /normes-ressources ──
PAGES.push(['normes-ressources', 'Normes & Ressources', buildPage('Normes & Ressources', [
  heroBlock('Normes &<br/>Ressources.', 'L\'expertise technique et réglementaire à la portée de tous. Documentation, guides et outils pour des installations conformes.', 'Référence Technique'),
  sectionBlock('Centre de Ressources', `<div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">${[
    { title: 'Normes Électriques', desc: 'Textes de référence et réglementation en vigueur au Sénégal (NS 01-001, NF C 15-100).' },
    { title: 'Guides Pratiques', desc: 'Guides complets pour l\'application des normes sur le terrain.' },
    { title: 'Mémentos', desc: 'Documents synthétiques pour le rappel rapide des bonnes pratiques.' },
    { title: 'Fiches Conseils', desc: 'Conseils pratiques pour les installations domestiques et professionnelles.' },
    { title: 'FAQ', desc: 'Questions fréquentes sur les normes, la certification et la sécurité.' },
    { title: 'Publications', desc: 'Articles, études et rapports techniques de PROQUELEC.' },
  ].map(c => `<a href="/normes-ressources" class="p-6 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow">
    <h3 class="font-semibold text-slate-900 mb-2">${c.title}</h3>
    <p class="text-sm text-slate-600">${c.desc}</p>
  </a>`).join('')}</div>`),
  ctaBlock('Une Question Technique ?', 'Nos experts normatifs sont là pour vous répondre. Accédez à la base de connaissance la plus complète du Sénégal.', 'Accéder à la FAQ', '/faq', '#0f766e', '#14b8a6'),
])]);

// ── 9. ProjetsRealisations.tsx → /projets-realisations ──
PAGES.push(['projets-realisations', 'Projets & Réalisations', buildPage('Projets & Réalisations', [
  heroBlock('Des Preuves<br/>Concrètes.', 'Au-delà des normes, des actions visibles qui changent le quotidien et renforcent la sécurité des populations.', 'Impact Terrain'),
  sectionBlock('Nos projets', `<div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">${[
    { title: 'Marchés Sécurisés', desc: 'Sécurisation des grands marchés publics et privés au Sénégal.' },
    { title: 'Partenariat SENELEC', desc: 'Collaboration stratégique pour la conformité des installations.' },
    { title: 'Études Majeures', desc: 'Études techniques et audits de grandes envergure.' },
  ].map(c => `<div class="p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
    <h3 class="text-lg font-bold text-slate-900 mb-2">${c.title}</h3>
    <p class="text-sm text-slate-600">${c.desc}</p>
  </div>`).join('')}</div>`),
  ctaBlock('Un Projet à Sécuriser ?', 'Confiez vos installations aux experts reconnus par SENELEC et l\'État. De l\'audit à la certification finale.', 'Demander une étude', '/contact'),
])]);

// ── 10. PartenairesPage.tsx → /partenaires ──
PAGES.push(['partenaires', 'Nos Partenaires', buildPage('Partenaires', [
  heroBlock('Ensemble pour<br/>l\'Excellence.', 'La crédibilité de PROQUELEC repose sur un réseau solide de partenaires nationaux et internationaux.', 'Écosystème de Confiance'),
  sectionBlock('Notre Réseau de Partenaires', `<div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">${[
    { title: 'Partenaires Institutionnels', desc: 'Ministères, agences gouvernementales et institutions publiques.' },
    { title: 'Partenaires Techniques', desc: 'Bureaux d\'études, laboratoires et experts techniques.' },
    { title: 'Partenaires Financiers', desc: 'Banques, institutions de microfinance et bailleurs de fonds.' },
    { title: 'Secteur Privé', desc: 'Entreprises, industriels et opérateurs économiques.' },
  ].map(c => `<div class="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
    <h3 class="text-lg font-bold text-slate-900 mb-2">${c.title}</h3>
    <p class="text-sm text-slate-600">${c.desc}</p>
  </div>`).join('')}</div>`),
])]);

// ── 11. PublicUtility.tsx → /utilite-publique ──
PAGES.push(['utilite-publique', 'Utilité Publique', buildPage('Utilité Publique', [
  heroBlock('Au service de<br/>toute la Nation.', 'De la case du village aux grands édifices de l\'État, PROQUELEC veille sur la sécurité électrique de tous les Sénégalais.', 'Intérêt Général'),
  sectionBlock('Nos missions', `<div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">${[
    { title: 'Pour les Autorités', desc: 'Accompagnement des pouvoirs publics dans la réglementation et le contrôle.' },
    { title: 'Pour les Ménages', desc: 'Sensibilisation et sécurité des installations domestiques.' },
    { title: 'Pour les Professionnels', desc: 'Formation, certification et accompagnement technique.' },
    { title: 'Pour les Collectivités', desc: 'Audit et mise en conformité des bâtiments publics.' },
    { title: 'Marchés & Centres', desc: 'Sécurisation des installations des marchés et centres commerciaux.' },
  ].map(c => `<div class="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
    <h3 class="text-lg font-bold text-slate-900 mb-2">${c.title}</h3>
    <p class="text-sm text-slate-600">${c.desc}</p>
  </div>`).join('')}</div>`),
  ctaBlock('Une mission de responsabilité', 'PROQUELEC est mandaté pour garantir la conformité et la sécurité. Votre confiance est notre moteur.', 'Demander une intervention', '/contact', '#1e40af', '#2563eb'),
])]);

// ── 12. Activities.tsx → /activities ──
PAGES.push(['activities', 'Nos Activités', buildPage('Activités', [
  heroBlock('Des Actions pour<br/>votre Sécurité.', 'PROQUELEC déploie un large éventail de services techniques pour garantir la conformité électrique nationale.', 'Notre Expertise'),
  sectionBlock('Nos domaines d\'intervention', `<div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">${[
    { title: 'Contrôle de Conformité', desc: 'Vérification des installations électriques selon les normes nationales.' },
    { title: 'Labellisation', desc: 'Certification QUALI-ELEC pour les professionnels et entreprises.' },
    { title: 'Formation', desc: 'Programmes de formation aux normes et à la sécurité électrique.' },
    { title: 'Audit Électrique', desc: 'Diagnostic complet des installations et recommandations.' },
  ].map(c => `<div class="p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
    <h3 class="text-lg font-bold text-slate-900 mb-2">${c.title}</h3>
    <p class="text-sm text-slate-600">${c.desc}</p>
  </div>`).join('')}</div>`),
])]);

// ── 13. AdvantagesPage.tsx → /avantages ──
PAGES.push(['avantages', 'Avantages', buildPage('Avantages', [
  heroBlock('Avantages PROQUELEC', 'Découvrez les avantages exclusifs de PROQUELEC pour les professionnels et les membres.', 'Exclusivités'),
  sectionBlock('Profils', `<div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">${[
    { title: 'Électriciens Indépendants', desc: 'Élevez votre expertise et sécurisez vos chantiers.' },
    { title: 'Entreprises & Installateurs', desc: 'Fluidifiez vos opérations et certifiez votre qualité.' },
    { title: 'Membres de l\'Association', desc: 'Le cœur de l\'expertise électrique au Sénégal.' },
  ].map(c => `<div class="p-6 rounded-xl border border-slate-200 bg-white shadow-sm text-center">
    <h3 class="text-lg font-bold text-slate-900 mb-2">${c.title}</h3>
    <p class="text-sm text-slate-600">${c.desc}</p>
  </div>`).join('')}</div>`),
])]);

// ── 14. Legal.tsx → /legal ──
PAGES.push(['legal', 'Mentions Légales', buildPage('Mentions Légales', [
  heroBlock('Cadre Légal.', 'PROQUELEC s\'engage à respecter les normes de transparence et de protection des données en vigueur au Sénégal.', 'Conformité & Transparence'),
  sectionBlock('Informations Légales', `<div class="max-w-4xl mx-auto prose prose-slate">
    <p><strong>PROQUELEC</strong> — Promotion de la Qualité des Installations Électriques au Sénégal.</p>
    <p>Conformément aux dispositions de la loi n° 2008-08 du 25 janvier 2008 sur les transactions électroniques et la protection des données personnelles.</p>
    <ul>
      <li>Siège social : Dakar, Sénégal</li>
      <li>Registre de commerce : RC Dakar</li>
      <li>Numéro d'identification fiscale : ...</li>
    </ul>
    <p class="text-sm text-slate-500 mt-8">Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  </div>`),
  ctaBlock('Une question d\'ordre Juridique ?', 'Notre service juridique est à votre disposition pour toute précision concernant nos conditions générales ou la protection de vos données.', 'Contacter le Service Juridique', '/contact'),
])]);

// ── 15. Contact.tsx → /contact ──
PAGES.push(['contact', 'Contactez-nous', buildPage('Contact', [
  heroBlock('Contactez PROQUELEC', 'Notre équipe est à votre disposition pour répondre à toutes vos questions.', 'Contact'),
  sectionBlock('Nos coordonnées', `<div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">${[
    { title: 'Adresse', content: 'Dakar, Sénégal' },
    { title: 'Téléphone', content: '+221 XX XXX XX XX' },
    { title: 'Email', content: 'info@proquelec.sn' },
  ].map(c => `<div class="p-6 rounded-xl border border-slate-200 bg-white text-center shadow-sm">
    <h3 class="text-lg font-bold text-slate-900 mb-2">${c.title}</h3>
    <p class="text-slate-600">${c.content}</p>
  </div>`).join('')}</div>
  <div class="mt-10 max-w-2xl mx-auto">
    <p class="text-center text-slate-500 mb-6">Ou utilisez notre formulaire de contact pour nous écrire directement.</p>
    <form class="space-y-4" onsubmit="alert('Formulaire désactivé — utilisez l\'API /api/contact-requests');return false">
      <input type="text" placeholder="Votre nom" class="w-full p-3 border border-slate-300 rounded-lg" />
      <input type="email" placeholder="Votre email" class="w-full p-3 border border-slate-300 rounded-lg" />
      <textarea placeholder="Votre message" rows="5" class="w-full p-3 border border-slate-300 rounded-lg"></textarea>
      <button type="submit" class="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Envoyer</button>
    </form>
  </div>`),
])]);


// ═══════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Migration du contenu des TSX orphelins vers des blocs Builder...\n');

    let updated = 0;
    let errors = 0;

    for (const [slug, title, craftGraph] of PAGES) {
      try {
        const json = JSON.stringify(craftGraph);
        const res = await client.query(
          'UPDATE public.pages SET structure_json = $1, updated_at = NOW(), render_engine = $2 WHERE slug = $3 RETURNING id, title',
          [json, 'raw', slug]
        );

        if (res.rows.length > 0) {
          updated++;
          const blockCount = Object.keys(craftGraph).length - 1; // minus ROOT
          console.log(`   ✅ "${slug}" (${res.rows[0].title}) — ${blockCount} blocs`);
        } else {
          console.warn(`   ⚠️  "${slug}" — page non trouvée dans la DB`);
        }
      } catch (err) {
        errors++;
        console.error(`   ❌ "${slug}": ${err.message}`);
      }
    }

    console.log(`\n📊 Résultat : ${updated} pages mises à jour, ${errors} erreurs`);
    console.log('✅ Migration terminée !');
    console.log('\n➡️  Exécutez maintenant: node server/migrations/cleanup_orphan_tsx.js');

  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
