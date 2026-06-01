const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'db');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:proquelec_secure_db_pass@localhost:5432/proquelec' });

async function main() {
  const files = fs.readdirSync(DB_DIR).filter(f => f.endsWith('.json'));
  let total = 0;
  for (const file of files) {
    const table = file.replace('.json', '');
    const raw = fs.readFileSync(path.join(DB_DIR, file), 'utf8');
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`⏭️  ${table}: 0 lignes`);
      continue;
    }
    let ok = 0;
    for (const row of rows) {
      try {
        const keys = Object.keys(row);
        const cols = keys.map(k => `"${k}"`).join(',');
        const vals = keys.map((_, i) => '$' + (i + 1)).join(',');
        const upsert = keys.map(k => `"${k}"=EXCLUDED."${k}"`).join(',');
        await pool.query(
          `INSERT INTO "${table}" (${cols}) VALUES (${vals}) ON CONFLICT DO UPDATE SET ${upsert}`,
          keys.map(k => row[k])
        );
        ok++;
      } catch (e) { /* skip individual row errors */ }
    }
    console.log(`✅ ${table}: ${ok}/${rows.length}`);
    total += ok;
  }
  console.log(`\n📦 Import terminé: ${total} lignes`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
