require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function inspect() {
  const client = await pool.connect();
  try {
    const slugs = [
      'actions/securisation',
      'evenements/ateliers',
      'portal/dashboard',
      'galerie',
      'partenariat-senelec',
      'collectivites',
      'marches'
    ];
    for (const slug of slugs) {
      const res = await client.query('SELECT slug, title, render_engine, is_published, content, structure_json FROM pages WHERE slug = $1', [slug]);
      if (res.rows.length > 0) {
        const r = res.rows[0];
        console.log(`=== Page: ${r.slug} ("${r.title}") ===`);
        console.log(`Render engine: ${r.render_engine}`);
        console.log(`Structure JSON: ${r.structure_json ? 'Present (length: ' + JSON.stringify(r.structure_json).length + ')' : 'None'}`);
        console.log(`Content length: ${r.content ? r.content.length : 0}`);
        if (r.content) {
          console.log(`Content preview:\n${r.content.substring(0, 400)}...\n`);
        }
      } else {
        console.log(`=== Page: ${slug} NOT FOUND ===`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}
inspect();
