const { pool } = require('../../core/database');

async function findAllTemplates() {
    const result = await pool.query('SELECT * FROM public.page_templates ORDER BY updated_at DESC');
    return result.rows;
}

async function findTemplateById(id) {
    const result = await pool.query('SELECT * FROM public.page_templates WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function createTemplate(fields) {
    const { name, description, structure, theme_config, category, tags, thumbnail } = fields;
    const result = await pool.query(
        `INSERT INTO public.page_templates (name, description, structure, theme_config, category, tags, thumbnail, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
        [
            name || 'Sans titre',
            description || '',
            structure ? (typeof structure === 'string' ? structure : JSON.stringify(structure)) : '{}',
            theme_config ? (typeof theme_config === 'string' ? theme_config : JSON.stringify(theme_config)) : null,
            category || null,
            tags || null,
            thumbnail || null,
        ]
    );
    return result.rows[0];
}

async function updateTemplate(id, fields) {
    const { name, description, structure, theme_config, category, tags, thumbnail } = fields;
    const result = await pool.query(
        `UPDATE public.page_templates
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             structure = COALESCE($3, structure),
             theme_config = COALESCE($4, theme_config),
             category = COALESCE($5, category),
             tags = COALESCE($6, tags),
             thumbnail = COALESCE($7, thumbnail),
             updated_at = NOW()
         WHERE id = $8 RETURNING *`,
        [
            name, description,
            structure ? (typeof structure === 'string' ? structure : JSON.stringify(structure)) : null,
            theme_config ? (typeof theme_config === 'string' ? theme_config : JSON.stringify(theme_config)) : null,
            category, tags, thumbnail,
            id,
        ]
    );
    return result.rows[0] || null;
}

async function deleteTemplate(id) {
    await pool.query('DELETE FROM public.page_templates WHERE id = $1', [id]);
}

module.exports = {
    findAllTemplates, findTemplateById,
    createTemplate, updateTemplate, deleteTemplate,
};
