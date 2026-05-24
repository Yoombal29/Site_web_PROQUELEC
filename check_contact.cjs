const { Pool } = require('pg');
const p = new Pool({ connectionString: 'postgresql://postgres:proquelec_secure_db_pass@127.0.0.1:5437/proquelec' });

(async () => {
  try {
    const cols = await p.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'pages'`);
    console.log(cols.rows);
    
    const r = await p.query(`SELECT * FROM pages WHERE slug = 'contact'`);
    console.log(JSON.stringify(r.rows, null, 2));
  } catch (e) {
    console.error(e.message);
  } finally {
    await p.end();
  }
})();
