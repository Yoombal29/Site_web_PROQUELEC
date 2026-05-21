const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const { rows: items } = await pool.query('SELECT count(*) FROM public.menu_items');
        console.log(`Total menu items: ${items[0].count}`);

        const { rows: types } = await pool.query('SELECT menu_type, count(*) FROM public.menu_items GROUP BY menu_type');
        console.log('\nBy Type:');
        types.forEach(t => console.log(`- ${t.menu_type}: ${t.count}`));

        const { rows: active } = await pool.query('SELECT is_active, count(*) FROM public.menu_items GROUP BY is_active');
        console.log('\nBy Active Status:');
        active.forEach(a => console.log(`- ${a.is_active}: ${a.count}`));

        const { rows: main } = await pool.query("SELECT title, url, is_active FROM public.menu_items WHERE menu_type = 'main' AND parent_id IS NULL ORDER BY menu_order");
        console.log('\nMain Menu (Top Level):');
        main.forEach(m => console.log(`- ${m.title} (${m.url}) ${m.is_active ? '[ACTIVE]' : '[INACTIVE]'}`));

    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}

check();
