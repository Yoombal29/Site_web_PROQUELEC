const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const tablesToCheck = ['users', 'profiles', 'blog_posts', 'site_settings', 'events', 'documents', 'audit_log', 'analytics_events'];
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1)", [tablesToCheck], (err, res) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(res.rows.map(r => r.table_name), null, 2));
    pool.end();
});
