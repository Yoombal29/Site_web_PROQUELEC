import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../../core/middleware.js';
import { masterRoute, masterStatusRoute } from './master.agent.js';
import ragService from './rag.service.js';

const router = Router();

// Routes IA existantes
router.post('/ai/chat', masterRoute);
router.post('/ai/vision', masterRoute);
router.post('/ai/image', masterRoute);
router.post('/ai/content-generation', masterRoute);
router.post('/ai-code-assistant', masterRoute);
router.post('/ai-generate', masterRoute);

// Diagnostic / Status du Master Agent
router.get('/ai/status', masterStatusRoute);

// Route de diagnostic complète
router.get('/ai/diagnostic', masterStatusRoute);

// Routes RAG
router.get('/rag/status', (req, res) => {
  const stats = ragService.getStats();
  res.json({ success: true, ...stats });
});

router.post('/rag/search', (req, res) => {
  try {
    const { query, limit, deduplicate = true } = req.body;
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Parametre "query" requis' });
    }
    const chunks = deduplicate
      ? ragService.searchChunksSmart(query, limit || 8)
      : ragService.searchChunks(query, limit || 10);
    res.json({ success: true, query, count: chunks.length, chunks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/rag/reload', async (req, res) => {
  try {
    await ragService.reload();
    res.json({ success: true, message: 'Base de connaissances rechargée', ...ragService.getStats() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialiser le service RAG au démarrage (les routes RAG sont montées depuis rag.routes.js)
ragService.initialize().catch(err => {
  console.warn('[RAG] Échec de l\'initialisation:', err.message);
});

export { router, basePath: '/api' };
