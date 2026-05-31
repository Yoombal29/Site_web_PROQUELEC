'use strict';

const { config } = require('./env');
const { capabilities, getCapability, requireCapability } = require('./capabilities');
const { featureFlags, isEnabled, getAllFlags } = require('./feature-flags');
const { getHealthReport, healthRoute } = require('./health');

module.exports = {
  config,
  capabilities,
  getCapability,
  requireCapability,
  featureFlags,
  isEnabled,
  getAllFlags,
  getHealthReport,
  healthRoute,
};
