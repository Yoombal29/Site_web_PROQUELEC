
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:proquelec_secure_db_pass@localhost:5433/postgres'
});

async function checkColumns() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'professional_training'");
        console.log(JSON.stringify(res.rows.map(r => r.column_name)));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkColumns();
