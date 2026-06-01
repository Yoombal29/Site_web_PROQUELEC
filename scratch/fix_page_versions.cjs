const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5437/proquelec'
});

async function main() {
  try {
    console.log('Altering page_versions table...');
    await pool.query(`
      ALTER TABLE public.page_versions
      ADD COLUMN IF NOT EXISTS version_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS structure_json JSONB;
    `);
    console.log('Table altered successfully!');

    // Verify columns again
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'page_versions'");
    console.log('New columns in public.page_versions:');
    res.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));

  } catch (err) {
    console.error('Error altering table:', err);
  } finally {
    await pool.end();
  }
}

main();
