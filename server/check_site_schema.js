
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'site_settings'");
        console.log('Columns in site_settings:', res.rows.map(r => r.column_name).join(', '));

        const data = await pool.query("SELECT * FROM public.site_settings WHERE id = 1");
        console.log('Data in site_settings id=1:', JSON.stringify(data.rows[0], null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
