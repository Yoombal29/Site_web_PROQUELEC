const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function test() {
    try {
        console.log('Inserting media_files test...');
        await pool.query('INSERT INTO public.media_files (file_name, file_path) VALUES ($1, $2)', ['test.txt', 'test.txt']);
        console.log('✅ Worked!');
        await pool.query('DELETE FROM public.media_files WHERE file_name = $1', ['test.txt']);
    } catch (e) {
        console.error('❌ Failed:', e.message);
    }
    process.exit(0);
}

test();
