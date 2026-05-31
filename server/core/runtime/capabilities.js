// Runtime capabilities — derived from env, consumed by all modules.
// Every module should check capabilities before acting, never silently mock.

'use strict';

const { config } = require('./env');

/**
 * Runtime capabilities object.
 * - `available`: feature is fully operational
 * - `mode`: 'real' | 'mock' | 'unavailable'
 * - `maturity`: 'experimental' | 'beta' | 'stable' | 'certified'
 * - `warning`: human-readable explanation if not fully available
 *
 * Every capability is explicit — no silent fallbacks.
 */
const capabilities = Object.freeze({
  database: {
    available: !!config.databaseUrl,
    mode: config.databaseUrl ? 'real' : 'unavailable',
    warning: !config.databaseUrl ? 'Aucune base de données configurée' : null,
  },

  email: {
    available: config.enableEmail && !!config.smtpHost,
    mode: config.enableEmail && config.smtpHost ? 'real' : config.mockMode ? 'mock' : 'unavailable',
    maturity: config.enableEmail && config.smtpHost ? 'stable' : 'experimental',
    warning: !config.smtpHost
      ? 'SMTP non configuré — les emails ne sont pas envoyés'
      : config.mockMode
        ? 'Mode mock — les emails sont simulés'
        : null,
  },

  cossuel: {
    available: config.enableCossuel && !!config.cossuelApiKey,
    mode: config.enableCossuel && config.cossuelApiKey ? 'real' : config.mockMode ? 'mock' : 'unavailable',
    maturity: config.enableCossuel ? 'stable' : 'experimental',
    warning: config.mockMode
      ? 'SYNC COSSUEL EN MODE MOCK — les données d\'inspection sont simulées'
      : !config.cossuelApiKey
        ? 'Clé API COSSUEL manquante'
        : null,
  },

  payments: {
    available: config.enablePayments,
    mode: config.enablePayments ? 'real' : config.mockMode ? 'mock' : 'unavailable',
    maturity: config.featureMaturity.payments,
    warning: !config.enablePayments
      ? 'Paiement non disponible — fonctionnalité désactivée'
      : config.mockMode
        ? 'Mode mock — les paiements sont simulés'
        : null,
  },

  electronicSignature: {
    available: config.enableSignature,
    mode: config.enableSignature ? 'real' : config.mockMode ? 'mock' : 'unavailable',
    maturity: 'experimental',
    warning: config.enableSignature
      ? 'Signature électronique active'
      : 'Signature électronique désactivée — seuls des hash d\'intégrité sont générés',
  },

  aiGeneration: {
    available: !!config.geminiApiKey,
    mode: config.geminiApiKey ? 'real' : config.mockMode ? 'mock' : 'unavailable',
    maturity: 'beta',
    warning: !config.geminiApiKey
      ? 'Clé API Gemini manquante — la génération IA n\'est pas disponible'
      : null,
  },

  collaboration: {
    available: true,
    mode: config.mockMode ? 'mock' : 'real',
    maturity: 'experimental',
    warning: null,
  },

  builder: {
    available: true,
    mode: 'real',
    maturity: 'stable',
    warning: null,
  },

  exports: {
    available: true,
    mode: config.mockMode ? 'mock' : 'real',
    maturity: 'beta',
    warning: config.mockMode
      ? 'Mode mock — certains exports utilisent des formats simplifiés'
      : null,
  },

  analytics: {
    available: !!config.databaseUrl,
    mode: config.databaseUrl ? 'real' : 'mock',
    maturity: 'beta',
    warning: !config.databaseUrl
      ? 'Base de données non disponible — les analytics utilisent des données simulées'
      : null,
  },
});

/**
 * Get a specific capability.
 */
function getCapability(name) {
  return capabilities[name] || {
    available: false,
    mode: 'unavailable',
    maturity: 'experimental',
    warning: `Capabilité inconnue: ${name}`,
  };
}

/**
 * Check if a capability is available. If not, return a structured response
 * instead of silently falling back.
 */
function requireCapability(name) {
  const cap = getCapability(name);
  if (!cap.available && cap.mode !== 'mock') {
    const err = new Error(`Service non disponible: ${name}`);
    err.code = 'SERVICE_UNAVAILABLE';
    err.capability = cap;
    throw err;
  }
  return cap;
}

module.exports = {
  capabilities,
  getCapability,
  requireCapability,
};
