require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const client = await pool.connect();
  const slugs = ['dashboard', 'formations', 'utilite-publique', 'collectivites', 'marches'];
  try {
    for (const slug of slugs) {
      const res = await client.query(
        `SELECT slug, title, immutable, render_engine, is_published, 
                LENGTH(COALESCE(structure_json::text,'')) as struct_size
         FROM pages WHERE slug = $1`, [slug]);
      if (res.rows.length === 0) {
        console.log(`[${slug}] ❌ NOT IN DB`);
      } else {
        const p = res.rows[0];
        console.log(`[${slug}] immutable=${p.immutable} engine=${p.render_engine} struct=${p.struct_size}b published=${p.is_published}`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}
check();
