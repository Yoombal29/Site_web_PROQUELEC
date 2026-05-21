// Simple migration runner using server's db connection
const fs = require('fs');
const path = require('path');

// Import the pool from index.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    const sqlPath = path.join(__dirname, 'migrations', '007_permissions_acl.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Running permissions migration...');

    try {
        // Execute the SQL
        await pool.query(sql);
        console.log('✅ Permissions migration completed successfully!');

        // Verify tables were created
        const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_groups', 'user_group_members', 'document_permissions')
      ORDER BY table_name
    `);

        console.log('📋 Created tables:', tables.rows.map(r => r.table_name).join(', '));

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

runMigration();
