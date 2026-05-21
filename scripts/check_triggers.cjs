
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:proquelec_secure_db_pass@localhost:5433/postgres'
});

async function checkTriggers() {
    try {
        const res = await pool.query("SELECT trigger_name, event_manipulation, action_statement FROM information_schema.triggers WHERE event_object_table = 'pages'");
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkTriggers();
