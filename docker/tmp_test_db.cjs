const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:proquelec_secure_db_pass@127.0.0.1:5437/proquelec?sslmode=disable' });
(async () => {
  try {
    const r = await pool.query('SELECT NOW()');
    console.log('OK', r.rows[0]);
  } catch (e) {
    console.error('ERR', e.message, e.code, e.detail);
  } finally {
    await pool.end();
  }
})();
