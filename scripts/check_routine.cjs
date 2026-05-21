
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:proquelec_secure_db_pass@localhost:5433/postgres'
});

async function checkRoutine() {
    try {
        const res = await pool.query("SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'auto_page_versioning'");
        if (res.rows.length > 0) {
            console.log(res.rows[0].routine_definition);
        } else {
            console.log('Routine not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkRoutine();
