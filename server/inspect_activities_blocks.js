require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT slug, title, structure_json FROM pages WHERE slug = 'activities'");
    if (res.rows.length > 0) {
      const p = res.rows[0];
      console.log(`=== Page: ${p.slug} ("${p.title}") ===`);
      const structure = p.structure_json;
      if (structure && typeof structure === 'object') {
        Object.entries(structure).forEach(([key, node]) => {
          if (node.displayName || node.type?.resolvedName) {
            console.log(`- Node key: ${key}, DisplayName: ${node.displayName}, Type: ${node.type?.resolvedName || node.type}`);
            if (node.props?.html) {
              // find if there are sections with IDs
              const matches = node.props.html.match(/<section[^>]*id="([^"]+)"[^>]*>/g);
              if (matches) {
                console.log(`  Found sections with IDs: ${matches.map(m => m.match(/id="([^"]+)"/)[1]).join(', ')}`);
              }
            }
          }
        });
      }
    } else {
      console.log("activities page not found in DB");
    }
  } finally {
    client.release();
    await pool.end();
  }
}
run();
