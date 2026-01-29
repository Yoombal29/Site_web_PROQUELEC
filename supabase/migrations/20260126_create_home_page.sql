-- Migration de la Page d'Accueil vers le CMS
-- Crée une page "home" éditable via l'admin

INSERT INTO public.pages (
    title,
    slug,
    content,
    content_raw,
    meta_description,
    meta_keywords,
    is_published,
    show_hero,
    show_footer,
    hero_title,
    hero_subtitle,
    hero_background_image,
    hero_cta_text,
    hero_cta_link,
    template,
    editor_engine
) VALUES (
    'Accueil - PROQUELEC Sénégal',
    'home',
    '<div class="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pourquoi choisir <span class="text-blue-600">PROQUELEC</span> ?
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Leader dans la promotion de la qualité des installations électriques au Sénégal,
            nous accompagnons particuliers et entreprises dans leurs projets électriques.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Sécurité Électrique</h3>
            <p class="text-gray-600 leading-relaxed">Installations conformes aux normes internationales pour une sécurité maximale</p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Expertise Technique</h3>
            <p class="text-gray-600 leading-relaxed">Équipe d''ingénieurs et techniciens hautement qualifiés et certifiés</p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Certifications</h3>
            <p class="text-gray-600 leading-relaxed">Reconnaissance officielle et certifications professionnelles validées</p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Formation Continue</h3>
            <p class="text-gray-600 leading-relaxed">Programmes de formation adaptés aux besoins du marché sénégalais</p>
          </div>
        </div>
      </div>
    </div>',
    -- content_raw (même contenu pour ICE Engine)
    '<div class="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pourquoi choisir <span class="text-blue-600">PROQUELEC</span> ?
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Leader dans la promotion de la qualité des installations électriques au Sénégal,
            nous accompagnons particuliers et entreprises dans leurs projets électriques.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Sécurité Électrique</h3>
            <p class="text-gray-600 leading-relaxed">Installations conformes aux normes internationales pour une sécurité maximale</p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Expertise Technique</h3>
            <p class="text-gray-600 leading-relaxed">Équipe d''ingénieurs et techniciens hautement qualifiés et certifiés</p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Certifications</h3>
            <p class="text-gray-600 leading-relaxed">Reconnaissance officielle et certifications professionnelles validées</p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Formation Continue</h3>
            <p class="text-gray-600 leading-relaxed">Programmes de formation adaptés aux besoins du marché sénégalais</p>
          </div>
        </div>
      </div>
    </div>',
    'PROQUELEC - Promotion de la Qualité des Installations Électriques au Sénégal. Formations, certifications et services d''audit électrique professionnels.',
    'électricité, formations, certifications, qualité, Sénégal, sécurité, installations, audit électrique',
    true,
    true,
    true,
    'Promotion de la Qualité des Installations Électriques',
    'Sécurité · Qualité · Formation',
    '',
    'Nos Services',
    '#services',
    'default',
    'code'
)
ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    content_raw = EXCLUDED.content_raw,
    updated_at = now();
