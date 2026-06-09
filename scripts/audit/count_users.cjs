const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT count(*) FROM public.users", (err, res) => {
    if (err) console.error(err);
    else console.log('Users count:', res.rows[0].count);
    pool.end();
});
