// Runtime environment configuration
// Loads and validates environment variables, provides a typed config object.

'use strict';

const REQUIRED_IN_PROD = [
  'JWT_SECRET',
];

/**
 * Runtime environment mode.
 * @returns {'development' | 'production' | 'test'}
 */
function nodeEnv() {
  return process.env.NODE_ENV || 'development';
}

/**
 * Whether we are in a specific environment.
 */
const isDev = () => nodeEnv() === 'development';
const isProd = () => nodeEnv() === 'production';
const isTest = () => nodeEnv() === 'test';

/**
 * Application configuration derived from environment variables.
 * All values have safe defaults for development.
 */
const config = Object.freeze({
  // ── Environment ──
  nodeEnv: nodeEnv(),
  isDev: isDev(),
  isProd: isProd(),
  isTest: isTest(),

  // ── Server ──
  port: parseInt(process.env.PORT || '3010', 10),
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3010',

  // ── Database ──
  databaseUrl: process.env.DATABASE_URL || '',
  dbHost: process.env.DB_HOST || '127.0.0.1',
  dbPort: parseInt(process.env.DB_PORT || '5437', 10),
  dbName: process.env.DB_NAME || 'proquelec',

  // ── Auth ──
  jwtSecret: process.env.JWT_SECRET || (isProd() ? '' : 'dev-secret-do-not-use-in-prod'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // ── Runtime Modes (explicit opt-in) ──
  mockMode: process.env.MOCK_MODE === 'true',
  enablePayments: process.env.ENABLE_PAYMENTS === 'true',
  enableCossuel: process.env.ENABLE_COSSUEL === 'true',
  smtpHost: process.env.SMTP_HOST || null,
  enableEmail: process.env.ENABLE_EMAIL === 'true',
  enableSignature: process.env.ENABLE_SIGNATURE === 'true',

  // ── External Services ──
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  cossuelApiUrl: process.env.COSSUEL_API_URL || 'https://api.cossuel.sn/v1',
  cossuelApiKey: process.env.COSSUEL_API_KEY || '',

  // ── Feature maturity labels ──
  featureMaturity: Object.freeze({
    builder: 'stable',
    layout: 'stable',
    animations: 'beta',
    collaboration: 'experimental',
    virtualRenderer: 'beta',
    exports: 'beta',
    cossuel: isProd() ? 'stable' : 'experimental',
    payments: process.env.ENABLE_PAYMENTS === 'true' ? 'beta' : 'experimental',
    electronicSignature: 'experimental',
    aiGeneration: 'beta',
  }),
});

/**
 * Validate required config for production.
 * Throws on missing critical values.
 */
function validate() {
  if (!isProd()) return;

  const missing = REQUIRED_IN_PROD.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(', ')}`,
    );
  }

  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is required in production');
  }

  if (!config.jwtSecret || config.jwtSecret === 'changeme_en_production') {
    throw new Error('JWT_SECRET must be changed from default in production');
  }
}

module.exports = {
  config,
  nodeEnv,
  isDev,
  isProd,
  isTest,
  validate,
};
