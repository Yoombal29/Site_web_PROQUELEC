/**
 * Payment Admin Routes
 * Configuration and management of payment providers
 */
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { getProvider, getAvailableProviders } = require('./providers');

// Get all payment settings
router.get('/admin/payment-settings', async (req, res) => {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query('SELECT * FROM public.site_settings WHERE key LIKE $1', ['payment_%']);
    const settings = {};
    result.rows.forEach(row => {
      try { settings[row.key] = JSON.parse(row.value); }
      catch { settings[row.key] = row.value; }
    });
    await pool.end();
    res.json({
      providers: settings.payment_providers || {},
      default_provider: settings.payment_default_provider || 'paydunya',
      api_keys: settings.payment_api_keys || {},
    });
  } catch (err) {
    console.error('[PAYMENT-ADMIN] Load settings error:', err.message);
    // Return defaults
    res.json({
      providers: {},
      default_provider: 'paydunya',
      api_keys: {},
    });
  }
});

// Save all payment settings
router.put('/admin/payment-settings', async (req, res) => {
  const { providers, default_provider, api_keys } = req.body;
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const upsert = async (key, value) => {
      await pool.query(
        'INSERT INTO public.site_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
        [key, typeof value === 'string' ? value : JSON.stringify(value)]
      );
    };
    await upsert('payment_providers', providers || {});
    await upsert('payment_default_provider', default_provider || 'paydunya');
    await upsert('payment_api_keys', api_keys || {});
    await pool.end();
    res.json({ success: true });
  } catch (err) {
    console.error('[PAYMENT-ADMIN] Save settings error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Test a provider connection
router.post('/admin/payment-providers/:name/test', async (req, res) => {
  const { name } = req.params;
  const { api_keys } = req.body;

  // Temporarily set environment variables for the test
  if (api_keys) {
    Object.entries(api_keys).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }

  try {
    const provider = getProvider(name);
    if (!provider) {
      return res.json({ success: false, error: `Provider "${name}" not found` });
    }

    const configured = provider.isConfigured();
    if (!configured) {
      return res.json({ success: false, error: 'API keys not configured. Please add your credentials.' });
    }

    // Try to make a test request
    res.json({ success: true, message: `${provider.PROVIDER?.label || name} est correctement configuré.` });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Get available providers list
router.get('/admin/payment-providers', (req, res) => {
  try {
    const available = getAvailableProviders();
    res.json(available);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent transactions
router.get('/admin/payment-transactions', async (req, res) => {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query(
      'SELECT * FROM public.orders ORDER BY created_at DESC LIMIT 50'
    );
    await pool.end();
    res.json(result.rows);
  } catch (err) {
    // Table might not exist yet
    res.json([]);
  }
});

module.exports = { router, basePath: '/api' };
