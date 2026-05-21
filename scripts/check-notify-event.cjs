const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    const { rows } = await pool.query(`
    SELECT proname, prosrc 
    FROM pg_proc 
    WHERE proname = 'notify_event'
  `);

    rows.forEach(r => {
        console.log(`--- ${r.proname} ---`);
        console.log(r.prosrc);
    });
    process.exit(0);
}

check();
