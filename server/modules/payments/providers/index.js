/**
 * Payment Provider Registry
 * Unified interface for all payment providers.
 * New providers register themselves here.
 */

const providers = {};

// Auto-load all provider files from this directory
const fs = require('fs');
const path = require('path');

fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.service.js') && file !== 'index.js')
  .forEach(file => {
    const providerName = file.replace('.service.js', '');
    try {
      const provider = require(`./${file}`);
      providers[providerName] = provider;
      console.log(`[PAYMENT] Loaded provider: ${providerName}`);
    } catch (err) {
      console.warn(`[PAYMENT] Failed to load provider ${providerName}:`, err.message);
    }
  });

/**
 * Get a provider by name
 */
function getProvider(name) {
  const provider = providers[name];
  if (!provider) throw new Error(`Payment provider "${name}" not found. Available: ${Object.keys(providers).join(', ')}`);
  return provider;
}

/**
 * Get all available providers
 */
function getAvailableProviders() {
  return Object.keys(providers).map(name => ({
    name,
    label: providers[name].label || name,
    icon: providers[name].icon || 'credit-card',
    enabled: true, // Will be filtered by admin settings at runtime
  }));
}

module.exports = { getProvider, getAvailableProviders, providers };
