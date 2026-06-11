const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenvResult = require('dotenv').config({
  override: true,
  path: path.resolve(__dirname, '../.env'),
});
if (dotenvResult.error) {
  console.error('[ENV] Failed to load .env:', dotenvResult.error);
}
try {
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl) {
    const parsedUrl = new URL(dbUrl);
    console.log(
      `[ENV] Loaded DATABASE_URL host=${parsedUrl.hostname} port=${parsedUrl.port || '5432'} database=${parsedUrl.pathname.slice(1)}`,
    );
  } else {
    console.log('[ENV] DATABASE_URL is not set');
  }
} catch (err) {
  console.warn('[ENV] Invalid DATABASE_URL format:', err.message);
}
const { orchestrate } = require('./orchestrator');
const { spawn } = require('child_process');
const { sendEmail, sendContactNotification, sendNewUserNotification } = require('./email-service');
const {
  validateContactRequestPayload,
  buildEmailNotificationPayload,
} = require('./contact-request-utils');
const { startSyncEngine } = require('./sync-engine');

// -- LOG BUFFER FOR REAL-TIME MONITORING --
const logBuffer = [];
const MAX_LOGS = 100;

const logToBuffer = (msg, type = 'info') => {
  const entry = { timestamp: new Date().toISOString(), type, message: msg.trim() };
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOGS) logBuffer.shift();
};

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  originalLog(...args);
  logToBuffer(args.map((a) => String(a)).join(' '), 'info');
};
console.error = (...args) => {
  originalError(...args);
  logToBuffer(args.map((a) => String(a)).join(' '), 'error');
};
console.warn = (...args) => {
  originalWarn(...args);
  logToBuffer(args.map((a) => String(a)).join(' '), 'warn');
};

// ------------------------------------------
// APP SETUP
// ------------------------------------------
const app = express();
const port = process.env.PORT || 3000;
const swaggerPort = process.env.SWAGGER_PORT || 3103;

// --- SSE (Server-Sent Events) ---
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

function addSseClient(res) {
  sseClients.set(res, {
    connectedAt: Date.now(),
    lastEventTime: Date.now(),
    lastHeartbeat: Date.now(),
  });
  sseStats.totalConnections++;
  sseStats.activeConnections = sseClients.size;
}

function removeSseClient(res) {
  sseClients.delete(res);
  sseStats.activeConnections = sseClients.size;
}

function getSseStats() {
  return { ...sseStats };
}

setInterval(() => {
  for (const [res] of sseClients) {
    try {
      if (!res.writableEnded && !res.destroyed) res.write(`:heartbeat\n\n`);
    } catch (e) {}
  }
}, 30000);

// --- SWAGGER ---
const swaggerApp = express();
swaggerApp.use(cors());
swaggerApp.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none } .swagger-ui .info .title { color: #2376df }',
    customSiteTitle: 'PROQUELEC API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  }),
);
swaggerApp.get('/', (req, res) => res.redirect('/api-docs'));
swaggerApp.listen(swaggerPort, () => {
  console.log(`📚 Swagger API Documentation running at http://localhost:${swaggerPort}/api-docs`);
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
    hidePoweredBy: true,
  }),
);
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache');
  next();
});
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: { error: 'Trop de requêtes, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: { error: 'Trop de tentatives, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de demandes de contact, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/contact-requests', (req, res, next) => {
  if (req.method !== 'POST') return next();
  return contactLimiter(req, res, next);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- AUTH MIDDLEWARE ---
const { authenticateToken, requireAdmin, requirePermission } = require('./middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;

// --- ERROR HANDLING ---
const { handleAppError, AppError } = require('./core/errors');

// ------------------------------------------
// DATABASE CONNECTION
// ------------------------------------------
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on('connect', (client) => {
  client.query("SET client_encoding TO 'UTF8'");
});
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// ------------------------------------------
// AI CONFIGURATION
// ------------------------------------------
const AI_SERVICES = { BRAIN: true, VISION: false, IMAGE: false };
const LOCAL_AI_REMOVED = true;
const LOCAL_AI_REMOVED_MESSAGE =
  'Le service IA local a été retiré. Utilisez PROQUELEC_REMOTE_AI=1 avec une clé API.';
const REMOTE_AI_ENABLED =
  process.env.PROQUELEC_REMOTE_AI === '1' || process.env.PROQUELEC_REMOTE_AI === 'true';
const AI_PROVIDER = process.env.PROQUELEC_AI_PROVIDER || 'openai';
const AI_API_KEY = process.env.PROQUELEC_API_KEY || process.env.OPENAI_API_KEY || '';
const CUSTOM_AI_API_URL = process.env.PROQUELEC_CUSTOM_API_URL || '';
const REMOTE_IMAGE_API = process.env.PROQUELEC_REMOTE_IMAGE_API || '';
const IMAGE_API_KEY = process.env.PROQUELEC_IMAGE_API_KEY || '';
const REMOTE_VISION_API =
  process.env.PROQUELEC_REMOTE_VISION_API || process.env.PROQUELEC_REMOTE_IMAGE_API || '';
const REMOTE_AI_MODEL = process.env.PROQUELEC_AI_MODEL || '';

// Normalize provider name
function normalizeProvider(provider) {
  const alias = {
    chatgpt: 'openai',
    gpt: 'openai',
    openai: 'openai',
    anthropic: 'anthropic',
    claude: 'anthropic',
    'claude-2': 'anthropic',
    'claude-3': 'anthropic',
  };
  return alias[provider?.toLowerCase()] || provider || 'openai';
}

async function callRemoteAI(body) {
  const provider = normalizeProvider(AI_PROVIDER);
  if (provider === 'anthropic') {
    const response = await fetch(CUSTOM_AI_API_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: REMOTE_AI_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: body.max_tokens || 1024,
        messages: [{ role: 'user', content: body.prompt || body.messages?.[0]?.content || '' }],
      }),
    });
    if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
    return response.json();
  }
  // Default: OpenAI-compatible
  const payload = {
    model: REMOTE_AI_MODEL || 'gpt-4o',
    messages: body.messages || [{ role: 'user', content: body.prompt || '' }],
    max_tokens: body.max_tokens || 1024,
    temperature: body.temperature || 0.2,
  };
  const response = await fetch(CUSTOM_AI_API_URL || 'https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
  return response.json();
}

async function callRemoteImage(body) {
  const response = await fetch(REMOTE_IMAGE_API || 'https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${IMAGE_API_KEY || AI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Image API error: ${response.status}`);
  return response.json();
}

async function callRemoteVision(imagePath, prompt) {
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));
  form.append('prompt', prompt || 'Describe this image.');
  const response = await fetch(REMOTE_VISION_API, {
    method: 'POST',
    headers: form.getHeaders(),
    body: form,
    timeout: 30000,
  });
  if (!response.ok) throw new Error(`Vision API error: ${response.status}`);
  return response.json();
}

// --- Constants for inline routes ---
const emailTemplates = require('./email-service');

// ------------------------------------------
// MOUNT EXTRACTED ROUTE MODULES
// ------------------------------------------

// SSE & Health
const { mountSseHealthRoutes } = require('./routes/inline/sse-health');
mountSseHealthRoutes(app, pool);

// Auth & Users
const { mountAuthUsersRoutes } = require('./routes/inline/auth-users');
mountAuthUsersRoutes(app, pool, { bcrypt, jwt, JWT_SECRET, sendNewUserNotification });

// Chats
const { mountChatRoutes } = require('./routes/inline/chats');
mountChatRoutes(app, pool);

// Storage
const { mountStorageRoutes } = require('./routes/inline/storage');
mountStorageRoutes(app, pool);

// Contact & Email
const { mountContactRoutes } = require('./routes/inline/contact');
mountContactRoutes(app, pool, {
  validateContactRequestPayload,
  buildEmailNotificationPayload,
  sendContactNotification,
  sendEmail,
  emailTemplates,
});

// AI Features
const { mountAiFeaturesRoutes } = require('./routes/inline/ai-features');
mountAiFeaturesRoutes(app, pool);

// AI Config API (save/load provider keys from DB)
app.get('/api/ai/config', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value, updated_at FROM ai_config ORDER BY key');
    const configs = {};
    for (const row of result.rows) {
      if (row.key.endsWith('_key') && row.value.length > 8) {
        configs[row.key] = row.value.slice(-4).padStart(row.value.length, '\u2022');
        configs[row.key + '_raw'] = row.value;
      } else {
        configs[row.key] = row.value;
      }
    }
    res.json({ success: true, configs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/ai/config', authenticateToken, async (req, res) => {
  try {
    const { configs } = req.body;
    if (!configs || typeof configs !== 'object') {
      return res.status(400).json({ success: false, error: 'Body doit contenir un objet configs' });
    }
    let saved = 0;
    for (const [key, value] of Object.entries(configs)) {
      const allowedPrefixes = ['password', 'security_answer', 'admin_password', 'provider_'];
      const isAllowed = allowedPrefixes.some((prefix) => key.startsWith(prefix));
      if (!isAllowed) continue;
      await pool.query(
        'INSERT INTO ai_config (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
        [key, String(value)],
      );
      saved++;
    }
    res.json({ success: true, saved, message: saved + ' configuration(s) sauvegardee(s)' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Observatoire
const { mountObservatoireRoutes } = require('./routes/inline/observatoire');
mountObservatoireRoutes(app, pool);

// Generic CRUD
const { mountGenericCrudRoutes } = require('./routes/inline/generic-crud');
mountGenericCrudRoutes(app, pool);

// Admin Features (settings, theme, homepage, partners, subscriptions, etc.)
const { mountAdminFeaturesRoutes } = require('./routes/inline/admin-features');
mountAdminFeaturesRoutes(app, pool);

// Engine
const { mountEngineRoutes } = require('./routes/inline/engine');
mountEngineRoutes(app);

// --- Public Site Settings (used by frontend without auth) ---
app.get('/api/site-settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.site_settings WHERE id = 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/theme-settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.theme_settings WHERE id = 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------
// REMAINING INLINE ROUTES
// ------------------------------------------

// Permissions endpoints
app.get('/api/user/permissions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await pool.query(
      `SELECT DISTINCT p.name FROM public.permissions p
       WHERE (EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role = $1 AND rp.permission_id = p.id)
          OR EXISTS (SELECT 1 FROM public.user_permissions up WHERE up.user_id = $2 AND up.permission_id = p.id AND up.granted = true))
         AND NOT EXISTS (SELECT 1 FROM public.user_permissions up WHERE up.user_id = $2 AND up.permission_id = p.id AND up.granted = false)
       ORDER BY p.name`,
      [userRole, userId],
    );
    const permissions = result.rows.map((row) => row.name);
    res.json({ permissions, role: userRole, count: permissions.length });
  } catch (err) {
    console.error('[RBAC] Erreur récupération permissions:', err);
    res.status(500).json({ error: 'Impossible de récupérer les permissions' });
  }
});

app.get('/api/admin/permissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, category, created_at FROM public.permissions ORDER BY category, name',
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[ADMIN] Erreur récupération permissions:', err);
    res.status(500).json({ error: 'Impossible de récupérer les permissions' });
  }
});

app.get('/api/admin/role-permissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT rp.role, array_agg(p.name ORDER BY p.name) as permissions FROM public.role_permissions rp JOIN public.permissions p ON rp.permission_id = p.id GROUP BY rp.role ORDER BY rp.role',
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/role-permissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res
        .status(403)
        .json({ error: 'Seul un Super Admin peut modifier la matrice globale' });
    }
    const { role, permission, granted } = req.body;
    if (!role || !permission || typeof granted !== 'boolean') {
      return res.status(400).json({ error: 'Paramètres manquants (role, permission, granted)' });
    }
    if (
      granted === false &&
      permission === 'admin.permissions' &&
      (role === 'admin' || role === 'superadmin')
    ) {
      return res
        .status(400)
        .json({ error: 'admin.permissions doit rester accordée aux rôles admin et superadmin' });
    }
    const permResult = await pool.query('SELECT id FROM public.permissions WHERE name = $1', [
      permission,
    ]);
    if (permResult.rows.length === 0)
      return res.status(404).json({ error: `Permission "${permission}" introuvable` });
    const permissionId = permResult.rows[0].id;
    if (granted) {
      await pool.query(
        'INSERT INTO public.role_permissions (role, permission_id) VALUES ($1, $2) ON CONFLICT (role, permission_id) DO NOTHING',
        [role, permissionId],
      );
    } else {
      await pool.query(
        'DELETE FROM public.role_permissions WHERE role = $1 AND permission_id = $2',
        [role, permissionId],
      );
    }
    res.json({ success: true, role, permission, granted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inspection endpoints
app.post('/api/inspections/suggest-checklist', authenticateToken, async (req, res) => {
  try {
    const { projectId, installationType } = req.body;
    let project = null;
    if (projectId) {
      const projectRes = await pool.query('SELECT * FROM public.projects WHERE id = $1', [
        projectId,
      ]);
      project = projectRes.rows[0];
    }
    const detectedType = installationType || project?.installation_type || 'résidentiel';
    const checklistTemplates = {
      Résidentiel: {
        title: 'Checklist Résidentiel NF C 15-100',
        description: 'Installation électrique intérieure et extérieure',
        categories: [
          {
            name: 'Protection différentielle',
            weight: 25,
            checks: [
              { label: "Disjoncteur différentiel 30mA pour salles d'eau", critical: true },
              { label: 'Interrupteur différentiel 30mA pour circuits prises', critical: true },
              { label: 'Parafoudre installé (en zone foudroyée)', critical: false },
              { label: 'Coffret de protection accessible', critical: true },
            ],
          },
          {
            name: 'Câblage et Conducteurs',
            weight: 20,
            checks: [
              { label: 'Section câbles conforme aux normes', critical: true },
              { label: 'Conducteurs identifiés par couleur', critical: true },
              { label: 'Connexions mécaniquement sécurisées', critical: true },
              { label: 'Aucun fil dénudé visible', critical: true },
            ],
          },
          {
            name: 'Mise à la Terre',
            weight: 25,
            checks: [
              { label: 'Prise de terre < 100 ohms', critical: true },
              { label: 'Liaison équipotentielle présente', critical: true },
              { label: 'Conducteur principal de terre continu', critical: true },
              { label: 'Tableau de répartition relié à la terre', critical: true },
            ],
          },
          {
            name: 'Appareillage',
            weight: 15,
            checks: [
              { label: 'Prises avec obturateurs', critical: true },
              { label: 'Interrupteurs hors zones humides', critical: true },
              { label: 'Disjoncteurs tétrapolaires si nécessaire', critical: false },
              { label: 'Fixations solides', critical: false },
            ],
          },
          {
            name: 'Documentation',
            weight: 15,
            checks: [
              { label: 'Schéma électrique fourni', critical: false },
              { label: 'Attestation de conformité CONSEL/COSSUEL', critical: true },
              { label: 'Notice des équipements', critical: false },
            ],
          },
        ],
      },
      Tertiaire: {
        title: 'Checklist Tertiaire & ERP',
        description: 'Établissement Recevant du Public',
        categories: [
          {
            name: 'Sécurité Incendie',
            weight: 30,
            checks: [
              { label: 'Câbles ignifugés', critical: true },
              { label: 'Coffrets en matériau non propagateur', critical: true },
              { label: 'Dispositif coupure urgence visible', critical: true },
              { label: 'Éclairage sécurité opérationnel', critical: true },
            ],
          },
          {
            name: 'Distribution Électrique',
            weight: 25,
            checks: [
              { label: 'TGBT accessible et conforme', critical: true },
              { label: 'Armoires divisionnaires étanches', critical: true },
              { label: 'Protection différentielle adaptée', critical: true },
              { label: 'Section câbles conforme', critical: true },
            ],
          },
          {
            name: 'Mise à la Terre & Protection',
            weight: 25,
            checks: [
              { label: 'Prise de terre < 5 ohms', critical: true },
              { label: 'Liaisons équipotentielles actives', critical: true },
              { label: 'Protection foudre si requis', critical: true },
              { label: 'Parafoudres installés', critical: true },
            ],
          },
          {
            name: 'Éclairage',
            weight: 10,
            checks: [
              { label: 'Éclairage sécurité conforme', critical: true },
              { label: 'Blocs autonomes en place', critical: true },
              { label: 'Niveau éclairement réglementaire', critical: false },
            ],
          },
          {
            name: 'Documentation ERP',
            weight: 10,
            checks: [
              { label: 'Registre sécurité à jour', critical: true },
              { label: 'Rapport vérification périodique', critical: true },
              { label: 'Schémas unifilaires affichés', critical: true },
            ],
          },
        ],
      },
      Industriel: {
        title: 'Checklist Industriel & Usine',
        description: 'Installations industrielles et process',
        categories: [
          {
            name: 'HTA/BT',
            weight: 25,
            checks: [
              { label: 'Poste HTA/BT accessible', critical: true },
              { label: 'Transformateur protégé', critical: true },
              { label: 'Cellules HTA verrouillées', critical: true },
              { label: 'Consignation possible', critical: true },
            ],
          },
          {
            name: 'Machines',
            weight: 25,
            checks: [
              { label: "Arrêt d'urgence accessible", critical: true },
              { label: 'Conformité machine (NF EN 60204)', critical: true },
              { label: 'Câbles machine protégés', critical: true },
              { label: 'Marquage CE visible', critical: true },
            ],
          },
          {
            name: 'Environnement',
            weight: 20,
            checks: [
              { label: 'ATEX zones classifiées', critical: true },
              { label: "Matériel adapté à l'environnement", critical: true },
              { label: 'Ventilation & dégagement chaleur', critical: true },
            ],
          },
          {
            name: 'Protection collective',
            weight: 20,
            checks: [
              { label: 'Protection différentielle adaptée', critical: true },
              { label: 'Schémas liaison terre', critical: true },
              { label: 'Coupure générale accessible', critical: true },
            ],
          },
          {
            name: 'Documentation',
            weight: 10,
            checks: [
              { label: 'Plan de masse électrique', critical: false },
              { label: 'Rapport vérification initiale', critical: true },
              { label: 'Consignes sécurité affichées', critical: true },
            ],
          },
        ],
      },
      'Audit Énergétique': {
        title: 'Checklist Audit Énergétique',
        description: 'Performance énergétique des installations',
        categories: [
          {
            name: 'Mesures',
            weight: 30,
            checks: [
              { label: 'Facture puissance souscrite', critical: false },
              { label: 'Courbe charge mesurée', critical: true },
              { label: 'Facteur puissance mesuré', critical: true },
              { label: 'Harmoniques mesurés', critical: false },
            ],
          },
          {
            name: 'Éclairage',
            weight: 20,
            checks: [
              { label: 'Type éclairage inventorié', critical: false },
              { label: 'Puissance installée connue', critical: false },
              { label: 'Détecteur présence opérationnel', critical: true },
              { label: 'Rendement luminaire', critical: false },
            ],
          },
          {
            name: 'CVC',
            weight: 25,
            checks: [
              { label: 'Pompe chaleur COP connu', critical: false },
              { label: 'Réseau aéraulique isolé', critical: true },
              { label: 'Ventilation double flux', critical: false },
              { label: 'Gestion technique centralisée', critical: false },
            ],
          },
          {
            name: 'Rapport',
            weight: 25,
            checks: [
              { label: 'Bilan énergétique complet', critical: true },
              { label: 'Plan actions priorisé', critical: true },
              { label: 'ROI calculé', critical: true },
              { label: 'Subventions identifiées', critical: false },
            ],
          },
        ],
      },
    };

    const matchedTemplate = checklistTemplates[detectedType] || checklistTemplates['Résidentiel'];
    res.json({ detected_type: detectedType, template: matchedTemplate });
  } catch (err) {
    console.error('[INSPECTION] Suggestion error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inspections/:id/generate-report', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const inspectionRes = await pool.query(
      `SELECT i.*, p.title as project_title, p.technical_info
       FROM public.inspections i LEFT JOIN public.projects p ON i.project_id = p.id WHERE i.id = $1`,
      [id],
    );
    if (inspectionRes.rows.length === 0)
      return res.status(404).json({ error: 'Inspection non trouvée' });
    const inspection = inspectionRes.rows[0];
    let checklistData = { type: 'Résidentiel', items: [] };
    try {
      checklistData =
        typeof inspection.checklist_data === 'string'
          ? JSON.parse(inspection.checklist_data)
          : inspection.checklist_data;
    } catch (e) {}
    const resultsRes = await pool.query(
      'SELECT * FROM public.inspection_results WHERE inspection_id = $1',
      [id],
    );
    const previousResults = resultsRes.rows.map((r) => ({
      type: r.type || 'checklist',
      items: (r.items || []).map((item) => ({
        label: item.label,
        is_compliant: item.is_compliant,
        comment: item.comment,
      })),
    }));
    const prompt = `Génère un rapport d'inspection électrique professionnel en français.
    Projet: ${inspection.project_title || 'N/A'}
    Date: ${inspection.created_at || 'N/A'}
    Checklist: ${JSON.stringify(checklistData)}
    Résultats: ${JSON.stringify(previousResults)}
    Le rapport doit inclure: 1. Résumé exécutif 2. Détail des contrôles 3. Non-conformités 4. Recommandations`;

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'IA non configurée' });
    const genAI = new GoogleGenerativeAI(apiKey);
    let model;
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    } catch (e) {
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
    const result = await model.generateContent(prompt);
    const reportText = result.response?.text?.() || 'Rapport non généré';
    await pool.query(
      'INSERT INTO public.inspection_reports (inspection_id, report, generated_at) VALUES ($1, $2, NOW()) ON CONFLICT (inspection_id) DO UPDATE SET report=$2, generated_at=NOW() RETURNING id',
      [id, reportText],
    );
    res.json({ inspection_id: id, report: reportText, generated_at: new Date().toISOString() });
  } catch (err) {
    console.error('[INSPECTION] Report generation error:', err);
    res
      .status(500)
      .json({ error: err.message, details: err.details, status: err.status, code: err.code });
  }
});

// --- MULTIPART UPLOAD SETUP (multer) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

// --- AI ROUTES (REMAINING) ---
const axios = require('axios');

// AI Provider ping endpoint (used by /expert/ai-providers to test connection)
app.post('/api/ai/ping-provider', authenticateToken, async (req, res) => {
  const { providerId, apiKey } = req.body;
  if (!providerId || !apiKey) {
    return res.status(400).json({ success: false, error: 'providerId et apiKey requis' });
  }
  try {
    const endpoints = {
      groq: {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile',
      },
      openai: { url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o' },
      anthropic: {
        url: 'https://api.anthropic.com/v1/messages',
        model: 'claude-sonnet-4-20250514',
      },
      gemini: {
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        model: 'gemini-pro',
      },
      deepseek: { url: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat' },
      mistral: { url: 'https://api.mistral.ai/v1/chat/completions', model: 'mistral-large-latest' },
      openrouter: { url: 'https://openrouter.ai/api/v1/chat/completions', model: 'openai/gpt-4o' },
      together: {
        url: 'https://api.together.xyz/v1/chat/completions',
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      },
      fireworks: {
        url: 'https://api.fireworks.ai/inference/v1/chat/completions',
        model: 'accounts/fireworks/models/mixtral-8x7b-instruct',
      },
      tavily: { url: 'https://api.tavily.com/search', model: '' },
    };
    const cfg = endpoints[providerId];
    if (!cfg) return res.json({ success: false, error: 'Provider inconnu' });

    const start = Date.now();
    let response;

    if (providerId === 'anthropic') {
      response = await fetch(cfg.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });
    } else if (providerId === 'gemini') {
      response = await fetch(`${cfg.url}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] }),
      });
    } else if (providerId === 'tavily') {
      response = await fetch(cfg.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, query: 'test' }),
      });
    } else {
      // OpenAI-compatible
      response = await fetch(cfg.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });
    }

    const latency = Date.now() - start;
    if (response.ok) {
      return res.json({ success: true, latency });
    }
    const errBody = await response.text().catch(() => '');
    return res.json({
      success: false,
      latency,
      error: `${response.status}: ${errBody.slice(0, 100)}`,
    });
  } catch (err) {
    res.json({ success: false, latency: 0, error: err.message });
  }
});

async function getAiConfigFromDb() {
  try {
    const result = await pool.query('SELECT key, value FROM ai_config WHERE key LIKE $1', [
      'provider_%',
    ]);
    const configs = {};
    for (const row of result.rows) {
      configs[row.key] = row.value;
    }
    return configs;
  } catch {
    return {};
  }
}

function getEnabledProvider(configs) {
  const providerMap = [
    { id: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions', keyPrefix: 'gsk_' },
    { id: 'openai', url: 'https://api.openai.com/v1/chat/completions', keyPrefix: 'sk-' },
    { id: 'anthropic', url: 'https://api.anthropic.com/v1/messages', keyPrefix: 'sk-ant-' },
    {
      id: 'gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      keyPrefix: 'AIza',
    },
    { id: 'deepseek', url: 'https://api.deepseek.com/v1/chat/completions', keyPrefix: 'sk-' },
    { id: 'mistral', url: 'https://api.mistral.ai/v1/chat/completions', keyPrefix: 'MISTRAL_' },
    { id: 'openrouter', url: 'https://openrouter.ai/api/v1/chat/completions', keyPrefix: 'sk-or-' },
  ];
  for (const p of providerMap) {
    if (configs[`provider_${p.id}_enabled`] === 'true' && configs[`provider_${p.id}_key`]) {
      return { ...p, key: configs[`provider_${p.id}_key`] };
    }
  }
  return null;
}

app.post('/api/ai/chat', async (req, res) => {
  try {
    // Priorité 1 : REMOTE_AI activé via .env
    if (REMOTE_AI_ENABLED && AI_API_KEY) {
      const data = await callRemoteAI(req.body);
      return res.json(data);
    }

    // Priorité 2 : Provider configuré depuis l'interface /expert/ai-providers
    const dbConfigs = await getAiConfigFromDb();
    const provider = getEnabledProvider(dbConfigs);
    if (provider) {
      const payload = {
        model:
          req.body.model ||
          (provider.id === 'groq'
            ? 'llama-3.3-70b-versatile'
            : provider.id === 'anthropic'
              ? 'claude-sonnet-4-20250514'
              : provider.id === 'gemini'
                ? 'gemini-pro'
                : provider.id === 'deepseek'
                  ? 'deepseek-chat'
                  : provider.id === 'mistral'
                    ? 'mistral-large-latest'
                    : provider.id === 'openrouter'
                      ? 'openai/gpt-4o'
                      : 'gpt-4o'),
        messages: req.body.messages || [{ role: 'user', content: req.body.prompt || '' }],
        max_tokens: req.body.max_tokens || 1024,
      };

      if (provider.id === 'anthropic') {
        const response = await fetch(provider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': provider.key,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({ ...payload, messages: payload.messages }),
        });
        if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
        const data = await response.json();
        return res.json(data);
      }

      if (provider.id === 'gemini') {
        const response = await fetch(`${provider.url}?key=${provider.key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: req.body.prompt || '' }] }] }),
        });
        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);
        return res.json({ response: text, model: 'gemini-pro' });
      }

      // OpenAI-compatible (Groq, DeepSeek, Mistral, OpenRouter, etc.)
      const response = await fetch(provider.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.key}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`${provider.id} API error (${response.status}): ${errBody.slice(0, 200)}`);
      }
      const data = await response.json();
      // Normaliser au format attendu par le frontend
      const assistantReply =
        data?.choices?.[0]?.message?.content ||
        data?.response ||
        data?.text ||
        JSON.stringify(data);
      return res.json({ response: assistantReply, model: data.model || payload.model });
    }

    // Priorité 3 : Fallback local (legacy, probablement indisponible)
    const { masterRoute } = await import('./modules/ai/master.agent.js');
    const adaptedReq = {
      body: {
        task: 'chat',
        prompt: req.body.prompt || req.body.messages?.[0]?.content || '',
        context: null,
        sessionId: null,
        useRag: false,
      },
    };
    const response = await fetch('http://127.0.0.1:8002/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: adaptedReq.body.prompt }),
    });
    if (response.ok) {
      const data = await response.json();
      return res.json({ response: data.response || data.answer || JSON.stringify(data) });
    }
    const result = await masterRoute(adaptedReq);
    res.json(result);
  } catch (err) {
    console.error('[AI-CHAT] Error:', err);
    res.status(500).json({
      error: 'AI Service Error',
      details: err.message,
      hint: 'Configurez une clé API dans /expert/ai-providers ou ajoutez PROQUELEC_REMOTE_AI=1 dans .env',
    });
  }
});

app.post('/api/ai/vision', upload.single('image'), async (req, res) => {
  try {
    if (REMOTE_VISION_API) {
      console.log('[AI-GATEWAY] Forwarding vision request to remote API');
      const data = await callRemoteVision(req.file.path, req.body.prompt || 'Describe this image.');
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.json(data);
    }
    if (!req.file) return res.status(400).json({ error: 'Image requise' });
    if (!AI_SERVICES.VISION) throw new Error('Aucun service Vision configuré');
    const FormDataLocal = require('form-data');
    const form = new FormDataLocal();
    form.append('image', fs.createReadStream(req.file.path));
    form.append('prompt', req.body.prompt || 'Describe this image in French');
    const response = await fetch('http://127.0.0.1:8003/analyze', {
      method: 'POST',
      headers: form.getHeaders(),
      body: form,
      timeout: 30000,
    });
    if (!response.ok) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res
        .status(502)
        .json({ error: 'Vision AI backend error', details: await response.text() });
    }
    const data = await response.json();
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.json(data);
  } catch (err) {
    console.error('[AI-VISION] Error:', err);
    res.status(500).json({ error: err.message, details: err.message });
  }
});

app.post('/api/ai/image', async (req, res) => {
  try {
    if (REMOTE_IMAGE_API) {
      const data = await callRemoteImage(req.body);
      return res.json(data);
    }
    if (!AI_SERVICES.IMAGE)
      throw new Error('Aucun service Image configuré. Configurez PROQUELEC_REMOTE_IMAGE_API.');
    const response = await fetch('http://127.0.0.1:8004/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      timeout: 300000,
    });
    if (!response.ok)
      return res
        .status(502)
        .json({ error: 'Image AI backend error', details: await response.text() });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[AI-IMAGE] Error:', err);
    res.status(500).json({ error: err.message, details: err.message });
  }
});

app.post('/api/ai/generate-visual', async (req, res) => {
  try {
    if (REMOTE_IMAGE_API) {
      const data = await callRemoteImage(req.body);
      return res.json(data);
    }
    const response = await fetch('http://127.0.0.1:8002/generate-visual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      timeout: 60000,
    });
    if (!response.ok) return res.status(502).json({ error: 'Visual AI backend error' });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[AI-VISUAL] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/content-generation', async (req, res) => {
  try {
    if (REMOTE_AI_ENABLED) {
      const data = await callRemoteAI({
        prompt: req.body.prompt,
        messages: req.body.messages,
        system_prompt: req.body.system_prompt,
        model: req.body.model,
      });
      return res.json(data);
    }
    const { masterRoute } = await import('./modules/ai/master.agent.js');
    const result = await masterRoute({
      body: {
        task: 'generate',
        prompt: req.body.prompt || '',
        context: req.body.system_prompt || null,
      },
    });
    res.json(result);
  } catch (err) {
    console.error('[AI-CONTENT] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ai/status', async (req, res) => {
  if (REMOTE_AI_ENABLED) {
    return res.json([
      {
        service: `Cerveau Expert (${AI_PROVIDER.toUpperCase()})`,
        key: 'brain',
        status: AI_API_KEY ? 'online' : 'offline',
        url: CUSTOM_AI_API_URL || `remote:${AI_PROVIDER}`,
      },
      {
        service: 'Vision Remote',
        key: 'vision',
        status: REMOTE_VISION_API ? 'online' : 'offline',
        url: REMOTE_VISION_API || 'non configuré',
      },
      {
        service: 'Image Remote',
        key: 'image',
        status: REMOTE_IMAGE_API ? 'online' : 'offline',
        url: REMOTE_IMAGE_API || 'non configuré',
      },
    ]);
  }
  const checkService = async (name, url) => {
    try {
      const resp = await fetch(url, { timeout: 5000 });
      return { service: name, status: resp.ok ? 'online' : 'offline' };
    } catch (e) {
      return { service: name, status: 'offline' };
    }
  };
  const statuses = [
    {
      service: 'Cerveau Expert (NLP/RAG)',
      key: 'brain',
      status: 'online',
      url: 'http://127.0.0.1:8002/health',
    },
    {
      service: 'Vision (Analyse Photos)',
      key: 'vision',
      status: 'offline',
      url: 'http://127.0.0.1:8003/health',
    },
    {
      service: "Générateur d'Images",
      key: 'image',
      status: 'offline',
      url: 'http://127.0.0.1:8004/health',
    },
  ];
  res.json(statuses);
});

app.post('/api/admin/ai/start', authenticateToken, requireAdmin, async (_req, res) => {
  return res
    .status(501)
    .json({ error: 'Local AI service unavailable', message: LOCAL_AI_REMOVED_MESSAGE });
});

app.post('/api/admin/ai/stop', authenticateToken, requireAdmin, async (_req, res) => {
  return res
    .status(501)
    .json({ error: 'Local AI service unavailable', message: LOCAL_AI_REMOVED_MESSAGE });
});

// --- CREWAI ORCHESTRATOR ---
app.post('/api/ai/orchestrate', authenticateToken, requireAdmin, orchestrate);

// --- CMS REGISTRY ---
app.get('/api/cms/plugins', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM public.cms_plugins ORDER BY display_name');
    res.json(rows);
  } catch (error) {
    console.error('[CMS] Public plugins list error:', error?.message);
    res.status(500).json({ error: 'Erreur lors du chargement des plugins' });
  }
});

app.get('/api/cms/themes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM public.cms_themes ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('[CMS] Public themes list error:', error?.message);
    res.status(500).json({ error: 'Erreur lors du chargement des thèmes' });
  }
});

// --- SYSTEM CONTROL ---
let pythonProcess = null;

app.post('/api/admin/system/control', authenticateToken, requireAdmin, (req, res) => {
  const { action, service } = req.body;
  if (service === 'python') {
    if (action === 'start') {
      if (pythonProcess) return res.status(400).json({ error: 'Service déjà lancé' });
      startPythonService();
      return res.json({ success: true, message: 'Service IA en cours de démarrage...' });
    } else if (action === 'stop') {
      if (!pythonProcess) return res.status(400).json({ error: 'Service déjà arrêté' });
      pythonProcess.kill();
      pythonProcess = null;
      return res.json({ success: true, message: 'Service IA arrêté' });
    }
  }
  res.status(400).json({ error: 'Action ou service non supporté' });
});

// ------------------------------------------
// LEGACY ROUTE MODULES
// ------------------------------------------

// Register legacy route files
const permissionsRouter = require('./routes/permissions');
app.use('/api/permissions', permissionsRouter);
const versionsRouter = require('./routes/versions');
app.use('/api/versions', versionsRouter);
const auditRouter = require('./routes/audit');
app.use('/api/audit', auditRouter);
const officeRouter = require('./routes/office');
app.use('/api/office', officeRouter);
const academyRouter = require('./routes/academy');
app.use('/api/academy', academyRouter);
const builderPermsRouter = require('./routes/builder-permissions');
app.use('/api/admin/builder-permissions', builderPermsRouter);

// CMS public/admin APIs mounted under /api/cms to avoid conflict with /api/events SSE.
const cmsModule = require('./modules/cms/cms.routes');
app.use('/api/cms', cmsModule.router);

// Pages module (must be BEFORE projects to avoid router-level auth interception)
const pagesModule = require('./modules/pages/pages.routes');
app.use(pagesModule.basePath || '/api', pagesModule.router);

// ELECTRO-GED 4.0 Modules
const projectsRouter = require('./routes/projects');
const inspectionsRouter = require('./routes/inspections');
const observatoireRouter = require('./routes/observatoire');
const builderModule = require('./modules/builder/builder.routes');
const templatesModule = require('./modules/templates/templates.routes');
app.use('/api', projectsRouter);
app.use('/api', inspectionsRouter);
app.use('/api', observatoireRouter);
app.use(
  builderModule.basePath || '/api',
  async (req, res, next) => {
    try {
      if (req.path.startsWith('/builder')) await ensureBuilderRuntimeTables();
      next();
    } catch (error) {
      next(error);
    }
  },
  builderModule.router,
);
app.use(templatesModule.basePath || '/api', templatesModule.router);

// ------------------------------------------
// SPA (Single Page Application) - Servir le frontend buildé
// ------------------------------------------
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('[SPA] Serving static files from', distPath);

  // Catch-all pour le routage client-side : servir index.html pour toute route non-API, non-fichier
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    if (path.extname(req.path)) return next();
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
    next();
  });
} else {
  console.warn('[SPA] dist directory not found at', distPath, '— SPA fallback disabled.');
}

// ------------------------------------------
// CATCH-ALL & ERROR HANDLING
// ------------------------------------------

// Catch-all 404 pour les routes API inexistantes
app.use('/api', (req, res) => {
  handleAppError(
    new AppError(
      'DB_NOT_FOUND',
      `L'endpoint ${req.originalUrl} n'existe pas encore sur ce serveur.`,
    ),
    res,
  );
});

// Final error middleware
app.use((err, req, res, next) => {
  console.error('SERVER CRASH DETECTED:', err);
  handleAppError(err, res);
});

// ------------------------------------------
// SERVER STARTUP
// ------------------------------------------

async function ensureBuilderRuntimeTables() {
  // Check and create builder-related tables if needed
  try {
    const { rows } = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'builder_snapshots')",
    );
    if (!rows[0].exists) {
      await pool.query(`CREATE TABLE IF NOT EXISTS public.builder_snapshots (
        id SERIAL PRIMARY KEY, page_id UUID NOT NULL, label VARCHAR(255) NOT NULL,
        snapshot JSONB NOT NULL, snapshot_type VARCHAR(50) DEFAULT 'manual',
        metadata JSONB DEFAULT '{}', created_by UUID, created_at TIMESTAMP DEFAULT NOW()
      )`);
      console.log('[BUILDER] Created builder_snapshots table');
    }
  } catch (e) {
    console.warn('[BUILDER] ensureBuilderRuntimeTables error:', e.message);
  }
}

async function initDB() {
  // Database initialization - create tables if they don't exist
  const initialPages = [
    {
      title: 'Accueil',
      slug: 'home',
      content: 'Bienvenue sur PROQUELEC',
      meta_description:
        'PROQUELEC - Promotion de la Qualité des Installations Électriques au Sénégal',
      hero_title: 'Votre Sécurité Électrique',
      hero_subtitle: 'Notre Priorité Nationale',
      menu_order: 0,
    },
    {
      title: 'Qui sommes-nous',
      slug: 'about',
      content: 'PROQUELEC, institution sénégalaise...',
      meta_description: "Découvrez PROQUELEC, l'institution de référence",
      hero_title: 'Qui sommes-nous ?',
      hero_subtitle: 'Notre histoire, notre mission',
      menu_order: 1,
    },
    {
      title: 'Certifications',
      slug: 'certifications',
      content: 'Certifications et labels...',
      meta_description: 'Certifications PROQUELEC',
      hero_title: 'Certifications',
      hero_subtitle: 'Gage de qualité et de confiance',
      menu_order: 2,
    },
    {
      title: 'Formations',
      slug: 'formations',
      content: 'Nos formations professionnelles...',
      meta_description: 'Formations en électricité',
      hero_title: 'Formations',
      hero_subtitle: 'Montez en compétences',
      menu_order: 3,
    },
    {
      title: 'Actualités',
      slug: 'actualites',
      content: 'Actualités et événements...',
      meta_description: 'Actualités PROQUELEC',
      hero_title: 'Actualités',
      hero_subtitle: 'Restez informé',
      menu_order: 4,
    },
    {
      title: 'Contact',
      slug: 'contact',
      content: '',
      meta_description: 'Contactez PROQUELEC — formulaire de contact, téléphone, email et adresse.',
      hero_title: 'Contact',
      hero_subtitle: 'Parlons de votre projet',
      immutable: true,
      menu_order: 5,
    },
    {
      title: 'Normes et Ressources',
      slug: 'normes',
      content: 'Normes électriques...',
      meta_description: 'Normes et ressources techniques',
      hero_title: 'Normes & Ressources',
      hero_subtitle: 'La référence technique',
      menu_order: 6,
    },
    {
      title: 'Outils',
      slug: 'outils',
      content: 'Outils pour électriciens...',
      meta_description: 'Outils professionnels',
      hero_title: 'Outils',
      hero_subtitle: 'Simplifiez votre travail au quotidien',
      menu_order: 7,
    },
    {
      title: 'Observatoire',
      slug: 'observatoire',
      content: 'Observatoire de la qualité électrique...',
      meta_description: 'Observatoire PROQUELEC',
      hero_title: 'Observatoire',
      hero_subtitle: 'La qualité électrique en temps réel',
      menu_order: 8,
    },
    {
      title: 'PROQUELEC Lab',
      slug: 'lab',
      content: "Laboratoire d'innovation...",
      meta_description: 'PROQUELEC Lab',
      menu_order: 9,
    },
  ];

  // Create tables
  await pool.query(
    `CREATE TABLE IF NOT EXISTS public.site_settings (id INTEGER PRIMARY KEY DEFAULT 1, site_name TEXT, slogan TEXT, logo_url TEXT, favicon_url TEXT, contact_email TEXT, phone_number TEXT, address TEXT, copyright_text TEXT, facebook_url TEXT, linkedin_url TEXT, twitter_url TEXT, logo_height INTEGER, logo_scale REAL, logo_brightness REAL, logo_contrast REAL, cta_primary_text TEXT, cta_primary_url TEXT, cta_secondary_text TEXT, cta_secondary_url TEXT, updated_at TIMESTAMP)`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS public.theme_settings (id INTEGER PRIMARY KEY DEFAULT 1, primary_color TEXT, secondary_color TEXT, accent_color TEXT, background_color TEXT, text_color TEXT, font_family TEXT, footer_background_url TEXT)`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS public.pages (id SERIAL PRIMARY KEY, title TEXT, slug TEXT UNIQUE, content TEXT, content_raw TEXT, content_blocks JSONB, structure_json JSONB, design_options JSONB, security_level TEXT DEFAULT 'public', immutable BOOLEAN DEFAULT false, is_published BOOLEAN DEFAULT false, categories TEXT[], tags TEXT[], author TEXT, excerpt TEXT, meta_description TEXT, meta_keywords TEXT, meta_robots TEXT DEFAULT 'index,follow', featured_image TEXT, template TEXT DEFAULT 'default', show_hero BOOLEAN DEFAULT true, show_footer BOOLEAN DEFAULT true, custom_css TEXT, custom_js TEXT, header_html TEXT, footer_html TEXT, hero_title TEXT, hero_subtitle TEXT, hero_background_image TEXT, hero_cta_text TEXT, hero_cta_link TEXT, published_at TIMESTAMP, workflow_status TEXT DEFAULT 'draft', status TEXT DEFAULT 'draft', publish_date TIMESTAMP, unpublish_date TIMESTAMP, reading_time INTEGER DEFAULT 0, theme_config JSONB, draft_json JSONB, builder_revision INTEGER DEFAULT 0, builder_content_hash TEXT, version INTEGER DEFAULT 1, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`,
  );

  // Check and insert initial pages
  for (const page of initialPages) {
    const existing = await pool.query('SELECT id FROM public.pages WHERE slug = $1', [page.slug]);
    if (existing.rows.length === 0) {
      const contentJson = JSON.stringify([
        { id: 'default-block', type: 'ContentBlock', props: { content: page.content || '' } },
      ]);
      await pool.query(
        'INSERT INTO public.pages (title, slug, content, structure_json, meta_description, hero_title, hero_subtitle, is_published, status, menu_order, immutable, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9, $10, NOW(), NOW())',
        [
          page.title,
          page.slug,
          page.content || '',
          contentJson,
          page.meta_description,
          page.hero_title,
          page.hero_subtitle,
          page.status || 'published',
          page.menu_order || 0,
          page.immutable || false,
        ],
      );
    }
  }

  // Create other required tables
  await pool.query(
    `CREATE TABLE IF NOT EXISTS public.home_hero (id INTEGER PRIMARY KEY DEFAULT 1, title TEXT, subtitle TEXT, description TEXT, cta_text TEXT, cta_link TEXT, background_url TEXT)`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS public.home_slides (id SERIAL PRIMARY KEY, badge TEXT, title TEXT, subtitle TEXT, description TEXT, background_url TEXT, cta_text TEXT, cta_link TEXT, secondary_cta_text TEXT, secondary_cta_link TEXT, display_order INTEGER DEFAULT 0)`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS public.home_services (id SERIAL PRIMARY KEY, title TEXT, subtitle TEXT, description TEXT, cta_text TEXT, cta_link TEXT, background_url TEXT, created_at TIMESTAMP DEFAULT NOW())`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS public.home_stats (id SERIAL PRIMARY KEY, label TEXT, value TEXT, icon_name TEXT, description TEXT, is_warning BOOLEAN DEFAULT false, display_order INTEGER DEFAULT 0)`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS public.partners (id SERIAL PRIMARY KEY, name TEXT, logo_url TEXT, category TEXT, display_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true)`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS public.quick_links (id SERIAL PRIMARY KEY, title TEXT, description TEXT, url TEXT, icon_name TEXT, display_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true)`,
  );

  // Create admin user if not exists
  const adminEmail = 'admin@proquelec.sn';
  let adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const userCheck = await pool.query('SELECT id FROM public.users WHERE email = $1', [adminEmail]);
  if (userCheck.rows.length === 0) {
    if (adminPassword.length < 6) adminPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await pool.query(
      'INSERT INTO public.users (email, password_hash, role, is_active, created_at) VALUES ($1, $2, $3, true, NOW())',
      [adminEmail, hashedPassword, 'admin'],
    );
    console.log(`[DB] Admin user created: ${adminEmail}`);
  }

  // Auto-migrate contact page to functional (immutable) CMS page
  try {
    const functionalStructure = JSON.stringify({
      ROOT: {
        type: 'div',
        nodes: ['func_page_block'],
        props: { style: {} },
        linkedNodes: {},
      },
      func_page_block: {
        type: { resolvedName: 'FunctionalPageBlock' },
        nodes: [],
        props: { slug: 'contact', pageTitle: 'Contact' },
        parent: 'ROOT',
        linkedNodes: {},
        isCanvas: false,
        displayName: 'FunctionalPageBlock',
      },
    });
    const designOptions = JSON.stringify({ locked: true, functional: true });
    const setImmutableTrigger = async (client, enabled) => {
      const action = enabled ? 'ENABLE' : 'DISABLE';
      await client.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM pg_trigger
            WHERE tgname = 'trg_immutable_prevent'
              AND tgrelid = 'public.pages'::regclass
          ) THEN
            EXECUTE 'ALTER TABLE public.pages ${action} TRIGGER trg_immutable_prevent';
          END IF;
        END $$;
      `);
    };
    const contactPage = await pool.query(
      'SELECT id, immutable, structure_json::text AS structure_json FROM public.pages WHERE slug = $1 LIMIT 1',
      ['contact'],
    );
    if (contactPage.rows.length > 0) {
      const page = contactPage.rows[0];
      const hasFunctionalStructure = String(page.structure_json || '').includes(
        'FunctionalPageBlock',
      );
      const mustRepairContactPage = page.immutable !== true || !hasFunctionalStructure;

      if (mustRepairContactPage) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await setImmutableTrigger(client, false);
          await client.query(
            `UPDATE public.pages
             SET immutable = true,
                 is_published = true,
                 status = 'published',
                 workflow_status = 'published',
                 content = '',
                 content_raw = '',
                 structure_json = $1,
                 draft_json = $1,
                 design_options = COALESCE(design_options, '{}'::jsonb) || $2::jsonb,
                 meta_description = 'Contactez PROQUELEC — formulaire de contact, téléphone, email et adresse.',
                 hero_title = 'Contact',
                 hero_subtitle = 'Parlons de votre projet',
                 updated_at = NOW()
             WHERE slug = 'contact'`,
            [functionalStructure, designOptions],
          );
          await setImmutableTrigger(client, true);
          await client.query('COMMIT');
        } catch (repairErr) {
          await client.query('ROLLBACK');
          throw repairErr;
        } finally {
          client.release();
        }
        console.log('[DB] Contact page migrated to immutable functional page.');
      }
    } else {
      await pool.query(
        `INSERT INTO public.pages
         (title, slug, content, content_raw, structure_json, draft_json, design_options, immutable,
          is_published, status, workflow_status, menu_order, meta_description, hero_title, hero_subtitle,
          created_at, updated_at)
         VALUES ($1, $2, '', '', $3, $3, $4, true, true, 'published', 'published', $5, $6, $7, $8, NOW(), NOW())`,
        [
          'Contact',
          'contact',
          functionalStructure,
          designOptions,
          5,
          'Contactez PROQUELEC — formulaire de contact, téléphone, email et adresse.',
          'Contact',
          'Parlons de votre projet',
        ],
      );
      console.log('[DB] Contact functional page created.');
    }
  } catch (migrateErr) {
    console.warn('[DB] Contact page migration skipped:', migrateErr.message);
  }

  console.log('[DB] Database initialization complete');
}

function startPythonService() {
  const scriptPath = path.join(__dirname, 'ai_agents', 'main_entry.py');
  if (fs.existsSync(scriptPath)) {
    const pythonPath = path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe');
    pythonProcess = spawn(pythonPath, [scriptPath], { stdio: 'pipe' });
    pythonProcess.stdout.on('data', (data) => console.log(`[PYTHON] ${data}`));
    pythonProcess.stderr.on('data', (data) => console.error(`[PYTHON] ${data}`));
    pythonProcess.on('close', (code) => {
      console.log(`[PYTHON] Process exited with code ${code}`);
      pythonProcess = null;
    });
  }
}

// Start server
initDB()
  .then(() => {
    startSyncEngine(pool);
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('CRITICAL: Database initialization failed:', err);
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port} (DEGRADED MODE - DB INIT FAILED)`);
    });
  });
