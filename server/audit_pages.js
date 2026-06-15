require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function audit() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT slug, title, 
             render_engine,
             immutable,
             CASE WHEN structure_json IS NOT NULL AND structure_json::text != 'null' AND structure_json::text != '{}' AND LENGTH(structure_json::text) > 10 THEN true ELSE false END as has_structure,
             LENGTH(COALESCE(structure_json::text, '')) as structure_size,
             CASE WHEN content IS NOT NULL AND LENGTH(content) > 50 THEN true ELSE false END as has_content,
             LENGTH(COALESCE(content, '')) as content_size,
             status,
             is_published
      FROM pages
      WHERE is_published = true OR status = 'published'
      ORDER BY slug
    `);
    
    console.log('=== PAGES PUBLIÉES ===\n');
    console.log('Slug'.padEnd(30) + 'Structure'.padEnd(12) + 'Size'.padEnd(10) + 'Content'.padEnd(10) + 'Engine'.padEnd(12) + 'Immutable');
    console.log('-'.repeat(90));
    
    let needsWork = [];
    
    res.rows.forEach(r => {
      const status = r.has_structure ? '✅' : (r.has_content ? '⚠️' : '❌');
      const sizeStr = r.structure_size > 0 ? `${(r.structure_size/1024).toFixed(1)}kb` : '0';
      const engine = r.render_engine || 'default';
      const immutable = r.immutable ? '🔒' : '';
      
      console.log(
        `${status} ${r.slug.padEnd(28)} ${(r.has_structure ? 'YES' : 'NO').padEnd(12)} ${sizeStr.padEnd(10)} ${(r.has_content ? 'YES' : 'NO').padEnd(10)} ${engine.padEnd(12)} ${immutable}`
      );
      
      if (!r.has_structure || r.structure_size < 500) {
        needsWork.push({ slug: r.slug, title: r.title, size: r.structure_size, hasContent: r.has_content });
      }
    });
    
    console.log(`\nTotal pages publiées: ${res.rows.length}`);
    
    if (needsWork.length > 0) {
      console.log(`\n⚠️  PAGES NÉCESSITANT UNE AMÉLIORATION (${needsWork.length}):`);
      needsWork.forEach(p => {
        console.log(`  - ${p.slug} ("${p.title}") — structure: ${p.size}b, contenu HTML: ${p.hasContent ? 'oui' : 'non'}`);
      });
    }
  } finally {
    client.release();
    await pool.end();
  }
}
audit();
