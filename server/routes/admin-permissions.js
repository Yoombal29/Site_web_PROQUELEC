/**
 * Routes admin pour permissions et abonnements
 *
 * GET    /api/admin/permissions         → Liste toutes les permissions disponibles
 * PUT    /api/admin/users/:id/permissions  → Définir les permissions d'un utilisateur
 * GET    /api/admin/subscriptions/user/:id → Abonnement d'un utilisateur
 * POST   /api/admin/subscriptions/force    → Forcer un abonnement
 * POST   /api/admin/subscriptions/:id/cancel → Annuler un abonnement
 */

import { Router } from 'express';
import bcrypt from 'bcrypt';

const router = Router();

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Non authentifie' });
  try {
    const payload = JSON.parse(Buffer.from(auth.split('.')[1], 'base64').toString());
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

let pool = null;
async function getPool() {
  if (!pool) {
    const { default: pg } = await import('pg');
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

// PUT /api/admin/users/:id/permissions
router.put('/admin/users/:id/permissions', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    const p = await getPool();

    // Supprimer les anciennes permissions
    await p.query('DELETE FROM public.user_permissions WHERE user_id = $1', [id]);

    // Ajouter les nouvelles
    if (permissions && Array.isArray(permissions)) {
      for (const perm of permissions) {
        await p.query(
          `INSERT INTO public.user_permissions (user_id, permission_id, granted)
           SELECT $1, id, true FROM public.permissions WHERE name = $2 ON CONFLICT DO NOTHING`,
          [id, perm]
        );
      }
    }

    res.json({ success: true, saved: permissions?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/subscriptions/user/:id
router.get('/admin/subscriptions/user/:id', authenticate, async (req, res) => {
  try {
    const p = await getPool();
    const result = await p.query(
      `SELECT us.*, sp.name as plan_name, sp.price, sp.features
       FROM public.user_subscriptions us
       JOIN public.subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = $1 AND us.is_active = true
       ORDER BY us.end_date DESC LIMIT 1`,
      [req.params.id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/subscriptions/force
router.post('/admin/subscriptions/force', authenticate, async (req, res) => {
  try {
    const { user_id, plan_id, end_date } = req.body;
    const p = await getPool();

    // Désactiver les anciens abonnements
    await p.query(
      `UPDATE public.user_subscriptions SET is_active = false WHERE user_id = $1`,
      [user_id]
    );

    // Créer le nouvel abonnement
    const result = await p.query(
      `INSERT INTO public.user_subscriptions (user_id, plan_id, end_date, payment_status, is_active)
       VALUES ($1, $2, $3, 'admin_forced', true) RETURNING *`,
      [user_id, plan_id, end_date || new Date(Date.now() + 365 * 24 * 3600 * 1000)]
    );

    res.json({ success: true, subscription: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/subscriptions/:id/cancel
router.post('/admin/subscriptions/:id/cancel', authenticate, async (req, res) => {
  try {
    const p = await getPool();
    await p.query(
      `UPDATE public.user_subscriptions SET is_active = false, payment_status = 'cancelled' WHERE id = $1`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { router, basePath: '/api' };
