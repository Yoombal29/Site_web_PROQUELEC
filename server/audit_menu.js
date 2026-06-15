require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function audit() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT id, title, url, parent_id, menu_order, menu_type, is_active
      FROM menu_items
      WHERE is_active = true
      ORDER BY menu_type, parent_id NULLS FIRST, menu_order
    `);
    
    const byType = {};
    res.rows.forEach(r => {
      const t = r.menu_type || 'NULL';
      if (!byType[t]) byType[t] = [];
      byType[t].push(r);
    });
    
    Object.entries(byType).forEach(([type, items]) => {
      console.log(`\n=== menu_type: "${type}" (${items.length} items) ===`);
      items.forEach(r => {
        const indent = r.parent_id ? '  └─ ' : '';
        const pid = r.parent_id ? `[parent:${r.parent_id.slice(0,8)}]` : '[ROOT]';
        console.log(`${indent}${pid} [${r.id.slice(0,8)}] "${r.title}" → ${r.url}`);
      });
    });
    
    console.log(`\nTotal actifs: ${res.rows.length}`);
  } finally {
    client.release();
    await pool.end();
  }
}
audit();
