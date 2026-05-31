const { Router } = require('express');
const controller = require('./builder.controller');
const { authenticateToken, requireAdmin, validate } = require('../../core/middleware');
const {
    createSnapshotSchema,
    createTemplateSchema,
    updateTemplateSchema,
    createComponentSchema,
    updateComponentSchema,
    createBindingSchema,
    updateBindingSchema,
    registerPluginSchema,
    togglePluginSchema,
    createExportSchema,
    updateCollaborationSchema,
    updatePageBuilderSchema,
} = require('./builder.validator');

const router = Router();

// ─── SNAPSHOTS ───────────────────────────────────────────────────────────────
router.get('/builder/pages/:pageId/snapshots', authenticateToken, controller.listSnapshots);
router.get('/builder/snapshots/:id', authenticateToken, controller.getSnapshot);
router.post('/builder/pages/:pageId/snapshots', authenticateToken, validate(createSnapshotSchema), controller.createSnapshot);
router.delete('/builder/snapshots/:id', authenticateToken, controller.removeSnapshot);

// ─── TEMPLATES ───────────────────────────────────────────────────────────────
router.get('/builder/templates', controller.listTemplates);
router.get('/builder/templates/:id', controller.getTemplate);
router.post('/builder/templates', authenticateToken, requireAdmin, validate(createTemplateSchema), controller.createTemplate);
router.put('/builder/templates/:id', authenticateToken, requireAdmin, validate(updateTemplateSchema), controller.updateTemplate);
router.delete('/builder/templates/:id', authenticateToken, requireAdmin, controller.removeTemplate);

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
router.get('/builder/components', controller.listComponents);
router.get('/builder/components/:id', controller.getComponent);
router.post('/builder/components', authenticateToken, validate(createComponentSchema), controller.createComponent);
router.put('/builder/components/:id', authenticateToken, validate(updateComponentSchema), controller.updateComponent);
router.delete('/builder/components/:id', authenticateToken, controller.removeComponent);

// ─── BINDINGS ────────────────────────────────────────────────────────────────
router.get('/builder/pages/:pageId/bindings', authenticateToken, controller.listBindings);
router.post('/builder/pages/:pageId/bindings', authenticateToken, validate(createBindingSchema), controller.createBinding);
router.put('/builder/bindings/:id', authenticateToken, validate(updateBindingSchema), controller.updateBinding);
router.delete('/builder/bindings/:id', authenticateToken, controller.removeBinding);

// ─── PLUGINS ─────────────────────────────────────────────────────────────────
router.get('/builder/plugins', authenticateToken, controller.listPlugins);
router.get('/builder/plugins/:name', authenticateToken, controller.getPlugin);
router.post('/builder/plugins', authenticateToken, requireAdmin, validate(registerPluginSchema), controller.registerPlugin);
router.put('/builder/plugins/:name/toggle', authenticateToken, requireAdmin, validate(togglePluginSchema), controller.togglePlugin);

// ─── EXPORTS ─────────────────────────────────────────────────────────────────
router.get('/builder/pages/:pageId/exports', authenticateToken, controller.listExports);
router.post('/builder/pages/:pageId/exports', authenticateToken, validate(createExportSchema), controller.createExport);

// ─── COLLABORATION ───────────────────────────────────────────────────────────
router.get('/builder/pages/:pageId/collaboration', authenticateToken, controller.getCollaboration);
router.put('/builder/pages/:pageId/collaboration', authenticateToken, validate(updateCollaborationSchema), controller.updateCollaboration);

// ─── PAGE ENRICHMENT ─────────────────────────────────────────────────────────
router.put('/builder/pages/:pageId/builder-fields', authenticateToken, validate(updatePageBuilderSchema), controller.updatePageBuilder);

module.exports = { router, basePath: '/api' };
