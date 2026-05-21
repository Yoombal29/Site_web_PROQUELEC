
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:proquelec_secure_db_pass@localhost:5433/postgres'
});

async function migrate() {
    try {
        console.log("Starting migration for professional_training table...");

        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professional_training' AND column_name='duration_hours') THEN
                    ALTER TABLE public.professional_training ADD COLUMN duration_hours INTEGER;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professional_training' AND column_name='max_participants') THEN
                    ALTER TABLE public.professional_training ADD COLUMN max_participants INTEGER;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professional_training' AND column_name='instructor_name') THEN
                    ALTER TABLE public.professional_training ADD COLUMN instructor_name TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professional_training' AND column_name='location') THEN
                    ALTER TABLE public.professional_training ADD COLUMN location TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professional_training' AND column_name='equipment_provided') THEN
                    ALTER TABLE public.professional_training ADD COLUMN equipment_provided BOOLEAN DEFAULT false;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professional_training' AND column_name='prerequisites') THEN
                    ALTER TABLE public.professional_training ADD COLUMN prerequisites TEXT[];
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professional_training' AND column_name='learning_objectives') THEN
                    ALTER TABLE public.professional_training ADD COLUMN learning_objectives TEXT[];
                END IF;

                -- Move duration to duration_hours if it exists and duration_hours is empty
                UPDATE public.professional_training SET duration_hours = duration::integer WHERE duration_hours IS NULL AND duration IS NOT NULL AND duration ~ '^[0-9]+$';
            END $$;
        `);

        console.log("Migration completed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

migrate();
