const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:proquelec_secure_db_pass@localhost:5432/proquelec' });

(async () => {
  const { rows } = await pool.query("SELECT structure_json FROM pages WHERE slug='home'");
  const sj = rows[0].structure_json;
  console.log('Blocs:', sj.ROOT.nodes.length);
  sj.ROOT.nodes.forEach((id, i) => {
    const b = sj[id];
    const html = (b.props && b.props.html) || '';
    console.log((i + 1) + '.', b.displayName, '| taille:', html.length, '| debut:', html.substring(0, 80));
  });
  await pool.end();
})();
