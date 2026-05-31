const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireAdmin, validate } = require('../../core/middleware');
const {
    codeAssistantSchema, aiGenerateSchema, contentGenerationSchema,
    pingProviderSchema, diagnosticSchema, complianceScanSchema,
    seoAnalyzeSchema, createChatSchema, updateChatSchema,
    createMessageSchema, layoutGenerateSchema, exportSchema,
} = require('./ai.validator');
const ctrl = require('./ai.controller');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

router.post('/ai/chat', ctrl.chat);
router.post('/ai/vision', upload.single('image'), ctrl.vision);
router.post('/ai/image', ctrl.image);
router.get('/ai/status', ctrl.status);
router.post('/ai/generate-visual', ctrl.generateVisual);
router.post('/ai/content-generation', validate(contentGenerationSchema), ctrl.contentGeneration);
router.post('/ai-code-assistant', authenticateToken, validate(codeAssistantSchema), ctrl.codeAssistant);
router.post('/ai-generate', authenticateToken, validate(aiGenerateSchema), ctrl.aiGenerate);
router.post('/ai/orchestrate', authenticateToken, requireAdmin, ctrl.orchestrateHandler);
router.post('/ai/ping-provider', authenticateToken, requireAdmin, validate(pingProviderSchema), ctrl.pingProvider);
router.post('/ai/diagnostic', authenticateToken, requireAdmin, validate(diagnosticSchema), ctrl.diagnostic);
router.post('/ai/scan-compliance', authenticateToken, requireAdmin, validate(complianceScanSchema), ctrl.scanCompliance);
router.get('/ai/logs', authenticateToken, requireAdmin, ctrl.getLogs);
router.post('/ai/seo-analyze', authenticateToken, requireAdmin, validate(seoAnalyzeSchema), ctrl.seoAnalyze);
router.post('/admin/ai/start', authenticateToken, requireAdmin, ctrl.adminStart);
router.post('/admin/ai/stop', authenticateToken, requireAdmin, ctrl.adminStop);

router.get('/chats', authenticateToken, ctrl.listChats);
router.post('/chats', authenticateToken, validate(createChatSchema), ctrl.createChatHandler);
router.delete('/chats/:sessionId', authenticateToken, ctrl.deleteChatHandler);
router.put('/chats/:sessionId', authenticateToken, validate(updateChatSchema), ctrl.updateChatHandler);
router.get('/chats/:sessionId/messages', authenticateToken, ctrl.listMessages);
router.post('/chats/:sessionId/messages', authenticateToken, validate(createMessageSchema), ctrl.createMessageHandler);

router.get('/engine/memory', authenticateToken, requireAdmin, ctrl.getEngineMemory);
router.post('/engine/scan', authenticateToken, requireAdmin, ctrl.scanEngine);
router.post('/engine/repair', authenticateToken, requireAdmin, ctrl.repairEngine);

router.post('/ai/layout-generate', authenticateToken, validate(layoutGenerateSchema), ctrl.generateLayoutHandler);

router.post('/ai/export', authenticateToken, validate(exportSchema), ctrl.exportPage);

module.exports = { router, basePath: '/api' };
