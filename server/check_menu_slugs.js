require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkSlugs() {
  const client = await pool.connect();
  try {
    const menuRes = await client.query(`
      SELECT DISTINCT url FROM menu_items WHERE is_active = true
    `);
    
    const urls = menuRes.rows.map(r => {
      let u = r.url;
      // Strip hashes
      u = u.split('#')[0];
      // Strip queries
      u = u.split('?')[0];
      return u;
    }).filter(u => u && u.startsWith('/') && u !== '/');

    // Deduplicate
    const uniqueSlugs = Array.from(new Set(urls.map(u => u.substring(1))));
    
    console.log(`Checking ${uniqueSlugs.length} unique slugs from active menus in DB...`);
    console.log('Slug'.padEnd(35) + 'Has Page'.padEnd(10) + 'Size'.padEnd(8) + 'Content'.padEnd(10) + 'Engine'.padEnd(12) + 'Title');
    console.log('-'.repeat(95));
    
    for (const slug of uniqueSlugs) {
      const pageRes = await client.query(`
        SELECT slug, title, render_engine,
               LENGTH(COALESCE(structure_json::text, '')) as structure_size,
               LENGTH(COALESCE(content, '')) as content_size
        FROM pages
        WHERE slug = $1
      `, [slug]);
      
      if (pageRes.rows.length > 0) {
        const p = pageRes.rows[0];
        const hasStruct = p.structure_size > 500 ? 'YES' : 'NO';
        const hasContent = p.content_size > 50 ? 'YES' : 'NO';
        console.log(`${slug.padEnd(35)} YES       ${(p.structure_size + 'b').padEnd(8)} ${hasContent.padEnd(10)} ${(p.render_engine || '').padEnd(12)} ${p.title}`);
      } else {
        console.log(`${slug.padEnd(35)} NO        -        -          -            -`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}
checkSlugs();
