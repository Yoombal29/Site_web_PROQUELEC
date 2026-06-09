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

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name").then(r => {
    console.table(r.rows);
    pool.end();
}).catch(err => {
    console.error(err);
    pool.end();
});
