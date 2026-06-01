const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:proquelec_secure_db_pass@localhost:5432/proquelec' });

async function main() {
  const { rows } = await pool.query("SELECT structure_json FROM pages WHERE slug='contact'");
  const sj = rows[0].structure_json;
  for (const id of sj.ROOT.nodes) {
    const b = sj[id];
    if (b.props && b.props.html && b.props.html.includes('<form')) {
      console.log('=== ' + b.displayName + ' ===');
      console.log(b.props.html);
    }
  }
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
