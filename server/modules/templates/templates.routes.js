const { Router } = require('express');
const controller = require('./templates.controller');
const { authenticateToken, requireAdmin } = require('../../core/middleware');

const router = Router();

router.get('/templates', controller.listTemplates);
router.get('/templates/:id', controller.getTemplate);
router.post('/templates', authenticateToken, requireAdmin, controller.createTemplate);
router.put('/templates/:id', authenticateToken, requireAdmin, controller.updateTemplate);
router.delete('/templates/:id', authenticateToken, requireAdmin, controller.deleteTemplate);

module.exports = { router, basePath: '/api' };
