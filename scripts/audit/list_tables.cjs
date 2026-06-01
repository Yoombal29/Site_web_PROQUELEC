const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", (err, res) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(res.rows.map(r => r.table_name), null, 2));
    pool.end();
});
