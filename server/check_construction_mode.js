const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function check() {
    try {
        const result = await pool.query('SELECT * FROM construction_mode');
        console.table(result.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
