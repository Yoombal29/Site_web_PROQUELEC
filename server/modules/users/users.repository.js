const { pool } = require('../../core/database');

async function findAll() {
    const result = await pool.query(
        'SELECT id, email, role, is_active as status, created_at FROM public.users ORDER BY created_at DESC'
    );
    return result.rows;
}

async function findAllAdmin() {
    const result = await pool.query(
        'SELECT id, email, role, is_active, created_at FROM public.users ORDER BY created_at DESC'
    );
    return result.rows;
}

async function findByEmail(email) {
    const result = await pool.query('SELECT id FROM public.users WHERE email = $1', [email]);
    return result.rows[0] || null;
}

async function create({ email, passwordHash, role, isActive }) {
    const result = await pool.query(
        `INSERT INTO public.users (email, password_hash, role, is_active, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, email, role, is_active, created_at`,
        [email, passwordHash, role || 'user', isActive === true]
    );
    return result.rows[0];
}

async function update(id, fields) {
    const updates = [];
    const params = [];
    let idx = 1;

    if (fields.email) { updates.push(`email = $${idx++}`); params.push(String(fields.email).trim().toLowerCase()); }
    if (fields.role) { updates.push(`role = $${idx++}`); params.push(fields.role); }
    if (typeof fields.is_active !== 'undefined') { updates.push(`is_active = $${idx++}`); params.push(!!fields.is_active); }
    if (fields.passwordHash) { updates.push(`password_hash = $${idx++}`); params.push(fields.passwordHash); }

    if (updates.length === 0) return null;

    params.push(fields.id);
    const query = `UPDATE public.users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email, role, is_active, created_at`;
    const result = await pool.query(query, params);
    return result.rows[0];
}

async function remove(id) {
    await pool.query('DELETE FROM public.users WHERE id = $1', [id]);
}

async function updateStatus(id, isActive) {
    const result = await pool.query(
        'UPDATE public.users SET is_active = $1 WHERE id = $2 RETURNING id, email, role, is_active, created_at',
        [!!isActive, id]
    );
    return result.rows[0];
}

async function getDirectPermissions(userId) {
    const userResult = await pool.query('SELECT id, role FROM public.users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return null;

    const directResult = await pool.query(`
        SELECT p.name, up.granted
        FROM public.user_permissions up
        JOIN public.permissions p ON p.id = up.permission_id
        WHERE up.user_id = $1
        ORDER BY p.name
    `, [userId]);

    const effectiveResult = await pool.query(`
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
    `, [userResult.rows[0].role, userId]);

    return {
        permissions: effectiveResult.rows.map(row => row.name),
        direct_permissions: directResult.rows.filter(row => row.granted === true).map(row => row.name),
        revoked_permissions: directResult.rows.filter(row => row.granted === false).map(row => row.name),
    };
}

async function setDirectPermissions(userId, permissions, grantedBy) {
    const client = await pool.connect();
    try {
        const userResult = await client.query('SELECT id FROM public.users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) return null;

        await client.query('BEGIN');
        await client.query('DELETE FROM public.user_permissions WHERE user_id = $1', [userId]);

        for (const permission of permissions) {
            await client.query(`
                INSERT INTO public.user_permissions (user_id, permission_id, granted, granted_by)
                SELECT $1, id, true, $3
                FROM public.permissions
                WHERE name = $2
                ON CONFLICT (user_id, permission_id)
                DO UPDATE SET granted = true, granted_by = EXCLUDED.granted_by, granted_at = NOW()
            `, [userId, permission, grantedBy]);
        }

        await client.query('COMMIT');
        return { success: true, saved: permissions.length };
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    findAll,
    findAllAdmin,
    findByEmail,
    create,
    update,
    remove,
    updateStatus,
    getDirectPermissions,
    setDirectPermissions,
};
