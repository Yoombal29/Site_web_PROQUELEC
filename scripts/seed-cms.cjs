const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const DEFAULT_PAGE_SECTIONS = {
    home: {
        label: "PROQUELEC SÉNÉGAL",
        blocks: [
            { id: "hero-1", type: "hero", data: { title: "PRO|QUELEC SÉNÉGAL", subtitle: "Garant de la sécurité et de la qualité électrique", cta_text: "S'inscrire", cta_link: "/auth" } },
            { id: "stats-1", type: "stats", data: { items: [{ label: "Projets/An", value: "500+" }, { label: "Régions", value: "14" }, { label: "Transparence", value: "100%" }] } },
            { id: "news-1", type: "latest_news", data: {} },
            { id: "partners-1", type: "partner_logos", data: {} }
        ]
    },
    menages: {
        label: "Ménages",
        blocks: [
            { id: "hero-m", type: "hero", data: { title: "Espace Ménages", subtitle: "Votre sécurité au quotidien" } },
            { id: "sec-1", type: "section", data: { title: "Sécurité Domestique", content: "<p>Conseils pour protéger votre foyer.</p>" } }
        ]
    },
    professionnels: {
        label: "Professionnels",
        blocks: [
            { id: "hero-p", type: "hero", data: { title: "Espace Professionnels", subtitle: "L'excellence technique au Sénégal" } },
            { id: "cert-1", type: "section", data: { title: "Certification QUALI-ELEC", content: "<p>Obtenez votre label de qualité.</p>" } }
        ]
    }
};

async function migrate() {
    console.log('🚀 Démarrage de la migration propre...');

    for (const [slug, pageData] of Object.entries(DEFAULT_PAGE_SECTIONS)) {
        try {
            // Delete if exists to avoid conflicts/corruption
            await pool.query('DELETE FROM public.pages WHERE slug = $1', [slug]);

            console.log(`✨ Création de la page: ${slug}`);
            await pool.query(
                'INSERT INTO public.pages (title, slug, content, content_blocks, is_published, updated_at, status) VALUES ($1, $2, $3, $4, true, NOW(), $5)',
                [pageData.label, slug, '', JSON.stringify(pageData.blocks), 'published']
            );
        } catch (err) {
            console.error(`❌ Erreur sur la page ${slug}:`, err.message);
        }
    }

    console.log('✅ Migration terminée !');
    process.exit(0);
}

migrate();
