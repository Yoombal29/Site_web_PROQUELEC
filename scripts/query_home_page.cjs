const { Client } = require('pg');
const fs = require('fs');
const conn = process.env.DATABASE_URL || 'postgresql://postgres:proquelec_secure_db_pass@127.0.0.1:5437/proquelec?sslmode=disable';

(async () => {
  const client = new Client({ connectionString: conn });
  try {
    await client.connect();
    const res = await client.query(
      'SELECT id, slug, title, workflow_status, is_published, structure_json, draft_json, updated_at FROM pages WHERE slug=$1 LIMIT 1',
      ['home']
    );
    const data = res.rows[0] || null;
    fs.mkdirSync('tmp', { recursive: true });
    fs.writeFileSync('tmp/db_page_home.json', JSON.stringify(data, null, 2));
    console.log(JSON.stringify({
      id: data?.id,
      slug: data?.slug,
      title: data?.title,
      workflow_status: data?.workflow_status,
      is_published: data?.is_published,
      structure_json_type: data?.structure_json ? (typeof data.structure_json === 'string' ? 'string' : Array.isArray(data.structure_json) ? 'array' : 'object') : null,
      draft_json_type: data?.draft_json ? (typeof data.draft_json === 'string' ? 'string' : Array.isArray(data.draft_json) ? 'array' : 'object') : null,
      updated_at: data?.updated_at,
    }, null, 2));
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
