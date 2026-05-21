
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgresql://postgres:proquelec_secure_db_pass@localhost:5433/postgres"
});

async function listUsers() {
    try {
        const res = await pool.query('SELECT id, email, role FROM public.users');
        console.log('Users found:', res.rows);
    } catch (err) {
        console.error('Error fetching users:', err.message);
    } finally {
        await pool.end();
    }
}

listUsers();
