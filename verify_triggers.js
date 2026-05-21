import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkTriggers() {
    try {
        const result = await pool.query(`
            SELECT trigger_name, event_manipulation, event_object_table
            FROM information_schema.triggers
            WHERE trigger_name IN (
                'pages_notify_insert',
                'pages_notify_update',
                'pages_notify_delete',
                'theme_settings_notify_update',
                'media_files_notify_insert',
                'media_files_notify_update',
                'media_files_notify_delete',
                'menu_items_notify_update'
            )
            ORDER BY trigger_name;
        `);
        
        console.log('✅ Triggers found:', result.rows.length);
        result.rows.forEach(row => {
            console.log(`  - ${row.trigger_name} [${row.event_manipulation} on ${row.event_object_table}]`);
        });
        
        if (result.rows.length === 8) {
            console.log('\n✨ All 8 triggers successfully created!');
        } else {
            console.log(`\n⚠️  Expected 8 triggers but found ${result.rows.length}`);
        }
    } catch (err) {
        console.error('❌ Database error:', err.message);
    } finally {
        await pool.end();
    }
}

checkTriggers();
