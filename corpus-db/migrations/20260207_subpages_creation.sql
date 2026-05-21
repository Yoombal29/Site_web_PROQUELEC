-- ========================================================
-- MIGRATION: CRÉATION DES PAGES DE SERVICES DÉTAILLÉES
-- ========================================================

DO $$
DECLARE
    p_content text;
BEGIN

    -- 🏢 COLLECTIVITÉS LOCALES
    p_content := '
    <div class="max-w-4xl mx-auto px-6 py-20 prose lg:prose-xl">
        <h2>Partenariat avec les Collectivités</h2>
        <p>PROQUELEC accompagne les mairies et conseils départementaux dans la sécurisation de leur patrimoine immobilier et urbain.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-10 not-prose">
            <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic">
                "La sécurité électrique est le socle de la confiance citoyenne dans nos espaces publics."
            </div>
        </div>
        <h3>Nos domaines d''intervention :</h3>
        <ul>
            <li>Éclairage public et signalisation</li>
            <li>Écoles, centres de santé et mairies</li>
            <li>Infrastructures sportives</li>
        </ul>
        <p>Découvrez nos programmes de <a href="/formations/collectivites">Formation pour les élus et agents techniques</a>.</p>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Collectivités Locales', 'collectivites', p_content, p_content, true, 'published', 'Au Coeur des Territoires', 'Sécurisation des infrastructures publiques locales')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- 🛒 SÉCURISATION DES MARCHÉS
    p_content := '
    <div class="max-w-4xl mx-auto px-6 py-20 prose lg:prose-xl">
        <h2>Sécurisation des Lieux de Commerce</h2>
        <p>Les marchés sont des zones à haut risque électrique au Sénégal. PROQUELEC déploie des solutions de diagnostic et de mise en conformité massives.</p>
        <div class="bg-orange-50 border-orange-200 border p-8 rounded-3xl my-10 not-prose">
            <h4 class="text-orange-900 font-bold mb-4">Objectif Zéro Sinistre</h4>
            <p class="text-sm">Nous travaillons avec les délégataires des marchés pour auditer chaque installation et installer des dispositifs de protection conformes.</p>
        </div>
        <p>Pour consulter les rapports de nos dernières interventions, allez dans la section <a href="/documents">Documents techniques</a>.</p>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Sécurisation des Marchés', 'marches', p_content, p_content, true, 'published', 'Protéger l''Économie Locale', 'Prévention des incendies et risques électriques dans les marchés')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- 🔍 ACTIONS : DIAGNOSTICS
    p_content := '
    <div class="max-w-4xl mx-auto px-6 py-20 prose lg:prose-xl">
        <h2>Diagnostic Électrique Professionnel</h2>
        <p>Un diagnostic PROQUELEC est une expertise technique rigoureuse qui garantit la conformité d''une installation à la norme NS 01-001.</p>
        <div class="bg-blue-600 text-white p-8 rounded-3xl my-12 not-prose">
            <h3 class="text-white font-bold mb-4">Vous souhaitez un audit ?</h3>
            <p class="mb-6">Réservez une expertise pour vos bureaux, votre usine ou votre domicile.</p>
            <a href="/contact?sujet=diagnostic" class="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-bold">Demander un diagnostic</a>
        </div>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Diagnostics Techniques', 'actions/diagnostics', p_content, p_content, true, 'published', 'Expertise Terrain', 'L''audit rigoureux au service de la sécurité')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- 📖 CONSEILS MÉNAGES
    p_content := '
    <div class="max-w-4xl mx-auto px-6 py-20 prose lg:prose-xl">
        <h2>Guide de Sécurité pour la Famille</h2>
        <p>Adoptez les bons réflexes pour éviter les accidents domestiques (électrisation, électrocution, incendie).</p>
        <ul class="space-y-4">
            <li><strong>Ne surchargez pas les prises</strong> : Évitez l''accumulation de multiprises.</li>
            <li><strong>Vérifiez la mise à la terre</strong> : Un élément vital de votre installation.</li>
            <li><strong>Utilisez du matériel certifié</strong> : Ne jouez pas avec votre vie avec des câbles non conformes.</li>
        </ul>
        <p class="mt-12 bg-slate-50 p-6 rounded-2xl">En savoir plus sur notre mission d''ordre social dans <a href="/utilite-publique">Utilité Publique</a>.</p>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Conseils de Sécurité', 'conseils-menages', p_content, p_content, true, 'published', 'Vivre en Sécurité', 'Guide des bonnes pratiques électriques à la maison')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

    -- 🤝 PARTENARIAT SENELEC
    p_content := '
    <div class="max-w-4xl mx-auto px-6 py-20 prose lg:prose-xl">
        <h2>SENELEC & PROQUELEC : Une Vision Commune</h2>
        <p>La SENELEC et PROQUELEC collaborent étroitement pour garantir que toute nouvelle connexion au réseau national soit sûre et conforme au corpus normatif sénégalais.</p>
        <div class="not-prose flex justify-center py-10">
            <div class="text-4xl">🔌 + 🛡️</div>
        </div>
        <p>Ce partenariat se traduit par des audits systématiques avant mise sous tension et un échange de données techniques permanent.</p>
    </div>';

    INSERT INTO pages (title, slug, content, content_raw, is_published, status, hero_title, hero_subtitle)
    VALUES ('Partenariat SENELEC', 'partenariat-senelec', p_content, p_content, true, 'published', 'Unité Institutionnelle', 'La SENELEC et PROQUELEC au service de la conformité')
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, content_raw = EXCLUDED.content_raw, is_published = true, status = 'published';

END $$;
