const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool();
async function main() {
  const r = await pool.query("SELECT slug, LEFT(structure_json::text, 800) AS preview FROM public.pages WHERE slug='home'");
  console.log(r.rows[0].preview);
  await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });
