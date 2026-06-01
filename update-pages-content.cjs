const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5437,
  database: 'proquelec',
  user: 'postgres',
  password: 'proquelec_secure_db_pass',
});

// ==============================
// CONTENU HTML POUR CHAQUE PAGE
// ==============================

function htmlContent(slug) {
  const contents = {
    'a-propos': `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">À Propos de PROQUELEC</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">L'organisme national sénégalais de promotion de la qualité des installations électriques intérieures</p>
  </div>
</section>

<!-- Mission & Valeurs -->
<section class="py-16 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <div class="grid md:grid-cols-2 gap-12">
      <div>
        <h2 class="text-3xl font-bold text-[#1e3a5f] mb-6">Notre Mission</h2>
        <p class="text-gray-700 leading-relaxed mb-4">PROQUELEC a pour mission de promouvoir et d'assurer la qualité et la sécurité des installations électriques intérieures au Sénégal. Nous œuvrons pour la réduction des risques électriques et l'amélioration continue des pratiques professionnelles.</p>
        <p class="text-gray-700 leading-relaxed">À travers nos actions de contrôle, de formation et de sensibilisation, nous contribuons à la protection des personnes et des biens contre les dangers liés à l'électricité.</p>
      </div>
      <div>
        <h2 class="text-3xl font-bold text-[#1e3a5f] mb-6">Nos Valeurs</h2>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <div><strong class="text-[#1e3a5f]">Excellence</strong><p class="text-gray-600 text-sm">La recherche constante de la qualité dans toutes nos actions</p></div>
          </div>
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <div><strong class="text-[#1e3a5f]">Intégrité</strong><p class="text-gray-600 text-sm">La transparence et l'éthique dans nos relations avec les parties prenantes</p></div>
          </div>
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <div><strong class="text-[#1e3a5f]">Innovation</strong><p class="text-gray-600 text-sm">L'adaptation continue aux évolutions technologiques et normatives</p></div>
          </div>
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <div><strong class="text-[#1e3a5f]">Service Public</strong><p class="text-gray-600 text-sm">L'engagement au service de la collectivité et de la sécurité de tous</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Histoire -->
<section class="py-16 px-4 bg-gray-50">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-[#1e3a5f] text-center mb-12">Notre Histoire</h2>
    <div class="relative">
      <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-blue-200 transform md:-translate-x-1/2"></div>
      <div class="space-y-12">
        <div class="relative pl-12 md:pl-0 md:pr-1/2 md:text-right">
          <div class="absolute left-2 md:right-auto md:left-auto md:-right-3 top-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white"></div>
          <div class="bg-white p-6 rounded-lg shadow-md"><h3 class="font-bold text-[#1e3a5f]">2015</h3><p class="text-gray-600 text-sm">Création de PROQUELEC par décret présidentiel pour répondre aux besoins croissants de sécurité électrique</p></div>
        </div>
        <div class="relative pl-12 md:pl-1/2">
          <div class="absolute left-2 md:left-0 top-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white"></div>
          <div class="bg-white p-6 rounded-lg shadow-md"><h3 class="font-bold text-[#1e3a5f]">2017</h3><p class="text-gray-600 text-sm">Lancement du programme national de certification des installations électriques</p></div>
        </div>
        <div class="relative pl-12 md:pl-0 md:pr-1/2 md:text-right">
          <div class="absolute left-2 md:right-auto md:-right-3 top-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white"></div>
          <div class="bg-white p-6 rounded-lg shadow-md"><h3 class="font-bold text-[#1e3a5f]">2020</h3><p class="text-gray-600 text-sm">Extension des activités à l'ensemble du territoire national avec des antennes régionales</p></div>
        </div>
        <div class="relative pl-12 md:pl-1/2">
          <div class="absolute left-2 md:left-0 top-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white"></div>
          <div class="bg-white p-6 rounded-lg shadow-md"><h3 class="font-bold text-[#1e3a5f]">2023</h3><p class="text-gray-600 text-sm">Plus de 15 000 installations certifiées et 500 professionnels formés à travers le Sénégal</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Équipe -->
<section class="py-16 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-[#1e3a5f] text-center mb-4">Notre Équipe</h2>
    <p class="text-gray-600 text-center max-w-2xl mx-auto mb-12">Une équipe d'experts passionnés au service de la qualité électrique</p>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="text-center p-6 bg-gray-50 rounded-xl"><div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-3xl text-blue-600 font-bold">AD</span></div><h3 class="font-bold text-[#1e3a5f]">Dr. Amadou Diallo</h3><p class="text-blue-600 text-sm">Directeur Général</p></div>
      <div class="text-center p-6 bg-gray-50 rounded-xl"><div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-3xl text-blue-600 font-bold">MS</span></div><h3 class="font-bold text-[#1e3a5f]">Mariam Sow</h3><p class="text-blue-600 text-sm">Directrice Technique</p></div>
      <div class="text-center p-6 bg-gray-50 rounded-xl"><div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-3xl text-blue-600 font-bold">OF</span></div><h3 class="font-bold text-[#1e3a5f]">Ousmane Fall</h3><p class="text-blue-600 text-sm">Responsable Certifications</p></div>
      <div class="text-center p-6 bg-gray-50 rounded-xl"><div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-3xl text-blue-600 font-bold">FN</span></div><h3 class="font-bold text-[#1e3a5f]">Fatou Ndiaye</h3><p class="text-blue-600 text-sm">Responsable Formation</p></div>
    </div>
  </div>
</section>`,

    'activities': `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Nos Activités</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">Découvrez l'ensemble de nos missions pour la sécurité électrique au Sénégal</p>
  </div>
</section>

<!-- Intro -->
<section class="py-12 px-4 bg-white">
  <div class="max-w-4xl mx-auto text-center">
    <p class="text-lg text-gray-700 leading-relaxed">PROQUELEC déploie un large éventail d'activités visant à garantir la qualité et la conformité des installations électriques intérieures sur l'ensemble du territoire sénégalais.</p>
  </div>
</section>

<!-- Cartes activités -->
<section class="py-12 px-4 bg-gray-50">
  <div class="max-w-6xl mx-auto">
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div class="h-2 bg-blue-600"></div>
        <div class="p-6">
          <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4"><span class="text-2xl">✓</span></div>
          <h3 class="text-xl font-bold text-[#1e3a5f] mb-3">Contrôle de Conformité</h3>
          <p class="text-gray-600 text-sm mb-4">Vérification rigoureuse des installations électriques conformément aux normes sénégalaises en vigueur.</p>
          <ul class="text-sm text-gray-500 space-y-1">
            <li>• Inspection sur site</li>
            <li>• Tests de conformité</li>
            <li>• Rapports détaillés</li>
          </ul>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div class="h-2 bg-green-500"></div>
        <div class="p-6">
          <div class="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4"><span class="text-2xl">🔍</span></div>
          <h3 class="text-xl font-bold text-[#1e3a5f] mb-3">Diagnostics Techniques</h3>
          <p class="text-gray-600 text-sm mb-4">Évaluation approfondie de l'état des installations électriques et identification des risques potentiels.</p>
          <ul class="text-sm text-gray-500 space-y-1">
            <li>• Diagnostic complet</li>
            <li>• Analyse des risques</li>
            <li>• Préconisations</li>
          </ul>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div class="h-2 bg-amber-500"></div>
        <div class="p-6">
          <div class="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mb-4"><span class="text-2xl">📋</span></div>
          <h3 class="text-xl font-bold text-[#1e3a5f] mb-3">Audits Techniques</h3>
          <p class="text-gray-600 text-sm mb-4">Audits approfondis des installations pour les bâtiments publics, les entreprises et les particuliers.</p>
          <ul class="text-sm text-gray-500 space-y-1">
            <li>• Audit réglementaire</li>
            <li>• Audit de performance</li>
            <li>• Certification</li>
          </ul>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div class="h-2 bg-purple-500"></div>
        <div class="p-6">
          <div class="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4"><span class="text-2xl">📚</span></div>
          <h3 class="text-xl font-bold text-[#1e3a5f] mb-3">Formation</h3>
          <p class="text-gray-600 text-sm mb-4">Programmes de formation professionnelle pour les électriciens, ingénieurs et techniciens.</p>
          <ul class="text-sm text-gray-500 space-y-1">
            <li>• Modules certifiants</li>
            <li>• Ateliers pratiques</li>
            <li>• E-learning</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Chiffres clés -->
<section class="py-16 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-[#1e3a5f] text-center mb-12">Nos Réalisations</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div class="text-center"><div class="text-4xl font-bold text-blue-600 mb-2">15 000+</div><p class="text-gray-600">Installations certifiées</p></div>
      <div class="text-center"><div class="text-4xl font-bold text-blue-600 mb-2">500+</div><p class="text-gray-600">Professionnels formés</p></div>
      <div class="text-center"><div class="text-4xl font-bold text-blue-600 mb-2">45</div><p class="text-gray-600">Agents techniques</p></div>
      <div class="text-center"><div class="text-4xl font-bold text-blue-600 mb-2">14</div><p class="text-gray-600">Régions couvertes</p></div>
    </div>
  </div>
</section>`,

    'certifications': `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Certifications PROQUELEC</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">Le label de qualité pour vos installations électriques intérieures</p>
  </div>
</section>

<!-- Intro -->
<section class="py-12 px-4 bg-white">
  <div class="max-w-4xl mx-auto text-center">
    <p class="text-lg text-gray-700 leading-relaxed">Le programme de certification PROQUELEC garantit que vos installations électriques respectent les normes de sécurité et de qualité en vigueur au Sénégal. Une certification reconnue par l'ensemble des acteurs du secteur.</p>
  </div>
</section>

<!-- processus -->
<section class="py-12 px-4 bg-gray-50">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-[#1e3a5f] text-center mb-12">Processus de Certification</h2>
    <div class="grid md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm text-center relative">
        <div class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
        <h3 class="font-bold text-[#1e3a5f] mb-2">Demande</h3>
        <p class="text-gray-600 text-sm">Soumettez votre demande de certification en ligne ou dans nos bureaux</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm text-center relative">
        <div class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
        <h3 class="font-bold text-[#1e3a5f] mb-2">Inspection</h3>
        <p class="text-gray-600 text-sm">Un agent technique qualifié inspecte votre installation</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm text-center relative">
        <div class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
        <h3 class="font-bold text-[#1e3a5f] mb-2">Évaluation</h3>
        <p class="text-gray-600 text-sm">Analyse approfondie des résultats de l'inspection</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm text-center relative">
        <div class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
        <h3 class="font-bold text-[#1e3a5f] mb-2">Certification</h3>
        <p class="text-gray-600 text-sm">Délivrance du certificat de conformité PROQUELEC</p>
      </div>
    </div>
  </div>
</section>

<!-- Types -->
<section class="py-12 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-[#1e3a5f] text-center mb-12">Types de Certification</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="border-2 border-blue-100 rounded-xl p-6 hover:border-blue-500 transition-colors">
        <h3 class="text-xl font-bold text-[#1e3a5f] mb-3">Certification Résidentielle</h3>
        <p class="text-gray-600 text-sm mb-4">Pour les installations électriques des logements individuels et collectifs.</p>
        <p class="text-blue-600 font-semibold">À partir de 75 000 F CFA</p>
      </div>
      <div class="border-2 border-blue-100 rounded-xl p-6 hover:border-blue-500 transition-colors">
        <h3 class="text-xl font-bold text-[#1e3a5f] mb-3">Certification Commerciale</h3>
        <p class="text-gray-600 text-sm mb-4">Pour les locaux commerciaux, bureaux et espaces professionnels.</p>
        <p class="text-blue-600 font-semibold">À partir de 150 000 F CFA</p>
      </div>
      <div class="border-2 border-blue-100 rounded-xl p-6 hover:border-blue-500 transition-colors">
        <h3 class="text-xl font-bold text-[#1e3a5f] mb-3">Certification Industrielle</h3>
        <p class="text-gray-600 text-sm mb-4">Pour les installations industrielles et les bâtiments à usage spécifique.</p>
        <p class="text-blue-600 font-semibold">Sur devis</p>
      </div>
    </div>
  </div>
</section>

<!-- Avantages -->
<section class="py-12 px-4 bg-blue-50">
  <div class="max-w-6xl mx-auto text-center">
    <h2 class="text-3xl font-bold text-[#1e3a5f] mb-8">Pourquoi se Certifier ?</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm"><span class="text-3xl block mb-3">🛡️</span><h3 class="font-bold text-[#1e3a5f] mb-2">Sécurité Garantie</h3><p class="text-gray-600 text-sm">Protection des personnes et des biens contre les risques électriques</p></div>
      <div class="bg-white p-6 rounded-xl shadow-sm"><span class="text-3xl block mb-3">💰</span><h3 class="font-bold text-[#1e3a5f] mb-2">Valeur Ajoutée</h3><p class="text-gray-600 text-sm">Valorisation immobilière grâce à la certification PROQUELEC</p></div>
      <div class="bg-white p-6 rounded-xl shadow-sm"><span class="text-3xl block mb-3">📋</span><h3 class="font-bold text-[#1e3a5f] mb-2">Conformité Légale</h3><p class="text-gray-600 text-sm">Respect des obligations réglementaires sénégalaises</p></div>
    </div>
  </div>
</section>`,

    'contact': `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Contactez-Nous</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">Notre équipe est à votre disposition pour répondre à vos questions</p>
  </div>
</section>

<!-- Contact info + form -->
<section class="py-16 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <div class="grid md:grid-cols-2 gap-12">
      <!-- Coordonnées -->
      <div>
        <h2 class="text-3xl font-bold text-[#1e3a5f] mb-8">Nos Coordonnées</h2>
        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><span class="text-xl">📍</span></div>
            <div><h3 class="font-bold text-[#1e3a5f]">Adresse</h3><p class="text-gray-600">Route de l'Aéroport, Almadies<br>BP: 12345 Dakar, Sénégal</p></div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><span class="text-xl">📞</span></div>
            <div><h3 class="font-bold text-[#1e3a5f]">Téléphone</h3><p class="text-gray-600">+221 33 859 00 00<br>+221 33 859 00 01</p></div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><span class="text-xl">✉️</span></div>
            <div><h3 class="font-bold text-[#1e3a5f]">Email</h3><p class="text-gray-600">contact@proquelec.sn<br>support@proquelec.sn</p></div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><span class="text-xl">🕐</span></div>
            <div><h3 class="font-bold text-[#1e3a5f]">Horaires d'ouverture</h3><p class="text-gray-600">Lun-Ven: 8h00 - 17h30<br>Sam: 9h00 - 13h00</p></div>
          </div>
        </div>
      </div>
      <!-- Formulaire -->
      <div>
        <h2 class="text-3xl font-bold text-[#1e3a5f] mb-8">Envoyez-nous un message</h2>
        <form class="space-y-4">
          <div class="grid sm:grid-cols-2 gap-4">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label><input type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Votre prénom"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Nom</label><input type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Votre nom"></div>
          </div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="votre@email.com"></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label><input type="tel" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="+221 XX XXX XX XX"></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Sujet</label><select class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"><option>Certification</option><option>Formation</option><option>Diagnostic</option><option>Partenariat</option><option>Autre</option></select></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Message</label><textarea rows="5" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Votre message..."></textarea></div>
          <button type="button" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Envoyer le message</button>
        </form>
      </div>
    </div>
  </div>
</section>`,

    'documents': `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Documents & Ressources</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">Centre de documentation technique PROQUELEC</p>
  </div>
</section>

<!-- Intro -->
<section class="py-12 px-4 bg-white">
  <div class="max-w-4xl mx-auto text-center">
    <p class="text-lg text-gray-700 leading-relaxed">Accédez à l'ensemble des documents techniques, normes, guides et ressources pédagogiques publiés par PROQUELEC pour vous accompagner dans vos projets électriques.</p>
  </div>
</section>

<!-- Catégories -->
<section class="py-12 px-4 bg-gray-50">
  <div class="max-w-6xl mx-auto">
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-4"><span class="text-3xl">📄</span><h3 class="text-xl font-bold text-[#1e3a5f]">Normes Techniques</h3></div>
        <p class="text-gray-600 text-sm mb-4">Recueil des normes sénégalaises pour les installations électriques intérieures.</p>
        <div class="space-y-2">
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded"><span class="text-sm text-gray-700">NF C 15-100</span><span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">PDF, 2.3 Mo</span></div>
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded"><span class="text-sm text-gray-700">Normes PROQUELEC 2024</span><span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">PDF, 4.1 Mo</span></div>
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded"><span class="text-sm text-gray-700">Guide des installations</span><span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">PDF, 1.8 Mo</span></div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-4"><span class="text-3xl">📘</span><h3 class="text-xl font-bold text-[#1e3a5f]">Guides Pratiques</h3></div>
        <p class="text-gray-600 text-sm mb-4">Guides et manuels pour les professionnels et le grand public.</p>
        <div class="space-y-2">
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded"><span class="text-sm text-gray-700">Guide de l'installateur</span><span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">PDF, 5.6 Mo</span></div>
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded"><span class="text-sm text-gray-700">Guide du consommateur</span><span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">PDF, 3.2 Mo</span></div>
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded"><span class="text-sm text-gray-700">Manuel de sécurité</span><span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">PDF, 2.9 Mo</span></div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-4"><span class="text-3xl">📊</span><h3 class="text-xl font-bold text-[#1e3a5f]">Rapports</h3></div>
        <p class="text-gray-600 text-sm mb-4">Rapports d'activité, études et publications institutionnelles.</p>
        <div class="space-y-2">
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded"><span class="text-sm text-gray-700">Rapport annuel 2024</span><span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">PDF, 8.4 Mo</span></div>
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded"><span class="text-sm text-gray-700">États des lieux 2023</span><span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">PDF, 6.1 Mo</span></div>
          <div class="flex items-center justify-between p-2 bg-gray-50 rounded"><span class="text-sm text-gray-700">Statistiques sectorielles</span><span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">PDF, 3.7 Mo</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Recherche -->
<section class="py-12 px-4 bg-white">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-2xl font-bold text-[#1e3a5f] mb-6">Recherche documentaire</h2>
    <div class="flex gap-3">
      <input type="text" class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Rechercher un document...">
      <button class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Rechercher</button>
    </div>
  </div>
</section>`,

    'event': `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Événements</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">Calendrier des événements PROQUELEC</p>
  </div>
</section>

<!-- Intro -->
<section class="py-12 px-4 bg-white">
  <div class="max-w-4xl mx-auto text-center">
    <p class="text-lg text-gray-700 leading-relaxed">Restez informé des prochains événements organisés par PROQUELEC : conférences, ateliers, séminaires et formations dédiés à la qualité des installations électriques.</p>
  </div>
</section>

<!-- Événements à venir -->
<section class="py-12 px-4 bg-gray-50">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-[#1e3a5f] mb-8">À Venir</h2>
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
        <div class="flex-shrink-0 w-full md:w-48 h-32 bg-blue-100 rounded-lg flex items-center justify-center"><span class="text-4xl">🗓️</span></div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2"><span class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">15 Juin 2026</span><span class="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">À venir</span></div>
          <h3 class="text-xl font-bold text-[#1e3a5f] mb-2">Conférence Annuelle PROQUELEC 2026</h3>
          <p class="text-gray-600 text-sm mb-4">Présentation du bilan annuel et des perspectives pour la sécurité électrique au Sénégal. Interventions de experts nationaux et internationaux.</p>
          <div class="flex items-center gap-4 text-sm text-gray-500"><span>📍 Dakar, Sénégal</span><span>🕐 9h - 17h</span></div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
        <div class="flex-shrink-0 w-full md:w-48 h-32 bg-blue-100 rounded-lg flex items-center justify-center"><span class="text-4xl">🔧</span></div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2"><span class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">22 Juillet 2026</span><span class="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">À venir</span></div>
          <h3 class="text-xl font-bold text-[#1e3a5f] mb-2">Atelier : Nouvelles Normes Électriques</h3>
          <p class="text-gray-600 text-sm mb-4">Atelier pratique sur les nouvelles normes et réglementations applicables aux installations électriques intérieures au Sénégal.</p>
          <div class="flex items-center gap-4 text-sm text-gray-500"><span>📍 Thiès, Sénégal</span><span>🕐 9h - 16h</span></div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
        <div class="flex-shrink-0 w-full md:w-48 h-32 bg-blue-100 rounded-lg flex items-center justify-center"><span class="text-4xl">📋</span></div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2"><span class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">5 Août 2026</span><span class="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">À venir</span></div>
          <h3 class="text-xl font-bold text-[#1e3a5f] mb-2">Séminaire Certification et Qualité</h3>
          <p class="text-gray-600 text-sm mb-4">Séminaire dédié aux professionnels sur le processus de certification des installations électriques et les bonnes pratiques.</p>
          <div class="flex items-center gap-4 text-sm text-gray-500"><span>📍 Saint-Louis, Sénégal</span><span>🕐 9h - 17h</span></div>
        </div>
      </div>
    </div>
  </div>
</section>`,
  };

  return contents[slug];
}

// Map pages to update with their slugs and titles
const pagesToUpdate = [
  { slug: 'a-propos', title: 'À Propos de PROQUELEC' },
  { slug: 'activities', title: 'Nos Activités' },
  { slug: 'certifications', title: 'Certifications PROQUELEC' },
  { slug: 'contact', title: 'Contact' },
  { slug: 'documents', title: 'Documents & Ressources' },
  { slug: 'event', title: 'Événements' },
  { slug: 'events', title: 'Événements' },
  { slug: 'expertises-techniques', title: 'Expertises Techniques' },
  { slug: 'formation', title: 'Formation' },
  { slug: 'formations', title: 'Formations' },
  { slug: 'formations-proquelec', title: 'Formations PROQUELEC' },
  { slug: 'labels', title: 'Labels & Qualité' },
  { slug: 'legal', title: 'Mentions Légales' },
  { slug: 'services', title: 'Nos Services' },
];

// ==============================
// PAGES AVEC CONTENU SPÉCIFIQUE
// ==============================

function getPageContent(page) {
  // Pages that share the same content (event/events)
  if (page.slug === 'events') {
    return htmlContent('event');
  }

  if (page.slug === 'formations') {
    return getFormationsContent();
  }

  if (page.slug === 'formation') {
    return getFormationContent();
  }

  if (page.slug === 'formations-proquelec') {
    return getFormationsProquelecContent();
  }

  if (page.slug === 'expertises-techniques') {
    return getExpertisesContent();
  }

  if (page.slug === 'labels') {
    return getLabelsContent();
  }

  if (page.slug === 'legal') {
    return getLegalContent();
  }

  if (page.slug === 'services') {
    return getServicesContent();
  }

  // Return specific content if available, otherwise generic
  return htmlContent(page.slug) || '';
}

function getFormationContent() {
  return `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Centre de Formation</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">Formation professionnelle en électricité et sécurité électrique</p>
  </div>
</section>

<!-- Intro -->
<section class="py-12 px-4 bg-white">
  <div class="max-w-4xl mx-auto text-center">
    <p class="text-lg text-gray-700 leading-relaxed">Le centre de formation PROQUELEC propose des programmes complets pour les professionnels de l'électricité. Nos formations allient théorie et pratique pour garantir une montée en compétence efficace.</p>
  </div>
</section>

<!-- Programmes -->
<section class="py-12 px-4 bg-gray-50">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-[#1e3a5f] text-center mb-12">Nos Programmes</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl shadow-sm overflow-hidden"><div class="h-40 bg-blue-600 flex items-center justify-center"><span class="text-5xl">⚡</span></div><div class="p-6"><h3 class="text-xl font-bold text-[#1e3a5f] mb-3">Électricien Certifié</h3><p class="text-gray-600 text-sm mb-4">Formation complète pour devenir électricien professionnel certifié PROQUELEC.</p><div class="flex items-center justify-between text-sm"><span class="text-blue-600 font-semibold">3 mois</span><span class="text-gray-400">→ En savoir plus</span></div></div></div>
      <div class="bg-white rounded-xl shadow-sm overflow-hidden"><div class="h-40 bg-green-600 flex items-center justify-center"><span class="text-5xl">🔋</span></div><div class="p-6"><h3 class="text-xl font-bold text-[#1e3a5f] mb-3">Énergies Renouvelables</h3><p class="text-gray-600 text-sm mb-4">Spécialisation en installation et maintenance de systèmes solaires photovoltaïques.</p><div class="flex items-center justify-between text-sm"><span class="text-blue-600 font-semibold">2 mois</span><span class="text-gray-400">→ En savoir plus</span></div></div></div>
      <div class="bg-white rounded-xl shadow-sm overflow-hidden"><div class="h-40 bg-amber-600 flex items-center justify-center"><span class="text-5xl">🛡️</span></div><div class="p-6"><h3 class="text-xl font-bold text-[#1e3a5f] mb-3">Sécurité Électrique</h3><p class="text-gray-600 text-sm mb-4">Formation aux normes de sécurité et prévention des risques électriques.</p><div class="flex items-center justify-between text-sm"><span class="text-blue-600 font-semibold">1 mois</span><span class="text-gray-400">→ En savoir plus</span></div></div></div>
    </div>
  </div>
</section>

<!-- Avantages -->
<section class="py-12 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-[#1e3a5f] text-center mb-8">Pourquoi Choisir PROQUELEC ?</h2>
    <div class="grid md:grid-cols-4 gap-6">
      <div class="text-center p-4"><div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-2xl">✓</span></div><h3 class="font-bold text-[#1e3a5f] mb-2">Certification Reconnue</h3><p class="text-gray-600 text-sm">Diplômes agréés par l'État</p></div>
      <div class="text-center p-4"><div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-2xl">👨‍🏫</span></div><h3 class="font-bold text-[#1e3a5f] mb-2">Formateurs Experts</h3><p class="text-gray-600 text-sm">Professionnels expérimentés</p></div>
      <div class="text-center p-4"><div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-2xl">🔧</span></div><h3 class="font-bold text-[#1e3a5f] mb-2">Pratique Intensive</h3><p class="text-gray-600 text-sm">70% de travaux pratiques</p></div>
      <div class="text-center p-4"><div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-2xl">🌍</span></div><h3 class="font-bold text-[#1e3a5f] mb-2">Présence Nationale</h3><p class="text-gray-600 text-sm">14 régions couvertes</p></div>
    </div>
  </div>
</section>`;
}

function getFormationsContent() {
  return `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Formations</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">Programmes de formation professionnelle PROQUELEC</p>
  </div>
</section>

<!-- Grille formations -->
<section class="py-16 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
        <span class="text-3xl block mb-3">⚡</span>
        <h3 class="text-lg font-bold text-[#1e3a5f] mb-2">Installateur Électricien</h3>
        <p class="text-gray-600 text-sm mb-3">Formation complète aux métiers de l'installation électrique</p>
        <div class="flex justify-between items-center"><span class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">120h</span><span class="text-sm text-gray-400">Niveau: Débutant</span></div>
      </div>
      <div class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
        <span class="text-3xl block mb-3">🔧</span>
        <h3 class="text-lg font-bold text-[#1e3a5f] mb-2">Technicien Supérieur</h3>
        <p class="text-gray-600 text-sm mb-3">Perfectionnement pour techniciens confirmés</p>
        <div class="flex justify-between items-center"><span class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">200h</span><span class="text-sm text-gray-400">Niveau: Avancé</span></div>
      </div>
      <div class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
        <span class="text-3xl block mb-3">📐</span>
        <h3 class="text-lg font-bold text-[#1e3a5f] mb-2">Bureau d'Études</h3>
        <p class="text-gray-600 text-sm mb-3">Conception et dimensionnement d'installations électriques</p>
        <div class="flex justify-between items-center"><span class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">160h</span><span class="text-sm text-gray-400">Niveau: Expert</span></div>
      </div>
      <div class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
        <span class="text-3xl block mb-3">☀️</span>
        <h3 class="text-lg font-bold text-[#1e3a5f] mb-2">Solaire Photovoltaïque</h3>
        <p class="text-gray-600 text-sm mb-3">Installation et maintenance de systèmes solaires</p>
        <div class="flex justify-between items-center"><span class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">80h</span><span class="text-sm text-gray-400">Niveau: Intermédiaire</span></div>
      </div>
      <div class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
        <span class="text-3xl block mb-3">🛡️</span>
        <h3 class="text-lg font-bold text-[#1e3a5f] mb-2">Sécurité & Normes</h3>
        <p class="text-gray-600 text-sm mb-3">Maîtrise des normes de sécurité électrique</p>
        <div class="flex justify-between items-center"><span class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">40h</span><span class="text-sm text-gray-400">Tous niveaux</span></div>
      </div>
      <div class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
        <span class="text-3xl block mb-3">🏗️</span>
        <h3 class="text-lg font-bold text-[#1e3a5f] mb-2">Gros Œuvre Électrique</h3>
        <p class="text-gray-600 text-sm mb-3">Électricité industrielle et bâtiment</p>
        <div class="flex justify-between items-center"><span class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">180h</span><span class="text-sm text-gray-400">Niveau: Avancé</span></div>
      </div>
    </div>
  </div>
</section>`;
}

function getFormationsProquelecContent() {
  return `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Formations PROQUELEC</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">Programmes détaillés de formation professionnelle</p>
  </div>
</section>

<!-- Description -->
<section class="py-12 px-4 bg-white">
  <div class="max-w-4xl mx-auto text-center">
    <p class="text-lg text-gray-700 leading-relaxed">PROQUELEC propose un catalogue complet de formations professionnelles certifiantes destinées aux électriciens, techniciens, ingénieurs et bureaux d'études. Tous nos programmes sont conformes aux normes nationales et internationales.</p>
  </div>
</section>

<!-- Détails formations -->
<section class="py-12 px-4 bg-gray-50">
  <div class="max-w-6xl mx-auto">
    <div class="space-y-6">
      <details class="bg-white rounded-xl shadow-sm">
        <summary class="p-6 cursor-pointer flex items-center justify-between"><span class="text-xl font-bold text-[#1e3a5f]">⚡ Certification d'Installateur Électricien</span><span class="text-blue-600">▼</span></summary>
        <div class="px-6 pb-6 text-gray-600"><p class="mb-3">Programme complet de 120 heures couvrant les fondamentaux de l'installation électrique : schémas électriques, câblage, tableau de répartition, mise à la terre, protection différentielle.</p><p class="font-semibold text-[#1e3a5f]">Prérequis : Niveau BAC scientifique | Prix : 350 000 F CFA</p></div>
      </details>
      <details class="bg-white rounded-xl shadow-sm">
        <summary class="p-6 cursor-pointer flex items-center justify-between"><span class="text-xl font-bold text-[#1e3a5f]">🔧 Perfectionnement Technique Supérieur</span><span class="text-blue-600">▼</span></summary>
        <div class="px-6 pb-6 text-gray-600"><p class="mb-3">200 heures de formation avancée : dimensionnement des installations, gestion de projet électrique, supervision de chantier, audit de conformité.</p><p class="font-semibold text-[#1e3a5f]">Prérequis : 3 ans d'expérience | Prix : 550 000 F CFA</p></div>
      </details>
      <details class="bg-white rounded-xl shadow-sm">
        <summary class="p-6 cursor-pointer flex items-center justify-between"><span class="text-xl font-bold text-[#1e3a5f]">☀️ Spécialisation Solaire Photovoltaïque</span><span class="text-blue-600">▼</span></summary>
        <div class="px-6 pb-6 text-gray-600"><p class="mb-3">80 heures pour maîtriser l'installation et la maintenance des systèmes solaires : dimensionnement, onduleurs, batteries, régulation.</p><p class="font-semibold text-[#1e3a5f]">Prérequis : Bases en électricité | Prix : 250 000 F CFA</p></div>
      </details>
      <details class="bg-white rounded-xl shadow-sm">
        <summary class="p-6 cursor-pointer flex items-center justify-between"><span class="text-xl font-bold text-[#1e3a5f]">🛡️ Normes et Sécurité Électrique</span><span class="text-blue-600">▼</span></summary>
        <div class="px-6 pb-6 text-gray-600"><p class="mb-3">40 heures pour maîtriser les normes NF C 15-100, les réglementations sénégalaises, la prévention des risques et les procédures de mise en sécurité.</p><p class="font-semibold text-[#1e3a5f]">Prérequis : Aucun | Prix : 150 000 F CFA</p></div>
      </details>
    </div>
  </div>
</section>

<!-- Inscription -->
<section class="py-12 px-4 bg-blue-600 text-center">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl font-bold text-white mb-4">Prêt à vous former ?</h2>
    <p class="text-blue-100 mb-8">Inscrivez-vous dès maintenant à nos programmes de formation</p>
    <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">S'inscrire à une formation</button>
  </div>
</section>`;
}

function getExpertisesContent() {
  return `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Expertises Techniques</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">Nos domaines d'expertise en génie électrique</p>
  </div>
</section>

<!-- Cartes expertise -->
<section class="py-16 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <div class="grid md:grid-cols-2 gap-8">
      <div class="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
        <span class="text-4xl block mb-4">🏠</span>
        <h3 class="text-2xl font-bold text-[#1e3a5f] mb-3">Installations Résidentielles</h3>
        <p class="text-gray-600 mb-4">Expertise en conception, diagnostic et certification des installations électriques des logements individuels et collectifs.</p>
        <ul class="space-y-2 text-sm text-gray-500"><li>✓ Schémas électriques normalisés</li><li>✓ Tableaux de répartition</li><li>✓ Mise à la terre</li><li>✓ Protection différentielle</li></ul>
      </div>
      <div class="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
        <span class="text-4xl block mb-4">🏢</span>
        <h3 class="text-2xl font-bold text-[#1e3a5f] mb-3">Bâtiments Commerciaux</h3>
        <p class="text-gray-600 mb-4">Diagnostic et conformité des installations électriques des locaux commerciaux, bureaux et ERP.</p>
        <ul class="space-y-2 text-sm text-gray-500"><li>✓ Audit de conformité</li><li>✓ Éclairage de sécurité</li><li>✓ Installations spéciales</li><li>✓ Ascenseurs et machineries</li></ul>
      </div>
      <div class="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
        <span class="text-4xl block mb-4">🏭</span>
        <h3 class="text-2xl font-bold text-[#1e3a5f] mb-3">Installations Industrielles</h3>
        <p class="text-gray-600 mb-4">Expertise en installations électriques haute puissance, automatismes et tableaux industriels.</p>
        <ul class="space-y-2 text-sm text-gray-500"><li>✓ Postes de transformation</li><li>✓ Armoires électriques</li><li>✓ Automates programmables</li><li>✓ Green'ly</li></ul>
      </div>
      <div class="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
        <span class="text-4xl block mb-4">☀️</span>
        <h3 class="text-2xl font-bold text-[#1e3a5f] mb-3">Énergies Renouvelables</h3>
        <p class="text-gray-600 mb-4">Expertise en systèmes solaires photovoltaïques, éoliens et hybrides pour tous types de bâtiments.</p>
        <ul class="space-y-2 text-sm text-gray-500"><li>✓ Étude de faisabilité</li><li>✓ Dimensionnement</li><li>✓ Installation et mise en service</li><li>✓ Maintenance préventive</li></ul>
      </div>
    </div>
  </div>
</section>`;
}

function getLabelsContent() {
  return `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Labels & Qualité</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">Le label PROQUELEC, gage de qualité et de sécurité</p>
  </div>
</section>

<!-- Présentation -->
<section class="py-12 px-4 bg-white">
  <div class="max-w-4xl mx-auto text-center">
    <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"><span class="text-4xl">🏆</span></div>
    <h2 class="text-3xl font-bold text-[#1e3a5f] mb-6">Le Label PROQUELEC</h2>
    <p class="text-lg text-gray-700 leading-relaxed">Le label PROQUELEC est une certification de qualité attribuée aux installations électriques intérieures qui respectent les normes de sécurité et de performance les plus exigeantes. C'est la référence au Sénégal pour une électricité sûre et fiable.</p>
  </div>
</section>

<!-- Critères -->
<section class="py-12 px-4 bg-gray-50">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-[#1e3a5f] text-center mb-12">Critères d'Attribution</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-2xl text-green-600">✓</span></div>
        <h3 class="text-lg font-bold text-[#1e3a5f] mb-2">Conformité aux Normes</h3>
        <p class="text-gray-600 text-sm">L'installation doit respecter les normes NF C 15-100 et les réglementations sénégalaises en vigueur.</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm text-center">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-2xl text-blue-600">✓</span></div>
        <h3 class="text-lg font-bold text-[#1e3a5f] mb-2">Sécurité Maximale</h3>
        <p class="text-gray-600 text-sm">Protection des personnes contre les risques d'électrisation et des biens contre les incendies d'origine électrique.</p>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm text-center">
        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"><span class="text-2xl text-amber-600">✓</span></div>
        <h3 class="text-lg font-bold text-[#1e3a5f] mb-2">Qualité des Matériaux</h3>
        <p class="text-gray-600 text-sm">Utilisation de matériaux et équipements conformes aux normes et adaptés à l'usage prévu.</p>
      </div>
    </div>
  </div>
</section>

<!-- Avantages du label -->
<section class="py-12 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-[#1e3a5f] text-center mb-12">Avantages du Label</h2>
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="text-center p-6"><span class="text-3xl block mb-3">🛡️</span><h3 class="font-bold text-[#1e3a5f] mb-2">Sécurité</h3><p class="text-gray-600 text-sm">Protection garantie contre les risques électriques</p></div>
      <div class="text-center p-6"><span class="text-3xl block mb-3">💰</span><h3 class="font-bold text-[#1e3a5f] mb-2">Valorisation</h3><p class="text-gray-600 text-sm">Augmentation de la valeur immobilière du bien</p></div>
      <div class="text-center p-6"><span class="text-3xl block mb-3">📋</span><h3 class="font-bold text-[#1e3a5f] mb-2">Conformité</h3><p class="text-gray-600 text-sm">Respect des obligations réglementaires</p></div>
      <div class="text-center p-6"><span class="text-3xl block mb-3">🤝</span><h3 class="font-bold text-[#1e3a5f] mb-2">Confiance</h3><p class="text-gray-600 text-sm">Gage de qualité reconnu par tous les acteurs</p></div>
    </div>
  </div>
</section>`;
}

function getLegalContent() {
  return `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Mentions Légales</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">Informations légales et conditions d'utilisation</p>
  </div>
</section>

<!-- Contenu légal -->
<section class="py-16 px-4 bg-white">
  <div class="max-w-4xl mx-auto">
    <div class="prose max-w-none">
      <h2 class="text-2xl font-bold text-[#1e3a5f] mb-6">1. Éditeur du site</h2>
      <p class="text-gray-700 mb-6">Le site internet <strong>proquelec.sn</strong> est édité par l'organisme national de promotion de la qualité des installations électriques intérieures (PROQUELEC), établissement public à caractère administratif.</p>
      <div class="bg-gray-50 p-6 rounded-xl mb-8">
        <p class="text-gray-700"><strong>Siège social :</strong> Route de l'Aéroport, Almadies, Dakar, Sénégal<br>
        <strong>BP :</strong> 12345 Dakar<br>
        <strong>Téléphone :</strong> +221 33 859 00 00<br>
        <strong>Email :</strong> contact@proquelec.sn<br>
        <strong>Registre :</strong> NINEA 123456789</p>
      </div>

      <h2 class="text-2xl font-bold text-[#1e3a5f] mb-6">2. Directeur de la publication</h2>
      <p class="text-gray-700 mb-6">Dr. Amadou Diallo, Directeur Général de PROQUELEC.</p>

      <h2 class="text-2xl font-bold text-[#1e3a5f] mb-6">3. Hébergement</h2>
      <p class="text-gray-700 mb-6">Le site est hébergé par <strong>OVH SAS</strong>, 2 rue Kellermann, 59100 Roubaix, France.</p>

      <h2 class="text-2xl font-bold text-[#1e3a5f] mb-6">4. Propriété intellectuelle</h2>
      <p class="text-gray-700 mb-6">L'ensemble du contenu du site (textes, images, logos, documents) est la propriété exclusive de PROQUELEC. Toute reproduction ou représentation, totale ou partielle, sans autorisation préalable est interdite.</p>

      <h2 class="text-2xl font-bold text-[#1e3a5f] mb-6">5. Protection des données</h2>
      <p class="text-gray-700 mb-6">Conformément à la loi sénégalaise relative à la protection des données à caractère personnel, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer, contactez-nous à dpo@proquelec.sn.</p>

      <h2 class="text-2xl font-bold text-[#1e3a5f] mb-6">6. Cookies</h2>
      <p class="text-gray-700 mb-6">Le site utilise des cookies techniques nécessaires à son bon fonctionnement. Des cookies analytiques peuvent être utilisés avec votre consentement. Vous pouvez configurer vos préférences à tout moment.</p>
    </div>
  </div>
</section>`;
}

function getServicesContent() {
  return `<!-- Hero -->
<section class="py-16 px-4" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);">
  <div class="max-w-5xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Nos Services</h1>
    <p class="text-xl text-blue-100 max-w-3xl mx-auto">Des solutions complètes pour la qualité et la sécurité de vos installations électriques</p>
  </div>
</section>

<!-- Services -->
<section class="py-16 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:border-blue-200 transition-all">
        <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4"><span class="text-2xl">🔍</span></div>
        <h3 class="text-xl font-bold text-[#1e3a5f] mb-2">Diagnostic Électrique</h3>
        <p class="text-gray-600 text-sm">Évaluation complète de vos installations pour identifier les non-conformités et les risques potentiels.</p>
        <p class="text-blue-600 text-sm font-semibold mt-3">À partir de 50 000 F CFA</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:border-blue-200 transition-all">
        <div class="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4"><span class="text-2xl">✓</span></div>
        <h3 class="text-xl font-bold text-[#1e3a5f] mb-2">Contrôle de Conformité</h3>
        <p class="text-gray-600 text-sm">Vérification rigoureuse de la conformité de vos installations aux normes en vigueur.</p>
        <p class="text-blue-600 text-sm font-semibold mt-3">À partir de 75 000 F CFA</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:border-blue-200 transition-all">
        <div class="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mb-4"><span class="text-2xl">📋</span></div>
        <h3 class="text-xl font-bold text-[#1e3a5f] mb-2">Audit Technique</h3>
        <p class="text-gray-600 text-sm">Audit approfondi de vos installations pour les bâtiments publics et entreprises.</p>
        <p class="text-blue-600 text-sm font-semibold mt-3">Sur devis</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:border-blue-200 transition-all">
        <div class="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4"><span class="text-2xl">🏆</span></div>
        <h3 class="text-xl font-bold text-[#1e3a5f] mb-2">Certification</h3>
        <p class="text-gray-600 text-sm">Obtention du label PROQUELEC garantissant la qualité de vos installations.</p>
        <p class="text-blue-600 text-sm font-semibold mt-3">À partir de 100 000 F CFA</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:border-blue-200 transition-all">
        <div class="w-14 h-14 bg-pink-100 rounded-lg flex items-center justify-center mb-4"><span class="text-2xl">📚</span></div>
        <h3 class="text-xl font-bold text-[#1e3a5f] mb-2">Formation Professionnelle</h3>
        <p class="text-gray-600 text-sm">Programmes de formation pour les professionnels de l'électricité.</p>
        <p class="text-blue-600 text-sm font-semibold mt-3">À partir de 150 000 F CFA</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:border-blue-200 transition-all">
        <div class="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center mb-4"><span class="text-2xl">📊</span></div>
        <h3 class="text-xl font-bold text-[#1e3a5f] mb-2">Conseil et Assistance</h3>
        <p class="text-gray-600 text-sm">Accompagnement technique pour vos projets électriques.</p>
        <p class="text-blue-600 text-sm font-semibold mt-3">Sur devis</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-12 px-4 bg-gray-50 text-center">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl font-bold text-[#1e3a5f] mb-4">Besoin d'un service personnalisé ?</h2>
    <p class="text-gray-600 mb-8">Contactez-nous pour une étude personnalisée de votre projet</p>
    <a href="/contact" class="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">Demander un devis</a>
  </div>
</section>`;
}

// ==============================
// GÉNÉRATION STRUCTURE CRAFT.js
// ==============================

function buildCraftStructure(htmlContent, pageTitle, idSuffix) {
  const htmlId = `html_ml_${idSuffix}`;
  return {
    ROOT: {
      type: { resolvedName: 'ContainerBlock' },
      nodes: [htmlId],
      props: { padding: 0, maxWidth: '100%', backgroundColor: '#ffffff' },
      custom: {},
      hidden: false,
      isCanvas: true,
      displayName: `Page: ${pageTitle}`,
      linkedNodes: {},
    },
    [htmlId]: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: { html: htmlContent, padding: 0 },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'Code HTML',
      linkedNodes: {},
    },
  };
}

// ==============================
// EXÉCUTION DES MISES À JOUR
// ==============================

async function updateAllPages() {
  console.log('========================================');
  console.log('  MISE À JOUR RICHE DES PAGES PROQUELEC');
  console.log('========================================\n');

  let counter = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const page of pagesToUpdate) {
    counter++;
    const content = getPageContent(page);

    if (!content) {
      console.log(`⚠️  [${counter}/${pagesToUpdate.length}] "${page.title}" (slug: ${page.slug}) → PAS DE CONTENU`);
      continue;
    }

    const structure = buildCraftStructure(content, page.title, counter);

    try {
      // Check if page exists
      const existing = await pool.query(
        'SELECT id FROM public.pages WHERE slug = $1',
        [page.slug]
      );

      if (existing.rows.length === 0) {
        console.log(`⚠️  [${counter}/${pagesToUpdate.length}] "${page.title}" (slug: ${page.slug}) → Page inexistante, création...`);
        await pool.query(
          `INSERT INTO public.pages (title, slug, structure_json, status, is_published, menu_order)
           VALUES ($1, $2, $3::jsonb, 'published', true, 999)`,
          [page.title, page.slug, JSON.stringify(structure)]
        );
      } else {
        await pool.query(
          `UPDATE public.pages
           SET title = $1, structure_json = $2::jsonb, status = 'published', is_published = true, updated_at = NOW()
           WHERE slug = $3`,
          [page.title, JSON.stringify(structure), page.slug]
        );
      }

      console.log(`✅  [${counter}/${pagesToUpdate.length}] "${page.title}" (slug: ${page.slug}) → ${content.length} caractères`);
      successCount++;
    } catch (err) {
      console.error(`❌  [${counter}/${pagesToUpdate.length}] "${page.title}" → ERREUR: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n========================================');
  console.log(`  RÉSULTAT : ${successCount} succès, ${errorCount} erreurs`);
  console.log('========================================\n');

  // Vérification finale
  console.log('🔍 Vérification des pages mises à jour :\n');
  const result = await pool.query(
    `SELECT title, slug, status, is_published,
            CASE WHEN structure_json IS NOT NULL THEN '✅' ELSE '❌' END as has_structure
     FROM public.pages
     WHERE slug = ANY($1)
     ORDER BY slug`,
    [pagesToUpdate.map(p => p.slug)]
  );
  result.rows.forEach(r => {
    console.log(`  ${r.has_structure} [${r.status}] ${r.title.padEnd(35)} "${r.slug}"`);
  });

  await pool.end();
  console.log('\n✅ Mise à jour terminée !');
}

updateAllPages().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
