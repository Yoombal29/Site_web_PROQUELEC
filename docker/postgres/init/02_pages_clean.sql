-- CLEAN EXPORT FOR LOCAL PAGES
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('b242ca89-b493-41f6-9ab2-497c77d9861d', 'PROQUELEC ACADEMIE', 'proquelec', 'SKJFJKNKLDN? V
FB
BFB
FB

BN
GBN', '', '', 'noindex,follow', 'https://upload.wikimedia.org/wikipedia/commons/7/79/Ville_touba_mosquee.jpg', 'full-width', true, true, '', '', '', '', 'HEROS', 'TESTE', '', 'TESTE', '', true, NULL, NULL, 0, NULL, '["PAGE"]'::jsonb, '[]'::jsonb, '', 0, '2026-01-27T12:40:37.124264+00:00', '2026-01-27T12:41:56.579049+00:00', '{}'::jsonb, '{}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('330aa5a3-bba2-4802-a7b5-7edb9a6ba946', 'Accueil - PROQUELEC Sénégal', 'home', '
<!-- Hero Section -->
<section class="relative w-full pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900">
  <div class="absolute inset-0 bg-black/60"></div>
  <div class="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
  <div class="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
  
  <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-center mb-6 sm:mb-8">
      <div class="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 opacity-90">
        <span class="w-2 h-2 bg-white rounded-full"></span>
        ⚡ PROQUELEC SENEGAL
      </div>
    </div>
    
    <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center mb-4 sm:mb-6 leading-tight">
      Promotion de la Qualité des Installations Électriques
    </h1>
    
    <p class="text-xl sm:text-2xl text-blue-100 text-center mb-6 sm:mb-8 max-w-3xl mx-auto">
      Sécurité · Qualité · Formation
    </p>

    <p class="text-sm sm:text-base text-slate-300 text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
      Expert en installations électriques au Sénégal. Nous garantissons la sécurité, la qualité et la conformité de vos projets électriques avec les normes internationales.
    </p>

    <div class="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-8 sm:mb-12 flex-wrap">
       <a href="#services" class="px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-orange-500/50 hover:scale-105 active:scale-95 text-center">
         Nos Services
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline ml-1"><path d="m9 18 6-6-6-6"/></svg>
       </a>
       <a href="/contact" class="px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 active:scale-95 text-center">
         Contactez-nous
       </a>
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="py-20 bg-gradient-to-br from-gray-50 to-white">
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
            <!-- Feature 1: Sécurité -->
            <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div class="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style="background-color: rgba(220, 38, 38, 0.12)">
                    <svg class="w-8 h-8 text-red-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">Sécurité Électrique</h3>
                <p class="text-gray-600 leading-relaxed">Installations conformes aux normes internationales pour une sécurité maximale</p>
            </div>

            <!-- Feature 2: Expertise -->
            <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div class="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style="background-color: rgba(245, 158, 11, 0.12)">
                    <svg class="w-8 h-8 text-amber-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">Expertise Technique</h3>
                <p class="text-gray-600 leading-relaxed">Équipe d''ingénieurs et techniciens hautement qualifiés et certifiés</p>
            </div>
            
            <!-- Feature 3: Certifications -->
            <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div class="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style="background-color: rgba(16, 185, 129, 0.12)">
                    <svg class="w-8 h-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">Certifications</h3>
                <p class="text-gray-600 leading-relaxed">Reconnaissance officielle et certifications professionnelles validées</p>
            </div>

            <!-- Feature 4: Formation -->
            <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div class="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style="background-color: rgba(59, 130, 246, 0.12)">
                    <svg class="w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">Formation Continue</h3>
                <p class="text-gray-600 leading-relaxed">Programmes de formation adaptés aux besoins du marché sénégalais</p>
            </div>
        </div>
    </div>
</section>

<!-- Stats Section -->
<section class="py-16 bg-gradient-to-r from-blue-900 to-blue-800">
    <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div class="text-center">
                <div class="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
                <div class="text-blue-200 text-sm md:text-base">Projets Réalisés</div>
            </div>
            <div class="text-center">
                <div class="text-4xl md:text-5xl font-bold text-white mb-2">98%</div>
                <div class="text-blue-200 text-sm md:text-base">Satisfaction Client</div>
            </div>
            <div class="text-center">
                <div class="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
                <div class="text-blue-200 text-sm md:text-base">Experts Certifiés</div>
            </div>
            <div class="text-center">
                <div class="text-4xl md:text-5xl font-bold text-white mb-2">15+</div>
                <div class="text-blue-200 text-sm md:text-base">Années d''Expérience</div>
            </div>
        </div>
    </div>
</section>
', 'PROQUELEC - Promotion de la Qualité des Installations Électriques au Sénégal. Formations, certifications et services d''audit électrique professionnels.', 'électricité, formations, certifications, qualité, Sénégal, sécurité, installations, audit électrique', 'index,follow', '', 'default', true, true, '', '', '', '', 'Promotion de la Qualité des Installations Électriques', 'Sécurité · Qualité · Formation', '', 'Nos Services', '#services', true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, '', 0, '2026-01-23T05:36:17.573337+00:00', '2026-01-23T21:49:05.078906+00:00', '{"layout":"default","body_font":"sans-serif","custom_css":"","text_color":"#333333","hero_height":"medium","accent_color":"#0066cc","heading_font":"sans-serif","hero_enabled":true,"hero_overlay":0.3,"content_width":"default","hero_alignment":"center","custom_sections":[],"sidebar_enabled":false,"background_color":"#ffffff","sidebar_position":"right","footer_cta_enabled":true}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('968e8972-0240-403f-a720-f0823bd7d3cf', 'Blog PROQUELEC', 'blog', '<h1>Blog PROQUELEC</h1>
<p>Actualités, conseils et informations sur la qualité électrique au Sénégal.</p>

<h2>Dernières Actualités</h2>
<p>Restez informé des dernières évolutions dans le domaine de l''électricité au Sénégal.</p>

<h2>Conseils Pratiques</h2>
<p>Des conseils d''experts pour améliorer la qualité et la sécurité de vos installations électriques.</p>

<h2>Normes et Réglementation</h2>
<p>Tout savoir sur les normes électriques applicables et les évolutions réglementaires.</p>', NULL, NULL, 'index,follow', NULL, 'default', true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, NULL, 2, '2026-01-22T04:34:32.874796+00:00', '2026-01-22T04:34:32.874796+00:00', '{"layout":"default","body_font":"sans-serif","custom_css":"","text_color":"#333333","hero_height":"medium","accent_color":"#0066cc","heading_font":"sans-serif","hero_enabled":true,"hero_overlay":0.3,"content_width":"default","hero_alignment":"center","custom_sections":[],"sidebar_enabled":false,"background_color":"#ffffff","sidebar_position":"right","footer_cta_enabled":true}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('764bf968-dcdc-4d6c-9e94-0121f441ad63', 'Formations PROQUELEC', 'formations-proquelec', '<div class="space-y-8">
<section class="bg-gradient-to-r from-proqblue to-blue-600 text-white rounded-lg p-8 mb-8">
  <h2 class="text-3xl font-bold mb-3">Formations PROQUELEC</h2>
  <p class="text-xl">Développez vos compétences avec nos programmes de formation professionnels</p>
</section>

<section class="space-y-4">
  <h3 class="text-2xl font-bold text-gray-900">Nos Programmes de Formation</h3>
  <p class="text-gray-700">PROQUELEC propose une gamme complète de formations pour les professionnels du secteur électrique.</p>
</section>

<section class="grid md:grid-cols-2 gap-6">
  <div class="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
    <h4 class="text-xl font-bold text-proqblue mb-3">Formation Initiale</h4>
    <p class="text-gray-700 mb-4">Formation complète pour les nouveaux professionnels couvrant les bases de l''électricité et la sécurité.</p>
    <ul class="space-y-2 text-sm text-gray-600">
      <li>✓ Durée: 4-6 semaines</li>
      <li>✓ Niveau: Débutant</li>
      <li>✓ Certification incluse</li>
    </ul>
  </div>

  <div class="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
    <h4 class="text-xl font-bold text-proqblue mb-3">Formation Continue</h4>
    <p class="text-gray-700 mb-4">Mises à jour régulières sur les nouvelles normes et technologies électriques.</p>
    <ul class="space-y-2 text-sm text-gray-600">
      <li>✓ Durée: 1-2 semaines</li>
      <li>✓ Niveau: Professionnel</li>
      <li>✓ Points de formation</li>
    </ul>
  </div>

  <div class="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
    <h4 class="text-xl font-bold text-proqblue mb-3">Spécialisation</h4>
    <p class="text-gray-700 mb-4">Formation spécialisée dans des domaines comme l''énergie renouvelable et les systèmes avancés.</p>
    <ul class="space-y-2 text-sm text-gray-600">
      <li>✓ Durée: 2-3 semaines</li>
      <li>✓ Niveau: Avancé</li>
      <li>✓ Expertise reconnue</li>
    </ul>
  </div>

  <div class="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
    <h4 class="text-xl font-bold text-proqblue mb-3">Séminaires</h4>
    <p class="text-gray-700 mb-4">Sessions courtes sur des sujets spécifiques et tendances du secteur.</p>
    <ul class="space-y-2 text-sm text-gray-600">
      <li>✓ Durée: 1 jour</li>
      <li>✓ Flexible</li>
      <li>✓ Attestation</li>
    </ul>
  </div>
</section>

<section class="space-y-4 mt-8">
  <h3 class="text-2xl font-bold text-gray-900">Modalités de Formation</h3>
  <div class="space-y-3">
    <div class="flex gap-4">
      <span class="text-proqblue font-bold text-xl">🏫</span>
      <div>
        <h4 class="font-bold text-gray-900">Présentiel</h4>
        <p class="text-gray-700">Formation directe dans nos centres accrédités avec matériel moderne.</p>
      </div>
    </div>
    <div class="flex gap-4">
      <span class="text-proqblue font-bold text-xl">💻</span>
      <div>
        <h4 class="font-bold text-gray-900">Hybride</h4>
        <p class="text-gray-700">Combinaison de modules en ligne et sessions pratiques en présence.</p>
      </div>
    </div>
    <div class="flex gap-4">
      <span class="text-proqblue font-bold text-xl">🌐</span>
      <div>
        <h4 class="font-bold text-gray-900">En Ligne</h4>
        <p class="text-gray-700">Modules 100% numériques avec plateforme interactive et support tuteur.</p>
      </div>
    </div>
  </div>
</section>

<section class="space-y-4 mt-8 bg-gray-50 rounded-lg p-6">
  <h3 class="text-2xl font-bold text-gray-900">Inscription et Information</h3>
  <p class="text-gray-700 mb-4">Contactez notre équipe de formation pour connaître les prochaines sessions.</p>
  <div class="space-y-2">
    <p class="text-gray-700"><strong>Email:</strong> formations@proquelec.sn</p>
    <p class="text-gray-700"><strong>Tél:</strong> +221 33 123 45 67 (poste formation)</p>
  </div>
</section>
</div>', NULL, NULL, 'index,follow', NULL, 'default', true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, NULL, 8, '2026-01-22T04:49:24.631533+00:00', '2026-01-22T04:49:24.631533+00:00', '{"layout":"default","body_font":"sans-serif","custom_css":"","text_color":"#333333","hero_height":"medium","accent_color":"#0066cc","heading_font":"sans-serif","hero_enabled":true,"hero_overlay":0.3,"content_width":"default","hero_alignment":"center","custom_sections":[],"sidebar_enabled":false,"background_color":"#ffffff","sidebar_position":"right","footer_cta_enabled":true}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('e0a75f20-3465-4aa9-9a16-75c6dc978079', 'Actualités', 'actualites', '<h2>Dernières actualités</h2><p>Consultez nos dernières actualités et mises à jour.</p>', NULL, NULL, 'index,follow', NULL, 'default', true, true, NULL, NULL, NULL, NULL, 'Actualités', 'Restez informé de nos dernières nouvelles', NULL, NULL, NULL, true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, NULL, 1, '2026-01-22T07:12:48.673+00:00', '2026-01-22T07:12:48.674+00:00', '{"layout":"default","body_font":"sans-serif","custom_css":"","text_color":"#333333","hero_height":"medium","accent_color":"#0066cc","heading_font":"sans-serif","hero_enabled":true,"hero_overlay":0.3,"content_width":"default","hero_alignment":"center","custom_sections":[],"sidebar_enabled":false,"background_color":"#ffffff","sidebar_position":"right","footer_cta_enabled":true}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('4cf68e4e-d091-4334-b826-7538f509a11c', 'Événements', 'evenements', '<h2>Événements à venir</h2><p>Retrouvez tous nos événements et webinaires.</p>', NULL, NULL, 'index,follow', NULL, 'default', true, true, NULL, NULL, NULL, NULL, 'Événements', 'Rejoignez nos prochains événements', NULL, NULL, NULL, true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, NULL, 1, '2026-01-22T07:12:49.206+00:00', '2026-01-22T07:12:49.206+00:00', '{"layout":"default","body_font":"sans-serif","custom_css":"","text_color":"#333333","hero_height":"medium","accent_color":"#0066cc","heading_font":"sans-serif","hero_enabled":true,"hero_overlay":0.3,"content_width":"default","hero_alignment":"center","custom_sections":[],"sidebar_enabled":false,"background_color":"#ffffff","sidebar_position":"right","footer_cta_enabled":true}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('40c6b4f6-921e-407a-85d7-0e10cdbb9231', 'À Propos de PROQUELEC', 'about', '
<div class="w-full bg-slate-50 overflow-hidden">
  <!-- Hero Section Futuriste -->
  <div class="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
    <!-- Vidéo de fond abstraite ou gradient animé -->
    <div class="absolute inset-0 bg-slate-900 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black opacity-90"></div>
      <div class="absolute inset-0 bg-[url(''https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'')] bg-cover bg-center mix-blend-overlay opacity-40 animate-pulse-slow"></div>
    </div>
    
    <div class="relative z-10 text-center px-4 max-w-5xl">
      <div class="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-300 text-sm font-medium animate-in fade-in slide-in-from-top-10 duration-1000">
        <span>EST. 1995</span>
        <span class="w-1 h-1 rounded-full bg-blue-300"></span>
        <span>SÉNÉGAL</span>
      </div>
      <h1 class="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 mb-8 animate-in fade-in zoom-in-50 duration-1000 delay-200 tracking-tight">
        L''Excellence Électrique <br/>Réinventée
      </h1>
      <p class="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 font-light">
        Organisme national de référence, PROQUELEC façonne l''avenir de la sécurité et de la qualité électrique par l''innovation et l''expertise.
      </p>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-70">
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
    </div>
  </div>

  <!-- Section Histoire & Vision (Glassmorphism) -->
  <section class="py-24 px-4 relative">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div class="space-y-8 animate-in fade-in slide-in-from-left duration-1000 view-timeline">
        <h2 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-indigo-600">
          Une Histoire d''Innovation
        </h2>
        <div class="prose prose-lg text-slate-600">
          <p>
            Depuis sa fondation en 1995, <strong class="text-blue-600">PROQUELEC</strong> n''a cessé d''évoluer pour répondre aux défis énergétiques du Sénégal. Plus qu''un organisme de contrôle, nous sommes devenus un partenaire stratégique pour la Senelec et les acteurs industriels majeurs.
          </p>
          <p>
            Notre vision dépasse la simple conformité : nous visons une transformation durable du secteur par la montée en compétence et l''adoption de technologies de pointe.
          </p>
        </div>
        
        <div class="grid grid-cols-2 gap-6 mt-8">
          <div class="p-6 bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
            <div class="text-3xl font-bold text-blue-600 mb-2">25+</div>
            <div class="text-sm font-semibold text-slate-400 uppercase tracking-wide">Années d''Expertise</div>
          </div>
          <div class="p-6 bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 delay-100">
            <div class="text-3xl font-bold text-indigo-600 mb-2">100%</div>
            <div class="text-sm font-semibold text-slate-400 uppercase tracking-wide">Engagement Qualité</div>
          </div>
        </div>
      </div>
      
      <div class="relative h-[600px] rounded-[2rem] overflow-hidden group shadow-2xl animate-in fade-in slide-in-from-right duration-1000 view-timeline">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" alt="Bureau futuriste" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div class="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <h3 class="text-xl font-bold mb-2">Au cœur de Dakar</h3>
          <p class="opacity-90">Notre siège, hub de l''innovation électrique.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Valeurs (Grid futuriste sombre) -->
  <section class="py-32 bg-slate-900 text-white relative overflow-hidden">
    <!-- Abstract Shapes BG -->
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl mix-blend-screen animate-pulse"></div>
    <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl mix-blend-screen"></div>

    <div class="max-w-7xl mx-auto px-4 relative z-10">
      <div class="text-center mb-20 animate-in fade-in duration-1000 view-timeline">
        <h2 class="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-white mb-6">Nos Piliers Fondamentaux</h2>
        <p class="text-xl text-slate-400 max-w-2xl mx-auto">
          Quatre valeurs cardinales qui guident chacune de nos actions sur le terrain.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Card 1 -->
        <div class="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity"></div>
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors">Sécurité</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Priorité absolue : protéger les vies et les biens par des contrôles intransigeants.
          </p>
        </div>

        <!-- Card 2 -->
        <div class="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity"></div>
          <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors">Qualité</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
             Des standards élevés conformes aux normes internationales les plus strictes.
          </p>
        </div>

        <!-- Card 3 -->
        <div class="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
          <div class="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity"></div>
          <div class="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
             <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white group-hover:text-amber-300 transition-colors">Excellence</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Une culture du dépassement de soi et de l''amélioration continue des processus.
          </p>
        </div>

        <!-- Card 4 -->
        <div class="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity"></div>
          <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white group-hover:text-emerald-300 transition-colors">Innovation</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Adoption proactive des technologies intelligentes pour un réseau plus smart.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-24 relative overflow-hidden bg-white">
    <div class="max-w-5xl mx-auto px-4 text-center relative z-10">
      <h2 className="text-4xl font-bold text-slate-900 mb-6">Prêt à collaborer pour un avenir plus sûr ?</h2>
      <p class="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
        Découvrez nos solutions et rejoignez le réseau des experts certifiés PROQUELEC.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/contact" class="px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transition-all">
          Contactez-nous
        </a>
        <a href="/expertises-techniques" class="px-8 py-4 bg-white text-blue-900 border-2 border-slate-200 font-bold rounded-full hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
          Nos Expertises
        </a>
      </div>
    </div>
  </section>
</div>
', 'Découvrez l''histoire, les valeurs et la mission de PROQUELEC, organisme de référence pour la sécurité électrique au Sénégal.', NULL, 'index,follow', NULL, 'default', true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, NULL, 13, '2026-01-22T23:34:20.83996+00:00', '2026-01-22T23:34:20.83996+00:00', '{"layout":"full-width","hero_enabled":false,"background_color":"#ffffff"}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('09764f64-00fa-46cd-9d5c-065b90c22029', 'Nos Activités & Services', 'activities', '
        <div class="w-full bg-slate-50 overflow-x-hidden">
            
<div class="relative w-full py-32 md:py-48 flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-slate-900 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black opacity-90"></div>
      <div class="absolute inset-0 bg-[url(''https://images.unsplash.com/photo-1581094794329-cd485fe69e8b?q=80&w=2070'')] bg-cover bg-center mix-blend-overlay opacity-30 animate-pulse-slow"></div>
    </div>
    <div class="relative z-10 text-center px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <h1 class="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 mb-6 tracking-tight drop-shadow-lg">
        Nos Domaines d''Intervention
      </h1>
      <p class="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
        Des solutions complètes pour sécuriser et optimiser vos installations électriques.
      </p>
    </div>
</div>

            
            <section class="py-24 max-w-7xl mx-auto px-4">
                
<div class="text-center mb-16 px-4">
    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4 inline-block relative">
        Expertise Technique
        <span class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-50 group-hover:scale-x-100 transition-transform"></span>
    </h2>
    <p class="text-xl text-slate-600 max-w-3xl mx-auto">Nous intervenons à chaque étape de votre projet électrique.</p>
</div>

                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Card 1 -->
                    <div class="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 group">
                        <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 class="text-2xl font-bold mb-4 text-slate-800">Contrôle & Conformité</h3>
                        <p class="text-slate-600 leading-relaxed">Vérification rigoureuse des installations selon la norme NS 17-2009 et les standards internationaux pour garantir la sécurité des personnes.</p>
                    </div>

                    <!-- Card 2 -->
                    <div class="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 group">
                        <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        </div>
                        <h3 class="text-2xl font-bold mb-4 text-slate-800">Assistance Technique</h3>
                        <p class="text-slate-600 leading-relaxed">Accompagnement des maîtres d''ouvrage et installateurs, du diagnostic initial à la réception finale des travaux.</p>
                    </div>

                    <!-- Card 3 -->
                    <div class="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 group">
                        <div class="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </div>
                        <h3 class="text-2xl font-bold mb-4 text-slate-800">Formation PRO</h3>
                        <p class="text-slate-600 leading-relaxed">Modules de formation continue pour électriciens, ingénieurs et techniciens, axés sur les nouvelles normes et technologies.</p>
                    </div>
                </div>
            </section>
        </div>', 'Découvrez les services de PROQUELEC : audit, contrôle, formation et expertise électrique au Sénégal.', NULL, 'index,follow', NULL, 'default', true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, NULL, 7, '2026-01-23T00:27:19.483317+00:00', '2026-01-23T00:27:19.483317+00:00', '{"layout":"full-width","hero_enabled":false,"background_color":"#ffffff"}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('82d3f295-20ce-402b-ab78-e7deec880ba7', 'Certifications & Qualité', 'certifications', '
        <div class="w-full bg-slate-50 overflow-x-hidden">
            
<div class="relative w-full py-32 md:py-48 flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-slate-900 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black opacity-90"></div>
      <div class="absolute inset-0 bg-[url(''https://images.unsplash.com/photo-1555963966-9233569a5892?q=80&w=2070'')] bg-cover bg-center mix-blend-overlay opacity-30 animate-pulse-slow"></div>
    </div>
    <div class="relative z-10 text-center px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <h1 class="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 mb-6 tracking-tight drop-shadow-lg">
        Certifications & Labels
      </h1>
      <p class="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
        La reconnaissance officielle de votre savoir-faire et de votre engagement qualité.
      </p>
    </div>
</div>

            
            <section class="py-24 max-w-7xl mx-auto px-4">
                <div class="bg-white rounded-3xl shadow-xl overflow-hidden mb-20 flex flex-col md:flex-row">
                    <div class="md:w-1/2 bg-blue-900 text-white p-12 flex flex-col justify-center">
                        <h3 class="text-3xl font-bold mb-6">Pourquoi se certifier ?</h3>
                        <ul class="space-y-4 text-blue-100">
                            <li class="flex items-center gap-3"><svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Reconnaissance par la Senelec</li>
                            <li class="flex items-center gap-3"><svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Gage de confiance pour vos clients</li>
                            <li class="flex items-center gap-3"><svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Accès aux marchés publics</li>
                        </ul>
                    </div>
                    <div class="md:w-1/2 p-12 flex items-center justify-center bg-slate-50">
                       <div class="text-center">
                           <div class="text-6xl mb-4">🏆</div>
                           <h4 class="text-2xl font-bold text-slate-800">Label Qualité PROQUELEC</h4>
                           <p class="text-slate-500 mt-2">La référence du secteur.</p>
                       </div>
                    </div>
                </div>
            </section>
        </div>', 'Certifiez vos compétences et vos installations avec les labels qualité PROQUELEC.', NULL, 'index,follow', NULL, 'default', true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, NULL, 4, '2026-01-23T00:27:19.789376+00:00', '2026-01-23T00:27:19.789376+00:00', '{"layout":"full-width","hero_enabled":false,"background_color":"#ffffff"}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('1299bc22-38c9-4892-a43a-8b9a796041af', 'Labels PROQUELEC', 'labels', '
        <div class="w-full bg-slate-50 overflow-x-hidden">
            
<div class="relative w-full py-32 md:py-48 flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-slate-900 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black opacity-90"></div>
      <div class="absolute inset-0 bg-[url(''https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070'')] bg-cover bg-center mix-blend-overlay opacity-30 animate-pulse-slow"></div>
    </div>
    <div class="relative z-10 text-center px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <h1 class="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 mb-6 tracking-tight drop-shadow-lg">
        Nos Labels de Confiance
      </h1>
      <p class="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
        Distinguez-vous sur le marché grâce à nos labels reconnus.
      </p>
    </div>
</div>

            <div class="py-24 max-w-5xl mx-auto px-4 text-center">
                <p class="text-xl text-slate-600">Contenu en cours de mise à jour pour inclure les derniers critères d''attribution 2026.</p>
            </div>
        </div>', 'Les labels qualité de PROQUELEC pour les installations domestiques et industrielles.', NULL, 'index,follow', NULL, 'default', true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, NULL, 2, '2026-01-23T00:27:19.996961+00:00', '2026-01-23T00:27:19.996961+00:00', '{"layout":"full-width","hero_enabled":false,"background_color":"#ffffff"}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('0e9a3ec3-12c3-49af-9f5a-2b20093f59b8', 'Centre de Documentation', 'documents', '
        <div class="w-full bg-slate-50 overflow-x-hidden">
             
<div class="relative w-full py-32 md:py-48 flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-slate-900 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black opacity-90"></div>
      <div class="absolute inset-0 bg-[url(''https://images.unsplash.com/photo-1544396821-4dd40b938ad3?q=80&w=2073'')] bg-cover bg-center mix-blend-overlay opacity-30 animate-pulse-slow"></div>
    </div>
    <div class="relative z-10 text-center px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <h1 class="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 mb-6 tracking-tight drop-shadow-lg">
        Ressources Documentaires
      </h1>
      <p class="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
        Toute la documentation technique et réglementaire à portée de clic.
      </p>
    </div>
</div>

             <section class="py-24 max-w-7xl mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Doc Item -->
                    <a href="#" class="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition-all group">
                        <div class="flex items-center gap-4">
                            <div class="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800">Guide NS 17-2009</h4>
                                <p class="text-sm text-slate-500">PDF • 2.4 MB</p>
                            </div>
                        </div>
                    </a>
                </div>
                <div class="text-center mt-12">
                   <a href="#" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                     Voir toute la bibliothèque
                   </a>
                </div>
             </section>
        </div>', 'Accédez aux normes, guides techniques et formulaires administratifs.', NULL, 'index,follow', NULL, 'default', true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, NULL, 4, '2026-01-23T00:27:20.201783+00:00', '2026-01-24T22:04:36.588835+00:00', '{"layout":"full-width","hero_enabled":false,"background_color":"#ffffff"}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('b72774d3-1098-42e5-86dd-baf566981e0f', 'Événements & Agenda', 'events', '
        <div class="w-full bg-slate-50 overflow-x-hidden">
            
<div class="relative w-full py-32 md:py-48 flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-slate-900 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black opacity-90"></div>
      <div class="absolute inset-0 bg-[url(''https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070'')] bg-cover bg-center mix-blend-overlay opacity-30 animate-pulse-slow"></div>
    </div>
    <div class="relative z-10 text-center px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <h1 class="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 mb-6 tracking-tight drop-shadow-lg">
        Agenda & Actualités
      </h1>
      <p class="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
        Restez connecté à l''écosystème électrique sénégalais.
      </p>
    </div>
</div>

            <section class="py-24 max-w-5xl mx-auto px-4">
                <div class="space-y-8">
                    <div class="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-blue-600 flex flex-col md:flex-row gap-6 items-center">
                        <div class="text-center md:text-left min-w-[100px]">
                            <div class="text-4xl font-bold text-blue-600">15</div>
                            <div class="text-slate-500 uppercase tracking-wide font-semibold">Mai</div>
                        </div>
                        <div class="flex-grow">
                            <h3 class="text-xl font-bold text-slate-900 mb-2">Séminaire Sécurité Électrique 2026</h3>
                            <p class="text-slate-600">Un grand rassemblement des professionnels du secteur pour discuter des nouvelles normes.</p>
                        </div>
                        <a href="#" class="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors">Détails</a>
                    </div>
                </div>
            </section>
        </div>', 'Retrouvez les prochains événements, séminaires et formations PROQUELEC.', NULL, 'index,follow', NULL, 'default', true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, NULL, 3, '2026-01-23T00:27:20.377341+00:00', '2026-01-23T00:27:20.377341+00:00', '{"layout":"full-width","hero_enabled":false,"background_color":"#ffffff"}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('f0520636-854e-40de-93d3-63a027fa5b5c', 'Catalogue des Formations', 'formations', '
        <div class="w-full bg-slate-50 overflow-x-hidden">
            
<div class="relative w-full py-32 md:py-48 flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-slate-900 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black opacity-90"></div>
      <div class="absolute inset-0 bg-[url(''https://images.unsplash.com/photo-1524178232363-1fb2b075b955?q=80&w=2028'')] bg-cover bg-center mix-blend-overlay opacity-30 animate-pulse-slow"></div>
    </div>
    <div class="relative z-10 text-center px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <h1 class="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 mb-6 tracking-tight drop-shadow-lg">
        Centre de Formation
      </h1>
      <p class="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
        L''excellence par l''apprentissage continu.
      </p>
    </div>
</div>

             <section class="py-24 max-w-7xl mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     <!-- Course Card -->
                    <div class="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 group">
                        <div class="h-48 bg-slate-200 relative overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                             <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-800">Niveau 1</div>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-slate-900 mb-2">Habilitation Électrique</h3>
                            <p class="text-slate-600 text-sm mb-4 line-clamp-2">Maîtrisez les risques électriques et obtenez votre titre d''habilitation officiel.</p>
                            <div class="flex items-center justify-between border-t border-slate-100 pt-4">
                                <span class="text-slate-500 text-sm flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 3 jours</span>
                                <a href="#" class="text-blue-600 font-bold text-sm hover:underline">S''inscrire →</a>
                            </div>
                        </div>
                    </div>
                </div>
             </section>
        </div>', 'Renforcez vos compétences avec nos programmes de formation certifiants.', NULL, 'index,follow', NULL, 'default', true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, NULL, 4, '2026-01-23T00:27:20.578502+00:00', '2026-01-23T00:27:20.578502+00:00', '{"layout":"full-width","hero_enabled":false,"background_color":"#ffffff"}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('c5d1d1e1-8f0e-4625-b9c2-fb08c046017c', 'Mentions Légales', 'legal', '
        <div class="w-full bg-slate-50 min-h-screen">
            <div class="max-w-4xl mx-auto px-4 py-24">
                <h1 class="text-4xl font-bold text-slate-900 mb-8 border-b pb-4">Mentions Légales</h1>
                <div class="prose prose-lg text-slate-700 bg-white p-8 rounded-2xl shadow-sm">
                    <h3>Éditeur du site</h3>
                    <p><strong>PROQUELEC</strong><br/>Association reconnue d''utilité publique<br/>Dakr, Sénégal</p>
                    <h3>Propriété intellectuelle</h3>
                    <p>Tous les contenus présents sur ce site sont la propriété exclusive de PROQUELEC.</p>
                </div>
            </div>
        </div>', 'Informations juridiques concernant le site PROQUELEC.', NULL, 'index,follow', NULL, 'default', true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, NULL, 2, '2026-01-23T00:27:20.780773+00:00', '2026-01-23T00:27:20.780773+00:00', '{"layout":"full-width","hero_enabled":false,"background_color":"#ffffff"}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('952b22ad-a307-4c2d-96de-64bdc085f8ca', 'Contactez-nous', 'contact', '
        <div class="w-full bg-white overflow-x-hidden">
            
<div class="relative w-full py-32 md:py-48 flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-slate-900 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-black opacity-90"></div>
      <div class="absolute inset-0 bg-[url(''https://images.unsplash.com/photo-1423666639041-f14d7045c5d9?q=80&w=2074'')] bg-cover bg-center mix-blend-overlay opacity-30 animate-pulse-slow"></div>
    </div>
    <div class="relative z-10 text-center px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <h1 class="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 mb-6 tracking-tight drop-shadow-lg">
        Contact & Localisation
      </h1>
      <p class="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
        Nos équipes sont à votre écoute pour tous vos projets.
      </p>
    </div>
</div>

            <section class="py-24 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16">
                 <div>
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">Nos Coordonnées</h2>
                    <div class="space-y-6 text-lg text-slate-600">
                        <div class="flex items-start gap-4">
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-900">Adresse</h3>
                                <p>Siège Social, Dakar, Sénégal</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-4">
                             <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-900">Téléphone</h3>
                                <p>+221 33 800 00 00</p>
                            </div>
                        </div>
                    </div>
                 </div>
                 <div class="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <h3 class="text-2xl font-bold text-slate-900 mb-4">Envoyez-nous un message</h3>
                    <p class="text-slate-500 mb-6">Utilisez le formulaire ci-dessous pour toute demande spécifique.</p>
                    <!-- Note: Le vrai formulaire React peut être injecté via un bloc ''form'' si supporté, sinon contenu statique pour l''instant -->
                    <div class="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
                        Le formulaire de contact interactif est disponible en bas de page.
                    </div>
                 </div>
            </section>
        </div>', 'Entrez en contact avec les experts PROQUELEC.', '', 'index,follow', '', 'default', true, true, '', '', '', '', '', '', '', '', '', true, NULL, NULL, 0, NULL, '[]'::jsonb, '[]'::jsonb, '', 6, '2026-01-23T00:27:20.960895+00:00', '2026-01-23T03:18:33.827462+00:00', '{"layout":"full-width","hero_enabled":false,"background_color":"#ffffff"}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
INSERT INTO pages (id, title, slug, content, meta_description, meta_keywords, meta_robots, featured_image, template, show_hero, show_footer, custom_css, custom_js, header_html, footer_html, hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link, is_published, publish_date, unpublish_date, menu_order, parent_id, categories, tags, author, reading_time, created_at, updated_at, design_options, seo_options, content_blocks) VALUES ('e5fcad66-3bff-471a-82ec-eb98587060bc', 'Expertises & Solutions', 'expertises-techniques', '<div class="space-y-12">
  <!-- Hero Section -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 to-slate-900 p-8 md:p-12 text-white shadow-2xl">
    <div class="relative z-10 max-w-3xl">
      <h2 class="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
        Au-delà des produits : L''Excellence Technique
      </h2>
      <p class="text-lg text-blue-100 leading-relaxed">
        Chez PROQUELEC, nous ne vendons pas simplement du matériel. Nous apportons la garantie de la performance, de la sécurité et de la conformité de vos installations électriques.
      </p>
    </div>
    <div class="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
  </div>
  <!-- Grid Services -->
  <div class="grid md:grid-cols-2 gap-8">
    <div class="p-8 rounded-2xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 class="text-xl font-bold text-slate-900 mb-3 text-blue-600">Audit & Diagnostic</h3>
      <p class="text-slate-600">Analyse complète de vos installations existantes. Identification des risques, mesure de la performance et recommandations de mise aux normes.</p>
    </div>
    <div class="p-8 rounded-2xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 class="text-xl font-bold text-slate-900 mb-3 text-indigo-600">Solutions Techniques</h3>
      <p class="text-slate-600">Accompagnement dans le choix des équipements et des architectures électriques pour vos projets neufs ou rénovations.</p>
    </div>
  </div>
  <!-- Call to Action -->
  <div class="mt-8 text-center bg-slate-50 p-6 rounded-xl">
    <h3 class="font-bold text-slate-900 mb-2">Besoin de spécifications précises ?</h3>
    <a href="/outils" class="text-blue-600 font-bold hover:underline">Accéder à notre Base de Données Technique &rarr;</a>
  </div>
</div>', 'Découvrez l''expertise technique de PROQUELEC : Audit, Conseil, Solutions Électriques et Base de Données Matériaux.', '', 'index,follow', '', 'full-width', true, true, '', '', '', '', '', '', '', '', '', true, NULL, NULL, 10, NULL, '[]'::jsonb, '[]'::jsonb, '', 1, '2026-01-22T23:16:40.333547+00:00', '2026-01-23T05:17:13.176111+00:00', '{"layout":"default","body_font":"sans-serif","custom_css":"","text_color":"#333333","hero_height":"medium","accent_color":"#0066cc","heading_font":"sans-serif","hero_enabled":true,"hero_overlay":0.3,"content_width":"default","hero_alignment":"center","custom_sections":[],"sidebar_enabled":false,"background_color":"#ffffff","sidebar_position":"right","footer_cta_enabled":true}'::jsonb, '{"og_image":"","og_title":"","schema_type":"WebPage","twitter_card":"summary","canonical_url":"","focus_keyword":"","og_description":"","meta_description":""}'::jsonb, '[]'::jsonb) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
