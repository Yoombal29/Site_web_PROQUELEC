const { Router } = require('express');
const paymentService = require('./payments.service');

const router = Router();

// Generic checkout (auto-selects provider)
router.post('/checkout', async (req, res) => {
  try {
    const { amount, currency, description, metadata, customer, storeName, cancelUrl, returnUrl, provider, channels } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Montant invalide' });
    const session = await paymentService.createCheckoutSession({
      amount, currency, description, metadata, customer, storeName, cancelUrl, returnUrl, channels,
    });
    res.json(session);
  } catch (err) {
    console.error('[PAYMENTS] Checkout error:', err.message);
    res.status(err.code === 'CONFIG_ERROR' ? 503 : 500).json({ error: err.message });
  }
});

// Confirm a payment (check status)
router.post('/confirm', async (req, res) => {
  try {
    const { sessionId, provider } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId requis' });
    const result = await paymentService.confirmPayment(sessionId, provider || 'paydunya');
    res.json(result);
  } catch (err) {
    console.error('[PAYMENTS] Confirm error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PayDunya-specific checkout (returns redirect URL)
router.post('/paydunya/checkout', async (req, res) => {
  try {
    const { amount, currency, description, metadata, customer, storeName, cancelUrl, returnUrl, channels } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Montant invalide' });
    const session = await paymentService.createCheckoutSession({
      amount, currency: currency || 'XOF', description, metadata, customer, storeName, cancelUrl, returnUrl, channels,
    });
    res.json(session);
  } catch (err) {
    console.error('[PAYMENTS] PayDunya error:', err.message);
    res.status(err.code === 'CONFIG_ERROR' ? 503 : 500).json({ error: err.message });
  }
});

module.exports = { router, basePath: '/api/payments' };
