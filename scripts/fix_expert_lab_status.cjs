const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function updateStatus() {
    try {
        const result = await pool.query("UPDATE pages SET status = 'published' WHERE slug = 'expert-lab'");
        console.log("Status mis à jour pour expert-lab :", result.rowCount);

        // Check if it exists and what its status is
        const check = await pool.query("SELECT slug, status, is_published FROM pages WHERE slug = 'expert-lab'");
        console.log("Données actuelles :", check.rows);
    } catch (err) {
        console.error("Erreur :", err);
    } finally {
        await pool.end();
    }
}

updateStatus();
