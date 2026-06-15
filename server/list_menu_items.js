require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function listMenuItems() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT id, title, url, parent_id, menu_order, is_active
      FROM menu_items
      ORDER BY parent_id NULLS FIRST, menu_order
    `);
    console.log('=== MENU ITEMS ===');
    res.rows.forEach(r => {
      const indent = r.parent_id ? '  └─ ' : '';
      console.log(`${indent}[${r.id}] ${r.title} → ${r.url} (actif: ${r.is_active})`);
    });
    console.log(`\nTotal: ${res.rows.length} items`);
    
    // Chercher des doublons par URL
    const dupRes = await client.query(`
      SELECT url, COUNT(*) as cnt, ARRAY_AGG(title) as titles
      FROM menu_items
      WHERE is_active = true
      GROUP BY url
      HAVING COUNT(*) > 1
      ORDER BY cnt DESC
    `);
    if (dupRes.rows.length > 0) {
      console.log('\n⚠️  DOUBLONS URL dans le menu:');
      dupRes.rows.forEach(r => console.log(`  ${r.url}: ${r.titles.join(', ')}`));
    } else {
      console.log('\n✅ Aucun doublon URL dans le menu.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}
listMenuItems();
