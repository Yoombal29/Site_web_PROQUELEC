const path = require('path');
const { Pool } = require(path.join(__dirname, 'server', 'node_modules', 'pg'));
require('dotenv').config();
const p = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
    const r1 = await p.query("SELECT column_name FROM information_schema.columns WHERE table_name='electrical_certifications' ORDER BY ordinal_position");
    console.log('electrical_certifications columns:', r1.rows.map(r => r.column_name).join(', '));

    const r2 = await p.query("SELECT column_name FROM information_schema.columns WHERE table_name='download_buttons' ORDER BY ordinal_position");
    console.log('download_buttons columns:', r2.rows.map(r => r.column_name).join(', '));

    await p.end();
})();
