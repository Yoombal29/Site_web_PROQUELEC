const fs = require('fs');
const path = require('path');
const env = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL=(.+)/);
if (!dbUrlMatch) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}
const dbUrl = dbUrlMatch[1].trim();

const { Pool } = require('pg');
const pool = new Pool({ connectionString: dbUrl });

pool.query("SELECT * FROM public.blog_posts LIMIT 1").then(r => {
    console.log(r.rows);
    pool.query("SELECT * FROM public.partners LIMIT 1").then(r2 => {
        console.log(r2.rows);
        pool.end();
    }).catch(err => {
        console.error('Partners query failed:', err.message);
        pool.end();
    });
}).catch(err => {
    console.error('Blog posts query failed:', err.message);
    pool.end();
});
