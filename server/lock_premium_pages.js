require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function lockPremiumPages() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // These are premium CMS pages that should be locked (immutable=true)
    // so DynamicPage renders their structure_json via CraftPageRenderer
    // and NOT via FunctionalPageBlock (which would try to load a React component by slug)
    const premiumSlugs = [
      'utilite-publique',
      'autorites',
      'menages',
      'professionnels',
      'activities',
      'normes-ressources',
      'projets-realisations',
      'partenaires',
      'legal',
      'portal/marches',
      'espace-partenaires',
      'portal',
      'social',
      'expert-lab',
      'formations',
      'certifications',
      'expertises-techniques',
      'about',
      'temoignages',
      'faq',
    ];

    // Set immutable=true so DynamicPage renders their Craft.js structure_json
    const res = await client.query(
      `UPDATE pages SET immutable = true WHERE slug = ANY($1) RETURNING slug`,
      [premiumSlugs]
    );
    console.log(`✅ Set immutable=true for ${res.rowCount} premium pages:`);
    res.rows.forEach(r => console.log(`   - ${r.slug}`));

    // Also make sure functional pages (small stubs) that are NOT premium stay locked
    // as immutable to load their React components
    const functionalSlugs = [
      'auth', 'connexion', 'login', 'contact', 'documents', 'events',
      'labels', 'outils', 'showroom', 'dashboard', 'ged', 'admin',
      'partner', 'admin-secondary', 'sitemap', 'plan-du-site',
      'analytics', 'abonnements', 'observatoire', 'projects',
    ];

    const res2 = await client.query(
      `UPDATE pages SET immutable = true WHERE slug = ANY($1) RETURNING slug`,
      [functionalSlugs]
    );
    console.log(`✅ Confirmed immutable=true for ${res2.rowCount} functional pages`);

    await client.query('COMMIT');
    console.log('\n✅ Done! All pages correctly locked.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}
lockPremiumPages();
