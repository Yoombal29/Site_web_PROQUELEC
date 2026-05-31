const service = require('./blog.service');

async function listPosts(req, res) {
    try {
        const posts = await service.listPublished();
        res.json(posts);
    } catch (err) {
        console.error('Error fetching blog posts:', err);
        res.status(500).json({ error: err.message });
    }
}

async function getPost(req, res) {
    try {
        const { slug } = req.params;
        const post = await service.getPublished(slug);
        res.json(post);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function listAdminPosts(req, res) {
    try {
        const posts = await service.listAll();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createPost(req, res) {
    try {
        const post = await service.create(req.body, req.user.id);
        res.status(201).json(post);
    } catch (err) {
        console.error('Error creating blog post:', err);
        res.status(500).json({ error: err.message });
    }
}

async function updatePost(req, res) {
    try {
        const { id } = req.params;
        const post = await service.update(id, req.body);
        res.json(post);
    } catch (err) {
        console.error('Error updating blog post:', err);
        res.status(500).json({ error: err.message });
    }
}

async function deletePost(req, res) {
    try {
        await service.remove(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// --- Categories ---
async function listCategories(req, res) {
    try {
        const cats = await service.listCategories();
        res.json(cats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createCategory(req, res) {
    try {
        const { name } = req.body;
        const cat = await service.createCategory(name);
        res.status(201).json(cat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const cat = await service.updateCategory(id, name);
        res.json(cat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteCategory(req, res) {
    try {
        await service.deleteCategory(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    listPosts, getPost, listAdminPosts, createPost, updatePost, deletePost,
    listCategories, createCategory, updateCategory, deleteCategory,
};
