const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    try {
        console.log('🚀 Updating menu items for the sticker (top bar)...');

        // 1. Move À Propos to secondary menu
        await pool.query(`
            UPDATE public.menu_items 
            SET menu_type = 'secondary', menu_order = 1
            WHERE url = '/about' OR title ILIKE '%propos%';
        `);

        // 2. Move Outils to secondary menu
        await pool.query(`
            UPDATE public.menu_items 
            SET menu_type = 'secondary', menu_order = 2
            WHERE url = '/outils' OR title ILIKE '%outils%';
        `);

        // 3. Move Contact to secondary menu
        await pool.query(`
            UPDATE public.menu_items 
            SET menu_type = 'secondary', menu_order = 3
            WHERE url = '/contact' OR title ILIKE '%contact%';
        `);

        // Ensure they exist as secondary
        const items = [
            { title: 'À Propos', url: '/about', order: 1 },
            { title: 'Outils', url: '/outils', order: 2 },
            { title: 'Contact', url: '/contact', order: 3 }
        ];

        for (const item of items) {
            const res = await pool.query('SELECT id FROM public.menu_items WHERE url = $1 AND menu_type = $2', [item.url, 'secondary']);
            if (res.rowCount === 0) {
                console.log(`Inserting ${item.title} into top bar...`);
                await pool.query(`
                    INSERT INTO public.menu_items (title, url, menu_type, is_active, menu_order)
                    VALUES ($1, $2, 'secondary', true, $3)
                `, [item.title, item.url, item.order]);
            }
        }

        // Deactivate them from 'main' menu to avoid duplication in main nav if they were there
        await pool.query(`
            UPDATE public.menu_items 
            SET is_active = false
            WHERE menu_type = 'main' AND url IN ('/about', '/outils', '/contact');
        `);

        console.log('✅ Menu items updated for the top bar!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
