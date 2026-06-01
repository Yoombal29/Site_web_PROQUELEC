import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5437,
  database: process.env.DB_NAME || 'proquelec',
  user: process.env.DB_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'proquelec_secure_db_pass',
  ssl: false
});

async function fixPages() {
  console.log('🔧 Fixing pages...\n');

  const fixes = [
    { old_slug: '/', new_slug: 'home', title: 'Accueil' },
    { old_slug: '/a-propos', new_slug: 'a-propos', title: 'À Propos' },
    { old_slug: '/services', new_slug: 'services', title: 'Services' },
    { old_slug: '/contact', new_slug: 'contact', title: 'Contact' }
  ];

  for (const fix of fixes) {
    try {
      console.log(`📝 Fixing: ${fix.title}`);
      console.log(`   Old: slug="${fix.old_slug}" status="draft"`);
      console.log(`   New: slug="${fix.new_slug}" status="published"`);

      const result = await pool.query(
        `UPDATE public.pages 
         SET slug = $1, status = 'published', is_published = true, updated_at = NOW() 
         WHERE slug = $2 
         RETURNING id, slug, status, is_published`,
        [fix.new_slug, fix.old_slug]
      );

      if (result.rows.length > 0) {
        console.log(`   ✅ Updated! New state:`, result.rows[0]);
      } else {
        console.log(`   ⚠️  No page found with slug="${fix.old_slug}"`);
      }
    } catch (err) {
      console.error(`   ❌ Error:`, err.message);
    }
    console.log();
  }

  console.log('🔍 Verifying all pages:\n');
  const result = await pool.query(
    `SELECT id, title, slug, status, is_published 
     FROM public.pages 
     ORDER BY menu_order ASC, slug ASC`
  );

  console.log('Current pages in database:');
  result.rows.forEach(row => {
    const statusEmoji = row.status === 'published' ? '✅' : '⚠️';
    const slugEmoji = row.slug.startsWith('/') ? '❌' : '✅';
    console.log(`${statusEmoji} ${slugEmoji} [${row.status}] ${row.title.padEnd(25)} slug="${row.slug}"`);
  });

  await pool.end();
  console.log('\n✅ Done!');
}

fixPages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
