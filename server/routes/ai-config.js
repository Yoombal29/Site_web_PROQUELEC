/**
 * Routes API pour la configuration IA (stockée en base de données)
 *
 * GET  /api/ai/config    → Récupère toutes les configs
 * POST /api/ai/config    → Sauvegarde une ou plusieurs configs
 * POST /api/ai/change-admin-password → Change le mot de passe superadmin
 *
 * Clés supportées dans ai_config :
 *   password, security_answer, admin_password
 *   provider_XX_key, provider_XX_enabled
 */

import { Router } from 'express';

const router = Router();

// Middleware d'authentification
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Non authentifie' });
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Format token invalide' });
  }
  try {
    const payload = JSON.parse(Buffer.from(parts[1].split('.')[1], 'base64').toString());
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_config (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      INSERT INTO ai_config (key, value)
      SELECT * FROM (VALUES
        ('password', 'Touba28'),
        ('security_answer', 'CORAN'),
        ('admin_password', 'admin123'),
        ('provider_groq_key', ''),
        ('provider_groq_enabled', 'false'),
        ('provider_openai_key', ''),
        ('provider_openai_enabled', 'false'),
        ('provider_anthropic_key', ''),
        ('provider_anthropic_enabled', 'false'),
        ('provider_gemini_key', ''),
        ('provider_gemini_enabled', 'false'),
        ('provider_deepseek_key', ''),
        ('provider_deepseek_enabled', 'false'),
        ('provider_together_key', ''),
        ('provider_together_enabled', 'false'),
        ('provider_openrouter_key', ''),
        ('provider_openrouter_enabled', 'false'),
        ('provider_fireworks_key', ''),
        ('provider_fireworks_enabled', 'false'),
        ('provider_mistral_key', ''),
        ('provider_mistral_enabled', 'false'),
        ('provider_ollama_enabled', 'false')
      ) AS v(key, value)
      WHERE NOT EXISTS (SELECT 1 FROM ai_config);
    `).catch(err => console.warn('[AI-CONFIG] Init:', err.message));
  }
  return pool;
}

router.get('/ai/config', authenticate, async (req, res) => {
  try {
    const p = await getPool();
    const result = await p.query('SELECT key, value, updated_at FROM ai_config ORDER BY key');
    const configs = {};
    for (const row of result.rows) {
      if (row.key.endsWith('_key') && row.value.length > 8) {
        configs[row.key] = row.value.slice(-4).padStart(row.value.length, '\u2022');
        configs[row.key + '_raw'] = row.value;
      } else {
        configs[row.key] = row.value;
      }
    }
    res.json({ success: true, configs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/ai/config', authenticate, async (req, res) => {
  try {
    const { configs } = req.body;
    if (!configs || typeof configs !== 'object') {
      return res.status(400).json({ success: false, error: 'Body doit contenir un objet configs' });
    }
    const p = await getPool();
    let saved = 0;
    for (const [key, value] of Object.entries(configs)) {
      const allowedPrefixes = ['password', 'security_answer', 'admin_password', 'provider_'];
      const isAllowed = allowedPrefixes.some(prefix => key.startsWith(prefix));
      if (!isAllowed) continue;
      await p.query(
        'INSERT INTO ai_config (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
        [key, String(value)]
      );
      saved++;
    }
    res.json({ success: true, saved, message: saved + ' configuration(s) sauvegardee(s)' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/ai/change-admin-password', authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Mot de passe trop court (min. 6 caracteres)' });
    }
    const bcrypt = (await import('bcrypt')).default;
    const hashedPassword = await bcrypt.hash(password, 10);
    const p = await getPool();
    await p.query(
      "UPDATE public.users SET password_hash = $1, updated_at = NOW() WHERE role = 'admin'",
      [hashedPassword]
    );
    await p.query(
      "INSERT INTO ai_config (key, value, updated_at) VALUES ('admin_password', $1, NOW()) ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()",
      [password]
    );
    res.json({ success: true, message: 'Mot de passe administrateur modifie' });
  } catch (err) {
    console.error('[AI-CONFIG] Change admin password error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export { router, basePath: '/api' };
