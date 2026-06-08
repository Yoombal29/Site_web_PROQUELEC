const { Router } = require('express');
const controller = require('./pages.controller');
const { authenticateToken, requireAdmin, requirePermission, validate } = require('../../core/middleware');
const {
    createPageSchema, updatePageSchema, adminUpdatePageSchema,
    draftPageSchema, namedVersionSchema, themeConfigSchema,
    createMenuItemSchema, updateMenuItemSchema,
    constructionModeSchema,
    releaseAnalyzeSchema, releaseImportSchema, releasePublishSchema,
    releaseRejectSchema, releaseRollbackSchema, releasePurgeHistorySchema
} = require('./pages.validator');

const router = Router();

const requireReleasePublishPermission = (req, res, next) =>
    requirePermission(req.body?.force === true ? 'builder.release.force' : 'builder.release.publish')(req, res, next);

router.get('/pages', controller.listPages);
router.get('/pages/slug/:slug', controller.getPage);
router.get('/pages/:id', controller.getPageById);
router.post('/pages', authenticateToken, validate(createPageSchema), controller.createPage);
router.put('/pages/:id', authenticateToken, validate(updatePageSchema), controller.updatePage);
router.delete('/pages/:id', authenticateToken, controller.deletePage);

router.get('/admin/pages', authenticateToken, requireAdmin, controller.listPages);
router.post('/admin/pages/release/analyze', authenticateToken, requireAdmin, requirePermission('builder.release.view'), validate(releaseAnalyzeSchema), controller.analyzePageRelease);
router.post('/admin/pages/release/import', authenticateToken, requireAdmin, requirePermission('builder.release.create'), validate(releaseImportSchema), controller.importPageRelease);
router.delete('/admin/pages/release/history', authenticateToken, requireAdmin, requirePermission('builder.release.purge'), validate(releasePurgeHistorySchema), controller.purgeReleaseHistory);
router.get('/admin/pages/release/candidates', authenticateToken, requireAdmin, requirePermission('builder.release.view'), controller.listReleaseCandidates);
router.get('/admin/pages/release/candidates/:candidateId', authenticateToken, requireAdmin, requirePermission('builder.release.view'), controller.getReleaseCandidate);
router.post('/admin/pages/release/candidates/:candidateId/publish', authenticateToken, requireAdmin, validate(releasePublishSchema), requireReleasePublishPermission, controller.publishReleaseCandidate);
router.post('/admin/pages/release/candidates/:candidateId/rollback', authenticateToken, requireAdmin, requirePermission('builder.release.rollback'), validate(releaseRollbackSchema), controller.rollbackReleaseCandidate);
router.delete('/admin/pages/release/candidates/:candidateId', authenticateToken, requireAdmin, requirePermission('builder.release.create'), validate(releaseRejectSchema), controller.rejectReleaseCandidate);
router.get('/admin/pages/:id/release/export', authenticateToken, requireAdmin, requirePermission('builder.release.create'), controller.exportPageRelease);
router.get('/admin/pages/:id', authenticateToken, requireAdmin, controller.adminGetPage);
router.put('/admin/pages/:id', authenticateToken, requireAdmin, validate(adminUpdatePageSchema), controller.adminUpdatePage);
router.get('/admin/page-versions/:id/:version', authenticateToken, requireAdmin, controller.getPageVersion);
router.post('/admin/seed-homepage', authenticateToken, requireAdmin, controller.seedHomepage);

// --- Draft Autosave, Named Versions & Theme Config ---
router.put('/admin/pages/:id/draft', authenticateToken, requireAdmin, validate(draftPageSchema), controller.saveDraft);
router.post('/admin/pages/:id/versions', authenticateToken, requireAdmin, validate(namedVersionSchema), controller.createNamedVersion);
router.get('/admin/pages/:id/versions', authenticateToken, requireAdmin, controller.listNamedVersions);
router.get('/admin/pages/:id/versions/:versionId', authenticateToken, requireAdmin, controller.getNamedVersionById);
router.put('/admin/pages/:id/theme-config', authenticateToken, requireAdmin, validate(themeConfigSchema), controller.saveThemeConfig);

router.get('/menu-items', controller.listMenuItems);
router.post('/menu-items', authenticateToken, validate(createMenuItemSchema), controller.createMenuItem);
router.put('/menu-items/:id', authenticateToken, validate(updateMenuItemSchema), controller.updateMenuItem);
router.delete('/menu-items/:id', authenticateToken, controller.deleteMenuItem);

router.get('/construction-mode', controller.getConstructionMode);
router.post('/construction-mode', authenticateToken, validate(constructionModeSchema), controller.setConstructionMode);

module.exports = { router, basePath: '/api' };
