const repo = require('./blog.repository');

// --- Posts ---
async function listPublished() {
    return repo.findAllPublished();
}

async function getPublished(slug) {
    const post = await repo.findPublishedBySlug(slug);
    if (!post) throw Object.assign(new Error('Post not found'), { status: 404 });
    return post;
}

async function listAll() {
    return repo.findAllAdmin();
}

async function create(data, userId) {
    return repo.create({ ...data, author_id: userId });
}

async function update(id, data) {
    return repo.update(id, data);
}

async function remove(id) {
    await repo.remove(id);
}

// --- Categories ---
async function listCategories() {
    return repo.findAllCategories();
}

async function createCategory(name) {
    return repo.createCategory(name);
}

async function updateCategory(id, name) {
    return repo.updateCategory(id, name);
}

async function deleteCategory(id) {
    await repo.deleteCategory(id);
}

module.exports = {
    listPublished, getPublished, listAll, create, update, remove,
    listCategories, createCategory, updateCategory, deleteCategory,
};
