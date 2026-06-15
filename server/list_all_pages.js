require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`SELECT id, slug, title, status, is_published, 
  LENGTH(COALESCE(content,'')) as content_len,
  CASE WHEN structure_json IS NOT NULL THEN 'yes' ELSE 'no' END as has_structure
  FROM pages ORDER BY slug`)
  .then(r => {
    console.log(`\n=== ${r.rows.length} PAGES EN BASE ===\n`);
    console.log('SLUG'.padEnd(35) + 'TITLE'.padEnd(40) + 'STATUS'.padEnd(12) + 'PUB'.padEnd(6) + 'CONTENT'.padEnd(10) + 'STRUCT');
    console.log('-'.repeat(110));
    r.rows.forEach(p => {
      console.log(
        (p.slug||'').padEnd(35) +
        (p.title||'').substring(0,38).padEnd(40) +
        (p.status||'?').padEnd(12) +
        (p.is_published ? 'YES' : 'NO').padEnd(6) +
        String(p.content_len).padEnd(10) +
        p.has_structure
      );
    });
    
    // Find duplicates by slug
    const slugs = r.rows.map(p => p.slug);
    const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    if (dupes.length) {
      console.log('\n⚠️  SLUGS DUPLIQUÉS:', [...new Set(dupes)].join(', '));
    }
    
    // Find duplicates by title
    const titles = r.rows.map(p => p.title);
    const titleDupes = titles.filter((t, i) => titles.indexOf(t) !== i);
    if (titleDupes.length) {
      console.log('⚠️  TITRES DUPLIQUÉS:', [...new Set(titleDupes)].join(', '));
    }
    
    pool.end();
  })
  .catch(e => { console.error(e.message); pool.end(); });
