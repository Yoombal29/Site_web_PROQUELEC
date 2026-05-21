const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const { rows: pages } = await pool.query('SELECT slug, title FROM public.pages ORDER BY slug');
        console.log('Pages in DB:');
        pages.forEach(p => console.log(`- /${p.slug} (${p.title})`));
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}

check();
