/**
 * Premium Access Middleware
 * Checks if user has an active premium subscription
 * or if the tool was manually activated for them.
 */

const { Pool } = require('pg');

/**
 * Middleware: require premium subscription
 * Blocks access if user doesn't have an active premium subscription
 */
function requirePremium(req, res, next) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  pool.query(
    `SELECT us.*, sp.is_premium FROM public.user_subscriptions us
     JOIN public.subscription_plans sp ON us.plan_id = sp.id
     WHERE us.user_id = $1
     AND us.is_active = true
     AND us.end_date > NOW()
     AND (sp.is_premium = true OR us.manually_activated = true)
     ORDER BY us.end_date DESC LIMIT 1`,
    [req.user.id]
  )
  .then(result => {
    pool.end();
    if (result.rows.length > 0) {
      req.premium = result.rows[0];
      return next();
    }
    return res.status(403).json({
      error: 'PREMIUM_REQUIRED',
      message: 'Cette fonctionnalité nécessite un abonnement Premium. Souscrivez sur /abonnements'
    });
  })
  .catch(err => {
    pool.end();
    console.error('[PREMIUM] Check error:', err.message);
    return res.status(500).json({ error: 'Erreur de vérification d\'accès' });
  });
}

/**
 * Check if a user has premium access (for UI display)
 * Returns the subscription data or null
 */
async function checkPremiumAccess(userId) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const result = await pool.query(
      `SELECT us.*, sp.name as plan_name, sp.is_premium FROM public.user_subscriptions us
       JOIN public.subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = $1
       AND us.is_active = true
       AND us.end_date > NOW()
       ORDER BY us.end_date DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('[PREMIUM] Check error:', err.message);
    return null;
  } finally {
    pool.end();
  }
}

module.exports = { requirePremium, checkPremiumAccess };
