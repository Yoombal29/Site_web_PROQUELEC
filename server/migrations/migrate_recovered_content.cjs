/**
 * migrate_recovered_content.cjs
 * Ajoute le contenu récupéré de l'ancien site WebSite X5 (2015) dans les pages existantes.
 *
 * Usage: node server/migrations/migrate_recovered_content.cjs
 */
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let counter = Date.now();
function nid() { counter++; return `rc_${counter.toString(36)}`; }

// ─── Helper: build a single HtmlBlock node ───
function htmlBlock(html, displayName, extraProps = {}) {
  const id = nid();
  return {
    id,
    node: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: { html, padding: 0, globalCss: '', ...extraProps },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName,
      linkedNodes: {},
    },
  };
}

// ─── Helper: style tag for animations ───
const ANIM_CSS = `<style>
@keyframes fadeUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes slideLeft { from { opacity:0; transform:translateX(-40px) } to { opacity:1; transform:translateX(0) } }
@keyframes slideRight { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }
@keyframes scaleIn { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:scale(1) } }
@keyframes countUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
.anim-fade-up { animation:fadeUp 0.8s ease-out both }
.anim-fade-in { animation:fadeIn 0.8s ease-out both }
.anim-slide-left { animation:slideLeft 0.8s ease-out both }
.anim-slide-right { animation:slideRight 0.8s ease-out both }
.anim-scale-in { animation:scaleIn 0.6s ease-out both }
.anim-delay-1 { animation-delay:0.1s }
.anim-delay-2 { animation-delay:0.2s }
.anim-delay-3 { animation-delay:0.3s }
.anim-delay-4 { animation-delay:0.4s }
.anim-delay-5 { animation-delay:0.5s }
.anim-delay-6 { animation-delay:0.6s }
.anim-delay-7 { animation-delay:0.7s }
.anim-delay-8 { animation-delay:0.8s }
</style>`;

// ─── HTML SECTIONS ───

// 1. Edito — Message du Directeur Général
function editoBlock() {
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
  <div class="max-w-4xl mx-auto relative">
    <div class="absolute -top-10 left-0 text-8xl font-serif opacity-10" style="color:#3b82f6">"</div>
    <div class="relative z-10 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border rounded-full mb-6" style="border-color:#3b82f6;color:#60a5fa">Édito</span>
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">Message du Directeur Général</h2>
      <div class="space-y-6 text-lg text-slate-300 leading-relaxed">
        <p>L'information et la communication en direction des usagers et des professionnels de l'électricité constituent les actions fondamentales de PROQUELEC.</p>
        <p>La <strong class="text-white">vulgarisation des normes et des dispositions sécuritaires</strong> en matière d'installations électriques intérieures sont la raison d'être de notre organisme.</p>
        <p>Eu égard au rôle de service public qui nous est dévolu dans la préservation des personnes et des biens contre les risques d'origine électrique, l'outil Internet est irremplaçable dans le contexte actuel des Technologies de l'Information et de la Communication.</p>
        <p class="text-white font-semibold text-xl">Ce site est le vôtre&nbsp;; profitez-en pour bénéficier de conseils, consulter notre agenda, nous écrire et prendre toute information utile pour faire bon ménage avec l'électricité.</p>
      </div>
      <div class="mt-10 pt-8 border-t border-slate-700 flex items-center gap-4 anim-fade-in anim-delay-3">
        <div class="w-14 h-14 rounded-full" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)"></div>
        <div>
          <p class="text-white font-bold">Le Directeur Général</p>
          <p class="text-sm text-slate-400">PROQUELEC Sénégal</p>
        </div>
      </div>
    </div>
  </div>
</section>`, 'Message du Directeur');
}

// 2. L'Association — historique et statut légal
function associationBlock() {
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div class="space-y-6 anim-slide-left">
        <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border rounded-full" style="border-color:#3b82f6;color:#2563eb">Fondation</span>
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">L'Association</h2>
        <p class="text-slate-500 text-lg">Pour la Promotion de la Qualité des Installations Électriques Intérieures</p>
        <div class="h-1 w-20 rounded-full" style="background:linear-gradient(90deg,#3b82f6,#1d4ed8)"></div>
      </div>
      <div class="space-y-6 anim-slide-right">
        <div class="grid grid-cols-2 gap-4">
          <div class="p-6 rounded-2xl border border-slate-200 bg-slate-50 text-center anim-fade-up anim-delay-1">
            <div class="text-3xl font-bold" style="color:#3b82f6">1995</div>
            <div class="text-sm text-slate-500 mt-1">Fondée le 12 octobre</div>
          </div>
          <div class="p-6 rounded-2xl border border-slate-200 bg-slate-50 text-center anim-fade-up anim-delay-2">
            <div class="text-3xl font-bold" style="color:#3b82f6">60-08</div>
            <div class="text-sm text-slate-500 mt-1">Loi sénégalaise</div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 anim-fade-up">
      <div class="p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1" style="background:#f8fafc">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-xl" style="background:#dbeafe;color:#2563eb">📜</div>
        <h3 class="text-lg font-bold text-slate-900 mb-3">Statut Légal</h3>
        <p class="text-slate-600 text-sm leading-relaxed">Association de service public régie par la loi sénégalaise n° 60-08 du 26 mars 1968. Récépissé n° 8470 MINT/DAGAT du 12 octobre 1995.</p>
      </div>
      <div class="p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1" style="background:#f8fafc">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-xl" style="background:#d1fae5;color:#059669">🌍</div>
        <h3 class="text-lg font-bold text-slate-900 mb-3">Rayonnement International</h3>
        <p class="text-slate-600 text-sm leading-relaxed">Membre fondateur de la <strong>FISUEL</strong> (Fédération Internationale pour la Sécurité des Usagers de l'Électricité), créée le 1er février 2002 à Beyrouth.</p>
      </div>
      <div class="p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1" style="background:#f8fafc">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-xl" style="background:#fef3c7;color:#d97706">🎯</div>
        <h3 class="text-lg font-bold text-slate-900 mb-3">Mission</h3>
        <p class="text-slate-600 text-sm leading-relaxed">Promotion de la qualité du matériel et des installations électriques dans les bâtiments neufs et anciens par la vulgarisation des normes.</p>
      </div>
    </div>
    <div class="mt-12 p-8 rounded-2xl anim-fade-in anim-delay-3" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
      <p class="text-slate-300 text-center text-lg leading-relaxed">"Une installation électrique de qualité se caractérise par son aptitude à assurer le fonctionnement des appareils, sa capacité à garantir la sécurité des personnes et la conservation des biens, et sa conception économique."</p>
    </div>
  </div>
</section>`, 'L\'Association');
}

// 3. L'Organisation — gouvernance
function organisationBlock() {
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border rounded-full mb-6" style="border-color:#3b82f6;color:#2563eb">Gouvernance</span>
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">L'Organisation</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Une structure au service de la qualité et de la sécurité électrique au Sénégal</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 anim-slide-left">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style="background:#dbeafe;color:#2563eb">🏛️</div>
          <div>
            <h3 class="text-xl font-bold text-slate-900">Conseil d'Administration</h3>
            <p class="text-sm text-slate-500">Instance dirigeante</p>
          </div>
        </div>
        <p class="text-slate-600 leading-relaxed">Composé de <strong class="text-slate-900">douze administrateurs</strong> désignés par les organismes membres fondateurs à raison de quatre par groupement. Il définit la politique générale et valide les programmes annuels d'activités sur la base d'un budget.</p>
      </div>
      <div class="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 anim-slide-right">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style="background:#d1fae5;color:#059669">👤</div>
          <div>
            <h3 class="text-xl font-bold text-slate-900">Direction Générale</h3>
            <p class="text-sm text-slate-500">Exécution et coordination</p>
          </div>
        </div>
        <p class="text-slate-600 leading-relaxed">Le Directeur général est chargé de l'exécution des décisions du conseil d'administration. Il coordonne les actions de l'Association sur tout le territoire national et prépare l'information à diffuser.</p>
      </div>
      <div class="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 md:col-span-2 anim-fade-up anim-delay-2">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style="background:#fef3c7;color:#d97706">⚙️</div>
          <div>
            <h3 class="text-xl font-bold text-slate-900">Coordination Technique</h3>
            <p class="text-sm text-slate-500">Commissions technique et communication</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div class="p-5 rounded-xl border border-slate-100 bg-slate-50">
            <p class="text-sm text-slate-700"><strong class="text-slate-900">Commission Technique</strong> — Élaboration des documents traitant des règles et des normes, conduite du processus d'élaboration des labels.</p>
          </div>
          <div class="p-5 rounded-xl border border-slate-100 bg-slate-50">
            <p class="text-sm text-slate-700"><strong class="text-slate-900">Commission Communication</strong> — Diffusion de l'information, participation aux réunions nationales et régionales, organisation de stands dans les manifestations.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`, 'L\'Organisation');
}

// 4. Les Activités de PROQUELEC
function activitiesBlock() {
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border rounded-full mb-6" style="border-color:#3b82f6;color:#2563eb">Nos Actions</span>
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Les Activités de PROQUELEC</h2>
      <p class="text-slate-500 max-w-3xl mx-auto">Toutes ces actions sont menées à titre bénévole et concourent à assurer une meilleure sécurité et un meilleur confort aux usagers de l'électricité.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="group p-8 rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white anim-fade-up anim-delay-1">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-all duration-500 group-hover:scale-110" style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);color:#2563eb">📢</div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Information & Communication</h3>
        <p class="text-slate-600 leading-relaxed">Élaboration et diffusion d'une information adaptée aux besoins des concepteurs, prescripteurs, installateurs et utilisateurs.</p>
      </div>
      <div class="group p-8 rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white anim-fade-up anim-delay-2">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-all duration-500 group-hover:scale-110" style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);color:#059669">🏆</div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Label de Qualité</h3>
        <p class="text-slate-600 leading-relaxed">Mise en œuvre d'une politique de labels décernés aux installations électriques assurant sécurité, confort et économie, permettant d'identifier les logements bien équipés.</p>
      </div>
      <div class="group p-8 rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white anim-fade-up anim-delay-3">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-all duration-500 group-hover:scale-110" style="background:linear-gradient(135deg,#fef3c7,#fde68a);color:#d97706">📋</div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Participation Réglementaire</h3>
        <p class="text-slate-600 leading-relaxed">Participation avec les départements ministériels à la définition et à la révision des prescriptions réglementaires et des normes de matériels électriques.</p>
      </div>
      <div class="group p-8 rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white anim-fade-up anim-delay-4">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-all duration-500 group-hover:scale-110" style="background:linear-gradient(135deg,#f3e8ff,#e9d5ff);color:#9333ea">🤝</div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Sensibilisation & Événements</h3>
        <p class="text-slate-600 leading-relaxed">Organisation de réunions d'information, participation aux expositions et manifestations nationales et internationales dans le domaine électrique.</p>
      </div>
    </div>
  </div>
</section>`, 'Les Activités');
}

// 5. Organismes membres (partenaires)
function membresBlock() {
  const members = [
    { name: 'SENELEC', desc: 'Société d\'Électricité du Sénégal — Production, transport et distribution d\'énergie électrique sur tout le territoire.', tel: '839.30.30', web: 'www.senelec.sn', color: '#dbeafe', textColor: '#2563eb' },
    { name: 'COSELEC "A"', desc: 'Constructions Électriques Africaines — Installation électrique HT/BT, automatismes industriels, études et programmation.', color: '#d1fae5', textColor: '#059669' },
    { name: 'E.E.R.I.', desc: 'Études et Réalisations d\'Infrastructures SARL — Génie civil et électrique, 20+ ans d\'expérience.', color: '#fef3c7', textColor: '#d97706' },
    { name: 'SECOM - AFRIQUE', desc: 'Électricité HT/MT/BT, protection foudre, hydraulique, énergie solaire, groupes de secours.', color: '#f3e8ff', textColor: '#9333ea' },
    { name: 'CGE', desc: 'Compagnie Générale d\'Énergie — 40+ ans d\'expérience, représente Legrand, Merlin Gerin, Nexans, Alstom. 15 000+ références produits.', color: '#ccfbf1', textColor: '#0d9488' },
    { name: 'LCS', desc: 'Les Cableries du Sénégal — Fabrication de câbles électriques, télécommunications et coaxiaux.', color: '#fce7f3', textColor: '#db2777' },
    { name: 'UNCM', desc: 'Union Nationale des Chambres de Métiers — Établissement public couvrant près de 130 corps de métiers de l\'artisanat.', color: '#e0f2fe', textColor: '#0369a1' },
  ];
  const cards = members.map((m, i) => `<div class="group p-6 rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 anim-fade-up anim-delay-${i + 1}" style="border-color:${m.color}">
    <div class="flex items-center gap-4 mb-4">
      <div class="w-4 h-4 rounded-full" style="background:${m.textColor}"></div>
      <h3 class="font-bold text-slate-900">${m.name}</h3>
    </div>
    <p class="text-sm text-slate-600 leading-relaxed">${m.desc}</p>
    ${m.tel ? `<p class="text-xs text-slate-400 mt-3">Tel: ${m.tel}</p>` : ''}
    ${m.web ? `<p class="text-xs mt-1"><a href="http://${m.web}" target="_blank" class="text-blue-600 hover:underline">${m.web}</a></p>` : ''}
  </div>`).join('');
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border rounded-full mb-6" style="border-color:#3b82f6;color:#60a5fa">Membres Fondateurs</span>
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Organismes Membres</h2>
      <p class="text-slate-400 max-w-3xl mx-auto">Un réseau solide d'acteurs clés du secteur électrique sénégalais réunis autour de la qualité et de la sécurité.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${cards}</div>
  </div>
</section>`, 'Membres Fondateurs');
}

// 6. Mémentos techniques
function mementosBlock() {
  const items = [
    { title: 'Locaux d\'habitation', desc: 'Installations électriques — les principales dispositions des textes officiels en vigueur.' },
    { title: 'La protection différentielle', desc: 'Comprendre et appliquer les dispositifs de protection différentielle dans les installations.' },
    { title: 'Établissements recevant du public', desc: 'Installation électrique pour ERP : magasins, hôtels, écoles, établissements sanitaires.' },
    { title: 'Locaux recevant des travailleurs', desc: 'Installation électrique Haute et Basse tension pour les environnements professionnels.' },
    { title: 'Mode d\'alimentation des marchés', desc: 'Spécifications techniques pour l\'alimentation électrique des marchés et centres commerciaux.' },
  ];
  const list = items.map((m, i) => `<div class="flex items-start gap-5 p-5 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-all duration-300 anim-slide-left anim-delay-${i + 1}">
    <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style="background:#dbeafe;color:#2563eb">📘</div>
    <div>
      <h4 class="font-bold text-slate-900 mb-1">${m.title}</h4>
      <p class="text-sm text-slate-600">${m.desc}</p>
    </div>
  </div>`).join('');
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4 bg-white">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-14 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border rounded-full mb-6" style="border-color:#3b82f6;color:#2563eb">Ressources</span>
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Mémentos Techniques</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Ils regroupent et explicitent les principales dispositions des textes officiels en vigueur pour mieux les faire connaître et en faciliter l'application.</p>
      <div class="h-1 w-20 mx-auto rounded-full mt-6" style="background:linear-gradient(90deg,#3b82f6,#1d4ed8)"></div>
    </div>
    <div class="space-y-4">${list}</div>
    <div class="mt-10 p-8 rounded-2xl anim-fade-in" style="background:linear-gradient(135deg,#f8fafc,#f1f5f9)">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-2xl">🎓</span>
        <h3 class="text-xl font-bold text-slate-900">Pour l'Enseignement</h3>
      </div>
      <p class="text-slate-600 leading-relaxed">PROQUELEC met à la disposition des professeurs et élèves de l'enseignement technique et professionnel tous ces documents qui peuvent s'intégrer dans leurs programmes.</p>
    </div>
  </div>
</section>`, 'Mémentos');
}

// 7. Feuillets techniques
function feuilletsBlock() {
  const items = [
    'La prise de terre',
    'Installation électrique triphasée',
    'Liaison équipotentielle dans la salle d\'eau',
    'Alimentation électrique de la maison individuelle',
    'Appareils électriques dans la salle d\'eau',
    'Protection de votre installation électrique',
  ];
  const list = items.map((f, i) => `<div class="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-all duration-300 anim-fade-up anim-delay-${i + 1}">
    <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style="background:${['#3b82f6','#059669','#d97706','#9333ea','#db2777','#0891b2'][i]}">${i + 1}</span>
    <span class="text-slate-800 font-medium">${f}</span>
  </div>`).join('');
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-14 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border rounded-full mb-6" style="border-color:#3b82f6;color:#2563eb">Documentation</span>
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Feuillets Techniques</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Une documentation spécifique pour aborder les problèmes techniques d'électricité et définir les programmes de travaux nécessaires.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${list}</div>
    <div class="mt-10 p-8 rounded-2xl anim-fade-in anim-delay-3" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-2xl">🏢</span>
        <h3 class="text-xl font-bold text-white">Pour les Syndics et Gérants d'Immeubles</h3>
      </div>
      <p class="text-slate-300 leading-relaxed">Ces feuillets permettent de mieux aborder les problèmes techniques, de sensibiliser les copropriétaires à la nécessité de mettre une installation électrique aux normes de sécurité.</p>
    </div>
  </div>
</section>`, 'Feuillets');
}

// 8. Brochures grand public
function brochuresBlock() {
  const items = [
    { icon: '📖', title: 'Informations sur PROQUELEC', desc: 'Découvrez notre organisme, nos missions et nos actions pour la sécurité électrique.' },
    { icon: '💡', title: 'L\'Électricité chez vous', desc: 'Les principes élémentaires de sécurité à respecter dans l\'usage de l\'électricité au quotidien.' },
    { icon: '🔌', title: 'Votre installation vieillit', desc: 'Êtes-vous en sécurité ? Les signes d\'usure et les solutions pour rénover sans abîmer.' },
    { icon: '🤝', title: 'Faites bon ménage avec l\'électricité', desc: 'Conseils pratiques et gestes simples pour une cohabitation sécurisée avec l\'électricité.' },
  ];
  const cards = items.map((b, i) => `<div class="group p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 anim-fade-up anim-delay-${i + 1}">
    <span class="text-4xl block mb-4 transition-transform duration-300 group-hover:scale-110">${b.icon}</span>
    <h3 class="text-lg font-bold text-slate-900 mb-3">${b.title}</h3>
    <p class="text-sm text-slate-600 leading-relaxed">${b.desc}</p>
  </div>`).join('');
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border rounded-full mb-6" style="border-color:#3b82f6;color:#2563eb">Publications</span>
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Brochures & Guides</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">PROQUELEC distribue gratuitement des fiches, brochures et dépliants pour sensibiliser le grand public à la sécurité électrique.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">${cards}</div>
  </div>
</section>`, 'Brochures');
}

// 9. Ce qu'il ne faut pas faire — Safety rules
function nePasFaireBlock() {
  const rules = [
    'Utiliser un appareil électrique avec les mains mouillées ou les pieds dans l\'eau.',
    'Nettoyer ou changer un accessoire d\'un appareil sans le débrancher au préalable.',
    'Intervenir sur votre installation sans couper le courant au disjoncteur général.',
    'Débrancher un appareil en tirant sur le fil.',
    'Bricoler votre téléviseur, branché ou venant d\'être débranché (électricité statique).',
    'Remplacer un fusible fondu par un fusible plus gros ou une épingle à cheveux.',
    'Laisser branché inutilement un appareil.',
    'Déplacer une pièce métallique de grande longueur près d\'une ligne électrique aérienne.',
  ];
  const list = rules.map((r, i) => `<div class="flex items-start gap-4 p-4 rounded-xl border border-red-100 bg-white hover:shadow-md transition-all duration-300 anim-slide-left anim-delay-${i + 1}">
    <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style="background:#ef4444">${i + 1}</span>
    <p class="text-slate-700 leading-relaxed">${r}</p>
  </div>`).join('');
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4" style="background:linear-gradient(135deg,#fef2f2 0%,#fee2e2 100%)">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-14 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-full mb-6" style="background:#fecaca;color:#dc2626">⚠️ Sécurité</span>
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Ce qu'il ne faut pas faire</h2>
      <p class="text-slate-600 max-w-2xl mx-auto">L'électricité : un compagnon précieux, inséparable, mais dangereux si on ne prend pas les précautions d'usage.</p>
    </div>
    <div class="space-y-3">${list}</div>
    <div class="mt-10 p-6 rounded-2xl text-center anim-fade-in" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
      <p class="text-blue-300 font-medium">Un conseil PROQUELEC reçu... Un mémento lu... Un feuillet technique consulté... Autant de déboires évités.</p>
    </div>
  </div>
</section>`, 'Ce qu\'il ne faut pas faire');
}

// 10. Faites bon ménage avec l'électricité
function bonMenageBlock() {
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4 bg-white">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-14 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border rounded-full mb-6" style="border-color:#3b82f6;color:#2563eb">Conseils</span>
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Faites bon ménage avec l'électricité</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 rounded-2xl border border-emerald-100 anim-slide-left" style="background:#f0fdf4">
        <h3 class="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2"><span>✅</span> Vérifications essentielles</h3>
        <ul class="space-y-3 text-sm text-emerald-700">
          <li class="flex items-start gap-2">• Disjoncteur différentiel et prise de terre de valeur appropriée</li>
          <li class="flex items-start gap-2">• Raccordement de toutes les prises à la terre</li>
          <li class="flex items-start gap-2">• Respect des règles particulières de sécurité pour les salles d'eau</li>
          <li class="flex items-start gap-2">• Prises et diamètres de fils adaptés à la puissance des appareils</li>
          <li class="flex items-start gap-2">• Matériel électrique normalisé</li>
        </ul>
      </div>
      <div class="p-6 rounded-2xl border border-red-100 anim-slide-right" style="background:#fef2f2">
        <h3 class="text-lg font-bold text-red-800 mb-4 flex items-center gap-2"><span>❌</span> À ne pas tolérer</h3>
        <ul class="space-y-3 text-sm text-red-700">
          <li class="flex items-start gap-2">• Prises de courant cassées ou démontées</li>
          <li class="flex items-start gap-2">• Interrupteurs défectueux</li>
          <li class="flex items-start gap-2">• Fils volants ou apparents</li>
          <li class="flex items-start gap-2">• Mauvais contacts</li>
        </ul>
      </div>
      <div class="p-6 rounded-2xl border border-amber-100 md:col-span-2 anim-fade-up anim-delay-2" style="background:#fffbeb">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-bold text-amber-800 mb-3">🔌 Bonnes pratiques</h3>
            <ul class="space-y-2 text-sm text-amber-700">
              <li>• Pas de douilles métalliques dans la salle d'eau (uniquement plastique)</li>
              <li>• Évitez les fiches multiples — préférez les prises doubles</li>
              <li>• N'abusez pas des prolongateurs</li>
              <li>• Ne laissez jamais un prolongateur branché sans appareil</li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-bold text-amber-800 mb-3">👶 Sécurité des enfants</h3>
            <ul class="space-y-2 text-sm text-amber-700">
              <li>• Faites poser des prises à éclipses (trous fermés)</li>
              <li>• Pas de jouets électriques branchés sur prise</li>
              <li>• Préférez les jouets à piles ou avec transformateur &lt; 25V</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-8 text-center text-slate-500 text-sm anim-fade-in anim-delay-3">
      <p>Eau et électricité vous sont familières. Mais, comme chien et chat, prenez soin de bien les séparer.</p>
    </div>
  </div>
</section>`, 'Bon ménage');
}

// 11. Votre installation électrique vieillit
function installationVieillitBlock() {
  const signs = [
    'Les isolants se détériorent',
    'Les prises s\'usent',
    'Les fils se dénudent',
    'Le faible diamètre des fils n\'est plus adapté à la puissance de vos appareils',
    'Il n\'y a pas de prise de terre',
    'Il n\'y a pas de disjoncteur différentiel',
  ];
  const questions = [
    'Votre disjoncteur est-il différentiel ?',
    'Avez-vous une prise de terre conforme aux normes ?',
    'Les prises de courant sont-elles raccordées à la terre ?',
    'Vos fusibles chauffent-ils ?',
    'Pouvez-vous brancher sans problème vos gros appareils ?',
    'Les fils, prises, interrupteurs sont-ils en bon état ?',
    'Dans la salle de bains, les règles de sécurité sont-elles respectées ?',
  ];
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4" style="background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-14 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-full mb-6" style="background:#fef3c7;color:#d97706">🔧 Diagnostic</span>
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Votre installation électrique vieillit...</h2>
      <p class="text-xl font-semibold text-red-600">Êtes-vous en sécurité ?</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      <div class="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm anim-slide-left">
        <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><span class="text-2xl">📉</span> Signes de vieillissement</h3>
        <ul class="space-y-3">${signs.map((s, i) => `<li class="flex items-start gap-3 text-slate-700 anim-fade-up anim-delay-${i + 1}"><span class="text-red-400 mt-0.5">▶</span>${s}</li>`).join('')}</ul>
      </div>
      <div class="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm anim-slide-right">
        <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><span class="text-2xl">❓</span> Questions à se poser</h3>
        <ul class="space-y-3">${questions.map((q, i) => `<li class="flex items-start gap-3 text-slate-700 anim-fade-up anim-delay-${i + 1}"><span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style="background:#3b82f6">${i + 1}</span>${q}</li>`).join('')}</ul>
      </div>
    </div>
    <div class="p-8 rounded-2xl anim-fade-in anim-delay-3" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-3xl">🛠️</span>
        <h3 class="text-xl font-bold text-white">Comment rénover sans abîmer ?</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div class="p-4 rounded-xl" style="background:rgba(255,255,255,0.08)">
          <p class="text-sm text-slate-300">Des matériels adaptés à la rénovation, faciles à mettre en œuvre, sans dégradation des parois.</p>
        </div>
        <div class="p-4 rounded-xl" style="background:rgba(255,255,255,0.08)">
          <p class="text-sm text-slate-300">Le tableau de distribution peut être dissimulé dans un coffret spécial à peindre ou à tapisser.</p>
        </div>
        <div class="p-4 rounded-xl" style="background:rgba(255,255,255,0.08)">
          <p class="text-sm text-slate-300">Les moulures et plinthes en plastique se fixent par collage ou clouage sans dégradation des murs.</p>
        </div>
        <div class="p-4 rounded-xl" style="background:rgba(255,255,255,0.08)">
          <p class="text-sm text-slate-300">Des accessoires permettent de fixer prises et interrupteurs à la canalisation existante.</p>
        </div>
      </div>
    </div>
  </div>
</section>`, 'Installation vieillit');
}

// 12. Protection foudre — Extérieur
function foudreExterieurBlock() {
  const tips = [
    'Éviter au maximum les activités de plein air (loisirs, sports, travail)',
    'Ne jamais s\'abriter sous un arbre',
    'En espace ouvert, ne porter aucun objet métallique',
    'S\'écarter des autres personnes d\'au moins trois mètres (arcs latéraux)',
    'S\'éloigner de toute structure métallique (pylônes, clôtures)',
    'S\'abriter dans une structure métallique fermée (voiture, portes et vitres fermées)',
    'Ne pas se tenir les jambes écartées, ne pas marcher à grandes enjambées (tensions de pas)',
    'En forêt, s\'écarter des troncs et branches basses',
    'Éviter de téléphoner sur un fixe pendant l\'orage',
    'Débrancher le câble d\'antenne de télévision',
  ];
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4 bg-white">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-14 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-full mb-6" style="background:#e0f2fe;color:#0369a1">⛈️ Protection</span>
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">La Foudre — À l'extérieur</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Comment éviter les coups de foudre, particulièrement dans les zones à niveau kéraunique (Nk) élevé.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${tips.map((t, i) => `<div class="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:shadow-md transition-all duration-300 anim-fade-up anim-delay-${Math.min(i + 1, 8)}">
      <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style="background:${i < 3 ? '#ef4444' : i < 6 ? '#f59e0b' : '#3b82f6'}">${i + 1}</span>
      <p class="text-sm text-slate-700">${t}</p>
    </div>`).join('')}</div>
    <div class="mt-8 p-6 rounded-2xl text-center anim-fade-in" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
      <p class="text-blue-300 font-medium">En montagne : s'éloigner des pointes et arêtes, s'abriter en position accroupie dans les ressauts, ne pas se plaquer contre une paroi rocheuse.</p>
    </div>
  </div>
</section>`, 'Foudre extérieur');
}

// 13. Protection foudre — Intérieur
function foudreInterieurBlock() {
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-14 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border rounded-full mb-6" style="border-color:#3b82f6;color:#60a5fa">🏠 Protection</span>
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">La Foudre — À l'intérieur</h2>
      <p class="text-slate-400 max-w-2xl mx-auto">Comment protéger les personnes et les équipements sensibles contre les effets de la foudre.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-8 rounded-2xl anim-slide-left" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
        <span class="text-3xl block mb-4">⚡</span>
        <h3 class="text-xl font-bold text-white mb-4">Effets directs</h3>
        <ul class="space-y-3 text-sm text-slate-300">
          <li class="flex items-start gap-2">• Personnes et animaux foudroyés</li>
          <li class="flex items-start gap-2">• Dommages et incendies (perte de biens)</li>
        </ul>
        <div class="mt-6 p-4 rounded-xl" style="background:rgba(59,130,246,0.15)">
          <p class="text-sm text-blue-200 font-medium">Solution : Installation de paratonnerres pour capter le courant de foudre et l'écouler vers la terre.</p>
        </div>
      </div>
      <div class="p-8 rounded-2xl anim-slide-right" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
        <span class="text-3xl block mb-4">🌩️</span>
        <h3 class="text-xl font-bold text-white mb-4">Effets indirects</h3>
        <ul class="space-y-3 text-sm text-slate-300">
          <li class="flex items-start gap-2">• Surtensions sur les réseaux électriques aériens</li>
          <li class="flex items-start gap-2">• Surtensions sur les réseaux de télécommunications</li>
          <li class="flex items-start gap-2">• Équipements électroniques, informatiques endommagés</li>
        </ul>
        <div class="mt-6 p-4 rounded-xl" style="background:rgba(245,158,11,0.15)">
          <p class="text-sm text-amber-200 font-medium">Solutions : Réseau équipotentiel, parafoudres en tête d'installation, câbles blindés, éviter les boucles.</p>
        </div>
      </div>
    </div>
    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 anim-fade-in anim-delay-2">
      <div class="p-5 rounded-xl text-center" style="background:rgba(255,255,255,0.04)">
        <div class="text-3xl font-bold text-white">Nk</div>
        <div class="text-xs text-slate-400 mt-1">Jours par an où l'on entend le tonnerre</div>
      </div>
      <div class="p-5 rounded-xl text-center" style="background:rgba(255,255,255,0.04)">
        <div class="text-3xl font-bold text-white">Ng</div>
        <div class="text-xs text-slate-400 mt-1">Coups de foudre au sol par km² / an</div>
      </div>
      <div class="p-5 rounded-xl text-center" style="background:rgba(255,255,255,0.04)">
        <div class="text-3xl font-bold text-white">18</div>
        <div class="text-xs text-slate-400 mt-1">Numéro d'urgence Sapeurs Pompiers</div>
      </div>
    </div>
  </div>
</section>`, 'Foudre intérieur');
}

// 14. Vidéothèque
function videotequeBlock() {
  return htmlBlock(`${ANIM_CSS}
<section class="py-20 px-4 bg-white">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-14 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase border rounded-full mb-6" style="border-color:#3b82f6;color:#2563eb">Médias</span>
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Vidéothèque</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Découvrez nos vidéos de sensibilisation à la sécurité électrique.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 anim-slide-left">
        <div class="aspect-video flex items-center justify-center" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
          <div class="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style="background:rgba(59,130,246,0.2)">
            <span class="text-3xl">▶️</span>
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-lg font-bold text-slate-900 mb-2">Sanekh et la contrefaçon</h3>
          <p class="text-sm text-slate-600">La maison de Sanekh est installée avec du matériel contrefait. Son disjoncteur ne cesse de disjoncter. Il fait appel à un technicien...</p>
          <span class="inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full" style="background:#fef3c7;color:#d97706">Lutte contre la contrefaçon</span>
        </div>
      </div>
      <div class="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 anim-slide-right">
        <div class="aspect-video flex items-center justify-center" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
          <div class="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style="background:rgba(59,130,246,0.2)">
            <span class="text-3xl">▶️</span>
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-lg font-bold text-slate-900 mb-2">Électrification zone périurbaine</h3>
          <p class="text-sm text-slate-600">Là où l'électricité ne fait pas bon ménage — Film tourné dans les zones périurbaines de Pikine, Sénégal (Décembre 2008).</p>
          <span class="inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full" style="background:#dbeafe;color:#2563eb">Documentaire</span>
        </div>
      </div>
    </div>
  </div>
</section>`, 'Vidéothèque');
}


// ─── PAGE MAPPING ───
const PAGE_CONTENT = {
  'about': [
    editoBlock(),
    associationBlock(),
    organisationBlock(),
    activitiesBlock(),
  ],
  'partenaires': [
    membresBlock(),
  ],
  'normes-ressources': [
    mementosBlock(),
    feuilletsBlock(),
    brochuresBlock(),
    foudreExterieurBlock(),
    foudreInterieurBlock(),
    videotequeBlock(),
  ],
  'conseils-menages': [
    nePasFaireBlock(),
    bonMenageBlock(),
    installationVieillitBlock(),
  ],
};


// ─── MIGRATION ───
async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Migration du contenu récupéré (ancien site WebSite X5)...\n');

    for (const [slug, blocks] of Object.entries(PAGE_CONTENT)) {
      try {
        const res = await client.query('SELECT structure_json FROM public.pages WHERE slug = $1', [slug]);
        if (res.rows.length === 0) {
          console.warn(`   ⚠️  "${slug}" — page non trouvée`);
          continue;
        }

        let existing = res.rows[0].structure_json;
        if (!existing || typeof existing !== 'object' || !existing.ROOT) {
          console.warn(`   ⚠️  "${slug}" — structure_json invalide, création d'une nouvelle structure`);
          existing = {
            ROOT: {
              type: { resolvedName: 'ContainerBlock' },
              nodes: [],
              props: { padding: 0, maxWidth: '100%' },
              custom: {},
              hidden: false,
              isCanvas: true,
              displayName: `Page: ${slug}`,
              linkedNodes: {},
            },
          };
        }

        let added = 0;
        for (const { id, node } of blocks) {
          if (existing[id]) continue;
          existing[id] = node;
          existing.ROOT.nodes.push(id);
          added++;
        }

        await client.query(
          'UPDATE public.pages SET structure_json = $1, updated_at = NOW() WHERE slug = $2',
          [JSON.stringify(existing), slug]
        );
        console.log(`   ✅ "${slug}" — ${added} nouveaux blocs ajoutés`);

      } catch (err) {
        console.error(`   ❌ "${slug}": ${err.message}`);
      }
    }

    console.log('\n✅ Migration terminée !');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => { console.error('❌ Migration failed:', err); process.exit(1); });
