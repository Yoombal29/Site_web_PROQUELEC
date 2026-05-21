const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || 'proquelec_secure_db_pass',
    port: process.env.DB_PORT || 5433,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Running media files schema update...');
        const schemaPath = path.join(__dirname, 'migrations', 'update_media_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await client.query(schemaSql);
        console.log('✅ media_files schema updated successfully.');
    } catch (err) {
        console.error('❌ Error executing migration:', err);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
