const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkAIRequestsLog() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'ai_requests_log'
            ORDER BY ordinal_position
        `);

        console.log('\n=== ai_requests_log columns ===');
        result.rows.forEach(row => {
            console.log(`${row.column_name}: ${row.data_type}`);
        });

        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkAIRequestsLog();
