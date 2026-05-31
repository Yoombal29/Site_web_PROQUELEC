const { pool } = require('../../core/database');

// --- Pages ---
async function findAllPages() {
    const result = await pool.query('SELECT * FROM public.pages ORDER BY menu_order ASC, updated_at DESC');
    return result.rows;
}

async function findPageBySlug(slug) {
    const result = await pool.query('SELECT * FROM public.pages WHERE slug = $1', [slug]);
    return result.rows[0] || null;
}

async function findPageById(id) {
    const result = await pool.query('SELECT * FROM public.pages WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function findPageBySlugOrId(slugOrId) {
    const result = await pool.query('SELECT * FROM public.pages WHERE slug = $1 OR id::text = $1', [slugOrId]);
    return result.rows[0] || null;
}

async function createPage({ title, slug, content, is_published, meta_description, meta_keywords }) {
    const result = await pool.query(
        'INSERT INTO public.pages (title, slug, content, is_published, meta_description, meta_keywords, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
        [title, slug, content, is_published || false, meta_description, meta_keywords]
    );
    return result.rows[0];
}

async function updatePage(id, fields) {
    const { title, slug, content, structure_json, is_published, meta_description, meta_keywords } = fields;
    const result = await pool.query(
        `UPDATE public.pages 
         SET title = COALESCE($1, title),
             slug = COALESCE($2, slug),
             content = COALESCE($3, content),
             structure_json = COALESCE($4, structure_json),
             is_published = COALESCE($5, is_published),
             meta_description = COALESCE($6, meta_description),
             meta_keywords = COALESCE($7, meta_keywords),
             updated_at = NOW()
         WHERE id::text = $8 OR slug = $8 RETURNING *`,
        [title, slug, content, structure_json ? JSON.stringify(structure_json) : null, is_published, meta_description, meta_keywords, id]
    );
    return result.rows[0] || null;
}

async function deletePage(id) {
    await pool.query('DELETE FROM public.pages WHERE id = $1', [id]);
}

async function adminUpdatePage(id, fields) {
    const {
        content_raw, content, content_blocks, structure_json, design_options, security_level, immutable,
        title, slug, meta_description, meta_keywords, is_published, categories, tags, author,
        excerpt, meta_robots, featured_image, template, show_hero, show_footer,
        custom_css, custom_js, header_html, footer_html,
        hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link,
        workflow_status, publish_date, unpublish_date, reading_time
    } = fields;

    const blocksToSave = content_blocks ?? structure_json;
    const statusVal = workflow_status;

    const result = await pool.query(
        `UPDATE public.pages 
         SET content_raw = COALESCE($1, content_raw),
             content = COALESCE($2, content),
             content_blocks = COALESCE($3, content_blocks),
             structure_json = COALESCE($3, structure_json),
             design_options = COALESCE($4, design_options),
             security_level = COALESCE($5, security_level),
             immutable = COALESCE($6, immutable),
             title = COALESCE($7, title),
             slug = COALESCE($8, slug),
             meta_description = COALESCE($9, meta_description),
             meta_keywords = COALESCE($10, meta_keywords),
             is_published = COALESCE($11, is_published),
             categories = COALESCE($12, categories),
             tags = COALESCE($13, tags),
             author = COALESCE($14, author),
             excerpt = COALESCE($16, excerpt),
             meta_robots = COALESCE($17, meta_robots),
             featured_image = COALESCE($18, featured_image),
             template = COALESCE($19, template),
             show_hero = COALESCE($20, show_hero),
             show_footer = COALESCE($21, show_footer),
             custom_css = COALESCE($22, custom_css),
             custom_js = COALESCE($23, custom_js),
             header_html = COALESCE($24, header_html),
             footer_html = COALESCE($25, footer_html),
             hero_title = COALESCE($26, hero_title),
             hero_subtitle = COALESCE($27, hero_subtitle),
             hero_background_image = COALESCE($28, hero_background_image),
             hero_cta_text = COALESCE($29, hero_cta_text),
             hero_cta_link = COALESCE($30, hero_cta_link),
             status = COALESCE($31, status),
             publish_date = COALESCE($32, publish_date),
             unpublish_date = COALESCE($33, unpublish_date),
             reading_time = COALESCE($34, reading_time),
             version = version + 1,
             updated_at = NOW()
         WHERE slug = $15 OR id::text = $15 RETURNING *`,
        [
            content_raw, content,
            blocksToSave ? (typeof blocksToSave === 'string' ? blocksToSave : JSON.stringify(blocksToSave)) : null,
            design_options ? (typeof design_options === 'string' ? design_options : JSON.stringify(design_options)) : null,
            security_level, immutable,
            title, slug, meta_description, meta_keywords, is_published,
            categories, tags, author,
            id,
            excerpt, meta_robots, featured_image, template, show_hero, show_footer,
            custom_css, custom_js, header_html, footer_html,
            hero_title, hero_subtitle, hero_background_image, hero_cta_text, hero_cta_link,
            statusVal, publish_date, unpublish_date, reading_time
        ]
    );
    return result.rows[0] || null;
}

async function savePageVersion(pageId, version, contentRaw, userId) {
    await pool.query(
        'INSERT INTO public.page_versions (page_id, content_raw, version, created_at, created_by) VALUES ($1, $2, $3, NOW(), $4)',
        [pageId, contentRaw, version, userId]
    );
}

async function findPageVersion(pageId, version) {
    const result = await pool.query('SELECT * FROM public.page_versions WHERE page_id = $1 AND version = $2', [pageId, version]);
    return result.rows[0] || null;
}

// --- Menu Items ---
async function findAllMenuItems() {
    const result = await pool.query('SELECT * FROM public.menu_items ORDER BY menu_order ASC');
    return result.rows;
}

async function createMenuItem(fields) {
    const { title, url, menu_order, parent_id, is_active, menu_type, target, icon, label, linked_page_id } = fields;
    const result = await pool.query(
        'INSERT INTO public.menu_items (title, url, menu_order, parent_id, is_active, menu_type, target, icon, label, linked_page_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [title || '', url || '#', menu_order || 0, parent_id || null, is_active === undefined ? true : is_active, menu_type || 'main', target || '_self', icon || null, label || null, linked_page_id || null]
    );
    return result.rows[0];
}

async function updateMenuItem(id, fields) {
    const updates = [];
    const values = [];
    let paramCounter = 1;
    const allowed = { title, url, menu_order, parent_id, is_active, menu_type, target, icon, label, linked_page_id };

    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && key in allowed) {
            updates.push(`${key} = $${paramCounter}`);
            values.push(value);
            paramCounter++;
        }
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE public.menu_items SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCounter} RETURNING *`;
    const result = await pool.query(sql, values);
    return result.rows[0];
}

async function deleteMenuItem(id) {
    await pool.query('DELETE FROM public.menu_items WHERE id=$1', [id]);
}

async function syncMenuUrlByPageId(pageId, slug) {
    await pool.query(
        'UPDATE public.menu_items SET url = $1, updated_at = NOW() WHERE linked_page_id = $2',
        ['/' + slug, pageId]
    );
}

// --- Construction Mode ---
async function getConstructionMode() {
    const result = await pool.query('SELECT * FROM public.construction_mode WHERE id = 1');
    return result.rows[0] || { is_enabled: false };
}

async function setConstructionMode(isEnabled, userId) {
    const result = await pool.query(
        `INSERT INTO public.construction_mode (id, is_enabled, updated_at, updated_by)
         VALUES (1, $1, NOW(), $2)
         ON CONFLICT (id) DO UPDATE 
         SET is_enabled = $1, updated_at = NOW(), updated_by = $2
         RETURNING *`,
        [isEnabled, userId]
    );
    return result.rows[0];
}

// --- Draft Autosave ---
async function saveDraft(pageId, draftJson) {
    const jsonStr = typeof draftJson === 'string' ? draftJson : JSON.stringify(draftJson);
    const result = await pool.query(
        `UPDATE public.pages SET draft_json = $1, updated_at = NOW() WHERE id = $2 RETURNING id, draft_json, updated_at`,
        [jsonStr, pageId]
    );
    return result.rows[0] || null;
}

// --- Named Versions (Checkpoints) ---
async function createNamedVersion(pageId, versionName, structureJson, createdBy) {
    const jsonStr = typeof structureJson === 'string' ? structureJson : JSON.stringify(structureJson);
    const result = await pool.query(
        `INSERT INTO public.page_versions (page_id, version_name, structure_json, created_at, created_by)
         VALUES ($1, $2, $3, NOW(), $4) RETURNING *`,
        [pageId, versionName, jsonStr, createdBy || 'admin']
    );

    // Enforce 50-version cap: delete oldest versions beyond the limit
    await pool.query(
        `DELETE FROM public.page_versions
         WHERE page_id = $1 AND id NOT IN (
           SELECT id FROM public.page_versions WHERE page_id = $1
           ORDER BY created_at DESC LIMIT 50
         )`,
        [pageId]
    );

    return result.rows[0];
}

async function listNamedVersions(pageId) {
    const result = await pool.query(
        `SELECT id, page_id, version_name, created_at, created_by
         FROM public.page_versions
         WHERE page_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [pageId]
    );
    return result.rows;
}

async function findNamedVersionById(versionId) {
    const result = await pool.query(
        `SELECT * FROM public.page_versions WHERE id = $1`,
        [versionId]
    );
    return result.rows[0] || null;
}

// --- Theme Config ---
async function saveThemeConfig(pageId, themeConfig) {
    const jsonStr = typeof themeConfig === 'string' ? themeConfig : JSON.stringify(themeConfig);
    const result = await pool.query(
        `UPDATE public.pages SET theme_config = $1, updated_at = NOW() WHERE id = $2 RETURNING id, theme_config`,
        [jsonStr, pageId]
    );
    return result.rows[0] || null;
}

module.exports = {
    findAllPages, findPageBySlug, findPageById, findPageBySlugOrId,
    createPage, updatePage, deletePage, adminUpdatePage,
    savePageVersion, findPageVersion,
    saveDraft, createNamedVersion, listNamedVersions, findNamedVersionById, saveThemeConfig,
    findAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, syncMenuUrlByPageId,
    getConstructionMode, setConstructionMode,
};
