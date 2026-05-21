const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    const { rows } = await pool.query(`
    SELECT routine_name, routine_definition 
    FROM information_schema.routines 
    WHERE routine_name LIKE 'pages_notify%'
  `);

    rows.forEach(r => {
        console.log(`--- ${r.routine_name} ---`);
        console.log(r.routine_definition);
    });
    process.exit(0);
}

check();
