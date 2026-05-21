const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const { rows: pages } = await pool.query('SELECT slug FROM public.pages');
        const slugs = new Set(pages.map(p => '/' + p.slug));

        // Add common static routes
        slugs.add('/home');
        slugs.add('/');
        slugs.add('/social');
        slugs.add('/partenaires');
        slugs.add('/outils');

        const { rows: menu } = await pool.query("SELECT title, url FROM public.menu_items WHERE is_active = true");

        console.log('SYNC AUDIT: Menu vs Pages');
        let failCount = 0;
        menu.forEach(item => {
            const baseUrl = item.url.split('#')[0].split('?')[0];
            if (baseUrl === '#' || baseUrl === '') {
                // Ignore anchors
            } else if (slugs.has(baseUrl)) {
                // Match
            } else {
                // If it's a dynamic slug like /blog/..., assume OK for now or improve check
                if (baseUrl.startsWith('/blog/')) return;
                if (baseUrl.startsWith('/formations')) return;
                if (baseUrl.startsWith('/actions')) return;
                if (baseUrl.startsWith('/portal')) return;

                console.log(`[FAIL] ${item.title} -> ${item.url} (NO MATCHING PAGE OR ROUTE)`);
                failCount++;
            }
        });

        if (failCount === 0) {
            console.log('ALL MENU ITEMS SYNCHRONIZED!');
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}

check();
