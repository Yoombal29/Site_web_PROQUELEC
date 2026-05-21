const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Explicitly load .env from parent dir

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    try {
        console.log('🔌 Connecting to database...');
        const client = await pool.connect();

        console.log('📄 Reading migration file: 20260214_authority_v2.sql');
        const sqlPath = path.join(__dirname, 'migrations', '20260214_authority_v2.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing migration...');
        await client.query(sql);

        console.log('✅ Migration executed successfully!');
        client.release();
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
