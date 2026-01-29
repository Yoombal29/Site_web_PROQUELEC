-- ========================================================
-- CONTENT UPDATE: Transform /produits to "Expertises & Solutions"
-- ========================================================

-- Update the existing 'produits' page with rich content about Proquelec's expertise
UPDATE public.pages
SET 
  title = 'Expertises & Solutions',
  slug = 'expertises-techniques', -- Renaming slug to match content
  meta_description = 'Découvrez l''expertise technique de PROQUELEC : Audit, Conseil, Solutions Électriques et Base de Données Matériaux.',
  content = '<div class="space-y-12">
  <!-- Hero Section -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 to-slate-900 p-8 md:p-12 text-white shadow-2xl">
    <div class="relative z-10 max-w-3xl">
      <h2 class="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
        Au-delà des produits : L''Excellence Technique
      </h2>
      <p class="text-lg text-blue-100 leading-relaxed">
        Chez PROQUELEC, nous ne vendons pas simplement du matériel. Nous apportons la garantie de la performance, de la sécurité et de la conformité de vos installations électriques au Sénégal.
      </p>
    </div>
    <div class="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
  </div>

  <!-- Intégration Image Illustrative (Placeholder généré par IA si besoin) -->
  <div class="grid md:grid-cols-3 gap-6">
     <div class="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h3 class="font-bold text-slate-900">Sécurité</h3>
        <p class="text-sm text-slate-500 mt-2">Normes NFC 15-100 & Respect des standards internationaux</p>
     </div>
     <div class="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <h3 class="font-bold text-slate-900">Conformité</h3>
        <p class="text-sm text-slate-500 mt-2">Certification et labellisation de vos projets électriques</p>
     </div>
     <div class="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        </div>
        <h3 class="font-bold text-slate-900">Expertise</h3>
        <p class="text-sm text-slate-500 mt-2">Plus de 20 ans d''expérience au service de l''électricité</p>
     </div>
  </div>

  <!-- Grid Services -->
  <div class="grid md:grid-cols-2 gap-8">
    <!-- Audit -->
    <div class="group p-8 rounded-2xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <h3 class="text-xl font-bold text-slate-900 mb-3">Audit & Diagnostic</h3>
      <p class="text-slate-600 mb-4">
        Analyse complète de vos installations existantes. Identification des risques, mesure de la performance et recommandations de mise aux normes.
      </p>
      <ul class="space-y-2 text-sm text-slate-500">
        <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Thermographie infrarouge</li>
        <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Analyse de réseau</li>
        <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Vérification NFC 15-100</li>
      </ul>
    </div>

    <!-- Consulting -->
    <div class="group p-8 rounded-2xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/><line x1="2" y1="20" x2="2" y2="20"/></svg>
      </div>
      <h3 class="text-xl font-bold text-slate-900 mb-3">Solutions Techniques</h3>
      <p class="text-slate-600 mb-4">
        Accompagnement dans le choix des équipements et des architectures électriques pour vos projets neufs ou rénovations.
      </p>
      <ul class="space-y-2 text-sm text-slate-500">
        <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>Dimensionnement d''installations</li>
        <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>Efficacité énergétique</li>
        <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>Protection foudre</li>
      </ul>
    </div>
  </div>

  <!-- Call to Action -->
  <div class="mt-12 p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center relative overflow-hidden">
    <div class="absolute top-0 right-0 w-32 h-32 bg-yellow-400 opacity-10 rounded-bl-full"></div>
    <h3 class="text-2xl font-bold text-slate-900 mb-4 relative z-10">Besoin de matériel spécifique ?</h3>
    <p class="text-slate-600 mb-6 max-w-2xl mx-auto relative z-10">
      Accédez à notre base de données technique complète pour trouver les spécifications et équivalences de milliers de références.
    </p>
    <a href="/outils" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30 relative z-10">
      Accéder aux Outils Techniques
      <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 -mr-1 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
    </a>
  </div>
</div>',
  workflow_status = 'published',
  is_published = true,
  updated_at = now()
WHERE slug = 'produits';
