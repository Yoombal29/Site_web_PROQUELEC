#!/usr/bin/env node
const { Pool } = require('pg');
const fetch = global.fetch || require('node-fetch');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:proquelec_secure_db_pass@localhost:5437/proquelec';
const BASE_URL = process.env.SITE_URL || 'http://127.0.0.1:5175';

const pool = new Pool({ connectionString: DATABASE_URL });

function buildUrl(slug) {
  if (!slug || slug === 'home') return `${BASE_URL}/`;
  return `${BASE_URL}/${slug}`;
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT slug, title FROM public.pages WHERE is_published = true ORDER BY slug");
    console.log(`Found ${rows.length} published pages.`);

    const results = [];
    for (const row of rows) {
      const url = buildUrl(row.slug);
      try {
        const res = await fetch(url, { method: 'GET' });
        const ok = res.ok;
        const status = res.status;
        let contentType = res.headers.get('content-type') || '';
        let snippet = '';
        if (ok && contentType.includes('html')) {
          const text = await res.text();
          snippet = text.slice(0, 200).replace(/\s+/g, ' ');
        }
        results.push({ slug: row.slug, url, ok, status, contentType, snippet: snippet.slice(0, 120) });
        console.log(`${ok ? 'OK ' : 'ERR'} ${status} ${url}`);
      } catch (error) {
        console.error('FAIL', url, error.message || error);
        results.push({ slug: row.slug, url, ok: false, status: 'ERR', error: error.message });
      }
    }

    const failed = results.filter(r => !r.ok);
    console.log('---');
    console.log(`Checked ${results.length} pages: ${failed.length} failed.`);
    if (failed.length > 0) {
      for (const f of failed) {
        console.log(`FAILED ${f.url} -> ${f.status} ${f.error || ''}`);
      }
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Error', err);
  process.exit(1);
});
