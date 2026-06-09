// Feature flags — allows runtime toggling of features without deployment.
// In production, flags could be loaded from DB or a flags service.

'use strict';

const { config } = require('./env');

/**
 * Feature flag definitions.
 * Each flag has:
 * - `enabled`: boolean — is the feature active?
 * - `owner`: which team/feature owns it
 * - `description`: what it controls
 */
const featureFlags = Object.freeze({
  // Phase flags for gradual rollout
  newCollaboration: {
    enabled: !config.isProd || process.env.FF_NEW_COLLAB === 'true',
    owner: 'builder',
    description: 'Nouveau moteur de collaboration temps réel',
  },
  incrementalLayout: {
    enabled: true,
    owner: 'builder',
    description: 'Moteur de layout incrémental (dirty tracking)',
  },
  patchHistory: {
    enabled: true,
    owner: 'builder',
    description: 'Historique basé sur patches Immer',
  },
  virtualizedCanvas: {
    enabled: !config.isProd || process.env.FF_VIRTUALIZED_CANVAS === 'true',
    owner: 'builder',
    description: 'Canvas virtualisé avec rendu viewport-only',
  },

  // Integration flags
  cossuelSync: {
    enabled: config.enableCossuel,
    owner: 'sync',
    description: 'Synchronisation avec le système COSSUEL',
  },
  emailDelivery: {
    enabled: config.enableEmail,
    owner: 'notifications',
    description: 'Envoi d\'emails transactionnels',
  },
  paymentProcessing: {
    enabled: config.enablePayments,
    owner: 'billing',
    description: 'Traitement des paiements en ligne',
  },

  // Product maturity flags
  builderExport: {
    enabled: true,
    owner: 'builder',
    description: 'Export React/HTML/JSON depuis le builder',
  },
  aiGeneration: {
    enabled: !!config.geminiApiKey,
    owner: 'ai',
    description: 'Génération de contenu par IA',
  },
});

/**
 * Check if a feature flag is enabled.
 */
function isEnabled(flagName) {
  const flag = featureFlags[flagName];
  if (!flag) return false;
  return flag.enabled;
}

/**
 * Get all flags (for API or health endpoint).
 */
function getAllFlags() {
  return Object.entries(featureFlags).map(([key, value]) => ({
    key,
    enabled: value.enabled,
    owner: value.owner,
    description: value.description,
  }));
}

module.exports = {
  featureFlags,
  isEnabled,
  getAllFlags,
};
