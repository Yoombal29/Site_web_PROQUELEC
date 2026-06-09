// Health check — exposes system status, capabilities, and feature flags.

'use strict';

const { config } = require('./env');
const { capabilities } = require('./capabilities');
const { getAllFlags } = require('./feature-flags');

/**
 * Build a complete health report.
 */
function getHealthReport() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    mockMode: config.mockMode,
    capabilities: Object.entries(capabilities).map(([key, cap]) => ({
      key,
      available: cap.available,
      mode: cap.mode,
      maturity: cap.maturity,
      warning: cap.warning,
    })),
    featureFlags: getAllFlags(),
    version: process.env.APP_VERSION || '0.0.0',
    uptime: process.uptime(),
  };
}

/**
 * Create an Express health route handler.
 */
function healthRoute(req, res) {
  const report = getHealthReport();
  const isHealthy = Object.values(capabilities).some((c) => c.available);

  if (!isHealthy) {
    return res.status(503).json({ ...report, status: 'degraded' });
  }

  res.json(report);
}

module.exports = {
  getHealthReport,
  healthRoute,
};
