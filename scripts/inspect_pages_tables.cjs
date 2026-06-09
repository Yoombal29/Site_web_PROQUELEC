const { Client } = require('pg');
const conn = process.env.DATABASE_URL || 'postgresql://postgres:proquelec_secure_db_pass@127.0.0.1:5437/proquelec?sslmode=disable';
(async () => {
  const client = new Client({ connectionString: conn });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name = 'pages'
      ORDER BY table_schema, table_name
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
