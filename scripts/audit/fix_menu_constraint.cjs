const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: 'postgresql://postgres:proquelec_secure_db_pass@localhost:5433/postgres',
});

async function fix() {
    try {
        console.log('Dropping old constraint...');
        await pool.query('ALTER TABLE public.menu_items DROP CONSTRAINT IF EXISTS menu_items_parent_id_fkey');
        console.log('Adding new constraint with ON DELETE SET NULL...');
        await pool.query('ALTER TABLE public.menu_items ADD CONSTRAINT menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE SET NULL');
        console.log('Done!');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

fix();
