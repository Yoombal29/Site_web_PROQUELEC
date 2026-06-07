/**
 * Routes admin pour la gestion des plans d'abonnement
 *
 * GET    /api/admin/subscription-plans       → Liste tous les plans
 * POST   /api/admin/subscription-plans       → Créer un plan
 * PUT    /api/admin/subscription-plans/:id   → Modifier un plan
 * DELETE /api/admin/subscription-plans/:id   → Supprimer un plan
 */
import { Router } from 'express';

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
    // Migration : ajouter les colonnes billing_mode et credits
    await pool.query(`
      ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS billing_mode TEXT DEFAULT 'monthly';
      ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;
    `).catch(err => console.warn('[PLANS] Migration:', err.message));
  }
  return pool;
}

// GET /api/admin/subscription-plans
router.get('/admin/subscription-plans', authenticate, async (req, res) => {
  try {
    const p = await getPool();
    const result = await p.query('SELECT * FROM public.subscription_plans ORDER BY price');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/subscription-plans
router.post('/admin/subscription-plans', authenticate, async (req, res) => {
  try {
    const { name, description, price, duration_days, features, billing_mode, credits, is_premium } = req.body;
    const p = await getPool();
    const result = await p.query(
      `INSERT INTO public.subscription_plans (name, description, price, duration_days, features, billing_mode, credits, is_premium, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *`,
      [name, description, price, duration_days || 30, features || [], billing_mode || 'monthly', credits || 0, is_premium !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/subscription-plans/:id
router.put('/admin/subscription-plans/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration_days, features, billing_mode, credits, is_premium, is_active } = req.body;
    const p = await getPool();
    const result = await p.query(
      `UPDATE public.subscription_plans SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        duration_days = COALESCE($4, duration_days),
        features = COALESCE($5, features),
        billing_mode = COALESCE($6, billing_mode),
        credits = COALESCE($7, credits),
        is_premium = COALESCE($8, is_premium),
        is_active = COALESCE($9, is_active)
       WHERE id = $10 RETURNING *`,
      [name, description, price, duration_days, features, billing_mode, credits, is_premium, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plan non trouve' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/subscription-plans/:id
router.delete('/admin/subscription-plans/:id', authenticate, async (req, res) => {
  try {
    const p = await getPool();
    await p.query('DELETE FROM public.subscription_plans WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { router, basePath: '/api' };
