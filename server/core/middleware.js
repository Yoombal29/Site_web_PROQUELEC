const jwt = require('jsonwebtoken');
const z = require('zod');
const { pool } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;

function validate(schema, source = 'body') {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const errors = result.error.issues.map(i => ({
                field: i.path.join('.'),
                message: i.message
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

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès refusé. Droits administrateur requis.' });
    }
    next();
}

function requirePermission(permissionName) {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            const permissionCheck = await pool.query(`
                SELECT EXISTS(
                    SELECT 1 FROM public.role_permissions rp
                    JOIN public.permissions p ON rp.permission_id = p.id
                    WHERE rp.role = $1 AND p.name = $2
                    UNION
                    SELECT 1 FROM public.user_permissions up
                    JOIN public.permissions p ON up.permission_id = p.id
                    WHERE up.user_id = $3 AND p.name = $2 AND up.granted = true
                ) as has_permission
            `, [userRole, permissionName, userId]);

            if (!permissionCheck.rows[0].has_permission) {
                return res.status(403).json({
                    error: 'Permission refusée',
                    required_permission: permissionName,
                    your_role: userRole
                });
            }

            next();
        } catch (err) {
            console.error('[RBAC] Erreur vérification permission:', err);
            res.status(500).json({ error: 'Échec de la vérification des permissions' });
        }
    };
}

module.exports = { authenticateToken, requireAdmin, requirePermission, validate, JWT_SECRET };
