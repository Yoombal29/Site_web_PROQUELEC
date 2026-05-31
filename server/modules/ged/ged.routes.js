const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission, validate } = require('../../core/middleware');
const { createDocumentSchema, transitionSchema } = require('./ged.validator');
const ctrl = require('./ged.controller');

router.get('/documents', ctrl.listDocuments);
router.post('/documents', authenticateToken, validate(createDocumentSchema), ctrl.createDocument);
router.delete('/documents/:id', authenticateToken, ctrl.deleteDocument);

router.post('/ged/:entity/:id/transition', authenticateToken, requirePermission('ged:transition'), validate(transitionSchema), ctrl.transition);
router.get('/ged/:entity/:id/history', authenticateToken, requirePermission('ged:transition'), ctrl.history);
router.get('/ged/workflow/config', authenticateToken, ctrl.config);

module.exports = { router, basePath: '/api' };
