const { Pool } = require('pg');
const p = new Pool({ connectionString: 'postgresql://postgres:proquelec_secure_db_pass@127.0.0.1:5437/proquelec' });

(async () => {
  try {
    // Check if test-page exists
    const check = await p.query(`SELECT id FROM pages WHERE slug = 'test-page'`);
    if (check.rows.length === 0) {
      const res = await p.query(`
        INSERT INTO pages (
          id, title, slug, content_blocks, structure_json, editor_engine, render_engine, is_published, status, workflow_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING id
      `, [
        '99999999-9999-9999-9999-999999999999',
        'Test Page Builder',
        'test-page',
        JSON.stringify([]),
        JSON.stringify([]),
        'visual_blocks',
        'builder',
        true,
        'published',
        'published'
      ]);
      console.log('✅ test-page seeded successfully with ID:', res.rows[0].id);
    } else {
      console.log('ℹ️ test-page already exists.');
    }
  } catch (e) {
    console.error('❌ Error seeding test-page:', e.message);
  } finally {
    await p.end();
  }
})();
