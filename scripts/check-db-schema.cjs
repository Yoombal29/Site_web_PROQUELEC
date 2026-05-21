const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    const table = process.argv[2] || 'pages';
    const { rows } = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = $1
  `, [table]);

    console.log(`Columns in ${table}:`);
    rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));
    process.exit(0);
}

check();
