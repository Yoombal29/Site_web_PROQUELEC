require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function purgeMenu() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── 1. Les 4 items "footer" ne doivent PAS apparaître dans le menu principal
    //       → on les désactive (ils doublonnent les entrées dans "Utilité publique")
    const footerIds = [
      '7760780e-d9b7-47b4-9ffa-bc8836ccf3f4', // Espace Autorités (footer)
      'a682b37f-af1c-445d-ab52-5945b20f8f4a', // Espace Ménages (footer)
      'e8a07e80-7e63-405e-bda6-23078843bc70', // Espace Professionnels (footer)
      'd0b57833-1381-4383-96d8-99cd3019573d', // Espace Presse (footer)
    ];
    const r1 = await client.query(
      'UPDATE menu_items SET is_active = false WHERE id = ANY($1::uuid[])',
      [footerIds]
    );
    console.log(`🗑️  Désactivé ${r1.rowCount} items "footer" parasites.`);

    // ── 2. Supprimer ACCUEIL du menu principal (redondant avec le logo)
    const r2 = await client.query(
      "UPDATE menu_items SET is_active = false WHERE title = 'ACCUEIL' AND url = '/' AND menu_type = 'main'"
    );
    console.log(`🗑️  Désactivé ${r2.rowCount} item "ACCUEIL".`);

    // ── 3. Mettre "PORTAIL PROQUELEC" en menu_type 'main'
    //       pour qu'il apparaisse bien dans la navigation principale (déjà secondary + top-level)
    const r3 = await client.query(
      "UPDATE menu_items SET menu_type = 'main' WHERE id = '361052b8-93d6-4c54-bef4-816190cb96c3'"
    );
    console.log(`✅ PORTAIL PROQUELEC passé en 'main': ${r3.rowCount}`);

    // ── 4. Ses enfants aussi en 'main' pour qu'ils apparaissent comme sous-menu
    const r4 = await client.query(
      "UPDATE menu_items SET menu_type = 'main' WHERE parent_id = '361052b8-93d6-4c54-bef4-816190cb96c3'"
    );
    console.log(`✅ Enfants du Portail passés en 'main': ${r4.rowCount}`);

    // ── 5. Vérifier l'état final
    const final = await client.query(`
      SELECT title, url, menu_type, is_active
      FROM menu_items
      WHERE parent_id IS NULL
      ORDER BY menu_type, menu_order
    `);
    console.log('\n=== Items ROOT après purge ===');
    final.rows.forEach(r => {
      const status = r.is_active ? '✅' : '❌';
      console.log(`  ${status} [${r.menu_type}] "${r.title}" → ${r.url}`);
    });

    // ── 6. Compter les doublons restants dans le menu actif
    const dups = await client.query(`
      SELECT url, COUNT(*) as cnt
      FROM menu_items
      WHERE is_active = true AND parent_id IS NULL
      GROUP BY url
      HAVING COUNT(*) > 1
    `);
    if (dups.rows.length > 0) {
      console.log('\n⚠️  Doublons URL restants:');
      dups.rows.forEach(r => console.log(`  ${r.url} (${r.cnt}x)`));
    } else {
      console.log('\n✅ Aucun doublon URL dans le menu actif.');
    }

    await client.query('COMMIT');
    console.log('\n✅ Purge du menu terminée!');
  } catch(e) {
    await client.query('ROLLBACK');
    console.error('Erreur:', e.message);
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

purgeMenu();
