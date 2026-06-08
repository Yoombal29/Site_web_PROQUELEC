const { pool } = require('../../core/database');

async function findByEmail(email) {
    const result = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
    return result.rows[0] || null;
}

async function findById(id) {
    const result = await pool.query('SELECT id, email, role, is_active FROM public.users WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function create({ email, passwordHash, role, fullName, phone, company }) {
    let result;
    try {
        result = await pool.query(
            `INSERT INTO public.users (email, password_hash, role, is_active, full_name, phone, company, created_at)
             VALUES ($1, $2, $3, true, $4, $5, $6, NOW()) RETURNING id, email, role, is_active`,
            [email, passwordHash, role, fullName || null, phone || null, company || null]
        );
    } catch (e) {
        result = await pool.query(
            `INSERT INTO public.users (email, password_hash, role, created_at)
             VALUES ($1, $2, $3, NOW()) RETURNING id, email, role, is_active`,
            [email, passwordHash, role]
        );
    }
    return result.rows[0];
}

async function getUserPermissions(userId, userRole) {
    const result = await pool.query(`
        SELECT DISTINCT p.name
        FROM public.permissions p
        WHERE (
            EXISTS (
                SELECT 1
                FROM public.role_permissions rp
                WHERE rp.role = $1 AND rp.permission_id = p.id
            )
            OR EXISTS (
                SELECT 1
                FROM public.user_permissions up
                WHERE up.user_id = $2
                  AND up.permission_id = p.id
                  AND up.granted = true
            )
        )
        AND NOT EXISTS (
            SELECT 1
            FROM public.user_permissions up
            WHERE up.user_id = $2
              AND up.permission_id = p.id
              AND up.granted = false
        )
        ORDER BY p.name
    `, [userRole, userId]);
    return result.rows.map(row => row.name);
}

async function getAllPermissions() {
    const result = await pool.query(`
        SELECT id, name, description, category, created_at
        FROM public.permissions
        ORDER BY category, name
    `);
    return result.rows;
}

async function getRolePermissions() {
    const result = await pool.query(`
        SELECT rp.role, array_agg(p.name ORDER BY p.name) as permissions
        FROM public.role_permissions rp
        JOIN public.permissions p ON rp.permission_id = p.id
        GROUP BY rp.role
        ORDER BY rp.role
    `);
    return result.rows;
}

async function patchRolePermission(role, permissionName, granted) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Trouver l'ID de la permission
        const permRes = await client.query('SELECT id FROM public.permissions WHERE name = $1', [permissionName]);
        if (permRes.rows.length === 0) {
            throw new Error(`Permission ${permissionName} introuvable`);
        }
        const permissionId = permRes.rows[0].id;

        if (granted) {
            await client.query(
                `INSERT INTO public.role_permissions (role, permission_id) 
                 VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [role, permissionId]
            );
        } else {
            await client.query(
                `DELETE FROM public.role_permissions WHERE role = $1 AND permission_id = $2`,
                [role, permissionId]
            );
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { findByEmail, findById, create, getUserPermissions, getAllPermissions, getRolePermissions, patchRolePermission };
