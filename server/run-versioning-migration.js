// Simple migration runner for versioning
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    const sqlPath = path.join(__dirname, 'migrations', '008_document_versioning.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Running versioning migration...');

    try {
        await pool.query(sql);
        console.log('✅ Versioning migration completed successfully!');

        // Verify columns were added
        const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'media_files' 
      AND column_name IN ('version', 'parent_version_id', 'is_latest', 'version_comment')
      ORDER BY column_name
    `);

        console.log('📋 Added columns:', columns.rows.map(r => r.column_name).join(', '));

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

runMigration();
