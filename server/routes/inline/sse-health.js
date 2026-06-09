const { authenticateToken, requireAdmin } = require('../../core/middleware');
const { sendSseEvent, addSseClient, removeSseClient, getSseStats } = require('../../core/sse');

function mountSseHealthRoutes(app, pool) {
  // --- SSE ---
  app.get('/api/events', (req, res) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders && res.flushHeaders();
    res.write(':connected\n\n');
    addSseClient(res);
    console.log(`[SSE] Client connected. Active: ${getSseStats().activeConnections}`);
    req.on('close', () => {
      removeSseClient(res);
      console.log(`[SSE] Client disconnected. Active: ${getSseStats().activeConnections}`);
    });
    req.on('error', (err) => {
      console.warn(`[SSE] Client error:`, err.message);
      removeSseClient(res);
    });
  });

  app.get('/api/events/stats', (req, res) => {
    res.json({
      ...getSseStats(),
      timestamp: new Date().toISOString(),
    });
  });

  // --- Health ---
  app.get('/api/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', database: 'connected', version: '1.2.0', timestamp: new Date() });
    } catch (err) {
      res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
  });

  app.get('/health', async (req, res) => {
    try {
      const start = Date.now();
      const dbResult = await pool.query('SELECT NOW() as now, version()');
      const duration = Date.now() - start;
      res.json({
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          status: 'healthy',
          latency: `${duration}ms`,
          version: dbResult.rows[0].version,
        },
        environment: process.env.NODE_ENV || 'development',
      });
    } catch (err) {
      res.status(503).json({
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: { status: 'degraded', error: err.message },
        environment: process.env.NODE_ENV || 'development',
      });
    }
  });

  app.get('/', (req, res) => {
    res.json({
      status: 'running',
      message: 'PROQUELEC Enterprise API is active',
      features: ['Self-Healing', 'Auto-Normalization', 'Deep-Diagnostics'],
      version: '1.2.0',
    });
  });
}

module.exports = { mountSseHealthRoutes };
