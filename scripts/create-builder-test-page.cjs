const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createTestPage() {
    const client = await pool.connect();
    try {
        // Structure JSON de test (Arbre de blocs)
        const testStructure = [
            {
                id: 'hero-1',
                type: 'hero', // Ce type doit exister dans ComponentRegistry
                content: {
                    title: 'Bienvenue sur le Nouveau Builder',
                    subtitle: 'Cette page est générée entièrement dynamiquement à partir d\'un arbre JSON.',
                    text: 'Voir la documentation',
                    href: '/docs'
                },
                style: {
                    backgroundColor: '#0f172a',
                    textColor: '#ffffff',
                    className: 'min-h-[80vh] flex items-center justify-center'
                }
            },
            {
                id: 'section-2',
                type: 'text-block',
                content: {
                    title: 'Pourquoi ce changement ?',
                    html: '<p>Le JSON permet une flexibilité totale. Chaque bloc est indépendant et peut être réorganisé sans toucher au code.</p>'
                },
                style: {
                    className: 'container mx-auto py-20 px-4'
                }
            }
        ];

        // Insertion
        const query = `
      INSERT INTO public.pages (title, slug, structure_json, is_published, status)
      VALUES ($1, $2, $3, true, 'published')
      ON CONFLICT (slug) DO UPDATE 
      SET structure_json = EXCLUDED.structure_json,
          title = EXCLUDED.title;
    `;

        await client.query(query, [
            'Page Test Builder',
            'test-builder',
            JSON.stringify(testStructure)
        ]);

        console.log('✅ Page de test "/test-builder" créée avec succès !');

    } catch (err) {
        console.error('❌ Erreur création page test:', err);
    } finally {
        client.release();
        pool.end();
    }
}

createTestPage();
