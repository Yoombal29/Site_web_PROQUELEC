const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5437,
  database: 'proquelec',
  user: 'postgres',
  password: 'proquelec_secure_db_pass'
});

async function main() {
  const client = await pool.connect();
  try {
    // Check existing slugs
    const slugs = [
      'contact-form', 'contact-premium', 'blog', 'actualites',
      'actualites-evenements', 'evenements', 'evenements/ateliers',
      'evenements/conferences', 'evenements/seminaires',
      'formations/artisans', 'formations/collectivites',
      'faq', 'galerie', 'partenaires-liste',
      'presse/communiques', 'presse/revue'
    ];

    for (const slug of slugs) {
      const res = await client.query('SELECT id, title, slug, structure_json IS NOT NULL as has_struct, pg_column_size(structure_json) as struct_size FROM pages WHERE slug = $1', [slug]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        console.log(`[${slug}] id=${row.id} title="${row.title}" has_struct=${row.has_struct} size=${row.struct_size}`);
      } else {
        console.log(`[${slug}] NOT FOUND`);
      }
    }

    // Check a couple of existing structures to understand format
    const sample = await client.query('SELECT slug, structure_json FROM pages WHERE slug IN (\'contact-form\', \'faq\', \'blog\') LIMIT 3');
    for (const row of sample.rows) {
      console.log(`\n=== ${row.slug} ===`);
      if (row.structure_json) {
        const json = typeof row.structure_json === 'string' ? JSON.parse(row.structure_json) : row.structure_json;
        console.log('Type:', Array.isArray(json) ? 'ARRAY' : typeof json);
        console.log('Keys:', Array.isArray(json) ? `length=${json.length}` : Object.keys(json));
        const preview = JSON.stringify(json).substring(0, 500);
        console.log('Preview:', preview);
      } else {
        console.log('NULL');
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
