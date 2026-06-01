const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:proquelec_secure_db_pass@localhost:5437/proquelec'
});

// ─── Helper: build a Craft.js JSON with one HtmlBlock ───
function craftJson(pageTitle, htmlContent, blockId) {
  return {
    ROOT: {
      type: { resolvedName: 'ContainerBlock' },
      nodes: [blockId],
      props: { padding: 0, maxWidth: '100%', backgroundColor: '#ffffff' },
      custom: {},
      hidden: false,
      isCanvas: true,
      displayName: `Page: ${pageTitle}`,
      linkedNodes: {}
    },
    [blockId]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: { html: htmlContent, padding: 0 },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'Code HTML',
      linkedNodes: {}
    }
  };
}

// ─── Rich HTML content for each page (800-1500+ chars) ───

const pages = [
  // ─────────────────────────────────────────────
  // 1. /actions/collectivites → Collectivités Locales
  // ─────────────────────────────────────────────
  {
    slug: 'actions/collectivites',
    title: 'Collectivités Locales',
    html: `<!-- Collectivités Locales -->
<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <span class="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">Programme d'accompagnement</span>
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Accompagnement des Collectivités Locales</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">PROQUELEC accompagne les collectivités territoriales du Sénégal dans la mise en conformité et la sécurisation de leurs infrastructures électriques.</p>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
    <div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
      <div class="text-4xl mb-4">🏛️</div>
      <h3 class="text-xl font-bold text-gray-900 mb-3">Diagnostic des Installations</h3>
      <p class="text-gray-600">Audit complet des infrastructures électriques communales : bâtiments administratifs, écoles, centres de santé, éclairage public et marchés.</p>
    </div>
    <div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-shadow">
      <div class="text-4xl mb-4">📋</div>
      <h3 class="text-xl font-bold text-gray-900 mb-3">Plan de Mise en Conformité</h3>
      <p class="text-gray-600">Élaboration d'un plan d'action priorisé pour la mise aux normes, avec estimation budgétaire et calendrier de réalisation adapté à chaque collectivité.</p>
    </div>
    <div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-amber-500 hover:shadow-xl transition-shadow">
      <div class="text-4xl mb-4">👥</div>
      <h3 class="text-xl font-bold text-gray-900 mb-3">Formation des Agents</h3>
      <p class="text-gray-600">Programmes de formation sur mesure pour les agents techniques municipaux : maintenance préventive, sécurité électrique et gestion des infrastructures.</p>
    </div>
  </div>
  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Bénéfices pour votre Collectivité</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="text-center p-4"><span class="text-3xl">✅</span><p class="mt-2 text-gray-700 font-medium">Conformité aux normes NFC</p></div>
      <div class="text-center p-4"><span class="text-3xl">🔒</span><p class="mt-2 text-gray-700 font-medium">Sécurisation des installations</p></div>
      <div class="text-center p-4"><span class="text-3xl">💰</span><p class="mt-2 text-gray-700 font-medium">Réduction des coûts énergétiques</p></div>
      <div class="text-center p-4"><span class="text-3xl">📈</span><p class="mt-2 text-gray-700 font-medium">Valorisation du patrimoine</p></div>
    </div>
  </div>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Comment démarrer ?</h2>
      <ol class="space-y-4">
        <li class="flex items-start gap-4"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span><div><strong class="text-gray-900">Prise de contact</strong><p class="text-gray-600">Remplissez notre formulaire de demande d'accompagnement ou contactez-nous directement.</p></div></li>
        <li class="flex items-start gap-4"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span><div><strong class="text-gray-900">Audit initial gratuit</strong><p class="text-gray-600">Nos techniciens réalisent un diagnostic complet de vos installations électriques.</p></div></li>
        <li class="flex items-start gap-4"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span><div><strong class="text-gray-900">Proposition personnalisée</strong><p class="text-gray-600">Recevez un plan de mise en conformité détaillé avec chiffrage et échéancier.</p></div></li>
        <li class="flex items-start gap-4"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span><div><strong class="text-gray-900">Accompagnement continu</strong><p class="text-gray-600">Suivi régulier et assistance technique tout au long du processus de mise en conformité.</p></div></li>
      </ol>
    </div>
  </div>
</div>`
  },

  // ─────────────────────────────────────────────
  // 2. /actions/conformite → Mise en Conformité
  // ─────────────────────────────────────────────
  {
    slug: 'actions/conformite',
    title: 'Mise en Conformité',
    html: `<!-- Mise en Conformité -->
<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <span class="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">Service professionnel</span>
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Mise en Conformité Électrique</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">Un service complet de mise aux normes de vos installations électriques, résidentielles comme professionnelles, par des techniciens agréés PROQUELEC.</p>
  </div>
  <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg mb-12">
    <div class="flex items-start gap-4">
      <span class="text-3xl flex-shrink-0">⚠️</span>
      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Pourquoi la conformité est essentielle ?</h3>
        <p class="text-gray-700">Selon la réglementation sénégalaise, toute installation électrique doit respecter les normes NFC en vigueur. Une installation non conforme présente des risques d'incendie, d'électrocution et de dommages matériels. Elle peut également entraîner des sanctions juridiques et des refus d'assurance.</p>
      </div>
    </div>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <h3 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><span class="text-2xl">🔍</span> Diagnostic et Audit</h3>
      <ul class="space-y-2 text-gray-600">
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">✓</span> Vérification complète de l'installation selon la norme NFC 15-100</li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">✓</span> Contrôle du tableau électrique, des circuits et de la mise à la terre</li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">✓</span> Test des dispositifs de protection différentielle (DDR)</li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">✓</span> Rapport détaillé avec photos et relevés techniques</li>
      </ul>
    </div>
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <h3 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><span class="text-2xl">🛠️</span> Travaux de Mise aux Normes</h3>
      <ul class="space-y-2 text-gray-600">
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">✓</span> Remplacement des tableaux et disjoncteurs obsolètes</li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">✓</span> Reprise des circuits de terre et liaisons équipotentielles</li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">✓</span> Installation de dispositifs de protection adaptés</li>
        <li class="flex items-start gap-2"><span class="text-green-500 mt-1">✓</span> Mise en conformité des locaux professionnels (ERP, IGH)</li>
      </ul>
    </div>
  </div>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
    <div class="p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Processus en 4 étapes</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-lg"><span class="text-3xl block mb-2">📞</span><h4 class="font-bold text-gray-900">1. Demande</h4><p class="text-sm text-gray-600">Contactez-nous pour planifier votre audit</p></div>
        <div class="text-center p-4 bg-gray-50 rounded-lg"><span class="text-3xl block mb-2">🔎</span><h4 class="font-bold text-gray-900">2. Audit</h4><p class="text-sm text-gray-600">Diagnostic complet de l'installation</p></div>
        <div class="text-center p-4 bg-gray-50 rounded-lg"><span class="text-3xl block mb-2">📄</span><h4 class="font-bold text-gray-900">3. Devis</h4><p class="text-sm text-gray-600">Proposition technique et financière</p></div>
        <div class="text-center p-4 bg-gray-50 rounded-lg"><span class="text-3xl block mb-2">✅</span><h4 class="font-bold text-gray-900">4. Réalisation</h4><p class="text-sm text-gray-600">Travaux et attestation de conformité</p></div>
      </div>
    </div>
  </div>
  <div class="text-center p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white">
    <h2 class="text-2xl font-bold mb-4">Prêt à mettre votre installation aux normes ?</h2>
    <p class="mb-6 text-blue-100">Nos experts sont disponibles pour vous accompagner dans votre projet de mise en conformité.</p>
    <a href="/contact" class="inline-block px-8 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors">Demander un audit</a>
  </div>
</div>`
  },

  // ─────────────────────────────────────────────
  // 3. /actions/securisation → Sécurisation des Marchés
  // ─────────────────────────────────────────────
  {
    slug: 'actions/securisation',
    title: 'Sécurisation Marchés',
    html: `<!-- Sécurisation des Marchés -->
<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <span class="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">Services aux donneurs d'ordre</span>
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Sécurisation des Marchés Publics Électriques</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">PROQUELEC apporte son expertise aux maîtres d'ouvrage publics et privés pour garantir la qualité et la conformité des installations électriques dans les marchés de construction et de rénovation.</p>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="h-2 bg-emerald-500"></div>
      <div class="p-6">
        <div class="text-4xl mb-4">📝</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Analyse des CCTP</h3>
        <p class="text-gray-600">Vérification des Cahiers des Clauses Techniques Particulières pour s'assurer de l'exhaustivité et de la conformité des spécifications électriques avant publication des appels d'offres.</p>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="h-2 bg-emerald-500"></div>
      <div class="p-6">
        <div class="text-4xl mb-4">🔎</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Contrôle des Offres</h3>
        <p class="text-gray-600">Analyse technique des propositions des soumissionnaires : vérification des références, des qualifications des équipes et de l'adéquation des solutions proposées aux normes en vigueur.</p>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="h-2 bg-emerald-500"></div>
      <div class="p-6">
        <div class="text-4xl mb-4">🏗️</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Suivi de Chantier</h3>
        <p class="text-gray-600">Inspections périodiques des installations en cours de réalisation, vérification de conformité aux plans et aux normes, et établissement de rapports de contrôle qualité.</p>
      </div>
    </div>
  </div>
  <div class="bg-white rounded-xl shadow-lg p-8 mb-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Nos prestations de sécurisation</h2>
    <div class="space-y-4">
      <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"><span class="text-2xl flex-shrink-0">📋</span><div><h4 class="font-bold text-gray-900">Assistance à Maîtrise d'Ouvrage (AMO)</h4><p class="text-gray-600">Accompagnement technique tout au long du projet, de la conception à la réception des travaux électriques.</p></div></div>
      <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"><span class="text-2xl flex-shrink-0">📑</span><div><h4 class="font-bold text-gray-900">Validation des Attestations de Conformité</h4><p class="text-gray-600">Vérification et validation des attestations de conformité fournies par les installateurs en fin de chantier.</p></div></div>
      <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"><span class="text-2xl flex-shrink-0">📊</span><div><h4 class="font-bold text-gray-900">Rapports d'Étape et Réception</h4><p class="text-gray-600">Production de rapports détaillés à chaque phase clé du projet et participation aux opérations de réception technique.</p></div></div>
      <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"><span class="text-2xl flex-shrink-0">🛡️</span><div><h4 class="font-bold text-gray-900">Garantie de Conformité</h4><p class="text-gray-600">Engagement de conformité aux normes NFC avec attestation PROQUELEC valable pour les assurances et garanties décennales.</p></div></div>
    </div>
  </div>
  <div class="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-lg">
    <h3 class="text-lg font-bold text-gray-900 mb-2">Impact pour les maîtres d'ouvrage</h3>
    <p class="text-gray-700">La sécurisation des marchés électriques par PROQUELEC réduit significativement les risques de contentieux, les malfaçons et les surcoûts liés aux travaux de reprise. Elle garantit la pérennité des installations et la satisfaction des utilisateurs finaux.</p>
  </div>
</div>`
  },

  // ─────────────────────────────────────────────
  // 4. /actions/sensibilisation → Sensibilisation
  // ─────────────────────────────────────────────
  {
    slug: 'actions/sensibilisation',
    title: 'Sensibilisation',
    html: `<!-- Sensibilisation -->
<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <span class="inline-block px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">Prévention et pédagogie</span>
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Campagnes de Sensibilisation</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">PROQUELEC mène des campagnes de sensibilisation à travers tout le Sénégal pour informer les populations sur les risques électriques et les bonnes pratiques à adopter.</p>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="bg-amber-500 p-4 text-white text-center"><span class="text-4xl">🏫</span></div>
      <div class="p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-3">Sensibilisation en Milieu Scolaire</h3>
        <p class="text-gray-600">Animations pédagogiques dans les écoles primaires et secondaires pour enseigner les gestes qui sauvent face aux risques électriques. Ateliers interactifs adaptés à chaque tranche d'âge.</p>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="bg-amber-500 p-4 text-white text-center"><span class="text-4xl">🏘️</span></div>
      <div class="p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-3">Campagnes Communautaires</h3>
        <p class="text-gray-600">Sessions d'information dans les quartiers et villages : identification des installations dangereuses, procédures à suivre en cas d'incident et conseils pour une utilisation sécurisée de l'électricité.</p>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="bg-amber-500 p-4 text-white text-center"><span class="text-4xl">📺</span></div>
      <div class="p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-3">Médias et Numérique</h3>
        <p class="text-gray-600">Diffusion de spots radio/télé, publications sur les réseaux sociaux et mise à disposition de ressources en ligne gratuites sur la sécurité électrique domestique.</p>
      </div>
    </div>
  </div>
  <div class="bg-white rounded-xl shadow-lg p-8 mb-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Les bons gestes à connaître</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="text-center p-4 border border-gray-200 rounded-lg hover:border-amber-400 transition-colors"><span class="text-3xl block mb-2">🔌</span><p class="text-gray-700 text-sm font-medium">Ne pas surcharger les prises multiprises</p></div>
      <div class="text-center p-4 border border-gray-200 rounded-lg hover:border-amber-400 transition-colors"><span class="text-3xl block mb-2">💧</span><p class="text-gray-700 text-sm font-medium">Garder les appareils électriques loin de l'eau</p></div>
      <div class="text-center p-4 border border-gray-200 rounded-lg hover:border-amber-400 transition-colors"><span class="text-3xl block mb-2">🔍</span><p class="text-gray-700 text-sm font-medium">Vérifier régulièrement l'état des câbles et prises</p></div>
      <div class="text-center p-4 border border-gray-200 rounded-lg hover:border-amber-400 transition-colors"><span class="text-3xl block mb-2">🛠️</span><p class="text-gray-700 text-sm font-medium">Faire appel à un électricien qualifié pour toute réparation</p></div>
    </div>
  </div>
  <div class="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-8 text-white text-center">
    <h2 class="text-2xl font-bold mb-4">La sécurité électrique est l'affaire de tous</h2>
    <p class="mb-6 max-w-2xl mx-auto">Chaque année, les accidents électriques causent des blessures graves et des dégâts matériels évitables par une bonne information. Participez à nos campagnes et contribuez à un Sénégal plus sûr.</p>
    <a href="/contact" class="inline-block px-8 py-3 bg-white text-amber-700 font-bold rounded-lg hover:bg-amber-50 transition-colors">Invitez-nous dans votre communauté</a>
  </div>
</div>`
  },

  // ─────────────────────────────────────────────
  // 5. /evenements/ateliers → Ateliers
  // ─────────────────────────────────────────────
  {
    slug: 'evenements/ateliers',
    title: 'Ateliers',
    html: `<!-- Ateliers -->
<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <span class="inline-block px-4 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-4">Apprentissage pratique</span>
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Ateliers Pratiques</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">Des ateliers hands-on animés par des experts PROQUELEC pour maîtriser les gestes techniques essentiels à la sécurité électrique.</p>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4"><span class="text-3xl">⚡</span><h3 class="text-xl font-bold text-gray-900">Atelier Tableau Électrique</h3></div>
        <p class="text-gray-600 mb-4">Apprenez à lire, diagnostiquer et intervenir sur un tableau électrique en toute sécurité. Cet atelier couvre le repérage des circuits, l'identification des défauts et les gestes d'urgence.</p>
        <ul class="space-y-2 text-gray-600 text-sm">
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Schéma unifilaire et repérage des circuits</li>
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Identification des disjoncteurs et DDR</li>
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Procédure d'urgence en cas d'incident</li>
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Exercices pratiques sur maquette pédagogique</li>
        </ul>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4"><span class="text-3xl">🔧</span><h3 class="text-xl font-bold text-gray-900">Atelier Mise à la Terre</h3></div>
        <p class="text-gray-600 mb-4">Maîtrisez les techniques de mise à la terre conformément à la norme NFC 15-100. Un atelier essentiel pour garantir la protection des personnes et des biens.</p>
        <ul class="space-y-2 text-gray-600 text-sm">
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Principes fondamentaux de la mise à la terre</li>
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Mesure de la résistance de terre (méthode 3 pôles)</li>
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Liaisons équipotentielles et conducteurs de protection</li>
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Mise en situation sur installations réelles</li>
        </ul>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4"><span class="text-3xl">📏</span><h3 class="text-xl font-bold text-gray-900">Atelier Vérification et Mesure</h3></div>
        <p class="text-gray-600 mb-4">Formation à l'utilisation des appareils de mesure électrique : multimètre, pince ampèremétrique, testeur d'isolement et analyseur de réseau.</p>
        <ul class="space-y-2 text-gray-600 text-sm">
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Utilisation sécurisée des appareils de mesure</li>
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Mesure de tension, courant et résistance</li>
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Test d'isolement et de continuité</li>
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Interprétation des résultats et diagnostic</li>
        </ul>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4"><span class="text-3xl">🏭</span><h3 class="text-xl font-bold text-gray-900">Atelier Installations Industrielles</h3></div>
        <p class="text-gray-600 mb-4">Atelier avancé dédié aux installations électriques industrielles : armoires électriques, démarreurs, variateurs de vitesse et automatismes.</p>
        <ul class="space-y-2 text-gray-600 text-sm">
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Schémas électriques industriels</li>
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Câblage d'armoires et coffrets</li>
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Mise en service et dépannage</li>
          <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Sécurité électrique en milieu industriel</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="text-center p-8 bg-violet-50 rounded-2xl">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Inscrivez-vous à nos ateliers</h2>
    <p class="text-gray-600 mb-6 max-w-2xl mx-auto">Les places sont limitées pour garantir un encadrement optimal. Consultez notre calendrier et réservez votre participation dès maintenant.</p>
    <a href="/contact" class="inline-block px-8 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition-colors">Voir le calendrier</a>
  </div>
</div>`
  },

  // ─────────────────────────────────────────────
  // 6. /evenements/conferences → Conférences
  // ─────────────────────────────────────────────
  {
    slug: 'evenements/conferences',
    title: 'Conférences',
    html: `<!-- Conférences -->
<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <span class="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">Savoir et innovation</span>
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Conférences Techniques</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">PROQUELEC organise des conférences de haut niveau réunissant experts nationaux et internationaux pour débattre des enjeux de la qualité électrique et des innovations du secteur.</p>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div class="flex items-center gap-2 mb-2"><span class="text-sm bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">Nov 2026</span><span class="text-sm text-gray-500">Dakar</span></div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">Conférence sur les Normes NFC 2026</h3>
      <p class="text-gray-600 text-sm">Présentation des dernières évolutions des normes NFC 15-100 et NFC 16-600, avec des cas pratiques d'application au contexte sénégalais. Intervention de représentants du Ministère de l'Énergie et de la Senelec.</p>
      <a href="/contact" class="text-indigo-600 font-medium text-sm hover:underline mt-3 inline-block">S'inscrire →</a>
    </div>
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div class="flex items-center gap-2 mb-2"><span class="text-sm bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">Jan 2027</span><span class="text-sm text-gray-500">En ligne</span></div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">Webinaire : Électricité et Transition Énergétique</h3>
      <p class="text-gray-600 text-sm">Comment les installations électriques contribuent à l'efficacité énergétique et à la transition vers les énergies renouvelables au Sénégal. Études de cas et retours d'expérience.</p>
      <a href="/contact" class="text-indigo-600 font-medium text-sm hover:underline mt-3 inline-block">S'inscrire →</a>
    </div>
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div class="flex items-center gap-2 mb-2"><span class="text-sm bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">Mar 2027</span><span class="text-sm text-gray-500">Dakar</span></div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">Conférence Annuelle PROQUELEC 2027</h3>
      <p class="text-gray-600 text-sm">Le grand rendez-vous du secteur électrique sénégalais : bilan des réalisations, perspectives réglementaires, innovations technologiques et remise des labels PROQUELEC aux professionnels certifiés.</p>
      <a href="/contact" class="text-indigo-600 font-medium text-sm hover:underline mt-3 inline-block">S'inscrire →</a>
    </div>
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div class="flex items-center gap-2 mb-2"><span class="text-sm bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">Mai 2027</span><span class="text-sm text-gray-500">Dakar</span></div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">Forum International de la Qualité Électrique</h3>
      <p class="text-gray-600 text-sm">En partenariat avec des organismes internationaux de normalisation. Trois jours de conférences, d'expositions et de networking avec des experts venus d'Afrique, d'Europe et d'Asie.</p>
      <a href="/contact" class="text-indigo-600 font-medium text-sm hover:underline mt-3 inline-block">S'inscrire →</a>
    </div>
  </div>
  <div class="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white text-center">
    <h2 class="text-2xl font-bold mb-4">Intervenez lors de nos conférences</h2>
    <p class="mb-6 max-w-2xl mx-auto">Vous êtes expert, chercheur ou professionnel du secteur électrique ? Proposez votre intervention pour nos prochaines conférences et webinaires.</p>
    <a href="/contact" class="inline-block px-8 py-3 bg-white text-indigo-700 font-bold rounded-lg hover:bg-indigo-50 transition-colors">Proposer une intervention</a>
  </div>
</div>`
  },

  // ─────────────────────────────────────────────
  // 7. /evenements/seminaires → Séminaires
  // ─────────────────────────────────────────────
  {
    slug: 'evenements/seminaires',
    title: 'Séminaires',
    html: `<!-- Séminaires -->
<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <span class="inline-block px-4 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-4">Formation continue</span>
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Séminaires Professionnels</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">Des séminaires approfondis animés par des experts de renom pour approfondir vos connaissances et développer de nouvelles compétences dans le domaine électrique.</p>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="h-2 bg-teal-500"></div>
      <div class="p-6">
        <div class="flex items-center justify-between mb-4"><span class="text-sm bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-medium">3 jours</span><span class="text-sm text-gray-500">Présentiel</span></div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Séminaire sur les Installations Photovoltaïques</h3>
        <p class="text-gray-600 text-sm mb-4">Conception, dimensionnement et installation de systèmes solaires photovoltaïques conformément aux normes en vigueur. Modules pratiques sur le câblage, l'onduleur et le stockage.</p>
        <div class="border-t pt-4"><p class="text-xs text-gray-500">📅 Prochaine session : 15-17 Juin 2026</p></div>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="h-2 bg-teal-500"></div>
      <div class="p-6">
        <div class="flex items-center justify-between mb-4"><span class="text-sm bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-medium">2 jours</span><span class="text-sm text-gray-500">Présentiel</span></div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Séminaire Audit et Diagnostic Électrique</h3>
        <p class="text-gray-600 text-sm mb-4">Maîtrisez les méthodologies d'audit électrique : inspection visuelle, mesures techniques, rédaction de rapports et préconisations. Préparation à la certification en audit électrique.</p>
        <div class="border-t pt-4"><p class="text-xs text-gray-500">📅 Prochaine session : 5-6 Juillet 2026</p></div>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="h-2 bg-teal-500"></div>
      <div class="p-6">
        <div class="flex items-center justify-between mb-4"><span class="text-sm bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-medium">4 jours</span><span class="text-sm text-gray-500">Mixte</span></div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Séminaire Gestion Technique des Bâtiments</h3>
        <p class="text-gray-600 text-sm mb-4">GTB, domotique et smart building : pilotage des installations électriques, gestion de l'énergie, maintenance prédictive et intégration des systèmes connectés pour bâtiments intelligents.</p>
        <div class="border-t pt-4"><p class="text-xs text-gray-500">📅 Prochaine session : 20-23 Septembre 2026</p></div>
      </div>
    </div>
  </div>
  <div class="bg-white rounded-xl shadow-lg p-8 mb-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Pourquoi participer à nos séminaires ?</h2>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="text-center"><span class="text-3xl block mb-2">🎓</span><h4 class="font-bold text-gray-900 text-sm">Expertise reconnue</h4><p class="text-xs text-gray-500">Formateurs certifiés et expérimentés</p></div>
      <div class="text-center"><span class="text-3xl block mb-2">📜</span><h4 class="font-bold text-gray-900 text-sm">Attestation délivrée</h4><p class="text-xs text-gray-500">Certificat de participation PROQUELEC</p></div>
      <div class="text-center"><span class="text-3xl block mb-2">🤝</span><h4 class="font-bold text-gray-900 text-sm">Networking</h4><p class="text-xs text-gray-500">Échanges avec les professionnels du secteur</p></div>
      <div class="text-center"><span class="text-3xl block mb-2">📚</span><h4 class="font-bold text-gray-900 text-sm">Supports inclus</h4><p class="text-xs text-gray-500">Documentation complète et ressources</p></div>
    </div>
  </div>
  <div class="bg-teal-50 rounded-2xl p-8 text-center">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Séminaires sur mesure pour votre organisation</h2>
    <p class="text-gray-600 mb-6 max-w-2xl mx-auto">Nous proposons des séminaires privatisés adaptés aux besoins spécifiques de votre entreprise ou collectivité, avec un contenu personnalisé et un calendrier flexible.</p>
    <a href="/contact" class="inline-block px-8 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors">Demander un séminaire sur mesure</a>
  </div>
</div>`
  },

  // ─────────────────────────────────────────────
  // 8. /faq → FAQ
  // ─────────────────────────────────────────────
  {
    slug: 'faq',
    title: 'FAQ',
    html: `<!-- FAQ -->
<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <span class="inline-block px-4 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-4">Questions fréquentes</span>
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Foire Aux Questions</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">Retrouvez les réponses aux questions les plus courantes sur la conformité électrique, les normes, les certifications et les services PROQUELEC.</p>
  </div>
  <div class="max-w-4xl mx-auto space-y-6 mb-16">
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="p-6 border-b border-gray-100"><h3 class="text-lg font-bold text-gray-900 mb-1">🔹 Qu'est-ce que la norme NFC 15-100 ?</h3><p class="text-gray-600">La norme NFC 15-100 est la norme française et européenne qui régit les installations électriques basse tension. Elle définit les règles de conception, de réalisation et de maintenance des installations électriques pour garantir la sécurité des personnes et des biens. Au Sénégal, elle est la référence pour toutes les installations électriques neuves ou rénovées.</p></div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="p-6 border-b border-gray-100"><h3 class="text-lg font-bold text-gray-900 mb-1">🔹 Comment obtenir le Label PROQUELEC ?</h3><p class="text-gray-600">Pour obtenir le Label PROQUELEC, vous devez soumettre votre installation à un audit réalisé par nos inspecteurs certifiés. Si votre installation est conforme aux normes en vigueur, vous recevez le label qui atteste de sa qualité et de sa sécurité. Le processus comprend une visite sur site, des tests techniques et la vérification de la documentation.</p></div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="p-6 border-b border-gray-100"><h3 class="text-lg font-bold text-gray-900 mb-1">🔹 Quels sont les signes d'une installation électrique dangereuse ?</h3><p class="text-gray-600">Les principaux signes sont : des prises ou interrupteurs qui chauffent, des odeurs de brûlé, des disjoncteurs qui sautent fréquemment, des fils apparents ou abîmés, des installations vétustes, des prises qui ne tiennent pas, des lumières qui vacillent, et l'absence de mise à la terre. Si vous constatez l'un de ces signes, faites appel à un professionnel sans tarder.</p></div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="p-6 border-b border-gray-100"><h3 class="text-lg font-bold text-gray-900 mb-1">🔹 Quelle est la différence entre conformité et certification ?</h3><p class="text-gray-600">La conformité désigne le fait qu'une installation respecte les normes en vigueur (NFC 15-100, etc.). La certification est un processus plus large qui valide les compétences d'un professionnel ou la qualité d'une entreprise. PROQUELEC propose à la fois des services de vérification de conformité des installations et des programmes de certification des professionnels.</p></div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="p-6 border-b border-gray-100"><h3 class="text-lg font-bold text-gray-900 mb-1">🔹 Comment devenir électricien certifié PROQUELEC ?</h3><p class="text-gray-600">Pour devenir électricien certifié PROQUELEC, vous devez suivre notre programme de formation, justifier d'une expérience professionnelle minimale, réussir les épreuves théoriques et pratiques, et vous engager à respecter notre charte de qualité. Les certifications sont valables 3 ans et renouvelables sous condition de formation continue.</p></div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="p-6 border-b border-gray-100"><h3 class="text-lg font-bold text-gray-900 mb-1">🔹 Quels sont les tarifs des services PROQUELEC ?</h3><p class="text-gray-600">Les tarifs varient selon le type de service : audit de conformité, certification, formation ou accompagnement. Nous vous invitons à nous contacter pour obtenir un devis personnalisé adapté à vos besoins. Nous proposons des tarifs préférentiels pour les collectivités territoriales et les artisans membres de notre réseau.</p></div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="p-6 border-b border-gray-100"><h3 class="text-lg font-bold text-gray-900 mb-1">🔹 À quelle fréquence doit-on vérifier son installation électrique ?</h3><p class="text-gray-600">Il est recommandé de faire vérifier son installation électrique tous les 5 à 10 ans pour une installation résidentielle. Pour les locaux professionnels, ERP (Établissements Recevant du Public) et IGH (Immeubles de Grande Hauteur), la périodicité est plus courte et définie par la réglementation en vigueur. Une vérification est également recommandée après tout sinistre ou travaux importants.</p></div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="p-6"><h3 class="text-lg font-bold text-gray-900 mb-1">🔹 PROQUELEC intervient-il dans tout le Sénégal ?</h3><p class="text-gray-600">Oui, PROQUELEC couvre l'ensemble du territoire sénégalais grâce à son réseau d'inspecteurs et de partenaires régionaux. Nous avons des bureaux à Dakar, Thiès, Saint-Louis, Kaolack, Ziguinchor et Touba. Pour les zones non couvertes, nous pouvons organiser des missions ponctuelles sur demande.</p></div>
    </div>
  </div>
  <div class="text-center p-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white">
    <h2 class="text-2xl font-bold mb-4">Vous ne trouvez pas votre question ?</h2>
    <p class="mb-6 max-w-2xl mx-auto">Notre équipe est à votre écoute pour répondre à toutes vos interrogations sur nos services, les normes électriques et les démarches de certification.</p>
    <a href="/contact" class="inline-block px-8 py-3 bg-white text-cyan-700 font-bold rounded-lg hover:bg-cyan-50 transition-colors">Contactez-nous</a>
  </div>
</div>`
  },

  // ─────────────────────────────────────────────
  // 9. /formations/artisans → Formation Artisans
  // ─────────────────────────────────────────────
  {
    slug: 'formations/artisans',
    title: 'Formation Artisans',
    html: `<!-- Formation Artisans -->
<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <span class="inline-block px-4 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">Professionnalisation</span>
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Formation pour Électriciens Artisans</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">Un programme complet de formation pratique destiné aux artisans électriciens pour renforcer leurs compétences techniques, leur connaissance des normes et leur professionnalisme.</p>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div class="flex items-center gap-3 mb-4"><span class="text-3xl">📘</span><h3 class="text-lg font-bold text-gray-900">Module 1 : Fondamentaux de l'Électricité</h3></div>
      <p class="text-gray-600 mb-3">Acquérez les bases théoriques essentielles : lois de l'électricité, grandeurs électriques, circuits série et parallèle, puissance et énergie. Ce module pose les fondations pour la suite de la formation.</p>
      <ul class="space-y-1 text-gray-500 text-sm"><li>✅ Durée : 5 jours (35h)</li><li>✅ Prérequis : aucun</li><li>✅ Certification : Attestation de formation</li></ul>
    </div>
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div class="flex items-center gap-3 mb-4"><span class="text-3xl">🔌</span><h3 class="text-lg font-bold text-gray-900">Module 2 : Installation Résidentielle</h3></div>
      <p class="text-gray-600 mb-3">Maîtrisez les techniques d'installation électrique en habitat individuel et collectif : schémas, câblage, tableau de répartition, circuits spécialisés et mise en service selon la norme NFC 15-100.</p>
      <ul class="space-y-1 text-gray-500 text-sm"><li>✅ Durée : 10 jours (70h)</li><li>✅ Prérequis : Module 1</li><li>✅ Certification : Attestation de compétence</li></ul>
    </div>
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div class="flex items-center gap-3 mb-4"><span class="text-3xl">🏗️</span><h3 class="text-lg font-bold text-gray-900">Module 3 : Normes et Sécurité</h3></div>
      <p class="text-gray-600 mb-3">Plongez au cœur des normes NFC 15-100 et NFC 16-600 : protection des personnes, règles de câblage, distances de sécurité, choix des dispositifs de protection et rédaction des attestations de conformité.</p>
      <ul class="space-y-1 text-gray-500 text-sm"><li>✅ Durée : 5 jours (35h)</li><li>✅ Prérequis : Modules 1 & 2</li><li>✅ Certification : Attestation normes NFC</li></ul>
    </div>
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div class="flex items-center gap-3 mb-4"><span class="text-3xl">🔧</span><h3 class="text-lg font-bold text-gray-900">Module 4 : Maintenance et Dépannage</h3></div>
      <p class="text-gray-600 mb-3">Apprenez les méthodes de diagnostic, les techniques de recherche de pannes et les procédures de maintenance préventive et curative sur installations électriques résidentielles et tertiaires.</p>
      <ul class="space-y-1 text-gray-500 text-sm"><li>✅ Durée : 5 jours (35h)</li><li>✅ Prérequis : Modules 1-3</li><li>✅ Certification : Attestation maintenance</li></ul>
    </div>
  </div>
  <div class="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white mb-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
      <div><span class="text-4xl font-bold">96%</span><p class="text-orange-100">de réussite aux examens</p></div>
      <div><span class="text-4xl font-bold">500+</span><p class="text-orange-100">artisans formés en 2025</p></div>
      <div><span class="text-4xl font-bold">85%</span><p class="text-orange-100">d'insertion professionnelle</p></div>
    </div>
  </div>
  <div class="text-center p-8 bg-white rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Financement et inscription</h2>
    <p class="text-gray-600 mb-6 max-w-2xl mx-auto">Nos formations sont éligibles au financement par les fonds de formation professionnelle (FNFPC, 3FPT). Nous proposons également des facilités de paiement pour les artisans indépendants.</p>
    <a href="/contact" class="inline-block px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">S'inscrire à une formation</a>
  </div>
</div>`
  },

  // ─────────────────────────────────────────────
  // 10. /formations/collectivites → Formation Collectivités
  // ─────────────────────────────────────────────
  {
    slug: 'formations/collectivites',
    title: 'Formation Collectivités',
    html: `<!-- Formation Collectivités -->
<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <span class="inline-block px-4 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-semibold mb-4">Agents territoriaux</span>
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Formation pour Agents Techniques des Collectivités</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">Des programmes de formation spécialement conçus pour les agents techniques des collectivités territoriales, afin de renforcer leurs compétences en gestion et maintenance des infrastructures électriques communales.</p>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="p-6">
        <span class="text-sm bg-sky-100 text-sky-700 px-3 py-1 rounded-full font-medium mb-3 inline-block">Niveau 1</span>
        <h3 class="text-lg font-bold text-gray-900 mb-3">Gestion des Infrastructures Électriques Communales</h3>
        <p class="text-gray-600 mb-4">Formation destinée aux agents en charge de la gestion des bâtiments communaux : écoles, dispensaires, marchés, éclairage public et installations sportives.</p>
        <ul class="space-y-2 text-gray-600 text-sm">
          <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Inventaire et suivi des installations électriques</li>
          <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Planification de la maintenance préventive</li>
          <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Gestion des marchés de travaux électriques</li>
          <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Suivi des consommations énergétiques</li>
        </ul>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="p-6">
        <span class="text-sm bg-sky-100 text-sky-700 px-3 py-1 rounded-full font-medium mb-3 inline-block">Niveau 2</span>
        <h3 class="text-lg font-bold text-gray-900 mb-3">Sécurité et Conformité des Installations Publiques</h3>
        <p class="text-gray-600 mb-4">Approfondissement sur les aspects réglementaires et les contrôles de conformité applicables aux bâtiments et infrastructures publics.</p>
        <ul class="space-y-2 text-gray-600 text-sm">
          <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Réglementation électrique des ERP et IGH</li>
          <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Réalisation de diagnostics de conformité</li>
          <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Procédures de mise en sécurité</li>
          <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Gestion des situations d'urgence électrique</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="bg-white rounded-xl shadow-lg p-8 mb-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Modalités de formation</h2>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="p-4 bg-sky-50 rounded-lg text-center"><span class="text-3xl block mb-2">🏛️</span><h4 class="font-bold text-gray-900">En inter</h4><p class="text-sm text-gray-600">Dans nos centres à Dakar et en régions</p></div>
      <div class="p-4 bg-sky-50 rounded-lg text-center"><span class="text-3xl block mb-2">🏫</span><h4 class="font-bold text-gray-900">En intra</h4><p class="text-sm text-gray-600">Directement dans votre collectivité</p></div>
      <div class="p-4 bg-sky-50 rounded-lg text-center"><span class="text-3xl block mb-2">💻</span><h4 class="font-bold text-gray-900">À distance</h4><p class="text-sm text-gray-600">Modules e-learning accessibles 24/7</p></div>
      <div class="p-4 bg-sky-50 rounded-lg text-center"><span class="text-3xl block mb-2">🔁</span><h4 class="font-bold text-gray-900">Mixte</h4><p class="text-sm text-gray-600">Combinaison présentiel et distanciel</p></div>
    </div>
  </div>
  <div class="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-8 text-white text-center">
    <h2 class="text-2xl font-bold mb-4">Programmez une session pour votre collectivité</h2>
    <p class="mb-6 max-w-2xl mx-auto">Nous adaptons nos formations aux besoins spécifiques de chaque collectivité. Sessions groupées, tarifs dégressifs et prise en charge possible par les fonds de formation.</p>
    <a href="/contact" class="inline-block px-8 py-3 bg-white text-sky-700 font-bold rounded-lg hover:bg-sky-50 transition-colors">Demander un devis formation</a>
  </div>
</div>`
  },

  // ─────────────────────────────────────────────
  // 11. /galerie → Galerie Photos
  // ─────────────────────────────────────────────
  {
    slug: 'galerie',
    title: 'Galerie Photos',
    html: `<!-- Galerie Photos -->
<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="text-center mb-12">
    <span class="inline-block px-4 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold mb-4">Nos réalisations</span>
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Galerie Photos</h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">Découvrez en images nos réalisations : installations électriques conformes, événements, formations et actions de sensibilisation à travers le Sénégal.</p>
  </div>
  <div class="mb-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Installations Conformes</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="group relative bg-gray-100 rounded-xl overflow-hidden h-64">
        <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"><span class="text-6xl">🏠</span></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"><p class="text-white font-medium">Installation résidentielle conforme - Thiès</p></div>
      </div>
      <div class="group relative bg-gray-100 rounded-xl overflow-hidden h-64">
        <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"><span class="text-6xl">🏢</span></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"><p class="text-white font-medium">Tableau électrique conforme norme NFC - Dakar</p></div>
      </div>
      <div class="group relative bg-gray-100 rounded-xl overflow-hidden h-64">
        <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"><span class="text-6xl">☀️</span></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"><p class="text-white font-medium">Installation solaire conforme - Kaolack</p></div>
      </div>
      <div class="group relative bg-gray-100 rounded-xl overflow-hidden h-64">
        <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"><span class="text-6xl">🔌</span></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"><p class="text-white font-medium">Mise à la terre conforme - Saint-Louis</p></div>
      </div>
      <div class="group relative bg-gray-100 rounded-xl overflow-hidden h-64">
        <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"><span class="text-6xl">🏭</span></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"><p class="text-white font-medium">Installation industrielle certifiée - Thiès</p></div>
      </div>
      <div class="group relative bg-gray-100 rounded-xl overflow-hidden h-64">
        <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"><span class="text-6xl">🏗️</span></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"><p class="text-white font-medium">Chantier de mise en conformité - Ziguinchor</p></div>
      </div>
    </div>
  </div>
  <div class="mb-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Événements et Formations</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-gray-100 rounded-lg overflow-hidden h-48 relative group"><div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"><span class="text-4xl">🎓</span></div><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3"><p class="text-white text-sm font-medium">Formation électriciens - Dakar 2025</p></div></div>
      <div class="bg-gray-100 rounded-lg overflow-hidden h-48 relative group"><div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"><span class="text-4xl">📢</span></div><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3"><p class="text-white text-sm font-medium">Sensibilisation scolaire - Thiès 2025</p></div></div>
      <div class="bg-gray-100 rounded-lg overflow-hidden h-48 relative group"><div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"><span class="text-4xl">🏆</span></div><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3"><p class="text-white text-sm font-medium">Remise de labels PROQUELEC 2025</p></div></div>
      <div class="bg-gray-100 rounded-lg overflow-hidden h-48 relative group"><div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"><span class="text-4xl">🤝</span></div><div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3"><p class="text-white text-sm font-medium">Conférence annuelle PROQUELEC 2025</p></div></div>
    </div>
  </div>
  <div class="text-center p-8 bg-gradient-to-r from-pink-600 to-rose-700 rounded-2xl text-white">
    <h2 class="text-2xl font-bold mb-4">Partagez vos réalisations</h2>
    <p class="mb-6 max-w-2xl mx-auto">Vous êtes un professionnel certifié PROQUELEC ? Proposez vos photos d'installations conformes pour figurer dans notre galerie et inspirer la communauté.</p>
    <a href="/contact" class="inline-block px-8 py-3 bg-white text-pink-700 font-bold rounded-lg hover:bg-pink-50 transition-colors">Soumettre mes photos</a>
  </div>
</div>`
  }
];

// ─── Main execution ───
async function main() {
  const client = await pool.connect();
  try {
    // Verify connection
    const verif = await client.query('SELECT NOW() as now, version() as ver');
    console.log(`✅ Connected to PostgreSQL at ${verif.rows[0].now}`);

    // Check which pages exist
    const slugs = pages.map(p => p.slug);
    const existQuery = await client.query(
      'SELECT slug FROM pages WHERE slug = ANY($1)',
      [slugs]
    );
    const existingSlugs = new Set(existQuery.rows.map(r => r.slug));

    const notFound = slugs.filter(s => !existingSlugs.has(s));
    if (notFound.length > 0) {
      console.log(`⚠️  Pages not found, will insert: ${notFound.join(', ')}`);
    }

    // Update each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const blockId = `html_b2_${i + 1}`;
      const structure = craftJson(page.title, page.html, blockId);

      if (existingSlugs.has(page.slug)) {
        await client.query(
          `UPDATE pages SET structure_json = $1::jsonb, updated_at = NOW() WHERE slug = $2`,
          [JSON.stringify(structure), page.slug]
        );
        console.log(`✅ Updated: ${page.slug} → "${page.title}" (${blockId})`);
      } else {
        // Insert a new page
        await client.query(
          `INSERT INTO pages (slug, title, content, structure_json, is_published, created_at, updated_at)
           VALUES ($1, $2, $3, $4::jsonb, true, NOW(), NOW())
           ON CONFLICT (slug) DO UPDATE SET structure_json = EXCLUDED.structure_json, updated_at = NOW()`,
          [page.slug, page.title, page.html, JSON.stringify(structure)]
        );
        console.log(`✅ Inserted: ${page.slug} → "${page.title}" (${blockId})`);
      }
    }

    console.log(`\n🎉 All ${pages.length} pages updated successfully!`);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
