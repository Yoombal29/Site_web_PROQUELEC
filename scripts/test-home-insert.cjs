const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function test() {
    try {
        await pool.query('DELETE FROM public.pages WHERE slug = $1', ['home']);
        console.log('Inserting home test...');
        await pool.query('INSERT INTO public.pages (title, slug) VALUES ($1, $2)', ['Home', 'home']);
        console.log('✅ Worked!');
    } catch (e) {
        console.error('❌ Failed:', e.message);
    }
    process.exit(0);
}

test();
