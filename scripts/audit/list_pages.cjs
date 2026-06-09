const { Pool } = require('pg');
const p = new Pool({ connectionString: 'postgresql://postgres:proquelec_secure_db_pass@127.0.0.1:5437/proquelec' });

(async () => {
  try {
    const r = await p.query(`SELECT id, title, slug, editor_engine, is_published FROM pages`);
    console.log(JSON.stringify(r.rows, null, 2));
  } catch (e) {
    console.error(e.message);
  } finally {
    await p.end();
  }
})();
