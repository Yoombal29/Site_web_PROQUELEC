/**
 * Routes de paiement
 * PayDunya webhook + création de paiement
 */
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { createPaydunyaInvoice, confirmPaydunyaPayment } = require('./paydunya.service');
const { authenticateToken } = require('../../middleware/auth');

if (!process.env.DB_PASS) {
  throw new Error(
    '[PAYMENTS] CRITICAL: DB_PASS environment variable is not set. Payment operations require a database password.',
  );
}

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5437'),
  database: process.env.DB_NAME || 'proquelec',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS,
});

router.get('/payment-settings', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.site_settings WHERE key LIKE $1',
      ['payment_%'],
    );

    const settings = {};
    result.rows.forEach((row) => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    });

    res.json({
      providers: settings.payment_providers || {},
      default_provider: settings.payment_default_provider || 'paydunya',
    });
  } catch (err) {
    console.error('[PAYMENT] Public settings error:', err.message);
    res.json({
      providers: {},
      default_provider: 'paydunya',
    });
  }
});

// ── Créer un paiement pour un abonnement ──
router.post('/payments/create', authenticateToken, async (req, res) => {
  try {
    const { planId, userId, email, name, phone } = req.body;
    if (!planId || !userId) return res.status(400).json({ error: 'Plan et utilisateur requis' });

    // Récupérer le plan
    const plan = await pool.query(
      'SELECT * FROM public.subscription_plans WHERE id = $1 AND is_active = true',
      [planId],
    );
    if (plan.rows.length === 0) return res.status(404).json({ error: 'Plan non trouvé' });

    const { name: planName, price, duration_days } = plan.rows[0];
    if (price <= 0)
      return res.status(400).json({ error: 'Plan gratuit, pas de paiement nécessaire' });

    // Créer la facture PayDunya
    const invoice = await createPaydunyaInvoice({
      amount: price,
      description: `Abonnement ${planName} - PROQUELEC (${duration_days} jours)`,
      customerEmail: email,
      customerName: name,
      customerPhone: phone,
      metadata: { plan_id: planId, user_id: userId },
    });

    // Enregistrer la transaction
    await pool.query(
      `INSERT INTO public.user_subscriptions (user_id, plan_id, end_date, payment_status, is_active)
       VALUES ($1, $2, NOW() + INTERVAL '1 day', 'pending', false)
       ON CONFLICT DO NOTHING`,
      [userId, planId],
    );

    res.json({
      success: true,
      invoice_url: invoice.invoice_url,
      token: invoice.token,
    });
  } catch (err) {
    console.error('[PAYMENT] Create error:', err.message);
    res.status(500).json({ error: err.message || 'Erreur paiement' });
  }
});

// ── Webhook PayDunya (appelé après paiement) ──
router.post('/payments/webhook', async (req, res) => {
  try {
    const { token, status, custom_data } = req.body;
    console.log('[WEBHOOK] PayDunya notification:', { token, status, custom_data });

    if (status === 'completed' || status === 'success') {
      const planId = custom_data?.plan_id;
      const userId = custom_data?.user_id;

      if (planId && userId) {
        const plan = await pool.query('SELECT * FROM public.subscription_plans WHERE id = $1', [
          planId,
        ]);
        if (plan.rows.length > 0) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.rows[0].duration_days);

          await pool.query(
            `UPDATE public.user_subscriptions
             SET is_active = true, payment_status = 'completed', end_date = $1, updated_at = NOW()
             WHERE user_id = $2 AND plan_id = $3 AND payment_status = 'pending'`,
            [endDate, userId, planId],
          );
          console.log(`[WEBHOOK] Subscription activated for user ${userId}, plan ${planId}`);
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[WEBHOOK] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Vérifier le statut d'un paiement ──
router.get('/payments/status/:token', authenticateToken, async (req, res) => {
  try {
    const result = await confirmPaydunyaPayment(req.params.token);
    res.json(result || { status: 'unknown' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, basePath: '/api' };
