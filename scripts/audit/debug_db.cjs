const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkSettings() {
    try {
        console.log('Checking site_settings table with ORDER BY...');
        const result = await pool.query('SELECT * FROM public.site_settings ORDER BY id ASC');
        console.log('Success! Row:', result.rows[0]);
        console.log('Columns:', Object.keys(result.rows[0]));
    } catch (err) {
        console.error('Error querying site_settings:', err);
    } finally {
        await pool.end();
    }
}

checkSettings();
