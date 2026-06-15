require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    const res = await pool.query("SELECT structure_json FROM pages WHERE slug = 'marches'");
    console.log(JSON.stringify(res.rows[0].structure_json, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}
run();
