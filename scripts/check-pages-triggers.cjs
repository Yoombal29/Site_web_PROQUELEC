const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    const { rows } = await pool.query(`
    SELECT 
        event_object_table AS table_name,
        trigger_name,
        action_statement AS action
    FROM information_schema.triggers
    WHERE event_object_table = 'pages'
  `);

    rows.forEach(r => {
        console.log(`- ${r.trigger_name} on ${r.table_name}: ${r.action}`);
    });
    process.exit(0);
}

check();
