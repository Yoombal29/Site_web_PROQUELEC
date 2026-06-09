const fs = require('fs');
const path = require('path');
const env = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL=(.+)/);
if (!dbUrlMatch) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}
const dbUrl = dbUrlMatch[1].trim();

const { Pool } = require('pg');
const pool = new Pool({ connectionString: dbUrl });

async function fixDB() {
    try {
        console.log('Fixing public.partners...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.partners (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                logo_url TEXT,
                category TEXT,
                display_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('Fixing public.blog_posts cover_image_url...');
        await pool.query(`
            ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
        `);

        console.log('Fixing public.cossuel_dossiers...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.cossuel_dossiers (
                id SERIAL PRIMARY KEY,
                dossier_number TEXT UNIQUE NOT NULL,
                status TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('Fixing public.cossuel_sync_logs...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.cossuel_sync_logs (
                id SERIAL PRIMARY KEY,
                sync_timestamp TIMESTAMP DEFAULT NOW(),
                status TEXT,
                message TEXT,
                records_processed INTEGER DEFAULT 0
            );
        `);

        console.log('All missing tables/columns added successfully!');
    } catch (err) {
        console.error('Failed to fix DB:', err);
    } finally {
        pool.end();
    }
}

fixDB();
