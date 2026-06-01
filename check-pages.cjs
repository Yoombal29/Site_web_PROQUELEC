const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5437,
  database: 'proquelec',
  user: 'postgres',
  password: 'proquelec_secure_db_pass',
});

async function check() {
  try {
    // Check table columns
    console.log('=== Checking pages table columns ===');
    const cols = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'pages'
      ORDER BY ordinal_position
    `);
    cols.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type}) default: ${c.column_default || '-'}`));

    // Check existing pages
    console.log('\n=== Current pages ===');
    const pages = await pool.query(
      `SELECT id, title, slug, status, is_published, menu_order
       FROM public.pages
       ORDER BY menu_order, slug`
    );
    pages.rows.forEach(p => console.log(`  [${p.status}] ${p.title.padEnd(30)} slug="${p.slug}" published=${p.is_published} order=${p.menu_order}`));

    // Check column "structure_json" or content/structure field
    console.log('\n=== Checking for structure_json column ===');
    const sj = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'pages' AND column_name LIKE '%structure%' OR column_name LIKE '%json%'
    `);
    sj.rows.forEach(r => console.log(`  Found: ${r.column_name}`));

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
