const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://proquelec:proquelec@localhost:5432/proquelec'
});

async function listAllPages() {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        slug,
        title,
        status,
        is_published,
        created_at
      FROM pages
      ORDER BY slug ASC`
    );

    console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    LISTE COMPLÈTE DES PAGES                            ║');
    console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

    console.log(`Total: ${result.rows.length} pages\n`);

    console.log('ID'.padEnd(5) + ' | ' + 'Slug'.padEnd(30) + ' | ' + 'Title'.padEnd(25) + ' | ' + 'Status'.padEnd(10) + ' | ' + 'Published');
    console.log('-'.repeat(100));

    result.rows.forEach((page, idx) => {
      const status = page.status || 'unknown';
      const published = page.is_published ? '✅ YES' : '❌ NO';
      const created = new Date(page.created_at).toLocaleDateString('fr-FR');
      
      console.log(
        page.id.toString().padEnd(5) + ' | ' +
        (page.slug || '-').padEnd(30) + ' | ' +
        (page.title || '-').substring(0, 25).padEnd(25) + ' | ' +
        status.padEnd(10) + ' | ' +
        published
      );
    });

    console.log('\n📊 Statistiques:');
    console.log(`  • Total pages: ${result.rows.length}`);
    console.log(`  • Published: ${result.rows.filter(p => p.is_published).length}`);
    console.log(`  • Drafts: ${result.rows.filter(p => !p.is_published).length}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

listAllPages();
