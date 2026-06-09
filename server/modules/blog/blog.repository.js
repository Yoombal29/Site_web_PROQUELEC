const { pool } = require('../../core/database');

// --- Blog Posts ---
async function findAllPublished() {
    const result = await pool.query(`
        SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image_url, p.published_at,
               json_build_object('name', c.name) as blog_categories 
        FROM public.blog_posts p
        LEFT JOIN public.blog_categories c ON p.category_id = c.id
        WHERE p.published_at IS NOT NULL
        ORDER BY p.published_at DESC
    `);
    return result.rows;
}

async function findPublishedBySlug(slug) {
    const result = await pool.query(`
        SELECT p.title, p.content, p.excerpt, p.cover_image_url, p.published_at, p.created_at,
               json_build_object('name', c.name) as blog_categories 
        FROM public.blog_posts p
        LEFT JOIN public.blog_categories c ON p.category_id = c.id
        WHERE p.slug = $1 AND p.published_at IS NOT NULL
    `, [slug]);
    return result.rows[0] || null;
}

async function findAllAdmin() {
    const result = await pool.query(`
        SELECT p.*, json_build_object('name', c.name) as blog_categories 
        FROM public.blog_posts p
        LEFT JOIN public.blog_categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
    `);
    return result.rows;
}

async function create(data) {
    const { title, content, excerpt, slug, cover_image_url, category_id, published_at, author_id } = data;
    const result = await pool.query(
        `INSERT INTO public.blog_posts(title, content, excerpt, slug, cover_image_url, category_id, published_at, author_id, created_at)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
        [title, content, excerpt, slug, cover_image_url, category_id, published_at, author_id]
    );
    return result.rows[0];
}

async function update(id, data) {
    const { title, content, excerpt, slug, cover_image_url, category_id, published_at } = data;
    const result = await pool.query(
        `UPDATE public.blog_posts 
         SET title = $1, content = $2, excerpt = $3, slug = $4, cover_image_url = $5, category_id = $6, published_at = $7, updated_at = NOW()
         WHERE id = $8 RETURNING *`,
        [title, content, excerpt, slug, cover_image_url, category_id, published_at, id]
    );
    return result.rows[0];
}

async function remove(id) {
    await pool.query('DELETE FROM public.blog_posts WHERE id=$1', [id]);
}

// --- Blog Categories ---
async function findAllCategories() {
    const result = await pool.query('SELECT * FROM public.blog_categories ORDER BY name ASC');
    return result.rows;
}

async function createCategory(name) {
    const result = await pool.query('INSERT INTO public.blog_categories (name) VALUES ($1) RETURNING *', [name]);
    return result.rows[0];
}

async function updateCategory(id, name) {
    const result = await pool.query('UPDATE public.blog_categories SET name=$1 WHERE id=$2 RETURNING *', [name, id]);
    return result.rows[0];
}

async function deleteCategory(id) {
    await pool.query('DELETE FROM public.blog_categories WHERE id=$1', [id]);
}

module.exports = {
    findAllPublished, findPublishedBySlug, findAllAdmin,
    create, update, remove,
    findAllCategories, createCategory, updateCategory, deleteCategory,
};
