const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runRBACMigration() {
    try {
        console.log('🔐 Running RBAC Permissions Migration...\n');

        const migrationPath = path.join(__dirname, 'migrations', '20260214_rbac_permissions.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await pool.query(sql);

        console.log('\n✅ RBAC Migration Completed Successfully!');
        console.log('📊 Permissions system is now active.');

        // Display summary
        const permCount = await pool.query('SELECT COUNT(*) FROM public.permissions');
        const rolePermCount = await pool.query('SELECT COUNT(*) FROM public.role_permissions');

        console.log(`\n📋 Summary:`);
        console.log(`   - Total Permissions: ${permCount.rows[0].count}`);
        console.log(`   - Role Assignments: ${rolePermCount.rows[0].count}`);

    } catch (err) {
        console.error('❌ Migration Error:', err.message);
        console.error(err);
    } finally {
        await pool.end();
    }
}

runRBACMigration();
