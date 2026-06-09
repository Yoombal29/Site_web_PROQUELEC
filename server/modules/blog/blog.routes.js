const { Router } = require('express');
const controller = require('./blog.controller');
const { authenticateToken, validate } = require('../../core/middleware');
const {
    createPostSchema, updatePostSchema,
    createCategorySchema, updateCategorySchema
} = require('./blog.validator');

const router = Router();

router.get('/blog-posts', controller.listPosts);
router.get('/blog-posts/:slug', controller.getPost);

router.get('/admin/blog-posts', authenticateToken, controller.listAdminPosts);
router.post('/blog-posts', authenticateToken, validate(createPostSchema), controller.createPost);
router.put('/blog-posts/:id', authenticateToken, validate(updatePostSchema), controller.updatePost);
router.delete('/blog-posts/:id', authenticateToken, controller.deletePost);

router.get('/blog-categories', controller.listCategories);
router.post('/blog-categories', authenticateToken, validate(createCategorySchema), controller.createCategory);
router.put('/blog-categories/:id', authenticateToken, validate(updateCategorySchema), controller.updateCategory);
router.delete('/blog-categories/:id', authenticateToken, controller.deleteCategory);

module.exports = { router, basePath: '/api' };
