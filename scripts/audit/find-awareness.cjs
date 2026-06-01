
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function findAwareness() {
    try {
        const res = await pool.query("SELECT * FROM menu_items WHERE url LIKE '%activities%awareness%'");
        console.log('Matching menu items:', JSON.stringify(res.rows, null, 2));

        const res2 = await pool.query("SELECT id, title, slug FROM pages WHERE content LIKE '%awareness%' OR title LIKE '%awareness%'");
        console.log('Matching pages:', JSON.stringify(res2.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findAwareness();
