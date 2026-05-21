
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function deduplicate() {
    try {
        console.log('Starting deduplication of menu items...');

        // Find duplicates
        const res = await pool.query(`
            SELECT title, url, menu_type, COALESCE(parent_id::text, 'none') as parent_group, array_agg(id) as ids
            FROM menu_items
            GROUP BY title, url, menu_type, parent_group
            HAVING COUNT(*) > 1
        `);

        console.log(`Found ${res.rows.length} groups of duplicates.`);

        for (const row of res.rows) {
            const ids = row.ids;
            // Keep the first one, delete others
            const toDelete = ids.slice(1);
            console.log(`Cleaning up group "${row.title}" (${row.url}): keeping ${ids[0]}, deleting ${toDelete.length} items.`);

            await pool.query('DELETE FROM menu_items WHERE id = ANY($1)', [toDelete]);
        }

        console.log('Deduplication complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

deduplicate();
