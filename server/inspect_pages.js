require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query("SELECT slug, title, structure_json FROM pages WHERE slug IN ('partenaires', 'partenaires-liste', 'home', 'about') LIMIT 4")
  .then(r => {
    r.rows.forEach(p => {
      console.log('=== ' + p.slug + ' (' + p.title + ') ===');
      const s = p.structure_json;
      if (s && typeof s === 'object') {
        console.log(JSON.stringify(s).substring(0, 4000));
      } else {
        console.log('(no structure_json or raw string)');
      }
      console.log('');
    });
    pool.end();
  })
  .catch(e => { console.error(e.message); pool.end(); });
