const { pool } = require('../../core/database');

async function queryAll(table, orderBy = 'created_at DESC') {
    const result = await pool.query(`SELECT * FROM public.${table} ORDER BY ${orderBy}`);
    return result.rows;
}

async function queryByCondition(table, condition, params) {
    const result = await pool.query(`SELECT * FROM public.${table} WHERE ${condition}`, params);
    return result.rows[0] || null;
}

async function insertOne(table, columns, values, placeholders) {
    const result = await pool.query(
        `INSERT INTO public.${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        values
    );
    return result.rows[0];
}

async function updateOne(table, id, columns, values) {
    const sets = columns.map((col, i) => `${col}=$${i + 1}`).join(', ');
    values.push(id);
    const result = await pool.query(
        `UPDATE public.${table} SET ${sets} WHERE id=$${values.length} RETURNING *`,
        values
    );
    return result.rows[0];
}

async function deleteOne(table, id) {
    await pool.query(`DELETE FROM public.${table} WHERE id=$1`, [id]);
}

// --- Electrical Standards ---
async function findByCode(code) {
    const result = await pool.query('SELECT * FROM public.electrical_standards WHERE code = $1', [code]);
    return result.rows[0] || null;
}

async function searchStandards(query) {
    const result = await pool.query(
        `SELECT * FROM public.electrical_standards 
         WHERE title ILIKE $1 OR description ILIKE $1 OR code ILIKE $1 OR summary ILIKE $1
         ORDER BY code ASC LIMIT 50`,
        [`%${query}%`]
    );
    return result.rows;
}

module.exports = {
    queryAll, queryByCondition, insertOne, updateOne, deleteOne, findByCode, searchStandards,
};
