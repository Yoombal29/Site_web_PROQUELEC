const { Router } = require('express');
const multer = require('multer');
const { authenticateToken, requireAdmin } = require('../../core/middleware');
const service = require('./media.service');

const router = Router();

// ──────────────────────────────────────────────
// Multer configuration — use memory storage so
// the service can write files into the correct
// date/category folder itself.
// ──────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: service.MAX_FILE_SIZE || 500 * 1024 * 1024 },
});

// ──────────────────────────────────────────────
// GET /api/media — paginated list with search
// and type filter
// ──────────────────────────────────────────────

router.get('/media', authenticateToken, async (req, res, next) => {
  try {
    const { page, limit, search, type, sortBy, sortOrder } = req.query;

    const result = await service.listFiles({
      page,
      limit,
      search,
      type,
      sortBy,
      sortOrder,
    });

    // Map rows to a clean response shape
    const data = result.rows.map(service.buildFileResponse);

    res.json({
      success: true,
      data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// GET /api/media/:id — file detail
// ──────────────────────────────────────────────

router.get('/media/:id', authenticateToken, async (req, res, next) => {
  try {
    const file = await service.getFileById(req.params.id);
    res.json({ success: true, data: service.buildFileResponse(file) });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/media/upload — upload a file with
// category (image / video / document)
// ──────────────────────────────────────────────

router.post(
  '/media/upload',
  authenticateToken,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: 'Fichier trop volumineux',
              message: `La taille maximale autorisée est de ${service.MAX_FILE_SIZE / (1024 * 1024)} Mo.`,
            });
          }
          return res.status(400).json({
            success: false,
            error: "Erreur d'upload",
            message: err.message,
          });
        }
        return next(err);
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Aucun fichier fourni',
          message: 'Le champ "file" est requis dans le formulaire.',
        });
      }

      const category = req.body.category || service.detectCategory(req.file.mimetype);
      const projectId = req.body.project_id || null;
      const altText = req.body.alt_text || null;

      const saved = await service.uploadFile(req.file, category, req.user.id, {
        projectId,
        altText,
        status: req.body.status || 'published',
      });

      res.status(201).json({
        success: true,
        message: 'Fichier uploadé avec succès',
        data: service.buildFileResponse(saved),
      });
    } catch (err) {
      next(err);
    }
  },
);

// ──────────────────────────────────────────────
// DELETE /api/media/:id — soft-delete by default,
// pass ?hard=true for physical deletion
// ──────────────────────────────────────────────

router.delete('/media/:id', authenticateToken, async (req, res, next) => {
  try {
    const hard = req.query.hard === 'true' || req.query.hard === '1';
    const deleted = await service.deleteFile(req.params.id, hard);

    res.json({
      success: true,
      message: hard ? 'Fichier supprimé définitivement' : 'Fichier mis à la corbeille',
      data: { id: deleted.id, fileName: deleted.file_name, hard },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = { router, basePath: '/api' };
