const jwt = require('jsonwebtoken');
const z = require('zod');
const { pool } = require('./database');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;
  if (!secret) {
    console.warn('[SECURITY] JWT_SECRET non défini! Utilisez une clé forte en production.');
    return 'changeme-en-production';
  }
  return secret;
}

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({ error: 'Validation échouée', details: errors });
    }
    req[source] = result.data;
    next();
  };
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, getJwtSecret(), (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ error: 'Accès refusé. Droits administrateur requis.' });
  }
  next();
}

function requirePermission(permissionName) {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      const permissionCheck = await pool.query(
        `
                SELECT EXISTS(
                    SELECT 1
                    FROM public.permissions p
                    WHERE p.name = $2
                    AND (
                        EXISTS (
                            SELECT 1
                            FROM public.role_permissions rp
                            WHERE rp.role = $1 AND rp.permission_id = p.id
                        )
                        OR EXISTS (
                            SELECT 1
                            FROM public.user_permissions up
                            WHERE up.user_id = $3
                              AND up.permission_id = p.id
                              AND up.granted = true
                        )
                    )
                    AND NOT EXISTS (
                        SELECT 1
                        FROM public.user_permissions up
                        WHERE up.user_id = $3
                          AND up.permission_id = p.id
                          AND up.granted = false
                    )
                ) as has_permission
            `,
        [userRole, permissionName, userId],
      );

      if (!permissionCheck.rows[0].has_permission) {
        return res.status(403).json({
          error: 'Permission refusée',
          required_permission: permissionName,
          your_role: userRole,
        });
      }

      next();
    } catch (err) {
      console.error('[RBAC] Erreur vérification permission:', err);
      res.status(500).json({ error: 'Échec de la vérification des permissions' });
    }
  };
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requirePermission,
  validate,
  getJwtSecret,
  get JWT_SECRET() {
    return getJwtSecret();
  },
};
