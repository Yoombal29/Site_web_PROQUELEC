const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkUsersTable() {
    const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='users'
        ORDER BY ordinal_position
    `);
    console.log('Users table columns:');
    res.rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`));
    await pool.end();
}

checkUsersTable();
