const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:proquelec_secure_db_pass@localhost:5432/proquelec' });

async function main() {
  const { rows } = await pool.query("SELECT structure_json FROM pages WHERE slug='contact'");
  const sj = rows[0].structure_json;
  for (const id of sj.ROOT.nodes) {
    const b = sj[id];
    if (b.props && b.props.html) {
      const hasScript = b.props.html.indexOf('<script') >= 0;
      const hasOnclick = b.props.html.indexOf('onclick') >= 0;
      const hasId = b.props.html.indexOf('sendBtn') >= 0;
      console.log('script:' + hasScript + ' onclick:' + hasOnclick + ' sendBtn:' + hasId);
      console.log('HTML length: ' + b.props.html.length);
    }
  }
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
