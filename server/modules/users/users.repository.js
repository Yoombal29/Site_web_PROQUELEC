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

module.exports = { findAll, findAllAdmin, findByEmail, create, update, remove, updateStatus };
