const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    try {
        console.log('🚀 Starting Header migration...');

        // 1. Add CTA columns to site_settings
        console.log('Adding CTA columns to site_settings...');
        await pool.query(`
            ALTER TABLE public.site_settings 
            ADD COLUMN IF NOT EXISTS cta_primary_text VARCHAR(255),
            ADD COLUMN IF NOT EXISTS cta_primary_url VARCHAR(255),
            ADD COLUMN IF NOT EXISTS cta_secondary_text VARCHAR(255),
            ADD COLUMN IF NOT EXISTS cta_secondary_url VARCHAR(255);
        `);

        // 2. Clear existing 'mega' menu items to avoid duplicates if re-run
        // await pool.query("DELETE FROM menu_items WHERE menu_type = 'mega'");

        // 3. Insert Mega Menu structure into menu_items
        console.log('Seeding Mega Menu structure...');

        // Section: Services & Expertise
        const sectionRes = await pool.query(`
            INSERT INTO public.menu_items (title, url, menu_type, is_active, menu_order, icon)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, ['Services & Expertise', '#', 'mega', true, 0, 'BookOpen']);

        const sectionId = sectionRes.rows[0].id;

        // Column: Ingénierie
        const col1Res = await pool.query(`
            INSERT INTO public.menu_items (title, url, menu_type, is_active, menu_order, parent_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, ['Ingénierie', '#', 'mega', true, 0, sectionId]);
        const col1Id = col1Res.rows[0].id;

        // Items for Ingénierie
        const items1 = [
            { label: 'Formations', path: '/formations' },
            { label: 'Certifications', path: '/certifications' },
            { label: 'Expertises', path: '/expertises-techniques' }
        ];
        for (let i = 0; i < items1.length; i++) {
            await pool.query(`
                INSERT INTO public.menu_items (title, url, menu_type, is_active, menu_order, parent_id)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [items1[i].label, items1[i].path, 'mega', true, i, col1Id]);
        }

        // Column: Labels & Activités
        const col2Res = await pool.query(`
            INSERT INTO public.menu_items (title, url, menu_type, is_active, menu_order, parent_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, ['Labels & Activités', '#', 'mega', true, 1, sectionId]);
        const col2Id = col2Res.rows[0].id;

        // Items for Labels & Activités
        const items2 = [
            { label: 'Labels PROQUELEC', path: '/labels' },
            { label: 'Nos Activités', path: '/activities' },
            { label: 'Showroom', path: '/showroom' }
        ];
        for (let i = 0; i < items2.length; i++) {
            await pool.query(`
                INSERT INTO public.menu_items (title, url, menu_type, is_active, menu_order, parent_id)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [items2[i].label, items2[i].path, 'mega', true, i, col2Id]);
        }

        // Column: Ressources
        const col3Res = await pool.query(`
            INSERT INTO public.menu_items (title, url, menu_type, is_active, menu_order, parent_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, ['Ressources', '#', 'mega', true, 2, sectionId]);
        const col3Id = col3Res.rows[0].id;

        // Items for Ressources
        const items3 = [
            { label: 'Documents', path: '/documents' },
            { label: 'Événements', path: '/events' },
            { label: 'Outils métier', path: '/outils' }
        ];
        for (let i = 0; i < items3.length; i++) {
            await pool.query(`
                INSERT INTO public.menu_items (title, url, menu_type, is_active, menu_order, parent_id)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [items3[i].label, items3[i].path, 'mega', true, i, col3Id]);
        }

        console.log('✅ Migration & Seeding for Step 1 complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
