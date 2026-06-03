const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://proquelec:proquelec@localhost:5432/proquelec'
});

async function checkHomeStructure() {
  try {
    const result = await pool.query(
      `SELECT id, slug, title, is_published, structure_json, draft_json FROM pages WHERE slug = 'home' OR slug = 'home_page' OR slug = '' LIMIT 1`
    );

    if (result.rows.length === 0) {
      console.log('❌ No home page found');
      process.exit(0);
    }

    const page = result.rows[0];
    console.log('📄 Page:', {
      id: page.id,
      slug: page.slug,
      title: page.title,
      is_published: page.is_published
    });

    // Check structure_json
    if (page.structure_json) {
      const struct = typeof page.structure_json === 'string' ? JSON.parse(page.structure_json) : page.structure_json;
      console.log('\n📊 structure_json type:', Array.isArray(struct) ? 'ARRAY' : typeof struct);
      if (Array.isArray(struct)) {
        console.log('   Length:', struct.length);
        console.log('   First item:', JSON.stringify(struct[0]).slice(0, 200) + '...');
      } else if (struct && typeof struct === 'object') {
        console.log('   Keys:', Object.keys(struct).slice(0, 10).join(', '));
        if ('ROOT' in struct) {
          console.log('   Has ROOT: YES');
          console.log('   ROOT structure:', JSON.stringify(struct.ROOT).slice(0, 300) + '...');
        }
      }
    } else {
      console.log('\n📊 structure_json: NULL');
    }

    // Check draft_json
    if (page.draft_json) {
      const draft = typeof page.draft_json === 'string' ? JSON.parse(page.draft_json) : page.draft_json;
      console.log('\n📋 draft_json type:', Array.isArray(draft) ? 'ARRAY' : typeof draft);
      if (Array.isArray(draft)) {
        console.log('   Length:', draft.length);
      } else if (draft && typeof draft === 'object') {
        console.log('   Keys:', Object.keys(draft).slice(0, 10).join(', '));
        if ('ROOT' in draft) {
          console.log('   Has ROOT: YES');
        }
      }
    } else {
      console.log('\n📋 draft_json: NULL');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkHomeStructure();
