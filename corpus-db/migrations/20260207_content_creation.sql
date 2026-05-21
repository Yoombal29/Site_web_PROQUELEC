-- ========================================================
-- MIGRATION: CRÉATION DES PAGES ET CONTENUS PROFESSIONNELS
-- ========================================================

DO $$
DECLARE
    p_content text;
BEGIN

    -- 🌍 1. UTILITÉ PUBLIQUE (HUB)
    p_content := '
    <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">🏛️</div>
                <h3 class="text-xl font-bold mb-4">Espace Autorités</h3>
                <p class="text-slate-600 mb-6">Accompagnement institutionnel et outils de régulation pour les instances étatiques.</p>
                <a href="/espace-autorites" class="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">Découvrir <span class="text-lg">→</span></a>
            </div>
            <div class="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                <div class="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">🏠</div>
                <h3 class="text-xl font-bold mb-4">Espace Ménages</h3>
                <p class="text-slate-600 mb-6">Conseils de sécurité, guides pratiques et assistance pour les foyers sénégalais.</p>
                <a href="/espace-menages" class="text-orange-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">Découvrir <span class="text-lg">→</span></a>
            </div>
            <div class="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                <div class="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">⚡</div>
                <h3 class="text-xl font-bold mb-4">Espace Professionnels</h3>
                <p class="text-slate-600 mb-6">Ressources techniques, certifications et opportunités pour les électriciens.</p>
                <a href="/espace-professionnels" class="text-emerald-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">Découvrir <span class="text-lg">→</span></a>
            </div>
        </div>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Utilité Publique', 'utilite-publique', p_content, p_content, true, 'published', 'Une Mission d''Intérêt Général', 'PROQUELEC au service du développement sécurisé du Sénégal')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- 🏬 2. ESPACE AUTORITÉS
    p_content := '
    <div class="max-w-4xl mx-auto px-6 py-20 prose prose-slate prose-blue lg:prose-xl">
        <h2>Régulation et Gouvernance</h2>
        <p>PROQUELEC assiste les autorités dans la définition et l''application de la politique nationale de sécurité électrique.</p>
        <div class="bg-blue-50 border-l-4 border-blue-600 p-6 my-8 rounded-r-xl">
            <h4 class="text-blue-900 font-bold mt-0">Nos services aux instances</h4>
            <ul>
                <li>Audits d''infrastructures critiques</li>
                <li>Conseil technique normatif</li>
                <li>Rapports sectoriels sur la conformité</li>
            </ul>
        </div>
        <p>Pour en savoir plus sur nos interventions de terrain, consultez notre section <a href="/nos-actions">Nos Actions</a>.</p>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Espace Autorités', 'espace-autorites', p_content, p_content, true, 'published', 'Partenariat Institutionnel', 'Dialogue et expertise pour une régulation efficace')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- 🏠 3. ESPACE MÉNAGES
    p_content := '
    <div class="max-w-4xl mx-auto px-6 py-20 prose prose-slate prose-orange lg:prose-xl">
        <h2>Votre sécurité au quotidien</h2>
        <p>La plupart des incendies domestiques sont d''origine électrique. PROQUELEC vous aide à protéger votre famille.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 not-prose">
            <a href="/conseils-menages" class="p-6 bg-slate-50 rounded-2xl border border-orange-100 hover:bg-orange-50 transition-colors">
                <h4 class="font-bold text-orange-800 mb-2">Conseils de sécurité</h4>
                <p class="text-sm text-slate-600">Gestes simples pour éviter les accidents.</p>
            </a>
            <a href="/faq" class="p-6 bg-slate-50 rounded-2xl border border-orange-100 hover:bg-orange-50 transition-colors">
                <h4 class="font-bold text-orange-800 mb-2">Foire aux questions</h4>
                <p class="text-sm text-slate-600">Réponses aux questions courantes.</p>
            </a>
        </div>
        <p>Besoin d''un électricien certifié ? Accédez à notre <a href="/portal/marches">Portail de services</a>.</p>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Espace Ménages', 'espace-menages', p_content, p_content, true, 'published', 'Sécurisez Votre Foyer', 'Information et prévention pour tous les citoyens')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- 🛠️ 4. ESPACE PROFESSIONNELS
    p_content := '
    <div class="max-w-4xl mx-auto px-6 py-20 prose prose-slate prose-emerald lg:prose-xl">
        <h2>Ingénierie et Métiers</h2>
        <p>Valorisez votre expertise en rejoignant le réseau des professionnels certifiés par PROQUELEC.</p>
        <h3>Nos outils pour vous :</h3>
        <ul>
            <li>Accès au <a href="/normative-corpus">Corpus Normatif (NS 01-001)</a></li>
            <li>Calculateurs techniques et <a href="/expert-lab">Expert Lab</a></li>
            <li>Programmes de <a href="/formations">Formation spécifique</a></li>
        </ul>
        <div class="bg-emerald-600 text-white p-8 rounded-3xl my-12 not-prose">
            <h3 class="text-white font-bold mb-4">Devenez Électricien Certifié</h3>
            <p class="mb-6 opacity-90">Obtenez le label de qualité PROQUELEC et accédez à des marchés sécurisés.</p>
            <a href="/certifications" class="inline-block bg-white text-emerald-600 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">Postuler à la certification</a>
        </div>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Espace Professionnels', 'espace-professionnels', p_content, p_content, true, 'published', 'Excellence Technique', 'Certifications et outils de pointe pour les experts')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- ⚡ 5. NOS ACTIONS (HUB)
    p_content := '
    <div class="w-full bg-slate-50 py-20 border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 class="text-xl font-bold mb-4">Diagnostics</h3>
                    <p class="text-slate-600 mb-6 text-sm">Contrôle rigoureux des installations existantes pour identifier les risques.</p>
                    <a href="/actions/diagnostics" class="text-blue-600 font-bold hover:underline">Lire plus</a>
                </div>
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 class="text-xl font-bold mb-4">Conformité</h3>
                    <p class="text-slate-600 mb-6 text-sm">Mise en conformité normative des bâtiments publics et privés.</p>
                    <a href="/actions/conformite" class="text-blue-600 font-bold hover:underline">Lire plus</a>
                </div>
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 class="text-xl font-bold mb-4">Marchés</h3>
                    <p class="text-slate-600 mb-6 text-sm">Programmes spécifiques de sécurisation des marchés et lieux de commerce.</p>
                    <a href="/actions/securisation" class="text-blue-600 font-bold hover:underline">Lire plus</a>
                </div>
            </div>
            <div class="mt-12 text-center">
                <p class="text-slate-500 mb-6 italic">Consultez nos réalisations concrètes sur la page <a href="/projets" class="text-blue-600 font-bold underline">Projets</a>.</p>
            </div>
        </div>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Nos Actions', 'nos-actions', p_content, p_content, true, 'published', 'Impact sur le Terrain', 'Découvrez comment nous sécurisons le Sénégal au quotidien')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- 📚 6. NORMES & RESSOURCES (HUB)
    p_content := '
    <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="bg-blue-900 rounded-[3rem] p-12 text-white relative overflow-hidden mb-16 shadow-2xl">
            <div class="relative z-10 max-w-2xl">
                <h2 class="text-3xl font-bold mb-6">Le Corpus Normatif NS 01-001</h2>
                <p class="text-blue-100 mb-8 leading-relaxed">Le texte de référence pour toute installation électrique au Sénégal. Accessible en ligne pour tous les professionnels certifiés.</p>
                <a href="/normative-corpus" class="inline-block bg-orange-600 hover:bg-orange-500 text-white px-10 py-4 rounded-2xl font-black transition-all">Consulter la Norme</a>
            </div>
            <div class="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden lg:block">📝</div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <h3 class="text-2xl font-bold text-slate-900 mb-6">Ressources Documentaires</h3>
                <ul class="space-y-4">
                    <li class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                        <span class="w-10 h-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold">PDF</span>
                        <div>
                            <p class="font-bold">Mémento de l''Électricien</p>
                            <p class="text-xs text-slate-500">Condensé des règles essentielles</p>
                        </div>
                    </li>
                    <li class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                        <span class="w-10 h-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold">PDF</span>
                        <div>
                            <p class="font-bold">Guide Sécurité Ménages</p>
                            <p class="text-xs text-slate-500">Prévention des risques domestiques</p>
                        </div>
                    </li>
                </ul>
            </div>
            <div>
                <h3 class="text-2xl font-bold text-slate-900 mb-6">Assistance FAQ</h3>
                <p class="text-slate-600 mb-6">Vous ne trouvez pas la règle applicable ? Consultez notre base de connaissance interactive.</p>
                <a href="/faq" class="text-blue-600 font-bold flex items-center gap-2 underline underline-offset-4">Accéder à la FAQ</a>
            </div>
        </div>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Normes & Ressources', 'normes-ressources', p_content, p_content, true, 'published', 'Le Savoir Technique', 'Documentation officielle et outils de référence normative')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- ✅ 7. ENSURE CRITICAL PAGES ARE PUBLISHED
    UPDATE pages SET is_published = true, status = 'published' WHERE slug IN ('about', 'formations', 'contact', 'labels', 'certifications', 'activities', 'blog', 'projets', 'documents');

END $$;
