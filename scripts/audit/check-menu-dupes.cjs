
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkDuplicates() {
    try {
        const res = await pool.query('SELECT title, url, menu_type, COUNT(*) FROM menu_items GROUP BY title, url, menu_type HAVING COUNT(*) > 1');
        console.log('Duplicates found:', JSON.stringify(res.rows, null, 2));

        const all = await pool.query('SELECT id, title, url, menu_order, menu_type FROM menu_items ORDER BY menu_type, menu_order');
        console.log('All menu items:', JSON.stringify(all.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDuplicates();
