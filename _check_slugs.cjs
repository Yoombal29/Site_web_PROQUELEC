require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT slug, render_engine, immutable FROM public.pages WHERE slug IN ('a-propos','about','conseils-menages','menages','partenaires','normes-ressources','contact','contact-premium','faq') ORDER BY slug").then(r => {
  r.rows.forEach(p => console.log(p.slug, '| render:', p.render_engine, '| immutable:', p.immutable));
  pool.end();
}).catch(e => { console.error(e.message); pool.end(); });
