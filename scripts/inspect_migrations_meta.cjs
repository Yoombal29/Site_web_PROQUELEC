const { Client } = require('pg');
const conn = process.env.DATABASE_URL || 'postgresql://postgres:proquelec_secure_db_pass@127.0.0.1:5437/proquelec?sslmode=disable';
(async () => {
  const client = new Client({ connectionString: conn });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='_migrations_meta'
    `);
    if (res.rows.length === 0) {
      console.log('No _migrations_meta table found');
      return;
    }
    const rows = await client.query('SELECT filename, applied_at FROM public._migrations_meta ORDER BY applied_at DESC LIMIT 20');
    console.log(JSON.stringify(rows.rows, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
