require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    const res = await pool.query("SELECT slug, structure_json FROM pages WHERE slug IN ('blog', 'actualites-evenements')");
    res.rows.forEach(r => {
      console.log(`=== Page: ${r.slug} ===`);
      console.log(JSON.stringify(r.structure_json, null, 2).substring(0, 1000));
      console.log('\n');
    });
  } finally {
    client.release();
    await pool.end();
  }
}
run();
