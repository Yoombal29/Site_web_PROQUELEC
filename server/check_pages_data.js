const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkPages() {
    try {
        const result = await pool.query(
            "SELECT structure_json, content FROM pages WHERE slug = 'home'"
        );
        console.log('Structure JSON de la page home :');
        console.log(JSON.stringify(result.rows[0], null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkPages();
