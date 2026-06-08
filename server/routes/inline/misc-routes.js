const { Router } = require('express');
const router = Router();

// ──────────────────────────────────────────────
// External imports
// ──────────────────────────────────────────────
const { Pool } = require('pg');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { sendEmail, emailTemplates } = require('../../email-service');
const { runSyncCycle } = require('../../sync-engine');

// ──────────────────────────────────────────────
// Database pool (same config as index.js)
// ──────────────────────────────────────────────
const dbUrl = process.env.DATABASE_URL || '';
let pool;
if (dbUrl) {
  pool = new Pool({ connectionString: dbUrl });
}

// ──────────────────────────────────────────────
// SSE infrastructure (moved from index.js)
// ──────────────────────────────────────────────
const sseClients = new Map();
const sseStats = { totalConnections: 0, activeConnections: 0 };

function sendSseEvent(event, data) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data || {});
  const disconnectedClients = [];
  for (const [res, metadata] of sseClients) {
    try {
      if (res.writableEnded || res.destroyed) {
        disconnectedClients.push(res);
        continue;
      }
      res.write(`event: ${event}\n`);
      res.write(`data: ${payload}\n\n`);
      metadata.lastEventTime = Date.now();
    } catch (e) {
      console.warn(`[SSE] Failed to send event '${event}' to client:`, e.message);
      disconnectedClients.push(res);
    }
  }
  for (const res of disconnectedClients) {
    sseClients.delete(res);
    sseStats.activeConnections = sseClients.size;
  }
}

// ──────────────────────────────────────────────
// Multer configuration (from index.js)
// ──────────────────────────────────────────────
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(PROJECT_ROOT, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 },
});

// ──────────────────────────────────────────────
// Ghost redundancy helpers (from index.js)
// ──────────────────────────────────────────────
const GHOST_DIR = path.join(PROJECT_ROOT, '.ghost');
if (!fs.existsSync(GHOST_DIR)) fs.mkdirSync(GHOST_DIR, { recursive: true });

const saveGhostCopy = (table, data) => {
  try {
    fs.writeFileSync(path.join(GHOST_DIR, `${table}.json`), JSON.stringify(data, null, 2));
  } catch (e) {
    /* silent */
  }
};

const getGhostCopy = (table) => {
  try {
    const file = path.join(GHOST_DIR, `${table}.json`);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    /* silent */
  }
  return null;
};

// ──────────────────────────────────────────────
// Semantic helpers (from index.js)
// ──────────────────────────────────────────────
const SEMANTIC_DICTIONARY = {
  senegal: 'Sénégal',
  electricien: 'électricien',
  electricite: 'électricité',
  securite: 'sécurité',
  qualite: 'qualité',
  formation: 'formation',
  verification: 'vérification',
  audit: 'audit',
};

const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return text;
  let normalized = text.replace(/S\?N\?GAL/g, 'SÉNÉGAL').replace(/[\u200B-\u200D\uFEFF]/g, '');
  const dictionary = {
    proqelec: 'PROQUELEC',
    proqueleque: 'PROQUELEC',
    seneque: 'SENELEC',
    electricien: 'Électricien',
    electricite: 'Électricité',
    societe: 'Société',
    senegal: 'Sénégal',
    dakar: 'Dakar',
    standard: 'Norme',
    norme: 'Norme',
    calulateur: 'Calculateur',
    calculateure: 'Calculateur',
    shema: 'Schéma',
    schema: 'Schéma',
  };
  Object.keys(dictionary).forEach((key) => {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    normalized = normalized.replace(regex, dictionary[key]);
  });
  return normalized.trim();
};

// ──────────────────────────────────────────────
// Error catalog & AppError (from index.js)
// ──────────────────────────────────────────────
const ERROR_CATALOG = {
  AUTH_INVALID: { status: 401, message: 'Identifiants invalides', icon: '🔐' },
  AUTH_EXPIRED: { status: 401, message: 'Session expirée', icon: '⏰' },
  AUTH_DENIED: { status: 403, message: 'Accès refusé', icon: '🚫' },
  DB_BUSY: { status: 503, message: 'Base de données temporairement indisponible', icon: '⏳' },
  GHOST_MODE: {
    status: 200,
    message: 'Mode dégradé — Affichage des données sauvegardées',
    icon: '👻',
  },
  DB_CONFLICT: { status: 409, message: 'Conflit de données', icon: '⚔️' },
  DB_NOT_FOUND: { status: 404, message: 'Ressource introuvable', icon: '🔍' },
  DB_CONSTRAINT: { status: 409, message: 'Contrainte de base de données violée', icon: '🔗' },
  VALIDATION_ERROR: { status: 400, message: 'Données invalides', icon: '❌' },
  FATAL_STRIKE: { status: 500, message: 'Erreur interne du serveur', icon: '💥' },
};

class AppError extends Error {
  constructor(code, details = null) {
    const error = ERROR_CATALOG[code] || ERROR_CATALOG['FATAL_STRIKE'];
    super(error.message);
    this.code = code;
    this.status = error.status;
    this.details = details;
    this.icon = error.icon;
  }
  static fromStatus(status, details = null) {
    if (status === 404) return new AppError('DB_NOT_FOUND', details);
    if (status === 401) return new AppError('AUTH_INVALID', details);
    if (status === 403) return new AppError('AUTH_DENIED', details);
    return new AppError('FATAL_STRIKE', details);
  }
}

const handleAppError = (err, res) => {
  console.error('[SERVER-ERROR]', err);
  const appError =
    err instanceof AppError ? err : AppError.fromStatus(err.status || 500, err.message);
  const errorBody = {
    success: false,
    code: appError.code,
    message: appError.message,
    icon: appError.icon,
    timestamp: new Date().toISOString(),
  };
  if (process.env.NODE_ENV === 'development') {
    errorBody.debug = err.stack;
    errorBody.details = appError.details;
  }
  console.log(`[EMPATHY-LOG] ${appError.code}: ${appError.message}`);
  res.status(appError.status).json(errorBody);
};

// ──────────────────────────────────────────────
// Database helpers (from index.js)
// ──────────────────────────────────────────────
const getTable = async (req, res, table, orderBy = 'created_at DESC') => {
  try {
    console.log(`[DEBUG-GETTABLE] Fetching table: ${table}, Order: ${orderBy}`);
    const result = await pool.query(`SELECT * FROM public.${table} ORDER BY ${orderBy}`);
    console.log(`[DEBUG-GETTABLE] Query success. Rows: ${result.rows.length}`);
    if (result.rows.length > 0) {
      saveGhostCopy(table, result.rows);
    }
    res.json(result.rows);
  } catch (err) {
    console.error(`[DEBUG-GETTABLE] Error fetching ${table}:`, err);
    const ghostData = getGhostCopy(table);
    if (ghostData) {
      console.log(`[GHOST-MODE] Serving mirrored copy for public.${table}`);
      return res.json({
        _ghost: true,
        message: ERROR_CATALOG['GHOST_MODE'].message,
        rows: ghostData,
      });
    }
    handleAppError(new AppError('DB_BUSY', err.message), res);
  }
};

const executeQuery = async (res, text, params) => {
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const normalizedParams = params
      ? params.map((p) => {
          if (typeof p === 'string') return normalizeText(p);
          return p;
        })
      : params;
    const result = await pool.query(text, normalizedParams);
    res.json(
      result.rows.length === 1
        ? result.rows[0]
        : { success: true, error: null, ...(result.rows.length > 1 ? { rows: result.rows } : {}) },
    );
  } catch (err) {
    console.error('[EXECUTE-QUERY-ERROR]', err);
    handleAppError(
      new AppError('DB_CONSTRAINT', {
        error: err.message,
        code: err.code,
        query: text,
      }),
      res,
    );
  }
};

const checkDatabaseHealth = async () => {
  try {
    const start = Date.now();
    const result = await pool.query('SELECT NOW() as now, version()');
    const duration = Date.now() - start;
    const tables = {};
    // simplified — just returns a simple health object
    return {
      status: 'healthy',
      latency: duration,
      version: result.rows[0].version,
      criticalTables: tables,
    };
  } catch (err) {
    return { status: 'unhealthy', error: err.message };
  }
};

// =========================================================================
// 1. SSE ROUTES
// =========================================================================

router.get('/api/events', (req, res) => {
  // CORS already enabled globally
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders && res.flushHeaders();

  // send a comment to keep connection alive
  res.write(':connected\n\n');

  const metadata = {
    connectedAt: Date.now(),
    lastEventTime: Date.now(),
    lastHeartbeat: Date.now(),
  };
  sseClients.set(res, metadata);
  sseStats.totalConnections++;
  sseStats.activeConnections = sseClients.size;

  console.log(
    `[SSE] Client connected. Total connections: ${sseStats.totalConnections}, Active: ${sseStats.activeConnections}`,
  );

  req.on('close', () => {
    sseClients.delete(res);
    sseStats.activeConnections = sseClients.size;
    console.log(`[SSE] Client disconnected. Active: ${sseStats.activeConnections}`);
  });

  req.on('error', (err) => {
    console.warn(`[SSE] Client error:`, err.message);
    sseClients.delete(res);
    sseStats.activeConnections = sseClients.size;
  });
});

// Endpoint to check SSE stats (for debugging)
router.get('/api/events/stats', (req, res) => {
  res.json({
    ...sseStats,
    timestamp: new Date().toISOString(),
  });
});

// =========================================================================
// 2. STORAGE ROUTES
// =========================================================================

// -- UPLOAD FILE ENDPOINT (GED) --
router.post('/api/storage/upload', authenticateToken, upload.single('file'), async (req, res) => {
  console.log('[INDEX-UPLOAD] /api/storage/upload handler invoked');
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const projectId = req.body.project_id || null;
    const docCategory = req.body.category || 'general';

    const dbRes = await pool.query(
      `INSERT INTO public.media_files
             (file_name,file_path,file_type,file_size,mime_type,uploaded_at,uploaded_by,project_id,status,metadata)
             VALUES ($1,$2,$3,$4,$5,NOW(),$6,$7,$8,$9::jsonb) RETURNING *`,
      [
        req.file.originalname,
        req.file.filename,
        docCategory || 'other',
        req.file.size,
        req.file.mimetype,
        req.user && req.user.id ? req.user.id : null,
        projectId,
        'draft',
        JSON.stringify({ category: docCategory }),
      ],
    );

    res.json({
      message: 'File uploaded successfully',
      id: dbRes.rows[0].id,
      file_path: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      original_name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      project_id: projectId,
      metadata: dbRes.rows[0].metadata || { category: docCategory },
    });

    try {
      sendSseEvent('media:uploaded', dbRes.rows[0]);
    } catch (e) {}
  } catch (err) {
    console.error('[STORAGE] Upload error:', err);
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Fichier trop volumineux',
          message: 'Le fichier dépasse la limite autorisée de 500 Mo.',
        });
      }
      return res.status(400).json({ error: 'Upload Error', details: err.message });
    }
    handleAppError(err, res);
  }
});

// -- LIST FILES ENDPOINT --
router.get('/api/storage/files', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.media_files ORDER BY uploaded_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('[STORAGE-ERROR] List files failed:', err);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// -- DELETE FILE ENDPOINT --
router.delete('/api/storage/files/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM public.media_files WHERE id=$1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Tentative de suppression physique (Optional: check path)
    const filePath = path.join(PROJECT_ROOT, 'uploads', result.rows[0].file_path);
    fs.unlink(filePath, (err) => {
      if (err) console.error('[STORAGE] Waring: Could not delete file logically:', filePath);
    });

    res.json({ message: 'Fichier supprimé', id });
  } catch (err) {
    console.error('[STORAGE] Delete DB Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// -- RENAME FILE ENDPOINT --
router.put('/api/storage/files/:id/rename', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName || typeof newName !== 'string' || !newName.trim()) {
      return res.status(400).json({ error: 'newName invalide ou manquant' });
    }

    console.log(`[STORAGE] Renaming file ${id} to ${newName}`);

    // 1. Get file from DB
    const result = await pool.query('SELECT * FROM public.media_files WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Fichier non trouvé' });

    const file = result.rows[0];

    // Safety check (User Recommendation): Prevent crash if DB has missing filename
    if (!file.file_path || typeof file.file_path !== 'string') {
      return res
        .status(500)
        .json({ error: 'Incohérence base de données : Nom de fichier manquant (file_path)' });
    }

    let oldPath = path.join(PROJECT_ROOT, 'uploads', file.file_path);

    // 2. Determine new filename (secure extension forcing)
    const ext = path.extname(file.file_path); // Trust the specific extension of the file on disk
    const safeBaseName = path.basename(newName, path.extname(newName)); // Remove any user-provided extension
    // Sanitize base name
    const cleanBaseName = safeBaseName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    // Reconstruct safe filename
    const newFilename = cleanBaseName + ext;
    const newPath = path.join(PROJECT_ROOT, 'uploads', newFilename);

    console.log('[DEBUG-RENAME] OldPath:', oldPath);
    console.log('[DEBUG-RENAME] NewPath:', newPath);
    console.log('[DEBUG-RENAME] fs exists?', fs.existsSync(oldPath));

    // 3. Rename file on disk with Retry Logic (Windows EBUSY fix)
    // Check for same file (no-op)
    if (oldPath === newPath) {
      console.log('[STORAGE] Rename skipping: Source and destination are the same.');
    } else if (fs.existsSync(oldPath)) {
      let renamed = false;
      let lastError = null;

      // Check if destination exists
      if (fs.existsSync(newPath)) {
        // If case-insensitive match (Windows)
        if (oldPath.toLowerCase() === newPath.toLowerCase()) {
          // Rename to temp first
          const tempPath = oldPath + '.tmp-' + Date.now();
          try {
            fs.renameSync(oldPath, tempPath);
            oldPath = tempPath; // Update oldPath to temp
          } catch (e) {
            throw new Error('Impossible de renommer (verrouillage temporaire)');
          }
        } else {
          throw new Error(`Le fichier destination existe déjà: ${newFilename}`);
        }
      }

      for (let i = 0; i < 5; i++) {
        try {
          fs.renameSync(oldPath, newPath);
          renamed = true;
          break;
        } catch (err) {
          lastError = err;
          console.log(`[STORAGE] Rename attempt ${i + 1} failed (${err.code}), retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
      if (!renamed) {
        // Try copy + unlink as fallback
        try {
          fs.copyFileSync(oldPath, newPath);
          await new Promise((resolve) => setTimeout(resolve, 100));
          fs.unlinkSync(oldPath);
          renamed = true;
        } catch (fallbackErr) {
          console.error('[STORAGE] Fallback copy/delete failed:', fallbackErr);
          throw lastError || fallbackErr;
        }
      }
    } else {
      console.warn(`[STORAGE] File not found on disk: ${oldPath}, updating DB only.`);
    }

    // 4. Update DB
    const updateResult = await pool.query(
      'UPDATE public.media_files SET file_path = $1, file_name = $2 WHERE id = $3 RETURNING *',
      [newFilename, newName, id],
    );

    res.json(updateResult.rows[0]);
    try {
      sendSseEvent('media:renamed', updateResult.rows[0]);
    } catch (e) {
      console.warn('SSE broadcast failed (media:renamed)', e);
    }
  } catch (err) {
    console.error('[STORAGE-ERROR] Rename failed:', err);
    // Envoyer l'erreur détaillée au client pour le debug
    res.status(500).json({ error: 'Rename failed', details: err.message, code: err.code });
  }
});

// -- DELETE FILE ENDPOINT (soft-delete user version) --
router.delete('/api/storage/files/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get file info
    const result = await pool.query('SELECT * FROM public.media_files WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Fichier non trouvé' });

    const file = result.rows[0];
    const filePath = path.join(PROJECT_ROOT, 'uploads', file.file_path); // Use strictly DB path

    // 2. Remove from Disk
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[STORAGE] Deleted file on disk: ${filePath}`);
      } catch (err) {
        console.error(`[STORAGE] Failed to delete file on disk: ${err.message}`);
        // Proceed to delete from DB anyway? Yes, to avoid phantom records.
      }
    } else {
      console.warn(`[STORAGE] File not found on disk for deletion: ${filePath}`);
    }

    // 3. Remove from DB
    await pool.query('DELETE FROM public.media_files WHERE id = $1', [id]);

    res.json({ success: true, message: 'Fichier supprimé' });
    try {
      sendSseEvent('media:deleted', { id, file_name: file.file_name });
    } catch (e) {
      console.warn('SSE broadcast failed (media:deleted)', e);
    }
  } catch (err) {
    console.error('[STORAGE-ERROR] Delete failed:', err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

// =========================================================================
// 3. SUBSCRIPTION ROUTES
// =========================================================================

router.get('/api/subscription-plans', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.subscription_plans WHERE is_active = true ORDER BY price',
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/subscriptions', authenticateToken, async (req, res) => {
  try {
    const { plan_id } = req.body;
    if (!plan_id) return res.status(400).json({ error: 'Plan requis' });
    const plan = await pool.query(
      'SELECT * FROM public.subscription_plans WHERE id = $1 AND is_active = true',
      [plan_id],
    );
    if (plan.rows.length === 0) return res.status(404).json({ error: 'Plan non trouvé' });
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.rows[0].duration_days);
    const result = await pool.query(
      'INSERT INTO public.user_subscriptions (user_id, plan_id, end_date, payment_status, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        req.user.id,
        plan_id,
        endDate,
        plan.rows[0].price > 0 ? 'pending' : 'active',
        plan.rows[0].price === 0,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/my-subscription', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT us.*, sp.name, sp.description, sp.features, sp.price FROM public.user_subscriptions us JOIN public.subscription_plans sp ON us.plan_id = sp.id WHERE us.user_id = $1 AND us.is_active = true AND us.end_date > NOW() ORDER BY us.end_date DESC LIMIT 1',
      [req.user.id],
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/admin/subscriptions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT us.*, sp.name as plan_name, u.email as user_email FROM public.user_subscriptions us JOIN public.subscription_plans sp ON us.plan_id = sp.id JOIN public.users u ON us.user_id = u.id ORDER BY us.created_at DESC',
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  '/api/admin/subscriptions/manual-activate',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { user_id, plan_id, duration_days, notes } = req.body;
      if (!user_id || !plan_id) {
        return res.status(400).json({ error: 'user_id et plan_id requis' });
      }

      // Verify plan exists
      const plan = await pool.query('SELECT * FROM public.subscription_plans WHERE id = $1', [
        plan_id,
      ]);
      if (plan.rows.length === 0) {
        return res.status(404).json({ error: 'Plan non trouvé' });
      }

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (duration_days || plan.rows[0].duration_days || 30));

      const result = await pool.query(
        `INSERT INTO public.user_subscriptions
       (user_id, plan_id, end_date, payment_status, is_active, manually_activated, activated_by)
       VALUES ($1, $2, $3, 'active', true, true, $4) RETURNING *`,
        [user_id, plan_id, endDate, req.user.id],
      );

      res.json({ success: true, subscription: result.rows[0] });
    } catch (err) {
      console.error('[SUBSCRIPTION] Manual activation error:', err.message);
      res.status(500).json({ error: err.message });
    }
  },
);

router.get('/api/premium-check', authenticateToken, async (req, res) => {
  const { checkPremiumAccess } = require('../../middleware/premium');
  const subscription = await checkPremiumAccess(req.user.id);
  res.json({
    hasPremium: !!subscription,
    subscription: subscription
      ? {
          planName: subscription.plan_name,
          endDate: subscription.end_date,
          isPremium: subscription.is_premium,
          manuallyActivated: subscription.manually_activated,
        }
      : null,
  });
});

// =========================================================================
// 4. ENGINE ROUTES
// =========================================================================

router.get('/api/engine/memory', (req, res) => {
  const memoryPath = path.join(PROJECT_ROOT, 'src/engine/memory/error-memory.json');
  if (fs.existsSync(memoryPath)) {
    const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
    return res.json(memory);
  }
  res.json([]);
});

router.post('/api/engine/scan', (req, res) => {
  const scriptPath = path.join(PROJECT_ROOT, 'proquelec-ultra-ai.mjs');
  const child = spawn('node', [scriptPath]);
  let output = '';

  child.stdout.on('data', (data) => {
    output += data.toString();
  });
  child.stderr.on('data', (data) => {
    output += data.toString();
  });

  child.on('close', (code) => {
    // Strip ANSI escape codes (colors) to avoid corrupted file paths like "file.tsx[39m"
    const cleanOutput = output.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      '',
    );

    // Parse the output to JSON
    const issues = [];
    const lines = cleanOutput.split('\n');
    lines.forEach((line) => {
      // Détection de tous les types (VULN, WARN, PERF, OPTIM, SECURITY)
      if (
        line.includes('[VULN]') ||
        line.includes('[WARN]') ||
        line.includes('[PERF]') ||
        line.includes('[OPTIM]') ||
        line.includes('[SECURITY]')
      ) {
        // Nouveau regex plus flexible pour matcher "[TYPE] Message dans Fichier"
        const match = line.match(/\[(.*?)\] (.*?) dans (.*)/);
        if (match) {
          issues.push({
            type: match[1],
            issue: match[2],
            file: match[3].trim(),
          });
        }
      }
    });

    res.json({
      success: code === 0,
      issues: issues,
      rawOutput: output,
    });
  });
});

router.post('/api/engine/repair', (req, res) => {
  const { file, issue } = req.body;
  const scriptPath = path.join(PROJECT_ROOT, 'proquelec-ultra-ai.mjs');
  const args = ['--repair'];
  if (file) args.push(`--file=${file}`);

  const child = spawn('node', [scriptPath, ...args]);
  let output = '';

  child.stdout.on('data', (data) => {
    output += data.toString();
  });
  child.stderr.on('data', (data) => {
    output += data.toString();
  });

  child.on('close', (code) => {
    res.json({
      success: code === 0,
      message: code === 0 ? 'Correctif appliqué avec succès' : 'Erreur lors de la réparation',
      output: output,
    });
  });
});

// =========================================================================
// 5. OBSERVATOIRE ROUTES
// =========================================================================

router.get('/api/observatoire/stats', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT * FROM public.cossuel_stats_daily
            ORDER BY date DESC LIMIT 1
        `);
    res.json(result.rows[0] || { total_dossiers: 0, total_inspections: 0 });
  } catch (e) {
    console.error('[OBSERVATOIRE] Stats Error:', e.message);
    res.status(500).json({ error: 'Erreur récupération stats' });
  }
});

router.get('/api/observatoire/dossiers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT * FROM public.cossuel_dossiers
            ORDER BY submission_date DESC LIMIT 50
        `);
    res.json(result.rows);
  } catch (e) {
    console.error('[OBSERVATOIRE] Dossiers Error:', e.message);
    res.status(500).json({ error: 'Erreur récupération dossiers' });
  }
});

router.get('/api/observatoire/map/stats', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT region, status, COUNT(*) as count
            FROM public.cossuel_dossiers
            GROUP BY region, status
        `);

    // Transformer pour le frontend map
    const regionalStats = {};
    result.rows.forEach((row) => {
      if (!regionalStats[row.region]) {
        regionalStats[row.region] = { total: 0, conformes: 0, non_conformes: 0 };
      }
      regionalStats[row.region].total += parseInt(row.count);
      if (row.status === 'CONFORME') regionalStats[row.region].conformes += parseInt(row.count);
      if (row.status === 'NON_CONFORME')
        regionalStats[row.region].non_conformes += parseInt(row.count);
    });

    res.json(regionalStats);
  } catch (e) {
    console.error('[OBSERVATOIRE] Map Stats Error:', e.message);
    res.status(500).json({ error: 'Erreur stats régionales' });
  }
});

router.post('/api/observatoire/sync/trigger', authenticateToken, requireAdmin, async (req, res) => {
  try {
    runSyncCycle().catch((err) => console.error('[SYNC] Manual trigger error:', err));
    res.json({ message: 'Synchronisation déclenchée. Consultez les logs pour le résultat.' });
  } catch (err) {
    console.error('[SYNC] Trigger failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 6. HEALTH ROUTES
// =========================================================================

router.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', version: '1.2.0', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

router.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  const status = dbHealth.status === 'healthy' ? 200 : 503;
  res.status(status).json({
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbHealth,
    environment: process.env.NODE_ENV || 'development',
  });
});

router.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'PROQUELEC Enterprise API is active',
    features: ['Self-Healing', 'Auto-Normalization', 'Deep-Diagnostics'],
    version: '1.2.0',
  });
});

// =========================================================================
// 7. MEDIA / FILE ROUTES
// =========================================================================

const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
});

router.post(
  '/api/media/upload',
  authenticateToken,
  (req, res, next) => {
    mediaUpload.single('file')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: 'Fichier trop volumineux',
              message: `La taille maximale autorisée est de ${500} Mo.`,
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

      const { MediaService } = require('../../modules/media/media.service');
      const category = req.body.category || MediaService.detectCategory(req.file.mimetype);
      const projectId = req.body.project_id || null;
      const altText = req.body.alt_text || null;

      const saved = await MediaService.uploadFile(req.file, category, req.user.id, {
        projectId,
        altText,
        status: req.body.status || 'published',
      });

      res.status(201).json({
        success: true,
        message: 'Fichier uploadé avec succès',
        data: MediaService.buildFileResponse(saved),
      });
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/api/media/:id', authenticateToken, async (req, res, next) => {
  try {
    const hard = req.query.hard === 'true' || req.query.hard === '1';
    const { MediaService } = require('../../modules/media/media.service');
    const deleted = await MediaService.deleteFile(req.params.id, hard);

    res.json({
      success: true,
      message: hard ? 'Fichier supprimé définitivement' : 'Fichier mis à la corbeille',
      data: { id: deleted.id, fileName: deleted.file_name, hard },
    });
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 8. PROFESSIONAL TRAINING ROUTES
// =========================================================================

router.get('/api/professional-training', async (req, res) => {
  await getTable(req, res, 'professional_training', 'created_at DESC');
});

router.post('/api/professional-training', authenticateToken, async (req, res) => {
  const {
    title,
    description,
    duration_hours,
    level,
    price,
    max_participants,
    instructor_name,
    location,
    equipment_provided,
    prerequisites,
    learning_objectives,
  } = req.body;
  await executeQuery(
    res,
    `INSERT INTO public.professional_training (title, description, duration_hours, level, price, max_participants, instructor_name, location, equipment_provided, prerequisites, learning_objectives)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [
      title,
      description,
      duration_hours,
      level,
      price,
      max_participants,
      instructor_name,
      location,
      equipment_provided,
      prerequisites,
      learning_objectives,
    ],
  );
});

router.put('/api/professional-training/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    duration_hours,
    level,
    price,
    max_participants,
    instructor_name,
    location,
    equipment_provided,
    prerequisites,
    learning_objectives,
  } = req.body;
  await executeQuery(
    res,
    `UPDATE public.professional_training SET title=$1, description=$2, duration_hours=$3, level=$4, price=$5, max_participants=$6, instructor_name=$7, location=$8, equipment_provided=$9, prerequisites=$10, learning_objectives=$11 WHERE id=$12 RETURNING *`,
    [
      title,
      description,
      duration_hours,
      level,
      price,
      max_participants,
      instructor_name,
      location,
      equipment_provided,
      prerequisites,
      learning_objectives,
      id,
    ],
  );
});

router.delete('/api/professional-training/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.professional_training WHERE id=$1', [req.params.id]);
});

// =========================================================================
// 9. EMAIL ROUTES
// =========================================================================

router.post('/api/send-email', async (req, res) => {
  // Placeholder for email sending logic
  console.log('Sending email:', req.body);
  res.json({ success: true, message: 'Email queued for sending' });
});

// =========================================================================
// 10. SEARCH ROUTES
// =========================================================================

router.get('/api/search', async (req, res) => {
  try {
    const { q, types } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const typeList = types ? types.split(',') : ['page', 'blog'];
    let allResults = [];

    // Pages
    if (typeList.includes('page')) {
      const { rows } = await pool.query(
        "SELECT id, title, content, slug, updated_at, 'page' as type FROM public.pages WHERE is_published = true AND (title ILIKE $1 OR content ILIKE $1) LIMIT 5",
        [`%${q}%`],
      );
      allResults = [
        ...allResults,
        ...rows.map((r) => ({
          ...r,
          excerpt: r.content ? r.content.substring(0, 150) + '...' : '',
          url: `/${r.slug}`,
          relevance: 1,
        })),
      ];
    }

    // Blog
    if (typeList.includes('blog')) {
      const { rows } = await pool.query(
        "SELECT id, title, content, slug, published_at as date, 'blog' as type FROM public.blog_posts WHERE (title ILIKE $1 OR content ILIKE $1) LIMIT 5",
        [`%${q}%`],
      );
      allResults = [
        ...allResults,
        ...rows.map((r) => ({
          ...r,
          excerpt: r.content ? r.content.substring(0, 150) + '...' : '',
          url: `/blog/${r.slug}`,
          relevance: 1,
        })),
      ];
    }

    // Normative Articles (for smart technical search)
    if (typeList.includes('normative')) {
      const { rows } = await pool.query(
        "SELECT id, article_ref, content_exact, 'regulation' as type FROM public.normative_articles WHERE content_exact ILIKE $1 LIMIT 5",
        [`%${q}%`],
      );
      allResults = [
        ...allResults,
        ...rows.map((r) => ({
          id: r.id,
          title: r.article_ref,
          excerpt: r.content_exact.substring(0, 150) + '...',
          content: r.content_exact,
          url: '#',
          relevance: 1,
        })),
      ];
    }

    res.json(allResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- FULL-TEXT SEARCH ENDPOINT (Advanced) ---
router.get('/api/search/full-text', async (req, res) => {
  try {
    const { q, type, limit = 20, offset = 0 } = req.query;

    if (!q || q.length < 2) {
      return res.json({ results: [], total: 0, query: q });
    }

    let results = [];
    let total = 0;

    // Configuration des tables à rechercher
    const searchConfigs = {
      pages: {
        table: 'public.pages',
        columns: ['title', 'content', 'meta_description'],
        where: 'is_published = true',
        urlField: 'slug',
        urlPrefix: '/',
        typeLabel: 'Page',
      },
      blog: {
        table: 'public.blog_posts',
        columns: ['title', 'content', 'excerpt'],
        where: 'published_at IS NOT NULL',
        urlField: 'slug',
        urlPrefix: '/blog/',
        typeLabel: 'Article',
      },
      standards: {
        table: 'public.electrical_standards',
        columns: ['title', 'description', 'summary'],
        where: '1=1',
        urlField: 'code',
        urlPrefix: '/standards/',
        typeLabel: 'Norme',
      },
    };

    const tablesToSearch = type ? [type] : Object.keys(searchConfigs);

    for (const tableType of tablesToSearch) {
      if (!searchConfigs[tableType]) continue;

      const config = searchConfigs[tableType];
      const searchQuery = q.replace(/'/g, "''");

      const columns = config.columns.map((col) => `${col}::text`).join(" || ' ' || ");

      try {
        const countResult = await pool.query(
          `
                    SELECT COUNT(*) as total FROM ${config.table}
                    WHERE ${config.where}
                    AND to_tsvector('french', COALESCE(${columns}, '')) @@
                        plainto_tsquery('french', $1)
                `,
          [searchQuery],
        );

        const searchResult = await pool.query(
          `
                    SELECT
                        id,
                        title,
                        COALESCE(${columns}, '') as content,
                        ${config.urlField} as url_slug,
                        ts_rank(to_tsvector('french', COALESCE(${columns}, '')),
                            plainto_tsquery('french', $1)) as relevance,
                        updated_at
                    FROM ${config.table}
                    WHERE ${config.where}
                    AND to_tsvector('french', COALESCE(${columns}, '')) @@
                        plainto_tsquery('french', $1)
                    ORDER BY relevance DESC, updated_at DESC
                    LIMIT $2 OFFSET $3
                `,
          [searchQuery, limit, offset],
        );

        total += parseInt(countResult.rows[0]?.total || 0);

        results = [
          ...results,
          ...searchResult.rows.map((row) => ({
            id: row.id,
            title: row.title,
            excerpt: row.content.substring(0, 200) + (row.content.length > 200 ? '...' : ''),
            url: config.urlPrefix + row.url_slug,
            type: config.typeLabel,
            relevance: parseFloat(row.relevance.toFixed(3)),
            date: row.updated_at,
          })),
        ];
      } catch (e) {
        console.warn(`[SEARCH] Table ${tableType} search failed:`, e.message);
      }
    }

    results.sort((a, b) => b.relevance - a.relevance);

    res.json({
      results: results.slice(0, limit),
      total: total,
      query: q,
      type: type || 'all',
      limit,
      offset,
    });
  } catch (error) {
    console.error('[SEARCH-FT] Error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// =========================================================================
// 11. NEWSLETTER ROUTES
// =========================================================================

router.get('/api/newsletter-subscribers', authenticateToken, async (req, res) => {
  await getTable(req, res, 'newsletter_subscribers', 'subscribed_at DESC');
});

router.post('/api/newsletter-subscribers', async (req, res) => {
  const { email, source } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.newsletter_subscribers (email, source, subscribed_at, is_active) VALUES ($1, $2, NOW(), true) ON CONFLICT (email) DO UPDATE SET is_active = true RETURNING *',
    [email, source],
  );
});

router.get('/api/newsletter/unsubscribe', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email requis' });
  await pool.query('UPDATE public.newsletter_subscribers SET is_active = false WHERE email = $1', [
    email,
  ]);
  res.send('\u2705 Vous avez \u00e9t\u00e9 d\u00e9sabonn\u00e9 de la newsletter PROQUELEC.');
});

router.post('/api/admin/newsletter/send', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, subject } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Titre et contenu requis' });

    const { sendNewsletter } = require('../../newsletter-service');
    const result = await sendNewsletter({ title, content, subject });

    res.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      message: `Newsletter envoy\u00e9e \u00e0 ${result.sent} abonn\u00e9(s)`,
    });
  } catch (err) {
    console.error('[NEWSLETTER] Send error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/admin/newsletter/campaigns', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.newsletter_campaigns ORDER BY sent_at DESC',
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
