require('dotenv/config');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res = await pool.query("SELECT * FROM pages WHERE slug = 'expertises-techniques'");
  console.log(JSON.stringify(res.rows[0], null, 2));
  pool.end();
}

run();
