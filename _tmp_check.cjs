const { Pool } = require('pg');
const p = new Pool({ host: '127.0.0.1', port: 5437, database: 'proquelec', user: 'postgres', password: 'proquelec_secure_db_pass' });
const slugs = ['partenaires-liste','portal/dashboard','portal/formations','portal/marches','presse/communiques','presse/revue','projets','publications','ressources-pedagogiques','temoignages','contact-form'];
p.query("SELECT slug, structure_json IS NOT NULL as has_struct, LENGTH(structure_json::text) as struct_len FROM pages WHERE slug = ANY($1::text[])", [slugs])
.then(r => { console.log(JSON.stringify(r.rows, null, 2)); p.end(); })
.catch(e => { console.error(e.message); p.end(); });
