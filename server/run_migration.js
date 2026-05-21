
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    try {
        console.log('Starting migration...');
        await pool.query(`
            DO $$ 
            BEGIN 
                -- Site Settings Missing Columns
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='phone_number') THEN
                    ALTER TABLE public.site_settings ADD COLUMN phone_number TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='facebook_url') THEN
                    ALTER TABLE public.site_settings ADD COLUMN facebook_url TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='linkedin_url') THEN
                    ALTER TABLE public.site_settings ADD COLUMN linkedin_url TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='twitter_url') THEN
                    ALTER TABLE public.site_settings ADD COLUMN twitter_url TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='copyright_text') THEN
                    ALTER TABLE public.site_settings ADD COLUMN copyright_text TEXT;
                END IF;

                -- Theme Settings Missing Columns
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='accent_color') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN accent_color TEXT DEFAULT '#ea580c';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='background_color') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN background_color TEXT DEFAULT '#ffffff';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='text_color') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN text_color TEXT DEFAULT '#1f2937';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='font_family') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN font_family TEXT DEFAULT 'Inter';
                END IF;
            END $$;
        `);
        console.log('Migration successful.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
