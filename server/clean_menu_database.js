require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function cleanMenu() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Identify root main menu items we want to keep
    const keepRootTitles = [
      'QUI SOMMES-NOUS ?',
      'UTILITÉ PUBLIQUE',
      'PORTAIL PROQUELEC',
      'CONTACT'
    ];

    // Find the IDs of the root items we want to keep
    const rootRes = await client.query(
      `SELECT id, title FROM menu_items WHERE parent_id IS NULL AND menu_type = 'main' AND title = ANY($1)`,
      [keepRootTitles]
    );
    const keepRootIds = rootRes.rows.map(r => r.id);
    console.log('Root menu items to keep:', rootRes.rows.map(r => `${r.title} (${r.id})`));

    // 2. Deactivate all OTHER root main menu items
    const deactivateRootRes = await client.query(
      `UPDATE menu_items 
       SET is_active = false 
       WHERE parent_id IS NULL AND menu_type = 'main' AND NOT (title = ANY($1))`,
      [keepRootTitles]
    );
    console.log(`Deactivated ${deactivateRootRes.rowCount} redundant top-level main menu items.`);

    // 3. Deactivate all children of deactivated main menu items
    // Any menu item that has a parent which is not in the keep list and is main
    const deactivateChildrenRes = await client.query(
      `UPDATE menu_items 
       SET is_active = false 
       WHERE parent_id IS NOT NULL 
         AND menu_type = 'main' 
         AND parent_id NOT IN (
           SELECT id FROM menu_items WHERE parent_id IS NULL AND menu_type = 'main' AND title = ANY($1)
         )`,
      [keepRootTitles]
    );
    console.log(`Deactivated ${deactivateChildrenRes.rowCount} sub-menu items belonging to deactivated parents.`);

    // 4. Ensure the keep root items and their children are active
    const activateRootsRes = await client.query(
      `UPDATE menu_items 
       SET is_active = true 
       WHERE parent_id IS NULL AND menu_type = 'main' AND title = ANY($1)`,
      [keepRootTitles]
    );
    const activateChildrenRes = await client.query(
      `UPDATE menu_items 
       SET is_active = true 
       WHERE parent_id IS NOT NULL 
         AND menu_type = 'main' 
         AND parent_id IN (
           SELECT id FROM menu_items WHERE parent_id IS NULL AND menu_type = 'main' AND title = ANY($1)
         )`,
      [keepRootTitles]
    );
    console.log(`Activated/verified active state for ${activateRootsRes.rowCount} roots and ${activateChildrenRes.rowCount} child menu items.`);

    // 5. Ensure all mega menu items are active
    const activateMegaRes = await client.query(
      `UPDATE menu_items SET is_active = true WHERE menu_type = 'mega'`
    );
    console.log(`Activated/verified active state for ${activateMegaRes.rowCount} mega menu items.`);

    // 6. Check final status of active main menu items
    const finalMainRes = await client.query(`
      SELECT id, title, url, parent_id, menu_order
      FROM menu_items
      WHERE is_active = true AND menu_type = 'main'
      ORDER BY parent_id NULLS FIRST, menu_order
    `);
    console.log('\n=== ACTIVE MAIN MENU ITEMS ===');
    finalMainRes.rows.forEach(r => {
      const parentLabel = r.parent_id ? `(parent: ${r.parent_id.slice(0, 8)})` : '[ROOT]';
      console.log(`  ${parentLabel} "${r.title}" → ${r.url}`);
    });

    await client.query('COMMIT');
    console.log('\n✅ Database menu cleaning complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database menu cleaning failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanMenu();
