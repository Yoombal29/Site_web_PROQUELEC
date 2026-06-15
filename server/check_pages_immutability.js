require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkImmutability() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT slug, title, immutable, design_options FROM pages ORDER BY slug');
    console.log('--- Page Immutability Status ---');
    res.rows.forEach(r => {
      console.log(`Slug: ${r.slug.padEnd(25)} | Immutable: ${r.immutable ? 'YES' : 'NO '} | PageType: ${r.design_options?.page_type || 'none'}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}
checkImmutability();
