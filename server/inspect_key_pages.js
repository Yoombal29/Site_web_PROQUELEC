require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function inspect() {
  const client = await pool.connect();
  const slugs = ['activities', 'autorites', 'professionnels', 'menages', 'contact', 'formations', 'auth', 'portal/dashboard', 'portal/formations', 'collectivites'];
  try {
    for (const slug of slugs) {
      const res = await client.query(
        `SELECT slug, title, render_engine, immutable, is_published, status,
                LENGTH(COALESCE(structure_json::text,'')) as struct_size,
                LENGTH(COALESCE(content,'')) as content_size,
                LEFT(COALESCE(content,''), 200) as content_preview
         FROM pages WHERE slug = $1`, [slug]);
      if (res.rows.length === 0) {
        console.log(`[${slug}] ❌ NOT IN DB`);
      } else {
        const p = res.rows[0];
        console.log(`[${slug}] immutable=${p.immutable} engine=${p.render_engine} published=${p.is_published} status=${p.status} struct=${p.struct_size}b content=${p.content_size}b`);
        if (p.content_preview) console.log(`  preview: ${p.content_preview.substring(0,100)}`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}
inspect();
