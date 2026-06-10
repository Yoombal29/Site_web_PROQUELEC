const express = require('express');
const router = express.Router();
const { pool } = require('../core/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// E-mail du superadmin principal (seul à pouvoir modifier la matrice)
const SUPERADMIN_EMAIL = 'oumarkebe@proquelec.sn';

/** Middleware : seul le superadmin principal peut modifier la matrice */
function requireSuperAdmin(req, res, next) {
  const email = req.user?.email;

  if (email !== SUPERADMIN_EMAIL) {
    return res.status(403).json({
      error: 'Accès refusé. Seul le superadmin principal oumarkebe@proquelec.sn peut modifier la matrice des permissions builder.',
    });
  }
  next();
}

// ─────────────────────────────────────────────────────────────
// GET /api/admin/builder-permissions
// Retourne toutes les permissions builder.* + leur statut par rôle
// ─────────────────────────────────────────────────────────────
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Toutes les permissions de la catégorie "builder"
    const permsResult = await pool.query(`
      SELECT id, name, description, category
      FROM public.permissions
      WHERE category = 'builder'
      ORDER BY name
    `);

    // Mapping role → permissions builder accordées
    const rolePermsResult = await pool.query(`
      SELECT rp.role, p.name as permission_name
      FROM public.role_permissions rp
      JOIN public.permissions p ON rp.permission_id = p.id
      WHERE p.category = 'builder'
      ORDER BY rp.role, p.name
    `);

    // Rôles distincts qui ont au moins une permission builder OU qui existent
    const roles = ['superadmin', 'admin', 'secondary_admin', 'partner', 'electricien', 'entreprise', 'membre'];

    // Construire la matrice : { role → Set<permissionName> }
    const matrix = {};
    roles.forEach(r => { matrix[r] = new Set(); });

    rolePermsResult.rows.forEach(row => {
      if (matrix[row.role]) {
        matrix[row.role].add(row.permission_name);
      }
    });

    // Sérialiser les Sets en tableaux
    const matrixOut = {};
    Object.entries(matrix).forEach(([role, set]) => {
      matrixOut[role] = Array.from(set);
    });

    res.json({
      permissions: permsResult.rows,
      matrix: matrixOut,
      roles,
      superadmin_email: SUPERADMIN_EMAIL,
    });
  } catch (err) {
    console.error('[Builder Perms] GET error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des permissions builder' });
  }
});

// ─────────────────────────────────────────────────────────────
// PATCH /api/admin/builder-permissions
// Modifie la matrice : accorde ou révoque une permission builder sur un rôle
// Body: { role: string, permission: string, granted: boolean }
// ─────────────────────────────────────────────────────────────
router.patch('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { role, permission, granted } = req.body;

  if (!role || !permission || typeof granted !== 'boolean') {
    return res.status(400).json({ error: 'Champs requis : role, permission (string), granted (boolean)' });
  }

  // Sécurité : on ne peut modifier que les permissions builder.*
  if (!permission.startsWith('builder.')) {
    return res.status(400).json({ error: 'Seules les permissions builder.* sont modifiables via cette route.' });
  }

  // Le superadmin ne peut pas perdre ses propres droits builder, sauf si c'est oumarkebe@proquelec.sn qui fait la modification
  if (role === 'superadmin' && !granted && req.user.email !== SUPERADMIN_EMAIL) {
    return res.status(403).json({ error: 'Impossible de révoquer les permissions builder du rôle superadmin.' });
  }

  try {
    // Récupérer l'ID de la permission
    const permResult = await pool.query(
      `SELECT id FROM public.permissions WHERE name = $1 AND category = 'builder'`,
      [permission]
    );

    if (permResult.rows.length === 0) {
      return res.status(404).json({ error: `Permission "${permission}" introuvable.` });
    }

    const permId = permResult.rows[0].id;

    if (granted) {
      // Accorder la permission
      await pool.query(
        `INSERT INTO public.role_permissions (role, permission_id)
         VALUES ($1, $2)
         ON CONFLICT (role, permission_id) DO NOTHING`,
        [role, permId]
      );
    } else {
      // Révoquer la permission
      await pool.query(
        `DELETE FROM public.role_permissions WHERE role = $1 AND permission_id = $2`,
        [role, permId]
      );
    }

    // Log de l'action
    console.log(`[Builder Perms] ${granted ? '✅ GRANT' : '❌ REVOKE'} → role=${role} permission=${permission} by=${req.user.email}`);

    res.json({
      success: true,
      action: granted ? 'granted' : 'revoked',
      role,
      permission,
      modified_by: req.user.email,
    });
  } catch (err) {
    console.error('[Builder Perms] PATCH error:', err);
    res.status(500).json({ error: 'Erreur lors de la modification de la permission' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/admin/builder-permissions/user
// Retourne les permissions builder de l'utilisateur connecté
// (combine permissions du rôle + overrides individuels)
// ─────────────────────────────────────────────────────────────
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await pool.query(`
      SELECT DISTINCT p.name
      FROM public.permissions p
      WHERE p.category = 'builder'
      AND (
        -- Permission accordée via le rôle
        EXISTS (
          SELECT 1 FROM public.role_permissions rp
          WHERE rp.role = $1 AND rp.permission_id = p.id
        )
        OR
        -- Permission accordée individuellement à cet utilisateur
        EXISTS (
          SELECT 1 FROM public.user_permissions up
          WHERE up.user_id = $2 AND up.permission_id = p.id AND up.granted = true
        )
      )
      AND NOT EXISTS (
        -- Permission explicitement révoquée pour cet utilisateur
        SELECT 1 FROM public.user_permissions up
        WHERE up.user_id = $2 AND up.permission_id = p.id AND up.granted = false
      )
      ORDER BY p.name
    `, [userRole, userId]);

    res.json({
      permissions: result.rows.map(r => r.name),
      role: userRole,
    });
  } catch (err) {
    console.error('[Builder Perms] GET /user error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des permissions utilisateur' });
  }
});

module.exports = router;
