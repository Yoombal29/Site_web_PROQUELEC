const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrateAIRequestsLog() {
    try {
        console.log('Adding missing columns to ai_requests_log...');

        // Add response_length column
        await pool.query(`
            ALTER TABLE public.ai_requests_log 
            ADD COLUMN IF NOT EXISTS response_length INTEGER
        `);
        console.log('✓ Added response_length column');

        // Add model_used column
        await pool.query(`
            ALTER TABLE public.ai_requests_log 
            ADD COLUMN IF NOT EXISTS model_used TEXT
        `);
        console.log('✓ Added model_used column');

        console.log('\n✅ Migration completed successfully!');
        await pool.end();
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrateAIRequestsLog();
