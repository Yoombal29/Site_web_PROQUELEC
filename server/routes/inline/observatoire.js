const { authenticateToken, requireAdmin } = require('../../core/middleware');

function mountObservatoireRoutes(app, pool) {
  // 1. Stats Globales
  app.get('/api/observatoire/stats', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM public.cossuel_stats_daily ORDER BY date DESC LIMIT 1');
      res.json(result.rows[0] || { total_dossiers: 0, total_inspections: 0 });
    } catch (e) {
      console.error('[OBSERVATOIRE] Stats Error:', e.message);
      res.status(500).json({ error: 'Erreur récupération stats' });
    }
  });

  // 2. Dossiers Récents
  app.get('/api/observatoire/dossiers', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM public.cossuel_dossiers ORDER BY submission_date DESC LIMIT 50');
      res.json(result.rows);
    } catch (e) {
      console.error('[OBSERVATOIRE] Dossiers Error:', e.message);
      res.status(500).json({ error: 'Erreur récupération dossiers' });
    }
  });

  // 3. Stats par Région (pour la Carte)
  app.get('/api/observatoire/map/stats', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT region, status, COUNT(*) as count FROM public.cossuel_dossiers GROUP BY region, status');
      const regionalStats = {};
      result.rows.forEach((row) => {
        if (!regionalStats[row.region]) regionalStats[row.region] = { total: 0, conformes: 0, non_conformes: 0 };
        regionalStats[row.region].total += parseInt(row.count);
        if (row.status === 'CONFORME') regionalStats[row.region].conformes += parseInt(row.count);
        if (row.status === 'NON_CONFORME') regionalStats[row.region].non_conformes += parseInt(row.count);
      });
      res.json(regionalStats);
    } catch (e) {
      console.error('[OBSERVATOIRE] Map Stats Error:', e.message);
      res.status(500).json({ error: 'Erreur stats régionales' });
    }
  });

  // 4. Déclenchement Manuel Sync (Admin)
  app.post('/api/observatoire/sync/trigger', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { runSyncCycle } = require('../../sync-engine');
      runSyncCycle().catch((err) => console.error('[SYNC] Manual trigger error:', err));
      res.json({ message: 'Synchronisation déclenchée. Consultez les logs pour le résultat.' });
    } catch (err) {
      console.error('[SYNC] Trigger failed:', err);
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = { mountObservatoireRoutes };
