const { Router } = require('express');
const controller = require('./settings.controller');
const { authenticateToken, requireAdmin, validate } = require('../../core/middleware');
const { siteSettingsSchema, themeSettingsSchema, siteConfigSchema, auditLogSchema } = require('./settings.validator');

const router = Router();

router.get('/site-settings', controller.getSiteSettings);
router.put('/site-settings', authenticateToken, validate(siteSettingsSchema), controller.updateSiteSettings);

router.get('/theme-settings', controller.getThemeSettings);
router.put('/theme-settings', authenticateToken, validate(themeSettingsSchema), controller.updateThemeSettings);

router.get('/site-config', controller.getSiteConfig);
router.post('/site-config', authenticateToken, validate(siteConfigSchema), controller.saveSiteConfig);

router.put('/settings', controller.saveSettings);

router.get('/admin/audit-logs', authenticateToken, controller.getAuditLogs);
router.post('/admin/audit-logs', authenticateToken, validate(auditLogSchema), controller.createAuditLog);

module.exports = { router, basePath: '/api' };
