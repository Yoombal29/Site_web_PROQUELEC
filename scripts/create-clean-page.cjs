const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const blocks = JSON.stringify([
            {
                id: 'section-hero-ex',
                type: 'section',
                data: {
                    title: 'Section Claire',
                    content: '<p>Une section aérée avec juste ce qu\'il faut de texte pour être lu.</p>'
                }
            }
        ]);

        const design = JSON.stringify({
            hero_enabled: true,
            renderMode: 'sections',
            show_footer: true
        });

        const query = `
      INSERT INTO public.pages 
      (title, slug, content, content_blocks, is_published, status, hero_title, hero_subtitle, design_options, created_at, updated_at)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET 
        title = EXCLUDED.title,
        hero_title = EXCLUDED.hero_title,
        hero_subtitle = EXCLUDED.hero_subtitle,
        design_options = EXCLUDED.design_options,
        content_blocks = EXCLUDED.content_blocks;
    `;

        await pool.query(query, [
            'Exemple Page Épurée',
            'exemple-epure',
            '<p>Contenu principal...</p>',
            blocks,
            true,
            'published',
            'Titre Impactant',
            'Sous-titre explicatif court et efficace',
            design
        ]);

        console.log('Page exemple créée avec succès.');
    } catch (err) {
        console.error('Erreur:', err);
    } finally {
        process.exit(0);
    }
}
run();
