const { Pool } = require('pg');
const pool = new Pool({
  host: '127.0.0.1',
  port: 5437,
  database: 'proquelec',
  user: 'postgres',
  password: 'proquelec_secure_db_pass',
});
(async () => {
  const slugs = ['menages','professionnels','social','showroom','formation-certification','actions/collectivites','actions/conformite','actions/securisation','actions/sensibilisation','formations/artisans','formations/collectivites','evenements/ateliers','evenements/conferences','evenements/seminaires'];
  const r = await pool.query('SELECT slug, title, char_length(content) as content_len, structure_json is not null as has_structure FROM public.pages WHERE slug = ANY($1)', [slugs]);
  r.rows.forEach(p => console.log(p.slug, '|', p.title, '| content_len:', p.content_len, '| has_structure:', p.has_structure));
  await pool.end();
})();
