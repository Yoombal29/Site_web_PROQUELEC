const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'fix-notifications.sql'), 'utf8');
        console.log('Applying SQL fix...');
        await pool.query(sql);
        console.log('✅ SQL applied successfully!');
    } catch (e) {
        console.error('❌ SQL Error:', e.message);
    }
    process.exit(0);
}

run();
