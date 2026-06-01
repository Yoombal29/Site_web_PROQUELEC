const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5437, database: 'proquelec', user: 'postgres', password: 'proquelec_secure_db_pass' });

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT slug, structure_json FROM pages WHERE slug IN (\'contact-form\', \'blog\')');
    for (const row of res.rows) {
      const json = row.structure_json;
      const htmlKey = Object.keys(json).find(k => k.startsWith('html_'));
      console.log(`=== ${row.slug} ===`);
      console.log('HTML key:', htmlKey);
      console.log('HTML content:');
      console.log(json[htmlKey]?.props?.html?.substring(0, 2000));
      console.log('---');
    }
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch(err => { console.error(err); process.exit(1); });
