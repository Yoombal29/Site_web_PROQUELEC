require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Delete stubs and sub-menu pages that are now handled by PAGE_ALIASES
    const obsoleteSlugs = [
      'actions/diagnostics',
      'actions/sensibilisation',
      'actions/conformite',
      'actions/securisation',
      'actions/collectivites',
      'evenements/anniversaire',
      'evenements/ateliers',
      'evenements/conferences',
      'evenements/seminaires',
      'presse/communiques',
      'presse/revue',
      'formations/collectivites',
      'formations/artisans',
      'portal/dashboard',
      'portal/formations',
      'blog',
      'galerie',
      'partenariat-senelec',
      'collectivites',
      'ressources-pedagogiques',
      'normative-corpus',
      'publications'
    ];
    
    console.log(`Deleting ${obsoleteSlugs.length} obsolete/stub pages from database...`);
    const delRes = await client.query(
      `DELETE FROM pages WHERE slug = ANY($1)`,
      [obsoleteSlugs]
    );
    console.log(`🗑️ Deleted ${delRes.rowCount} pages from base.`);

    // 2. Set immutable = true for all functional pages
    const functionalSlugs = [
      'connexion', 'login', 'auth', 'dashboard', 'admin', 
      'admin/builder', 'admin/builder/{pageId}', 'admin/builder/config', 'admin/builder/legacy',
      'admin/craft-builder/{pageId}', 'admin/schematic-editor/{pageId}', 'admin/permissions',
      'partner', 'admin-secondary', 'ged', 'documents', 'events', 'labels', 'outils', 'showroom',
      'blog/{slug}', 'expert-kebe', 'rubrique-selector', 'schema-builder', 'plan-du-site', 'sitemap',
      'dashboard/electricien', 'dashboard/entreprise', 'dashboard/membre',
      'expert/chat', 'expert/calculators', 'expert/schemas', 'expert/docs', 'expert/history',
      'expert/config', 'expert/ai-providers', 'expert/logs', 'expert/scanner', 'expert/models', 'expert/stats',
      'projects', 'projects/{id}', 'diagnostics/{id}', 'observatoire',
      'office/document/new', 'office/document/{id}', 'office/document/template/{templateId}',
      'office/spreadsheet/new', 'office/spreadsheet/{id}', 'office/spreadsheet/template/{templateId}',
      'office/presentation/new', 'office/presentation/{id}', 'office/presentation/template/{templateId}',
      'analytics', 'demo/rbac', 'abonnements', 'contact'
    ];
    
    console.log(`Setting immutability for ${functionalSlugs.length} functional page records...`);
    const lockRes = await client.query(
      `UPDATE pages SET immutable = true, render_engine = 'raw' WHERE slug = ANY($1)`,
      [functionalSlugs]
    );
    console.log(`🔒 Marked ${lockRes.rowCount} functional pages as immutable in DB.`);

    await client.query('COMMIT');
    console.log('✅ Database cleanup and lock complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database operation failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}
run();
