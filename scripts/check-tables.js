const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('chats', 'messages')
`, (err, res) => {
    if (err) {
        console.error('ERROR:', err.message);
    } else {
        console.log('Tables found:');
        res.rows.forEach(r => console.log(' -', r.table_name));
    }
    pool.end();
});
