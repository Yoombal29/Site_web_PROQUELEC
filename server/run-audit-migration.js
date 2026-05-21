// Simple migration runner for audit trail
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    const sqlPath = path.join(__dirname, 'migrations', '009_audit_trail.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Running audit trail migration...');

    try {
        await pool.query(sql);
        console.log('✅ Audit trail migration completed successfully!');

        // Verify table was created
        const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'audit_logs'
    `);

        if (tables.rows.length > 0) {
            console.log('📋 Created table: audit_logs');

            // Check triggers
            const triggers = await pool.query(`
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table IN ('media_files', 'document_permissions')
        AND trigger_name LIKE '%audit%'
      `);

            console.log('🔔 Created triggers:', triggers.rows.map(r => r.trigger_name).join(', '));
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

runMigration();
