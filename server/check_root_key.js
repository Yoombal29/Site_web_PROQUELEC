require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkRoot() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT slug, 
              structure_json ? 'ROOT' as has_root,
              jsonb_typeof(structure_json) as json_type,
              (SELECT COUNT(*) FROM jsonb_object_keys(structure_json)) as key_count
       FROM pages 
       WHERE slug IN ('activities', 'menages', 'autorites', 'professionnels', 'formations', 'portal/marches')`
    );
    res.rows.forEach(r => {
      console.log(`[${r.slug}] has_ROOT=${r.has_root} type=${r.json_type} keys=${r.key_count}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}
checkRoot();
