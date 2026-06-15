require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkStructure() {
  const client = await pool.connect();
  const slugs = ['activities', 'menages'];
  try {
    for (const slug of slugs) {
      const res = await client.query(
        `SELECT slug, immutable, render_engine,
                LEFT(structure_json::text, 300) as struct_preview
         FROM pages WHERE slug = $1`, [slug]);
      if (res.rows.length === 0) {
        console.log(`[${slug}] NOT IN DB`);
      } else {
        const p = res.rows[0];
        console.log(`\n=== [${slug}] immutable=${p.immutable} engine=${p.render_engine} ===`);
        console.log(`structure_json preview: ${p.struct_preview}`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}
checkStructure();
