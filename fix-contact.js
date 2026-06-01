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

async function fixContactConflict() {
  console.log('🔍 Checking contact pages...\n');

  // Get both pages
  const result = await pool.query(
    `SELECT id, title, slug, status, content 
     FROM public.pages 
     WHERE slug LIKE '%contact%' 
     ORDER BY title`
  );

  console.log('Found pages:');
  result.rows.forEach((row, i) => {
    const content = row.content?.substring(0, 100) || '(empty)';
    console.log(`\n${i+1}. Title: "${row.title}"`);
    console.log(`   Slug: "${row.slug}"`);
    console.log(`   Status: ${row.status}`);
    console.log(`   Content: ${content}...`);
  });

  // Fix Contact with /contact by renaming it to "contact-form" 
  console.log('\n\n🔧 Fixing conflict...');
  const contactPage = result.rows.find(p => p.slug === '/contact');
  
  if (contactPage) {
    console.log(`\nRenaming "${contactPage.title}" (slug: /contact) -> contact-form`);
    const fixResult = await pool.query(
      `UPDATE public.pages 
       SET slug = 'contact-form', status = 'published', is_published = true, updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, slug, status`,
      [contactPage.id]
    );
    console.log('✅ Fixed:', fixResult.rows[0]);
  }

  console.log('\n\n📋 Final status of contact pages:');
  const finalResult = await pool.query(
    `SELECT id, title, slug, status 
     FROM public.pages 
     WHERE slug LIKE '%contact%' 
     ORDER BY slug`
  );

  finalResult.rows.forEach(row => {
    const emoji = row.status === 'published' ? '✅' : '⚠️';
    console.log(`${emoji} "${row.title}".padEnd(30) slug="${row.slug}" (${row.status})`);
  });

  await pool.end();
  console.log('\n✅ Done!');
}

fixContactConflict().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
