-- ========================================================
-- MIGRATION: FINAL PRO POLISH (UPSERT KEY PAGES)
-- ========================================================

DO $$
DECLARE
    p_content text;
BEGIN

    -- 📚 1. CORPUS NORMATIF (NS 01-001)
    p_content := '
    <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div class="lg:col-span-2 prose lg:prose-xl">
                <h2>Le Standard Sénégalais NS 01-001</h2>
                <p>Adoptée pour encadrer la qualité des installations électriques, la norme NS 01-001 est le document de référence pour tout concepteur, installateur ou contrôleur au Sénégal.</p>
                <div class="bg-blue-50 p-8 rounded-3xl border border-blue-100 my-10 not-prose">
                    <h4 class="text-blue-900 font-bold mb-4">Structure de la norme</h4>
                    <ul class="space-y-3 text-sm text-blue-800">
                        <li class="flex items-center gap-2">🔹 Chapitre 1 : Domaine d''application</li>
                        <li class="flex items-center gap-2">🔹 Chapitre 2 : Définitions et terminologie</li>
                        <li class="flex items-center gap-2">🔹 Chapitre 3 : Caractéristiques générales</li>
                        <li class="flex items-center gap-2">🔹 Chapitre 4 : Protection pour la sécurité</li>
                    </ul>
                </div>
            </div>
            <div class="space-y-8">
                <div class="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl">
                    <h3 class="text-xl font-bold mb-4">Accès Expert</h3>
                    <p class="text-slate-400 text-sm mb-6">L''accès complet au texte interactif est réservé aux professionnels authentifiés et certifiés.</p>
                    <a href="/connexion" class="block text-center bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all">S''identifier pour lire</a>
                </div>
                <div class="p-6 border-2 border-dashed border-slate-200 rounded-3xl">
                    <h4 class="font-bold mb-2 italic">Acheter la version papier</h4>
                    <p class="text-xs text-slate-500">Contactez notre secrétariat technique pour obtenir une copie physique certifiée par l''ASN.</p>
                </div>
            </div>
        </div>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Corpus Normatif', 'normative-corpus', p_content, p_content, true, 'published', 'Référentiel National', 'Norme Sénégalais NS 01-001 : Fondement de la sécurité')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- 🎓 2. FORMATIONS (FULL PAGE)
    p_content := '
    <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
            <div>
                <h2 class="text-3xl font-bold mb-6">Se Former avec PROQUELEC</h2>
                <p class="text-slate-600 leading-relaxed mb-6">Nous offrons des programmes de formation continue pour élever le standard technique des intervenants du secteur électrique au Sénégal.</p>
                <div class="flex flex-col gap-4">
                    <a href="/formations/artisans" class="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all group">
                        <span class="font-bold">Parcours pour Artisans</span>
                        <span class="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </a>
                    <a href="/formations/collectivites" class="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all group">
                        <span class="font-bold">Session Spéciale Collectivités</span>
                        <span class="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </a>
                </div>
            </div>
            <div class="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80" class="w-full h-full object-cover grayscale opacity-80" />
            </div>
        </div>
        
        <h3 id="calendrier" class="text-2xl font-bold mb-8">Calendrier 2026</h3>
        <div class="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
            <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th class="px-6 py-4 text-sm font-bold uppercase tracking-wider">Date</th>
                        <th class="px-6 py-4 text-sm font-bold uppercase tracking-wider">Intitulé</th>
                        <th class="px-6 py-4 text-sm font-bold uppercase tracking-wider">Lieu</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    <tr><td class="px-6 py-4 text-sm">15 Mars</td><td class="px-6 py-4 text-sm font-medium">Protection des Personnes et des Biens</td><td class="px-6 py-4 text-sm">Dakar</td></tr>
                    <tr><td class="px-6 py-4 text-sm">22 Avril</td><td class="px-6 py-4 text-sm font-medium">Dimensionnement Solaire & Normes</td><td class="px-6 py-4 text-sm">Saint-Louis</td></tr>
                </tbody>
            </table>
        </div>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Formations & Certification', 'formations', p_content, p_content, true, 'published', 'Pôle de Compétences', 'Transmettre l''excellence pour un réseau électrique sûr')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- 🏢 3. PORTAIL (HUB)
    p_content := '
    <div class="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 class="text-4xl font-black mb-12">Bienvenue sur le Portail PROQUELEC</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl">
                <h3 class="text-2xl font-bold mb-4">Marchés Sécurisés</h3>
                <p class="text-slate-400 text-sm mb-8">Accédez au suivi des projets de sécurisation des marchés nationaux.</p>
                <a href="/portal/marches" class="inline-block bg-blue-600 px-8 py-3 rounded-xl font-bold">Entrer</a>
            </div>
            <div class="p-10 bg-blue-600 text-white rounded-[3rem] shadow-2xl">
                <h3 class="text-2xl font-bold mb-4">Mon Dashboard</h3>
                <p class="text-blue-200 text-sm mb-8">Gérez vos certifications, vos dossiers et vos alertes personnalisées.</p>
                <a href="/portal/dashboard" class="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-bold">Accéder</a>
            </div>
            <div class="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-xl">
                <h3 class="text-2xl font-bold mb-4">Espace Apprentissage</h3>
                <p class="text-slate-500 text-sm mb-8">Vidéos pédagogiques, mementos et documentation exclusive.</p>
                <a href="/portal/formations" class="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Visionner</a>
            </div>
        </div>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Portail Proquelec', 'portail', p_content, p_content, true, 'published', 'Espace Digital Unifié', 'Tous vos outils et services en un seul endroit')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- 🚧 4. CATCH-ALL FOR OTHER SLUGS
    -- (Created to avoid 404 while site is in development)
    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES 
    ('Anniversaire Proquelec', 'evenements/anniversaire', '<div class="p-20 text-center">Page en cours de rédaction. Revenez bientôt !</div>', '', true, 'published', 'Événement Spécial', 'Célébrons ensemble nos décennies de sécurité'),
    ('Espace Presse', 'presse', '<div class="p-20 text-center">Communiqués et kits médias bientôt disponibles.</div>', '', true, 'published', 'Salle de Presse', 'Informations officielles pour les médias'),
    ('Espace Partenaires', 'espace-partenaires', '<div class="p-20 text-center">Espace réservé à nos partenaires stratégiques.</div>', '', true, 'published', 'Réseau Partenarial', 'Coopérer pour un impact durable')
    ON CONFLICT (slug) DO UPDATE SET is_published = true, status = 'published';

END $$;
