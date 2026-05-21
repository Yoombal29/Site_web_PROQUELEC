
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://postgres:proquelec_secure_db_pass@localhost:5433/postgres"
});

async function createTestUser() {
    const email = 'experimental@proquelec.com';
    const password = 'experimental';
    const hash = await bcrypt.hash(password, 10);

    try {
        // Create table if not exists (just in case)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Insert or update user
        await pool.query(`
            INSERT INTO public.users (email, password_hash, role)
            VALUES ($1, $2, 'admin')
            ON CONFLICT (email) DO UPDATE SET password_hash = $2, role = 'admin';
        `, [email, hash]);

        console.log('✅ Utilisateur de test créé avec succès !');
        console.log('📧 Email: ' + email);
        console.log('🔑 Password: ' + password);
    } catch (err) {
        console.error('❌ Erreur:', err.message);
    } finally {
        await pool.end();
    }
}

createTestUser();
