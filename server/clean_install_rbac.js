const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function cleanRBAC() {
    try {
        console.log('🧹 Cleaning existing RBAC tables...\n');

        // Drop in correct order (child tables first)
        await pool.query('DROP TABLE IF EXISTS public.user_permissions CASCADE');
        await pool.query('DROP TABLE IF EXISTS public.role_permissions CASCADE');
        await pool.query('DROP TABLE IF EXISTS public.permissions CASCADE');

        console.log('✅ Tables dropped\n');

        // Now run the full migration
        console.log('🔐 Installing RBAC System...\n');

        const fs = require('fs');
        const path = require('path');
        const migrationPath = path.join(__dirname, 'migrations', '20260214_rbac_permissions.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await pool.query(sql);

        console.log('\n✅ RBAC System Installed Successfully!');

        // Summary
        const permCount = await pool.query('SELECT COUNT(*) FROM public.permissions');
        const rolePermCount = await pool.query('SELECT COUNT(*) FROM public.role_permissions');

        console.log(`\n📋 Summary:`);
        console.log(`   - Total Permissions: ${permCount.rows[0].count}`);
        console.log(`   - Role Assignments: ${rolePermCount.rows[0].count}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('\nFull error:', err);
    } finally {
        await pool.end();
    }
}

cleanRBAC();
