const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testMigration() {
    try {
        console.log('🔐 Testing RBAC Migration Step-by-Step...\n');

        // Step 1: Create permissions table
        console.log('1️⃣  Creating permissions table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.permissions (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                category VARCHAR(50),
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('   ✅ Permissions table created\n');

        // Step 2: Create role_permissions table
        console.log('2️⃣  Creating role_permissions table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.role_permissions (
                id SERIAL PRIMARY KEY,
                role VARCHAR(50) NOT NULL,
                permission_id INTEGER REFERENCES public.permissions(id) ON DELETE CASCADE,
                granted_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(role, permission_id)
            )
        `);
        console.log('   ✅ Role permissions table created\n');

        // Step 3: Insert sample permissions
        console.log('3️⃣  Inserting permissions...');
        await pool.query(`
            INSERT INTO public.permissions (name, description, category) VALUES
                ('projects.view', 'View project details', 'projects'),
                ('projects.edit', 'Edit projects', 'projects'),
                ('projects.transition', 'Change project status', 'projects')
            ON CONFLICT (name) DO NOTHING
        `);
        console.log('   ✅ Permissions inserted\n');

        // Step 4: Assign to admin role
        console.log('4️⃣  Assigning permissions to admin role...');
        const result = await pool.query(`
            INSERT INTO public.role_permissions (role, permission_id)
            SELECT 'admin', id FROM public.permissions
            ON CONFLICT (role, permission_id) DO NOTHING
            RETURNING *
        `);
        console.log(`   ✅ ${result.rowCount} permissions assigned to admin\n`);

        console.log('🎉 Manual test successful!');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('Code:', err.code);
        console.error('Position:', err.position);
        console.error('\nFull error:', err);
    } finally {
        await pool.end();
    }
}

testMigration();
