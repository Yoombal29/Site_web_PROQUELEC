const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    try {
        console.log('🚀 Starting Page Sections migration...');

        // 1. Add page_sections column to site_settings
        console.log('Adding page_sections column to site_settings...');
        await pool.query(`
            ALTER TABLE public.site_settings 
            ADD COLUMN IF NOT EXISTS page_sections JSONB DEFAULT '{}';
        `);

        console.log('✅ Migration for page_sections complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
