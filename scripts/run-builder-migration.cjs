const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    const client = await pool.connect();
    try {
        const migrationPath = path.join(__dirname, 'migrations', '001_create_builder_schema.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('--- Démarrage de la Migration Builder V1 ---');
        console.log('Lecture du fichier:', migrationPath);

        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');

        console.log('✅ Migration COMPLETE avec succès !');
        console.log('Les tables pages, page_components, page_versions et menu_items ont été mises à jour.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Erreur critique lors de la migration:', err);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
