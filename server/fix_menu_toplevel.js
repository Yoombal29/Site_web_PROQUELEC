require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fix() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Corriger /espace-partenaires -> /partenaires dans le menu (top-level)
    const r1 = await client.query(
      "UPDATE menu_items SET url = '/partenaires' WHERE url = '/espace-partenaires' AND parent_id IS NULL"
    );
    console.log('espace-partenaires top-level corrigé:', r1.rowCount, 'items');
    
    // 2. Vérifier s'il y a des doublons top-level avec le même URL après correction
    const dups = await client.query(`
      SELECT url, COUNT(*) as cnt, ARRAY_AGG(id::text) as ids, ARRAY_AGG(COALESCE(label,'NULL')) as labels
      FROM menu_items
      WHERE parent_id IS NULL AND is_active = true
      GROUP BY url
      HAVING COUNT(*) > 1
    `);
    
    if (dups.rows.length > 0) {
      console.log('\n⚠️  Doublons top-level trouvés:');
      for (const row of dups.rows) {
        console.log(`  URL: ${row.url} | labels: ${row.labels.join(', ')}`);
        // Garder le premier, désactiver les autres
        const [keep, ...toDisable] = row.ids;
        if (toDisable.length > 0) {
          const delRes = await client.query(
            'UPDATE menu_items SET is_active = false WHERE id = ANY($1::uuid[])',
            [toDisable]
          );
          console.log(`  -> Désactivé ${delRes.rowCount} doublon(s), gardé: ${keep}`);
        }
      }
    } else {
      console.log('\n✅ Aucun doublon URL top-level.');
    }
    
    // 3. Afficher menu final
    const final = await client.query(
      'SELECT label, url FROM menu_items WHERE parent_id IS NULL AND is_active = true ORDER BY menu_order'
    );
    console.log('\n=== Menu top-level final ===');
    final.rows.forEach(r => console.log(`  [${r.label || 'NULL'}] → ${r.url}`));
    
    await client.query('COMMIT');
    console.log('\n✅ Correction terminée!');
  } catch(e) {
    await client.query('ROLLBACK');
    console.error('Erreur:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}
fix();
