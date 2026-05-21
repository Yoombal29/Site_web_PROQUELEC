const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const { rows: functions } = await pool.query("SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE 'menu_items%'");
        console.log('Menu Items related functions:');
        functions.forEach(f => console.log(`- ${f.routine_name}`));

        const { rows: triggers } = await pool.query("SELECT trigger_name, event_manipulation, event_object_table FROM information_schema.triggers WHERE event_object_table = 'menu_items'");
        console.log('\nMenu Items triggers:');
        triggers.forEach(t => console.log(`- ${t.trigger_name} on ${t.event_object_table} (${t.event_manipulation})`));
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}

check();
