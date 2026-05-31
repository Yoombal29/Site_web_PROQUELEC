const { Router } = require('express');
const controller = require('./pages.controller');
const { authenticateToken, requireAdmin, validate } = require('../../core/middleware');
const {
    createPageSchema, updatePageSchema, adminUpdatePageSchema,
    createMenuItemSchema, updateMenuItemSchema,
    constructionModeSchema
} = require('./pages.validator');

const router = Router();

router.get('/pages', controller.listPages);
router.get('/pages/slug/:slug', controller.getPage);
router.get('/pages/:id', controller.getPageById);
router.post('/pages', authenticateToken, validate(createPageSchema), controller.createPage);
router.put('/pages/:id', authenticateToken, validate(updatePageSchema), controller.updatePage);
router.delete('/pages/:id', authenticateToken, controller.deletePage);

router.get('/admin/pages', authenticateToken, requireAdmin, controller.listPages);
router.get('/admin/pages/:id', authenticateToken, requireAdmin, controller.adminGetPage);
router.put('/admin/pages/:id', authenticateToken, requireAdmin, validate(adminUpdatePageSchema), controller.adminUpdatePage);
router.get('/admin/page-versions/:id/:version', authenticateToken, requireAdmin, controller.getPageVersion);
router.post('/admin/seed-homepage', authenticateToken, requireAdmin, controller.seedHomepage);

// --- Draft Autosave, Named Versions & Theme Config ---
router.put('/admin/pages/:id/draft', authenticateToken, requireAdmin, controller.saveDraft);
router.post('/admin/pages/:id/versions', authenticateToken, requireAdmin, controller.createNamedVersion);
router.get('/admin/pages/:id/versions', authenticateToken, requireAdmin, controller.listNamedVersions);
router.get('/admin/pages/:id/versions/:versionId', authenticateToken, requireAdmin, controller.getNamedVersionById);
router.put('/admin/pages/:id/theme-config', authenticateToken, requireAdmin, controller.saveThemeConfig);

router.get('/menu-items', controller.listMenuItems);
router.post('/menu-items', authenticateToken, validate(createMenuItemSchema), controller.createMenuItem);
router.put('/menu-items/:id', authenticateToken, validate(updateMenuItemSchema), controller.updateMenuItem);
router.delete('/menu-items/:id', authenticateToken, controller.deleteMenuItem);

router.get('/construction-mode', controller.getConstructionMode);
router.post('/construction-mode', authenticateToken, validate(constructionModeSchema), controller.setConstructionMode);

module.exports = { router, basePath: '/api' };
