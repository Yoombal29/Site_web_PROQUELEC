const { Pool } = require('pg');
const p = new Pool({ connectionString: 'postgresql://postgres:proquelec_secure_db_pass@127.0.0.1:5437/proquelec' });

(async () => {
  const client = await p.connect();
  try {
    // Drop and recreate cossuel_dossiers with correct schema matching the sync-engine
    console.log('--- Recreating cossuel_dossiers ---');
    await client.query('DROP TABLE IF EXISTS public.cossuel_dossiers CASCADE');
    await client.query(`
      CREATE TABLE public.cossuel_dossiers (
        id TEXT PRIMARY KEY,
        dossier_number TEXT,
        region TEXT,
        status TEXT,
        installation_type TEXT,
        submission_date TIMESTAMPTZ,
        last_sync_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('  ✅ cossuel_dossiers recreated with TEXT id');

    // Drop and recreate cossuel_sync_logs with correct schema
    console.log('--- Recreating cossuel_sync_logs ---');
    await client.query('DROP TABLE IF EXISTS public.cossuel_sync_logs CASCADE');
    await client.query(`
      CREATE TABLE public.cossuel_sync_logs (
        id SERIAL PRIMARY KEY,
        started_at TIMESTAMPTZ,
        finished_at TIMESTAMPTZ,
        status TEXT,
        records_processed INTEGER DEFAULT 0,
        errors_count INTEGER DEFAULT 0,
        details TEXT,
        message TEXT,
        sync_timestamp TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('  ✅ cossuel_sync_logs recreated');

    // Ensure cossuel_stats_daily exists
    console.log('--- Ensuring cossuel_stats_daily ---');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.cossuel_stats_daily (
        date DATE PRIMARY KEY,
        total_dossiers INTEGER DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('  ✅ cossuel_stats_daily ensured');

    console.log('\n✅ All COSSUEL tables fixed!');
  } catch (e) {
    console.error('Fatal error:', e.message);
  } finally {
    client.release();
    await p.end();
  }
})();
