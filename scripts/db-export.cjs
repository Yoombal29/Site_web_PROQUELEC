const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'db');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const pool = new Pool({
  host: '127.0.0.1',
  port: 5437,
  database: 'proquelec',
  user: 'postgres',
  password: 'proquelec_secure_db_pass',
  ssl: false
});

const tables = [
  'pages', 'menu_items', 'site_settings', 'theme_settings',
  'construction_mode', 'home_hero', 'home_slides', 'home_stats',
  'home_services', 'partners', 'testimonials', 'quick_links',
  'blog_posts', 'blog_categories', 'events', 'documents',
  'gallery_items', 'newsletter_subscribers', 'contact_requests',
  'download_buttons', 'professional_training', 'electrical_certifications',
  'normative_articles', 'page_templates', 'tech_tools', 'cms_themes', 'cms_plugins',
  'site_config', 'site_assets'
];

async function main() {
  for (const table of tables) {
    try {
      const { rows } = await pool.query(`SELECT * FROM "${table}"`);
      fs.writeFileSync(path.join(DB_DIR, `${table}.json`), JSON.stringify(rows, null, 2));
      console.log(`✅ ${table}: ${rows.length} lignes`);
    } catch (e) {
      if (e.code === '42P01') {
        console.log(`⏭️  ${table}: table inexistante`);
      } else {
        console.log(`❌ ${table}: ${e.message.substring(0, 60)}`);
      }
    }
  }
  console.log('\n📦 Export terminé dans db/');
  await pool.end();
}

main().catch(console.error);
