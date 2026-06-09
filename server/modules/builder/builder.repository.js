const { pool } = require('../../core/database');

// ─── SNAPSHOTS ───────────────────────────────────────────────────────────────

async function findSnapshotsByPage(pageId) {
    const result = await pool.query(
        'SELECT * FROM public.builder_snapshots WHERE page_id = $1 ORDER BY created_at DESC',
        [pageId]
    );
    return result.rows;
}

async function findSnapshotById(id) {
    const result = await pool.query(
        'SELECT * FROM public.builder_snapshots WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
}

async function createSnapshot({ page_id, label, snapshot, snapshot_type, metadata, created_by }) {
    const result = await pool.query(
        `INSERT INTO public.builder_snapshots (page_id, label, snapshot, snapshot_type, metadata, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [page_id, label, JSON.stringify(snapshot), snapshot_type, JSON.stringify(metadata), created_by]
    );
    return result.rows[0];
}

async function deleteSnapshot(id) {
    await pool.query('DELETE FROM public.builder_snapshots WHERE id = $1', [id]);
}

// ─── TEMPLATES ───────────────────────────────────────────────────────────────

async function findTemplates({ category, tags } = {}) {
    let sql = 'SELECT * FROM public.builder_templates';
    const params = [];
    const conditions = [];

    if (category) {
        params.push(category);
        conditions.push(`category = $${params.length}`);
    }
    if (tags && tags.length > 0) {
        params.push(tags);
        conditions.push(`tags && $${params.length}`);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY is_system DESC, name ASC';

    const result = await pool.query(sql, params);
    return result.rows;
}

async function findTemplateById(id) {
    const result = await pool.query('SELECT * FROM public.builder_templates WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function createTemplate({ name, category, description, preview_image, blocks, layout_tree, theme_config, animation_config, tags, is_system, created_by }) {
    const result = await pool.query(
        `INSERT INTO public.builder_templates (name, category, description, preview_image, blocks, layout_tree, theme_config, animation_config, tags, is_system, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [name, category, description || null, preview_image || null, JSON.stringify(blocks), JSON.stringify(layout_tree || []), JSON.stringify(theme_config || {}), JSON.stringify(animation_config || {}), tags || [], is_system || false, created_by]
    );
    return result.rows[0];
}

async function updateTemplate(id, fields) {
    const setClauses = [];
    const params = [];
    let paramIndex = 0;

    for (const [key, value] of Object.entries(fields)) {
        paramIndex++;
        if (key === 'tags') {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(value || []);
        } else if (key === 'blocks' || key === 'layout_tree' || key === 'theme_config' || key === 'animation_config') {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(JSON.stringify(value));
        } else {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(value);
        }
    }

    if (setClauses.length === 0) return null;

    params.push(id);
    const sql = `UPDATE public.builder_templates SET ${setClauses.join(', ')} WHERE id = $${paramIndex + 1} RETURNING *`;
    const result = await pool.query(sql, params);
    return result.rows[0] || null;
}

async function deleteTemplate(id) {
    await pool.query('DELETE FROM public.builder_templates WHERE id = $1', [id]);
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

async function findComponents({ category, global: isGlobal, tags } = {}) {
    let sql = 'SELECT * FROM public.builder_components';
    const params = [];
    const conditions = [];

    if (category) {
        params.push(category);
        conditions.push(`category = $${params.length}`);
    }
    if (isGlobal !== undefined) {
        params.push(isGlobal);
        conditions.push(`is_global = $${params.length}`);
    }
    if (tags && tags.length > 0) {
        params.push(tags);
        conditions.push(`tags && $${params.length}`);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY name ASC';

    const result = await pool.query(sql, params);
    return result.rows;
}

async function findComponentById(id) {
    const result = await pool.query('SELECT * FROM public.builder_components WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function createComponent({ name, category, schema, preview_image, is_global, tags, created_by }) {
    const result = await pool.query(
        `INSERT INTO public.builder_components (name, category, schema, preview_image, is_global, tags, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, category || 'custom', JSON.stringify(schema), preview_image || null, is_global || false, tags || [], created_by]
    );
    return result.rows[0];
}

async function updateComponent(id, fields) {
    const setClauses = [];
    const params = [];
    let paramIndex = 0;

    for (const [key, value] of Object.entries(fields)) {
        paramIndex++;
        if (key === 'schema') {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(JSON.stringify(value));
        } else if (key === 'tags') {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(value || []);
        } else {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(value);
        }
    }

    if (setClauses.length === 0) return null;

    params.push(id);
    const sql = `UPDATE public.builder_components SET ${setClauses.join(', ')}, version = version + 1 WHERE id = $${paramIndex + 1} RETURNING *`;
    const result = await pool.query(sql, params);
    return result.rows[0] || null;
}

async function deleteComponent(id) {
    await pool.query('DELETE FROM public.builder_components WHERE id = $1', [id]);
}

// ─── BINDINGS ────────────────────────────────────────────────────────────────

async function findBindingsByPage(pageId) {
    const result = await pool.query(
        'SELECT * FROM public.builder_bindings WHERE page_id = $1 ORDER BY created_at ASC',
        [pageId]
    );
    return result.rows;
}

async function findBindingById(id) {
    const result = await pool.query('SELECT * FROM public.builder_bindings WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function createBinding({ page_id, node_id, source_type, source_config, mapping, refresh_interval }) {
    const result = await pool.query(
        `INSERT INTO public.builder_bindings (page_id, node_id, source_type, source_config, mapping, refresh_interval)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [page_id, node_id, source_type, JSON.stringify(source_config), JSON.stringify(mapping || {}), refresh_interval || 0]
    );
    return result.rows[0];
}

async function updateBinding(id, fields) {
    const setClauses = [];
    const params = [];
    let paramIndex = 0;

    for (const [key, value] of Object.entries(fields)) {
        paramIndex++;
        if (key === 'source_config' || key === 'mapping') {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(JSON.stringify(value));
        } else {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(value);
        }
    }

    if (setClauses.length === 0) return null;

    params.push(id);
    const sql = `UPDATE public.builder_bindings SET ${setClauses.join(', ')} WHERE id = $${paramIndex + 1} RETURNING *`;
    const result = await pool.query(sql, params);
    return result.rows[0] || null;
}

async function deleteBinding(id) {
    await pool.query('DELETE FROM public.builder_bindings WHERE id = $1', [id]);
}

// ─── PLUGINS ─────────────────────────────────────────────────────────────────

async function findPlugins({ enabled } = {}) {
    let sql = 'SELECT * FROM public.builder_plugins';
    const params = [];

    if (enabled !== undefined) {
        sql += ' WHERE enabled = $1';
        params.push(enabled);
    }
    sql += ' ORDER BY load_order ASC, name ASC';

    const result = await pool.query(sql, params);
    return result.rows;
}

async function findPluginByName(name) {
    const result = await pool.query('SELECT * FROM public.builder_plugins WHERE name = $1', [name]);
    return result.rows[0] || null;
}

async function upsertPlugin({ name, display_name, description, version, enabled, config, dependencies, load_order }) {
    const result = await pool.query(
        `INSERT INTO public.builder_plugins (name, display_name, description, version, enabled, config, dependencies, load_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (name) DO UPDATE SET
           display_name = COALESCE($2, builder_plugins.display_name),
           description = COALESCE($3, builder_plugins.description),
           version = COALESCE($4, builder_plugins.version),
           enabled = COALESCE($5, builder_plugins.enabled),
           config = CASE WHEN $6::jsonb IS NOT NULL THEN $6 ELSE builder_plugins.config END,
           dependencies = COALESCE($7, builder_plugins.dependencies),
           load_order = COALESCE($8, builder_plugins.load_order)
         RETURNING *`,
        [name, display_name || null, description || null, version || '1.0.0', enabled !== undefined ? enabled : false, config ? JSON.stringify(config) : null, dependencies || [], load_order || 0]
    );
    return result.rows[0];
}

async function togglePlugin(name, enabled) {
    const result = await pool.query(
        'UPDATE public.builder_plugins SET enabled = $1 WHERE name = $2 RETURNING *',
        [enabled, name]
    );
    return result.rows[0] || null;
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

async function findExportsByPage(pageId) {
    const result = await pool.query(
        'SELECT * FROM public.builder_exports WHERE page_id = $1 ORDER BY generated_at DESC',
        [pageId]
    );
    return result.rows;
}

async function createExport({ page_id, snapshot_id, format, output_path, output_size, content_hash, metadata, generated_by }) {
    const result = await pool.query(
        `INSERT INTO public.builder_exports (page_id, snapshot_id, format, output_path, output_size, content_hash, metadata, generated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [page_id, snapshot_id || null, format, output_path || null, output_size || null, content_hash || null, JSON.stringify(metadata || {}), generated_by]
    );
    return result.rows[0];
}

// ─── COLLABORATION ───────────────────────────────────────────────────────────

async function findCollaborationByPage(pageId) {
    const result = await pool.query(
        'SELECT * FROM public.builder_collaboration WHERE page_id = $1',
        [pageId]
    );
    return result.rows[0] || null;
}

async function upsertCollaboration({ page_id, ydoc_state, awareness }) {
    const result = await pool.query(
        `INSERT INTO public.builder_collaboration (page_id, ydoc_state, awareness, last_synced_at, connected_peers)
         VALUES ($1, $2, $3, NOW(), 1)
         ON CONFLICT (page_id) DO UPDATE SET
           ydoc_state = $2,
           awareness = $3,
           last_synced_at = NOW(),
           connected_peers = builder_collaboration.connected_peers
         RETURNING *`,
        [page_id, ydoc_state || null, JSON.stringify(awareness || {})]
    );
    return result.rows[0];
}

async function updateCollaborationPeers(pageId, delta) {
    const result = await pool.query(
        `UPDATE public.builder_collaboration
         SET connected_peers = GREATEST(0, connected_peers + $1), last_synced_at = NOW()
         WHERE page_id = $2 RETURNING *`,
        [delta, pageId]
    );
    return result.rows[0] || null;
}

// ─── PAGE ENRICHMENT ─────────────────────────────────────────────────────────

async function updatePageBuilderFields(pageId, fields) {
    const setClauses = [];
    const params = [];
    let paramIndex = 0;

    const jsonColumns = ['layout_tree', 'theme_config', 'bindings', 'animation_config'];

    for (const [key, value] of Object.entries(fields)) {
        paramIndex++;
        if (jsonColumns.includes(key)) {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(JSON.stringify(value));
        } else {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(value);
        }
    }

    if (setClauses.length === 0) return null;

    params.push(pageId);
    const sql = `UPDATE public.pages SET ${setClauses.join(', ')} WHERE id = $${paramIndex + 1} RETURNING *`;
    const result = await pool.query(sql, params);
    return result.rows[0] || null;
}

module.exports = {
    findSnapshotsByPage,
    findSnapshotById,
    createSnapshot,
    deleteSnapshot,
    findTemplates,
    findTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    findComponents,
    findComponentById,
    createComponent,
    updateComponent,
    deleteComponent,
    findBindingsByPage,
    findBindingById,
    createBinding,
    updateBinding,
    deleteBinding,
    findPlugins,
    findPluginByName,
    upsertPlugin,
    togglePlugin,
    findExportsByPage,
    createExport,
    findCollaborationByPage,
    upsertCollaboration,
    updateCollaborationPeers,
    updatePageBuilderFields,
};
