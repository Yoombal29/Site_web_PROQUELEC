const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    const { rows } = await pool.query(`
    SELECT trigger_name, event_manipulation, event_object_table, action_statement 
    FROM information_schema.triggers
  `);

    console.log(`Triggers:`);
    rows.forEach(r => console.log(`- ${r.trigger_name} on ${r.event_object_table} (${r.event_manipulation})`));
    process.exit(0);
}

check();
