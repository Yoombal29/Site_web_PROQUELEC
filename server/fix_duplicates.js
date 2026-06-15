require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixAll() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── 1. Supprimer les pages doublon (anciennes avec préfixe "espace-") ──
    const oldPageSlugs = [
      'espace-menages',
      'espace-professionnels',
      'espace-autorites',
      'partenaires-liste',
      'nos-actions',
      'projets-realisations',  // si doublon avec projets
      'formations-proquelec',
      'trainings',
      'avis-clients',
      'activites',
      'normes',
    ];
    const delResult = await client.query(
      `DELETE FROM pages WHERE slug = ANY($1)`,
      [oldPageSlugs]
    );
    console.log(`🗑️  Supprimé ${delResult.rowCount} pages doublon en base.`);

    // ── 2. Mettre à jour les URLs du menu pour pointer vers les slugs propres ──
    const menuUrlUpdates = [
      ['/espace-menages',         '/menages'],
      ['/espace-professionnels',  '/professionnels'],
      ['/espace-autorites',       '/autorites'],
      ['/partenaires-liste',      '/partenaires'],
      ['/nos-actions',            '/activities'],
      ['/projets',                '/projets-realisations'],
      ['/avantages?type=member',  '/autorites'],
      ['/avantages?type=electrician', '/menages'],
      ['/avantages?type=company', '/professionnels'],
      ['/avantages?type=member#collectivities', '/collectivites'],
    ];
    let menuUpdated = 0;
    for (const [oldUrl, newUrl] of menuUrlUpdates) {
      const res = await client.query(
        `UPDATE menu_items SET url = $1 WHERE url = $2 AND is_active = true`,
        [newUrl, oldUrl]
      );
      if (res.rowCount > 0) {
        console.log(`  📌 Menu: "${oldUrl}" → "${newUrl}" (${res.rowCount} items)`);
        menuUpdated += res.rowCount;
      }
    }
    console.log(`📌 ${menuUpdated} liens du menu mis à jour.`);

    // ── 3. Vérifier qu'il n'y a plus de doublons ──
    const check = await client.query(`
      SELECT slug, title FROM pages 
      WHERE slug IN ('menages','espace-menages','professionnels','espace-professionnels',
                     'autorites','espace-autorites','partenaires','partenaires-liste',
                     'activities','nos-actions','activites')
      ORDER BY slug
    `);
    console.log('\n📋 Pages restantes (espaces) :');
    check.rows.forEach(r => console.log(`  - ${r.slug}: ${r.title}`));

    await client.query('COMMIT');
    console.log('\n✅ Nettoyage terminé avec succès !');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAll();
