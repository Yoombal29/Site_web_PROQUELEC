const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        const { rows } = await pool.query('SELECT id, slug, title, is_published, security_level FROM public.pages');
        console.log("PAGES IN DB:");
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error("Error querying pages:", err);
    } finally {
        await pool.end();
    }
}

run();
