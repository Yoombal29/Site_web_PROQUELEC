require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    const res = await pool.query("SELECT slug, structure_json FROM pages WHERE slug IN ('blog', 'actualites-evenements')");
    res.rows.forEach(r => {
      console.log(`=== Page: ${r.slug} ===`);
      const s = r.structure_json;
      if (s) {
        Object.entries(s).forEach(([k, v]) => {
          if (v.props?.html) {
            console.log(`  Block ${k} ("${v.displayName}"):`);
            console.log(v.props.html);
          }
        });
      }
      console.log('\n');
    });
  } finally {
    client.release();
    await pool.end();
  }
}
run();
