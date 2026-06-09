require('dotenv').config();
const { Pool } = require('pg');

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const r1 = await client.query('SELECT count(*)::int AS cnt FROM public.cossuel_dossiers');
    const r2 = await client.query('SELECT count(*)::int AS cnt FROM public.cossuel_sync_logs');
    const r3 = await client.query('SELECT count(*)::int AS cnt FROM public.cossuel_stats_daily');
    console.log(`dossiers: ${r1.rows[0].cnt}, logs: ${r2.rows[0].cnt}, stats: ${r3.rows[0].cnt}`);
  } catch (e) {
    console.error('Erreur:', e.message || e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
