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
const { sendEmail, emailTemplates } = require('./email-service');
const { startSyncEngine } = require('./sync-engine'); // Observatoire Sync

// -- LOG BUFFER FOR REAL-TIME MONITORING --
const logBuffer = [];
const MAX_LOGS = 100;

const logToBuffer = (msg, type = 'info') => {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    message: msg.trim(),
  };
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

// ------------------------------

// (AI Gateway moved below app initialization)

// -----------------------------
// --------------------------------------

const app = express();
const port = process.env.PORT || 3000;
const swaggerPort = process.env.SWAGGER_PORT || 3103;

// --- Simple SSE (Server-Sent Events) broadcaster for Admin -> Public instant updates ---
const sseClients = new Map(); // Map of response -> metadata (connect time, etc)
const sseStats = { totalConnections: 0, activeConnections: 0 };

function sendSseEvent(event, data) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data || {});
  const disconnectedClients = [];

  for (const [res, metadata] of sseClients) {
    try {
      // Skip if response is closed
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

  // Clean up disconnected clients
  for (const res of disconnectedClients) {
    sseClients.delete(res);
    sseStats.activeConnections = sseClients.size;
  }

  const discCount = disconnectedClients.length;
  if (discCount > 0) {
    console.log(
      `[SSE] Cleaned up ${discCount} disconnected client(s). Active: ${sseStats.activeConnections}`,
    );
  }
}

// Heartbeat to keep connections alive (every 30s)
setInterval(() => {
  for (const [res, metadata] of sseClients) {
    try {
      if (!res.writableEnded && !res.destroyed) {
        res.write(`:heartbeat\n\n`);
        metadata.lastHeartbeat = Date.now();
      }
    } catch (e) {
      // Connection likely closed, will be cleaned up on next event
    }
  }
}, 30000);

app.get('/api/events', (req, res) => {
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
app.get('/api/events/stats', (req, res) => {
  res.json({
    ...sseStats,
    timestamp: new Date().toISOString(),
  });
});

// Create separate Express app for Swagger documentation
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

// Redirect root to api-docs
swaggerApp.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Start Swagger server on port 3103
swaggerApp.listen(swaggerPort, () => {
  console.log(`📚 Swagger API Documentation running at http://localhost:${swaggerPort}/api-docs`);
});

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Rate limiting — généreux pour le développement
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: { error: 'Trop de requêtes, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: { error: 'Trop de tentatives, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- AUTHENTICATION MIDDLEWARE ---
const { authenticateToken, requireAdmin, requirePermission } = require('./middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;

// Endpoint pour récupérer les permissions de l'utilisateur connecté (pour le frontend)
app.get('/api/user/permissions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Récupérer toutes les permissions de l'utilisateur via son rôle + overrides
    const result = await pool.query(
      `
            SELECT DISTINCT p.name
            FROM public.permissions p
            WHERE p.id IN (
                -- Permissions du rôle
                SELECT permission_id
                FROM public.role_permissions
                WHERE role = $1

                UNION

                -- Permissions spécifiques à l'utilisateur (overrides)
                SELECT permission_id
                FROM public.user_permissions
                WHERE user_id = $2 AND granted = true
            )
            ORDER BY p.name
        `,
      [userRole, userId],
    );

    const permissions = result.rows.map((row) => row.name);

    res.json({
      permissions,
      role: userRole,
      count: permissions.length,
    });
  } catch (err) {
    console.error('[RBAC] Erreur récupération permissions:', err);
    res.status(500).json({ error: 'Impossible de récupérer les permissions' });
  }
});

// ADMIN: Liste toutes les permissions disponibles
app.get('/api/admin/permissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT id, name, description, category, created_at
            FROM public.permissions
            ORDER BY category, name
        `);
    res.json(result.rows);
  } catch (err) {
    console.error('[ADMIN] Erreur récupération permissions:', err);
    res.status(500).json({ error: 'Impossible de récupérer les permissions' });
  }
});

// ADMIN: Mapping des permissions par rôle
app.get('/api/admin/role-permissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT rp.role, array_agg(p.name ORDER BY p.name) as permissions
            FROM public.role_permissions rp
            JOIN public.permissions p ON rp.permission_id = p.id
            GROUP BY rp.role
            ORDER BY rp.role
        `);
    res.json(result.rows);
  } catch (err) {
    console.error('[ADMIN] Erreur récupération mapping rôles:', err);
    res.status(500).json({ error: 'Impossible de récupérer le mapping des rôles' });
  }
});

// ============================================
// INSPECTION WIZARD INTELLIGENCE (Point 5)
// ============================================

// Suggérer une checklist intelligente selon le type d'installation
app.post('/api/inspections/suggest-checklist', authenticateToken, async (req, res) => {
  try {
    const { projectId, installationType } = req.body;

    // Récupérer les infos du projet
    let project = null;
    if (projectId) {
      const projectRes = await pool.query('SELECT * FROM public.projects WHERE id = $1', [
        projectId,
      ]);
      project = projectRes.rows[0];
    }

    const detectedType =
      installationType || project?.technical_info?.installation_type || 'Résidentiel';

    // Checklists intelligentes basées sur NS 01-001
    const checklistTemplates = {
      Résidentiel: {
        title: 'Inspection Résidentielle NS 01-001',
        description: 'Checklist complète pour installations résidentielles (maisons, appartements)',
        categories: [
          {
            name: 'Comptage et Protection',
            weight: 25,
            checks: [
              { label: 'Présence et conformité du compteur électrique', critical: true },
              { label: 'Disjoncteur de branchement (calibre adapté)', critical: true },
              { label: "Dispositif différentiel 30mA en tête d'installation", critical: true },
              {
                label: 'Protection contre les surintensités (disjoncteurs/fusibles)',
                critical: true,
              },
            ],
          },
          {
            name: 'Tableau Électrique',
            weight: 20,
            checks: [
              { label: 'Accessibilité et identification des circuits', critical: false },
              { label: "Connexions serrées et absence d'échauffement", critical: true },
              { label: 'Présence de schéma unifilaire', critical: false },
              { label: 'Réserve de 20% pour extensions futures', critical: false },
            ],
          },
          {
            name: 'Mise à la Terre',
            weight: 30,
            checks: [
              { label: 'Présence et continuité de la prise de terre', critical: true },
              { label: 'Valeur de résistance de terre < 100 Ω', critical: true },
              { label: "Liaison équipotentielle salle d'eau", critical: true },
              { label: 'Conducteur de protection visible et continu', critical: true },
            ],
          },
          {
            name: 'Installation Intérieure',
            weight: 15,
            checks: [
              { label: 'Prises de courant avec terre (type E/F)', critical: false },
              { label: 'Conducteurs de section adaptée (min 1.5mm²)', critical: true },
              { label: 'Absence de fils dénudés ou détériorés', critical: true },
              { label: 'Protection IP adaptée aux locaux humides', critical: true },
            ],
          },
          {
            name: 'Éclairage et Circuits Spécialisés',
            weight: 10,
            checks: [
              { label: 'Circuits séparés pour gros consommateurs', critical: false },
              { label: 'Interrupteurs accessibles et fonctionnels', critical: false },
              { label: 'Luminaires fixés solidement', critical: false },
            ],
          },
        ],
      },
      Tertiaire: {
        title: 'Inspection Tertiaire NS 01-001',
        description: 'Checklist pour installations tertiaires (bureaux, commerces, écoles)',
        categories: [
          {
            name: 'Distribution Générale',
            weight: 25,
            checks: [
              { label: 'TGBT conforme et accessible', critical: true },
              { label: 'Tableaux divisionnaires avec schémas', critical: true },
              { label: 'Protection différentielle par départ', critical: true },
              { label: 'Sélectivité des protections assurée', critical: true },
            ],
          },
          {
            name: 'Éclairage de Sécurité',
            weight: 20,
            checks: [
              { label: 'BAES fonctionnels et testés', critical: true },
              { label: "Éclairage d'évacuation conforme", critical: true },
              { label: 'Blocs autonomes avec autonomie 1h min', critical: true },
            ],
          },
          {
            name: 'Mise à la Terre et Parafoudre',
            weight: 30,
            checks: [
              { label: 'Résistance de terre < 30 Ω (tertiaire)', critical: true },
              { label: 'Parafoudre sur installation si requis', critical: true },
              { label: 'Liaisons équipotentielles conformes', critical: true },
            ],
          },
          {
            name: 'Circuits Spécialisés',
            weight: 15,
            checks: [
              { label: 'Climatisation sur circuit dédié', critical: false },
              { label: 'Groupe électrogène (si présent) testé', critical: false },
              { label: 'Borne de recharge VE conforme (si présente)', critical: false },
            ],
          },
          {
            name: 'Documentation',
            weight: 10,
            checks: [
              { label: 'Schémas électriques à jour', critical: true },
              { label: 'Registre de maintenance disponible', critical: false },
              { label: 'Attestation de conformité Consuel', critical: true },
            ],
          },
        ],
      },
      Industriel: {
        title: 'Inspection Industrielle NS 01-001',
        description: 'Checklist pour installations industrielles (usines, ateliers)',
        categories: [
          {
            name: 'Distribution HT/BT',
            weight: 30,
            checks: [
              { label: 'Poste de transformation conforme', critical: true },
              { label: 'Cellules HT avec dispositif de coupure', critical: true },
              { label: 'Transformateur HT/BT avec protection', critical: true },
              { label: 'TGBT avec jeu de barres dimensionné', critical: true },
            ],
          },
          {
            name: 'Protection et Sécurité',
            weight: 25,
            checks: [
              { label: "Arrêts d'urgence fonctionnels sur machines", critical: true },
              { label: 'Protection différentielle adaptée type B (variateurs)', critical: true },
              { label: 'Système de consignation/déconsignation', critical: true },
            ],
          },
          {
            name: 'Mise à la Terre Renforcée',
            weight: 25,
            checks: [
              { label: 'Résistance de terre < 10 Ω (industriel)', critical: true },
              { label: 'Boucle à fond de fouilles présente', critical: true },
              { label: 'Mesure et contrôle annuel documenté', critical: true },
            ],
          },
          {
            name: 'Machines et Équipements',
            weight: 15,
            checks: [
              { label: 'Machines fixes sur départs dédiés', critical: true },
              { label: 'Coffrets de commande IP44 minimum', critical: true },
              { label: 'Chemins de câbles conformes', critical: false },
            ],
          },
          {
            name: 'Conformité Réglementaire',
            weight: 5,
            checks: [
              { label: 'Vérifications périodiques à jour', critical: true },
              { label: 'Attestation de conformité installateur', critical: true },
              { label: "Plan d'intervention électrique affiché", critical: true },
            ],
          },
        ],
      },
      'Audit Énergétique': {
        title: 'Expertise Performance Énergétique',
        description: "Diagnostic d'efficacité énergétique et optimisation des consommations",
        categories: [
          {
            name: 'Analyse des Consommations',
            weight: 30,
            checks: [
              { label: 'Relevé des puissances actives et réactives', critical: false },
              { label: 'Analyse du facteur de puissance (cos phi)', critical: true },
              { label: 'Identification des pointes de demande', critical: false },
              { label: 'Équilibrage des phases vérifié', critical: true },
            ],
          },
          {
            name: "Qualité de l'Énergie",
            weight: 25,
            checks: [
              { label: 'Taux de distorsion harmonique (THD)', critical: false },
              { label: 'Absence de papillotement (flicker)', critical: false },
              { label: 'Mesure des micro-coupures', critical: false },
            ],
          },
          {
            name: 'Optimisation Éclairage & HVAC',
            weight: 20,
            checks: [
              { label: 'Présence de variateurs de vitesse sur moteurs', critical: false },
              { label: 'Relamping LED effectué ou planifié', critical: false },
              { label: 'Gestion technique du bâtiment (GTB) fonctionnelle', critical: false },
            ],
          },
          {
            name: 'Énergies Renouvelables',
            weight: 25,
            checks: [
              { label: "Potentiel d'intégration photovoltaïque", critical: false },
              { label: "Système de stockage d'énergie (si existant)", critical: false },
              { label: 'Point de livraison injection réseau conforme', critical: true },
            ],
          },
        ],
      },
    };

    // Sélectionner la checklist appropriée
    const matchedTemplate = checklistTemplates[detectedType] || checklistTemplates['Résidentiel'];

    res.json({
      detected_type: detectedType,
      template: matchedTemplate,
      project_context: project
        ? {
            title: project.title,
            power: project.technical_info?.power_subscribed,
            voltage: project.technical_info?.voltage_type,
          }
        : null,
      message: `Checklist "${matchedTemplate.title}" suggérée pour ${detectedType}`,
    });
  } catch (err) {
    console.error('[INSPECTION] Erreur suggestion checklist:', err);
    res.status(500).json({ error: 'Impossible de générer la checklist' });
  }
});

// Générer un rapport explicatif IA pour une inspection
app.post('/api/inspections/:id/generate-report', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer l'inspection complète
    const inspectionRes = await pool.query(
      `SELECT i.*, p.title as project_title, p.technical_info
             FROM public.inspections i
             LEFT JOIN public.projects p ON i.project_id = p.id
             WHERE i.id = $1`,
      [id],
    );

    if (inspectionRes.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection introuvable' });
    }

    const inspection = inspectionRes.rows[0];

    // Récupérer les points de contrôle s'ils ne sont pas dans la colonne checklist
    let checklistData = inspection.checklist;
    if (!checklistData) {
      const resultsRes = await pool.query(
        `SELECT ci.label, r.is_compliant, r.inspector_comment
                 FROM public.inspection_results r
                 JOIN public.checklist_items ci ON r.checklist_item_id = ci.id
                 WHERE r.inspection_id = $1`,
        [id],
      );
      checklistData = {
        type: 'standard',
        items: resultsRes.rows.map((r) => ({
          label: r.label,
          is_compliant: r.is_compliant,
          comment: r.inspector_comment,
        })),
      };
    }

    // Construire le prompt pour Gemini (Cortex Expert Diagnostic & Audit)
    const prompt = `Tu es l'Expert Senior en Diagnostic Électrique et Audit Énergétique de PROQUELEC.
Ta mission est d'analyser les données collectées sur le terrain par nos agents techniques et de générer un rapport de diagnostic de haute précision.

CONTEXTE DU DIAGNOSTIC :
- Projet : ${inspection.project_title}
- Usage : ${inspection.technical_info?.installation_type || 'Non spécifié'}
- Score de Santé Électrique : ${inspection.overall_score}/100
- Données Terrain : ${JSON.stringify(checklistData)}

STRUCTURE DU RAPPORT (Format Professionnel Interne) :

1. BILAN DE SÉCURITÉ ÉLECTRIQUE (Priorité Absolue)
   - Analyse des risques critiques (incendie, électrocution).
   - État de la mise à la terre et des protections différentielles.
   - Points de non-conformité majeure selon la norme NS 01-001.

2. AUDIT DE PERFORMANCE ÉNERGÉTIQUE
   - Analyse des points de déperdition ou d'inefficacité.
   - Analyse de l'équilibrage des phases (si applicable).
   - Recommandations pour l'optimisation de la consommation.

3. PLAN D'ACTION TECHNIQUE (Pour l'agent terrain)
   - Actions correctives immédiates (Sécurité).
   - Améliorations suggérées à moyen terme (Énergie).
   - Estimation de la complexité des travaux.

4. CONCLUSION D'EXPERT
   - Verdict global sur la dangerosité et l'efficience.
   - Avis sur la possibilité de certification future.

Utilise un ton expert, factuel et pédagogique. Cite les articles de la norme NS 01-001. Sois très précis sur les recommandations techniques.`;

    // Appeler Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[INSPECTION] GEMINI_API_KEY manquante');
      return res.status(503).json({ error: 'Système IA non configuré' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let model;
    console.log(`[INSPECTION] Début génération rapport pour inspection ${id}...`);

    try {
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    } catch (e) {
      console.warn(`[INSPECTION] Fallback gemini-pro car 1.5-flash failed:`, e.message);
      model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    console.log(`[INSPECTION] Appel Gemini avec prompt (${prompt.length} chars)...`);
    const result = await generateWithRetry(model, prompt);

    if (!result || !result.response) {
      console.error('[INSPECTION] Résultat Gemini invalide:', result);
      throw new Error('Réponse Gemini vide ou invalide');
    }

    const reportText = result.response.text();
    console.log(`[INSPECTION] Rapport généré (${reportText.length} chars).`);

    // Stocker le rapport généré dans la base de données
    await pool.query(
      `UPDATE public.inspections
             SET ai_report = $1, ai_report_generated_at = NOW()
             WHERE id = $2`,
      [reportText, id],
    );

    res.json({
      inspection_id: id,
      report: reportText,
      generated_at: new Date().toISOString(),
      message: 'Rapport IA généré avec succès',
    });
  } catch (err) {
    console.error('[INSPECTION] Erreur génération rapport IA:', err);
    res.status(500).json({
      error: 'Impossible de générer le rapport IA',
      details: err.message,
      status: err.status || 500,
      code: err.code || 'AI_ERROR',
    });
  }
});

// --- UTILS ---
async function generateWithRetry(model, parts, maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await model.generateContent(parts);
    } catch (error) {
      lastError = error;
      if (
        error.status === 429 ||
        error.message?.includes('429') ||
        error.message?.includes('Resource has been exhausted')
      ) {
        const waitTime = Math.pow(2, i) * 1000;
        console.warn(
          `[AI-RETRY] 429 detected, waiting ${waitTime}ms before retry ${i + 1}/${maxRetries}`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
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
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for videos
});

// ------------------------------
// -- AI GATEWAY (CORTEX PROXY) --
const axios = require('axios');

// Service Endpoints (Docker/Remote only)
const AI_SERVICES = {
  BRAIN: process.env.AI_BRAIN_URL || '',
  VISION: process.env.AI_VISION_URL || '',
  IMAGE: process.env.AI_IMAGE_URL || '',
};

const LOCAL_AI_REMOVED = true;
const LOCAL_AI_REMOVED_MESSAGE =
  'Le backend local haystack_backend a été retiré. Configurez un service distant (PROQUELEC_REMOTE_AI=1 / PROQUELEC_AI_PROVIDER / AI_BRAIN_URL / PROQUELEC_REMOTE_VISION_API).';

const REMOTE_AI_ENABLED =
  ['1', 'true'].includes((process.env.PROQUELEC_REMOTE_AI || '').toLowerCase()) ||
  !!process.env.PROQUELEC_AI_PROVIDER ||
  !!process.env.PROQUELEC_AI_API_URL;
const AI_PROVIDER = (process.env.PROQUELEC_AI_PROVIDER || 'openai').toLowerCase();
const AI_API_KEY = process.env.PROQUELEC_API_KEY;
const CUSTOM_AI_API_URL = process.env.PROQUELEC_AI_API_URL;
const REMOTE_IMAGE_API = process.env.PROQUELEC_REMOTE_IMAGE_API;
const IMAGE_API_KEY = process.env.PROQUELEC_IMAGE_API_KEY;
const REMOTE_VISION_API = process.env.PROQUELEC_REMOTE_VISION_API || REMOTE_IMAGE_API;
const REMOTE_AI_MODEL =
  process.env.PROQUELEC_AI_MODEL || (AI_PROVIDER === 'anthropic' ? 'claude-3.5' : 'gpt-4o');

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
  return alias[provider?.toLowerCase()] || provider?.toLowerCase();
}

async function callRemoteAI(body) {
  if (!AI_API_KEY && !CUSTOM_AI_API_URL) {
    throw new Error('PROQUELEC_API_KEY ou PROQUELEC_AI_API_URL requis pour remote AI.');
  }
  const provider = CUSTOM_AI_API_URL ? null : normalizeProvider(AI_PROVIDER);
  const headers = { 'Content-Type': 'application/json' };
  if (CUSTOM_AI_API_URL) {
    if (AI_API_KEY) headers.Authorization = `Bearer ${AI_API_KEY}`;
    const response = await axios.post(CUSTOM_AI_API_URL, body, { headers, timeout: 90000 });
    return response.data;
  }
  if (provider === 'anthropic') {
    headers['x-api-key'] = AI_API_KEY;
    const messages = body.messages || [];
    let prompt = body.prompt || '';
    if (messages.length) {
      prompt = messages
        .map((m) => {
          if (m.role === 'user') return `\n\nHuman: ${m.content}`;
          if (m.role === 'assistant') return `\n\nAssistant: ${m.content}`;
          return '';
        })
        .join('');
    }
    if (!prompt.includes('Human:') && !prompt.includes('Assistant:')) {
      prompt = `\n\nHuman: ${body.prompt || ''}\n\nAssistant:`;
    }
    const payload = {
      model: body.model || REMOTE_AI_MODEL,
      prompt,
      max_tokens_to_sample: body.max_tokens || 1024,
      temperature: body.temperature ?? 0.2,
    };
    const response = await axios.post('https://api.anthropic.com/v1/complete', payload, {
      headers,
      timeout: 90000,
    });
    return response.data;
  }
  // Default OpenAI compatible flow
  headers.Authorization = `Bearer ${AI_API_KEY}`;
  const messages = body.messages || [];
  if (body.prompt && !messages.length) {
    messages.push({ role: 'user', content: body.prompt });
  }
  if (body.system_prompt && !messages.some((m) => m.role === 'system')) {
    messages.unshift({ role: 'system', content: body.system_prompt });
  }
  const payload = {
    model: body.model || REMOTE_AI_MODEL,
    messages,
    max_tokens: body.max_tokens || 1024,
    temperature: body.temperature ?? 0.2,
  };
  const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers,
    timeout: 90000,
  });
  return response.data;
}

async function callRemoteImage(body) {
  if (!REMOTE_IMAGE_API) {
    throw new Error('PROQUELEC_REMOTE_IMAGE_API requis pour image remote.');
  }
  const headers = { 'Content-Type': 'application/json' };
  if (IMAGE_API_KEY) headers.Authorization = `Bearer ${IMAGE_API_KEY}`;
  const response = await axios.post(REMOTE_IMAGE_API, body, { headers, timeout: 120000 });
  return response.data;
}

async function callRemoteVision(filePath, prompt) {
  if (!REMOTE_VISION_API) {
    throw new Error(
      'PROQUELEC_REMOTE_VISION_API ou PROQUELEC_REMOTE_IMAGE_API requis pour vision remote.',
    );
  }
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  if (prompt) form.append('prompt', prompt);
  const headers = form.getHeaders();
  if (IMAGE_API_KEY) headers.Authorization = `Bearer ${IMAGE_API_KEY}`;
  const response = await axios.post(REMOTE_VISION_API, form, { headers, timeout: 60000 });
  return response.data;
}

// 1. Brain (LLM) Proxy
app.post('/api/ai/chat', async (req, res) => {
  try {
    if (REMOTE_AI_ENABLED) {
      const data = await callRemoteAI(req.body);
      return res.json(data);
    }
    if (!AI_SERVICES.BRAIN) {
      throw new Error(LOCAL_AI_REMOVED_MESSAGE);
    }
    const targetUrl = `${AI_SERVICES.BRAIN}/api/v1/chat`;
    console.log(`[AI-GATEWAY] Tunneling to: ${targetUrl}`);
    const response = await axios.post(targetUrl, req.body, {
      timeout: 90000, // 90s timeout for long normative analysis
    });
    res.json(response.data);
  } catch (error) {
    console.error('[AI-GATEWAY] Brain Error:', error.message);
    if (REMOTE_AI_ENABLED) {
      return res.status(502).json({ error: 'Remote AI indisponible', details: error.message });
    }
    res.status(502).json({ error: 'Cerveau IA indisponible', details: error.message });
  }
});

// 2. Vision (Moondream) Proxy
app.post('/api/ai/vision', upload.single('image'), async (req, res) => {
  try {
    if (REMOTE_VISION_API) {
      console.log('[AI-GATEWAY] Forwarding vision request to remote API');
      const data = await callRemoteVision(req.file.path, req.body.prompt || 'Describe this image.');
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.json(data);
    }

    if (!req.file) return res.status(400).json({ error: 'Image requise' });
    if (!AI_SERVICES.VISION) {
      throw new Error(
        'Aucun service Vision configuré. Configurez PROQUELEC_REMOTE_VISION_API ou AI_VISION_URL.',
      );
    }

    console.log('[AI-GATEWAY] Floating request to VISION (Moondream)...');
    const FormDataLocal = require('form-data');
    const form = new FormDataLocal();
    form.append('file', fs.createReadStream(req.file.path));
    form.append('prompt', req.body.prompt || 'Describe this image.');

    const response = await axios.post(`${AI_SERVICES.VISION}/analyze-vision`, form, {
      headers: { ...form.getHeaders() },
      timeout: 30000,
    });

    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.json(response.data);
  } catch (error) {
    console.error('[AI-GATEWAY] Vision Error:', error.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(502).json({ error: 'Vision IA indisponible', details: error.message });
  }
});

// 3. Image (SDXL) Proxy
app.post('/api/ai/image', async (req, res) => {
  try {
    if (REMOTE_IMAGE_API) {
      console.log('[AI-GATEWAY] Forwarding image generation to remote API');
      const data = await callRemoteImage(req.body);
      return res.json(data);
    }
    if (!AI_SERVICES.IMAGE) {
      throw new Error(
        'Aucun service Image configuré. Configurez PROQUELEC_REMOTE_IMAGE_API ou AI_IMAGE_URL.',
      );
    }

    console.log('[AI-GATEWAY] Floating request to IMAGE (SDXL)...');
    const response = await axios.post(`${AI_SERVICES.IMAGE}/generate-visual`, req.body, {
      timeout: 120000, // 120s timeout for cold start generation
    });
    res.json(response.data);
  } catch (error) {
    console.error('[AI-GATEWAY] Image Error:', error.message);
    res.status(502).json({ error: "Générateur d'Image indisponible", details: error.message });
  }
});

// --- AI SERVICE ORCHESTRATOR (XPU) ---
// Local backend orchestration has been disabled because haystack_backend was removed.
const aiProcesses = {};

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

// Status Check for Dashboard (Enhanced)
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
        url: REMOTE_VISION_API || 'not-configured',
      },
      {
        service: 'Générateur Image Remote',
        key: 'image',
        status: REMOTE_IMAGE_API ? 'online' : 'offline',
        url: REMOTE_IMAGE_API || 'not-configured',
      },
    ]);
  }

  const checkService = async (url, name, key) => {
    if (!url) {
      return { service: name, key, status: 'not-configured', url: 'not-configured' };
    }
    try {
      const endpoint = key === 'brain' ? `${url}/api/v1/chat/health` : `${url}/health`;
      await axios.get(endpoint, { timeout: 1500 });
      return { service: name, key, status: 'online', url };
    } catch {
      return { service: name, key, status: 'offline', url };
    }
  };

  const statuses = await Promise.all([
    checkService(AI_SERVICES.BRAIN, 'Cerveau Expert (Phi-3.5)', 'brain'),
    checkService(AI_SERVICES.VISION, 'Cortex Vision (Moondream)', 'vision'),
    checkService(AI_SERVICES.IMAGE, 'Générateur Image (SDXL)', 'image'),
  ]);
  res.json(statuses);
});
// ------------------------------
// ------------------------------

// -- AI REPAIR ENGINE ENDPOINTS --
app.get('/api/engine/memory', (req, res) => {
  const memoryPath = path.join(__dirname, '../src/engine/memory/error-memory.json');
  if (fs.existsSync(memoryPath)) {
    const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
    return res.json(memory);
  }
  res.json([]);
});

app.post('/api/engine/scan', (req, res) => {
  const scriptPath = path.join(__dirname, '../proquelec-ultra-ai.mjs');
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

app.post('/api/engine/repair', (req, res) => {
  const { file, issue } = req.body;
  const scriptPath = path.join(__dirname, '../proquelec-ultra-ai.mjs');
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

// -- UPLOAD FILE ENDPOINT (GED) --
app.post('/api/storage/upload', authenticateToken, upload.single('file'), async (req, res) => {
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
app.get('/api/storage/files', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.media_files ORDER BY uploaded_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('[STORAGE-ERROR] List files failed:', err);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// -- DELETE FILE ENDPOINT --
app.delete('/api/storage/files/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM public.media_files WHERE id=$1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Tentative de suppression physique (Optional: check path)
    const filePath = path.join(__dirname, 'uploads', result.rows[0].file_path);
    fs.unlink(filePath, (err) => {
      if (err) console.error('[STORAGE] Waring: Could not delete file logically:', filePath);
    });

    res.json({ message: 'Fichier supprimé', id });
  } catch (err) {
    console.error('[STORAGE] Delete DB Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// -- HEALTH CHECK --
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', version: '1.2.0', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// --- THE "BONUS" LAYER: PROACTIVE REDUNDANCY & SEMANTIC INTELLIGENCE ---

// 1. Ghost Redundancy (Mirroring critical data to local disk for 100% Uptime Fallback)
const GHOST_DIR = path.join(__dirname, '.ghost_cache');
if (!fs.existsSync(GHOST_DIR)) fs.mkdirSync(GHOST_DIR);

const saveGhostCopy = (table, data) => {
  try {
    fs.writeFileSync(path.join(GHOST_DIR, `${table}.json`), JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Ghost mirroring failed', e);
  }
};

const getGhostCopy = (table) => {
  try {
    const file = path.join(GHOST_DIR, `${table}.json`);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return null;
  }
  return null;
};

// -- FILE RENAMING ENDPOINT --
// -- FILE RENAMING ENDPOINT --
app.put('/api/storage/files/:id/rename', authenticateToken, async (req, res) => {
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

    const oldPath = path.join(__dirname, 'uploads', file.file_path);

    // 2. Determine new filename (secure extension forcing)
    const ext = path.extname(file.file_path); // Trust the specific extension of the file on disk
    const safeBaseName = path.basename(newName, path.extname(newName)); // Remove any user-provided extension
    // Sanitize base name
    const cleanBaseName = safeBaseName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    // Reconstruct safe filename
    const newFilename = cleanBaseName + ext;
    const newPath = path.join(__dirname, 'uploads', newFilename);

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

// -- DELETE FILE ENDPOINT --
app.delete('/api/storage/files/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get file info
    const result = await pool.query('SELECT * FROM public.media_files WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Fichier non trouvé' });

    const file = result.rows[0];
    const filePath = path.join(__dirname, 'uploads', file.file_path); // Use strictly DB path

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

// 2. Semantic Normalization (Corrects professional & geographic terms automatically)
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

  // 1. Technical Normalization (Anti-Corruption)
  // Handle specific character encoding issues seen in some DB dumps
  let normalized = text.replace(/S\?N\?GAL/g, 'SÉNÉGAL').replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 2. Semantic Correction (Human-Centric Empathy)
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

  // Only apply dictionary if it's a short string or a specific match is found
  Object.keys(dictionary).forEach((key) => {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    normalized = normalized.replace(regex, dictionary[key]);
  });

  return normalized.trim();
};

// --- HUMAN-CENTRIC ERROR LIBRARY (The "Empathy Engine") ---
const ERROR_CATALOG = {
  // Authentification
  AUTH_INVALID: {
    status: 401,
    message: 'Oups ! Ces identifiants ne semblent pas corrects. Pouvez-vous vérifier ?',
    icon: 'Lock',
  },
  AUTH_EXPIRED: {
    status: 403,
    message: 'Votre session a expiré pour votre sécurité. Un petit clic pour vous reconnecter ?',
    icon: 'Clock',
  },
  AUTH_DENIED: {
    status: 403,
    message: "Désolé, vous n'avez pas les droits pour accéder à cette zone.",
    icon: 'ShieldAlert',
  },

  // Base de données & Redondance
  DB_BUSY: {
    status: 503,
    message: 'Le serveur est un peu essoufflé sous la charge. On réessaie dans quelques secondes ?',
    icon: 'Activity',
  },
  GHOST_MODE: {
    status: 200,
    message:
      'Le serveur de données se repose, nous utilisons une copie de sécurité ultra-rapide en attendant.',
    icon: 'Ghost',
  },
  DB_CONFLICT: {
    status: 409,
    message: 'Cette information existe déjà ! Pas besoin de la créer deux fois.',
    icon: 'Copy',
  },
  DB_NOT_FOUND: {
    status: 404,
    message: "Nous n'avons pas trouvé ce que vous cherchiez. S'est-il volatilisé ?",
    icon: 'Search',
  },
  DB_CONSTRAINT: {
    status: 400,
    message: "Cette action est impossible car cet élément est lié à d'autres données.",
    icon: 'Link',
  },

  // Général
  VALIDATION_ERROR: {
    status: 400,
    message: 'Il y a une petite erreur dans les informations saisies. On corrige ça ?',
    icon: 'Edit',
  },
  FATAL_STRIKE: {
    status: 500,
    message:
      'Une erreur imprévue est survenue. Notre équipe technique a été alertée automatiquement !',
    icon: 'Hammer',
  },
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

  // Anticipation : Traduction automatique basée sur le code HTTP
  static fromStatus(status, details = null) {
    if (status === 404) return new AppError('DB_NOT_FOUND', details);
    if (status === 401) return new AppError('AUTH_INVALID', details);
    if (status === 403) return new AppError('AUTH_DENIED', details);
    return new AppError('FATAL_STRIKE', details);
  }
}

// Global Human-Friendly Error Handler
const handleAppError = (err, res) => {
  console.error('[SERVER-ERROR]', err);
  // Si l'erreur n'est pas déjà une AppError, on la convertit

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

  // Log automatique pour le Self-Healing
  console.log(`[EMPATHY-LOG] ${appError.code}: ${appError.message}`);

  res.status(appError.status).json(errorBody);
};

// Global error handler for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parsing Error:', err.message);
    return res.status(400).json({ error: 'JSON Invalide', message: err.message });
  }
  next();
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Enforce UTF-8 for database client
pool.on('connect', (client) => {
  client.query("SET client_encoding TO 'UTF8'");
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// --- POSTGRES NOTIFY LISTENER (Real-time DB events) ---
// This listener connects to DB and broadcasts NOTIFY events to SSE clients
let notifyClient = null;

const initializeNotifyListener = async () => {
  try {
    notifyClient = await pool.connect();
    console.log('[NOTIFY] Connected to Postgres LISTEN channel');

    // Listen to all table notification events
    await notifyClient.query('LISTEN pages_insert');
    await notifyClient.query('LISTEN pages_update');
    await notifyClient.query('LISTEN pages_delete');
    await notifyClient.query('LISTEN theme_settings_update');
    await notifyClient.query('LISTEN media_files_insert');
    await notifyClient.query('LISTEN media_files_update');
    await notifyClient.query('LISTEN media_files_delete');
    await notifyClient.query('LISTEN menu_items_update');

    // Handle notifications from database
    notifyClient.on('notification', (msg) => {
      try {
        const channel = msg.channel; // e.g., 'pages_update'
        const payload = JSON.parse(msg.payload);

        // Map DB channel to SSE event name
        // e.g., pages_update -> page:updated
        let eventName = 'unknown';
        if (channel === 'pages_insert') eventName = 'page:created';
        else if (channel === 'pages_update') eventName = 'page:updated';
        else if (channel === 'pages_delete') eventName = 'page:deleted';
        else if (channel === 'theme_settings_update') eventName = 'theme:updated';
        else if (channel === 'media_files_insert') eventName = 'media:uploaded';
        else if (channel === 'media_files_update') eventName = 'media:renamed';
        else if (channel === 'media_files_delete') eventName = 'media:deleted';
        else if (channel === 'menu_items_update') eventName = 'menu:updated';

        // Broadcast to all SSE clients
        sendSseEvent(eventName, payload.data || payload);
        console.log(`[NOTIFY] Event emitted: ${eventName} from ${channel}`);
      } catch (err) {
        console.error('[NOTIFY] Failed to process notification:', err.message);
      }
    });

    notifyClient.on('error', (err) => {
      console.error('[NOTIFY] Listener error:', err);
      // Try to reconnect after 5s
      setTimeout(() => {
        console.log('[NOTIFY] Attempting reconnect...');
        initializeNotifyListener().catch((e) => console.error('[NOTIFY] Reconnect failed:', e));
      }, 5000);
    });
  } catch (err) {
    console.error('[NOTIFY] Failed to initialize listener:', err);
    // Retry in 5 seconds
    setTimeout(initializeNotifyListener, 5000);
  }
};

// Start the listener after pool is ready
setTimeout(() => {
  initializeNotifyListener().catch((err) => console.error('[NOTIFY] Init error:', err));
}, 1000);

// Cleanup on shutdown
process.on('exit', () => {
  if (notifyClient) notifyClient.release();
});

// ============================================
// AI & CHAT ROUTES
// ============================================

// -- PROXY TO PYTHON AI (VISUAL GENERATION) --
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
    });
    if (!response.ok) throw new Error(`Python server error: ${response.statusText}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('AI Proxy Error:', err.message);
    res.status(502).json({
      success: false,
      error: 'Service de génération visuelle indisponible',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
      metadata: { model: 'NodeJS-Fallback', fallback: true },
    });
  }
});

// -- PROXY TO PYTHON AI (CONTENT GENERATION) --
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
    const response = await fetch('http://127.0.0.1:8002/api/ai/content-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    if (!response.ok) throw new Error(`Python server error: ${response.statusText}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('AI Content Generation Proxy Error:', err.message);
    res.status(500).json({ error: 'AI Backend Unavailable', details: err.message });
  }
});

// -- CHAT PERSISTENCE APIs --
app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    console.log(`[CHAT-API] Fetching chats for user: ${req.user.id}`);
    // Removing 'public.' prefix to test if it's a schema visibility issue
    const result = await pool.query(
      'SELECT * FROM chats WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id],
    );
    console.log(`[CHAT-API] Found ${result.rows.length} chats.`);
    res.json(result.rows);
  } catch (err) {
    console.error('[CHAT-API-ERROR] Failed to fetch chats:', err);
    res.status(500).send('Server Error');
  }
});

app.post('/api/chats', authenticateToken, async (req, res) => {
  try {
    console.log(`[CHAT-API] Creating new chat for user: ${req.user.id}`);
    const result = await pool.query(
      'INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING *',
      [req.user.id, req.body.title || 'Nouvelle conversation'],
    );
    console.log(`[CHAT-API] Created chat with ID: ${result.rows[0].id}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[CHAT-API-ERROR] Failed to create chat:', err);
    res.status(500).send('Server Error');
  }
});

// DELETE chat session
app.delete('/api/chats/:sessionId', authenticateToken, async (req, res) => {
  try {
    const check = await pool.query('SELECT 1 FROM chats WHERE id = $1 AND user_id = $2', [
      req.params.sessionId,
      req.user.id,
    ]);
    if (check.rowCount === 0) return res.status(403).send('Unauthorized');

    await pool.query('DELETE FROM chats WHERE id = $1', [req.params.sessionId]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// UPDATE chat session (Rename)
app.put('/api/chats/:sessionId', authenticateToken, async (req, res) => {
  try {
    const check = await pool.query('SELECT 1 FROM chats WHERE id = $1 AND user_id = $2', [
      req.params.sessionId,
      req.user.id,
    ]);
    if (check.rowCount === 0) return res.status(403).send('Unauthorized');

    const { title } = req.body;
    const result = await pool.query(
      'UPDATE chats SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [title, req.params.sessionId],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/api/chats/:sessionId/messages', authenticateToken, async (req, res) => {
  try {
    console.log(
      `[CHAT-API] Fetching messages for session: ${req.params.sessionId} (user: ${req.user.id})`,
    );
    // Verify ownership
    const check = await pool.query('SELECT 1 FROM chats WHERE id = $1 AND user_id = $2', [
      req.params.sessionId,
      req.user.id,
    ]);
    if (check.rowCount === 0) {
      console.warn(
        `[CHAT-API] Unauthorized access attempt to session: ${req.params.sessionId} by user: ${req.user.id}`,
      );
      return res.status(403).send('Unauthorized');
    }

    const result = await pool.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
      [req.params.sessionId],
    );
    console.log(`[CHAT-API] Found ${result.rows.length} messages.`);
    res.json(result.rows);
  } catch (err) {
    console.error('[CHAT-API-ERROR] Failed to fetch messages:', err);
    res.status(500).send('Server Error');
  }
});

app.post('/api/chats/:sessionId/messages', authenticateToken, async (req, res) => {
  try {
    console.log(
      `[CHAT-API] Adding message to session: ${req.params.sessionId} (user: ${req.user.id})`,
    );
    // Verify ownership
    const check = await pool.query('SELECT 1 FROM chats WHERE id = $1 AND user_id = $2', [
      req.params.sessionId,
      req.user.id,
    ]);
    if (check.rowCount === 0) {
      console.warn(
        `[CHAT-API] Unauthorized message addition attempt to session: ${req.params.sessionId} by user: ${req.user.id}`,
      );
      return res.status(403).send('Unauthorized');
    }

    const { role, content, metadata } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (chat_id, role, content, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.sessionId, role, content, metadata || {}],
    );
    console.log(`[CHAT-API] Added message with ID: ${result.rows[0].id}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[CHAT-API-ERROR] Failed to add message:', err);
    res.status(500).send('Server Error');
  }
});
// ============================================

// --- SELF-HEALING & ANTICIPATION LAYER ---

// Helper for standard selects with GHOST MODE Redundancy
const getTable = async (req, res, table, orderBy = 'created_at DESC') => {
  try {
    console.log(`[DEBUG-GETTABLE] Fetching table: ${table}, Order: ${orderBy}`);

    // res.setHeader('Content-Type', 'application/json; charset=utf-8'); // Let res.json handle this
    const result = await pool.query(`SELECT * FROM public.${table} ORDER BY ${orderBy}`);
    console.log(`[DEBUG-GETTABLE] Query success. Rows: ${result.rows.length}`);

    // Anticipation : Sauvegarde d'une copie fantôme pour la prochaine fois
    if (result.rows.length > 0) {
      saveGhostCopy(table, result.rows);
    }

    res.json(result.rows);
  } catch (err) {
    console.error(`[DEBUG-GETTABLE] Error fetching ${table}:`, err);

    // Self-Healing : Récupération de la dernière copie saine connue
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

// 2. Proactive Database Health Check
const checkDatabaseHealth = async () => {
  try {
    const start = Date.now();
    const result = await pool.query('SELECT NOW() as now, version()');
    const duration = Date.now() - start;

    // Vérification des tables critiques
    const tables = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('pages', 'site_settings', 'users', 'partners')
        `);

    return {
      status: 'healthy',
      latency: `${duration}ms`,
      version: result.rows[0].version,
      criticalTables: tables.rowCount >= 3 ? 'ok' : 'missing_some',
    };
  } catch (err) {
    return { status: 'degraded', error: err.message };
  }
};

/**
 * @swagger
 * /health:
 *   get:
 *     summary: État de santé du serveur
 *     description: Retourne l'état du serveur, de la base de données et de l'environnement.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Serveur en bonne santé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime: { type: 'number' }
 *                 timestamp: { type: 'string' }
 *                 database: { type: 'object' }
 *       503:
 *         description: Problème de base de données
 */
app.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  const status = dbHealth.status === 'healthy' ? 200 : 503;
  res.status(status).json({
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbHealth,
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Page d'accueil de l'API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Informations sur l'API
 */
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'PROQUELEC Enterprise API is active',
    features: ['Self-Healing', 'Auto-Normalization', 'Deep-Diagnostics'],
    version: '1.2.0',
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Identifiants invalides
 *       403:
 *         description: Compte désactivé
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const result = await pool.query('SELECT * FROM public.users WHERE email = $1', [
      normalizedEmail,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.is_active === false) {
      return res.status(403).json({ error: 'Account disabled' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- INSCRIPTION UTILISATEUR ---
const ALLOWED_ROLES = ['electricien', 'entreprise', 'membre', 'partner'];

app.post('/api/auth/register', async (req, res) => {
  const { email, password, full_name, phone, company, role } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  // Validation
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }
  if (role && !ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Type de profil invalide' });
  }

  try {
    // Check if user already exists
    const exists = await pool.query('SELECT id FROM public.users WHERE email = $1', [
      normalizedEmail,
    ]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'membre';

    let result;
    try {
      result = await pool.query(
        `INSERT INTO public.users (email, password_hash, role, is_active, full_name, phone, company, created_at)
                 VALUES ($1, $2, $3, true, $4, $5, $6, NOW()) RETURNING id, email, role, is_active`,
        [
          normalizedEmail,
          hashedPassword,
          userRole,
          full_name || null,
          phone || null,
          company || null,
        ],
      );
    } catch (e) {
      result = await pool.query(
        `INSERT INTO public.users (email, password_hash, role, created_at)
                 VALUES ($1, $2, $3, NOW()) RETURNING id, email, role, is_active`,
        [normalizedEmail, hashedPassword, userRole],
      );
    }

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({
      access_token: token,
      user: { id: user.id, email: user.email, role: user.role, is_active: user.is_active },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer le profil utilisateur actuel
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Profil récupéré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
 */
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    console.log(`[AUTH-ME] Fetching user profile for ID: ${req.user.id}`);
    const result = await pool.query(
      'SELECT id, email, role, is_active FROM public.users WHERE id = $1',
      [req.user.id],
    );

    if (result.rows.length === 0) {
      console.warn(`[AUTH-ME] User not found for ID: ${req.user.id}`);
      return res.sendStatus(404);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[AUTH-ME] CRITICAL ERROR:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Users management
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    console.log('[API] Fetching all users...');
    const result = await pool.query(
      'SELECT id, email, role, is_active as status, created_at FROM public.users ORDER BY created_at DESC',
    );
    console.log(`[API] Found ${result.rows.length} users.`);
    res.json(result.rows);
  } catch (err) {
    console.error('[API-USERS] Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Admin users management
// ----------------------
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, is_active, created_at FROM public.users ORDER BY created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[API-ADMIN-USERS] Error fetching admin users:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, password, role, is_active } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const normalizedEmail = String(email).trim().toLowerCase();
    const exists = await pool.query('SELECT id FROM public.users WHERE email = $1', [
      normalizedEmail,
    ]);
    if (exists.rows.length > 0) return res.status(409).json({ error: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO public.users (email, password_hash, role, is_active, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING id, email, role, is_active, created_at`,
      [normalizedEmail, passwordHash, role || 'user', is_active === true],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[API-ADMIN-USERS] Create error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { email, role, password, is_active } = req.body;
    const updates = [];
    const params = [];
    let idx = 1;
    if (email) {
      updates.push(`email = $${idx++}`);
      params.push(String(email).trim().toLowerCase());
    }
    if (role) {
      updates.push(`role = $${idx++}`);
      params.push(role);
    }
    if (typeof is_active !== 'undefined') {
      updates.push(`is_active = $${idx++}`);
      params.push(!!is_active);
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${idx++}`);
      params.push(hash);
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No updates provided' });
    params.push(id);
    const q = `UPDATE public.users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email, role, is_active, created_at`;
    const result = await pool.query(q, params);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[API-ADMIN-USERS] Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM public.users WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error('[API-ADMIN-USERS] Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { is_active } = req.body;
    if (typeof is_active === 'undefined')
      return res.status(400).json({ error: 'is_active required' });
    const result = await pool.query(
      'UPDATE public.users SET is_active = $1 WHERE id = $2 RETURNING id, email, role, is_active, created_at',
      [!!is_active, id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[API-ADMIN-USERS] Status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// == DATA ENDPOINTS ==

// Site Settings
app.get('/api/site-settings', async (req, res) => {
  await getTable(req, res, 'site_settings', 'id ASC');
});

app.put('/api/site-settings', authenticateToken, async (req, res) => {
  try {
    const {
      site_name,
      slogan,
      logo_url,
      favicon_url,
      contact_email,
      phone_number,
      address,
      copyright_text,
      facebook_url,
      linkedin_url,
      twitter_url,
      logo_height,
      logo_scale,
      logo_brightness,
      logo_contrast,
      cta_primary_text,
      cta_primary_url,
      cta_secondary_text,
      cta_secondary_url,
      page_sections = {},
      audience_section_title = null,
      audience_section_subtitle = null,
      audience_title_electrician = null,
      audience_subtitle_electrician = null,
      audience_desc_electrician = null,
      audience_title_company = null,
      audience_subtitle_company = null,
      audience_desc_company = null,
      audience_title_member = null,
      audience_subtitle_member = null,
      audience_desc_member = null,
    } = req.body;
    const result = await pool.query(
      `UPDATE public.site_settings
             SET site_name = $1, slogan = $2, logo_url = $3, favicon_url = $4,
                 contact_email = $5, phone_number = $6, address = $7,
                 copyright_text = $8, facebook_url = $9, linkedin_url = $10, twitter_url = $11,
                 logo_height = $12, logo_scale = $13, logo_brightness = $14, logo_contrast = $15,
                 cta_primary_text = $16, cta_primary_url = $17, cta_secondary_text = $18, cta_secondary_url = $19,
                 page_sections = $20,
                 audience_section_title = $21, audience_section_subtitle = $22,
                 audience_title_electrician = $23, audience_subtitle_electrician = $24, audience_desc_electrician = $25,
                 audience_title_company = $26, audience_subtitle_company = $27, audience_desc_company = $28,
                 audience_title_member = $29, audience_subtitle_member = $30, audience_desc_member = $31,
                 updated_at = NOW()
             WHERE id = 1 RETURNING *`,
      [
        site_name,
        slogan,
        logo_url,
        favicon_url,
        contact_email,
        phone_number,
        address,
        copyright_text,
        facebook_url,
        linkedin_url,
        twitter_url,
        logo_height,
        logo_scale,
        logo_brightness,
        logo_contrast,
        cta_primary_text,
        cta_primary_url,
        cta_secondary_text,
        cta_secondary_url,
        JSON.stringify(page_sections || {}),
        audience_section_title,
        audience_section_subtitle,
        audience_title_electrician,
        audience_subtitle_electrician,
        audience_desc_electrician,
        audience_title_company,
        audience_subtitle_company,
        audience_desc_company,
        audience_title_member,
        audience_subtitle_member,
        audience_desc_member,
      ],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating site settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Theme Settings
app.get('/api/theme-settings', async (req, res) => {
  await getTable(req, res, 'theme_settings', 'id ASC');
});

app.put('/api/theme-settings', authenticateToken, async (req, res) => {
  try {
    const {
      primary_color,
      secondary_color,
      accent_color,
      background_color,
      text_color,
      font_family,
      footer_background_url,
    } = req.body;
    const result = await pool.query(
      `UPDATE public.theme_settings
             SET primary_color = $1, secondary_color = $2, accent_color = $3,
                 background_color = $4, text_color = $5, font_family = $6,
                 footer_background_url = $7,
                 updated_at = NOW()
             WHERE id = 1 RETURNING *`,
      [
        primary_color,
        secondary_color,
        accent_color,
        background_color,
        text_color,
        font_family,
        footer_background_url,
      ],
    );
    res.json(result.rows[0]);
    try {
      sendSseEvent('theme:updated', result.rows[0]);
    } catch (e) {
      console.warn('SSE broadcast failed (theme:updated)', e);
    }
  } catch (err) {
    console.error('Error updating theme settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Simple cache purge endpoint (can be extended to call CDN providers)
app.post('/api/cache/purge', authenticateToken, async (req, res) => {
  try {
    const { paths } = req.body || {};
    if (!paths || !Array.isArray(paths)) {
      return res.status(400).json({ error: 'paths (array) required' });
    }

    console.log('[CACHE] Purge requested for paths:', paths);

    // If an external CDN purge URL is configured, call it (example: CLOUD_PURGE_URL env)
    if (process.env.CDN_PURGE_URL) {
      try {
        const fetchRes = await fetch(process.env.CDN_PURGE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CDN_PURGE_KEY || ''}`,
          },
          body: JSON.stringify({ paths }),
        });
        console.log('[CACHE] CDN purge status:', fetchRes.status);
      } catch (cdnErr) {
        console.warn('[CACHE] CDN purge call failed:', cdnErr);
      }
    }

    // Broadcast cache purge to connected clients (so frontends can refetch)
    try {
      sendSseEvent('cache:purged', { paths });
    } catch (e) {
      console.warn('SSE broadcast failed (cache:purged)', e);
    }

    res.json({ success: true, purged: paths.length });
  } catch (err) {
    console.error('[CACHE] Purge failed:', err);
    res.status(500).json({ error: 'Purge failed' });
  }
});

// All Pages — MOVED to PAGE MANAGEMENT ENDPOINTS section (~L3260) with better ORDER BY

// Single Page (by slug)
app.get('/api/pages/slug/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query('SELECT * FROM public.pages WHERE slug = $1', [slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Page non trouvée' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Menu Items
app.get('/api/menu-items', async (req, res) => {
  await getTable(req, res, 'menu_items', 'menu_order ASC');
});

// Construction Mode
app.get('/api/construction-mode', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.construction_mode WHERE id = 1');
    res.json(result.rows[0] || { is_enabled: false });
  } catch (err) {
    console.error('Error fetching construction mode:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/construction-mode', authenticateToken, async (req, res) => {
  const { is_enabled } = req.body;
  try {
    // Upsert logic for id=1
    const result = await pool.query(
      `INSERT INTO public.construction_mode (id, is_enabled, updated_at, updated_by)
             VALUES (1, $1, NOW(), $2)
             ON CONFLICT (id) DO UPDATE
             SET is_enabled = $1, updated_at = NOW(), updated_by = $2
             RETURNING *`,
      [is_enabled, req.user.id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating construction mode:', err);
    res.status(500).json({ error: err.message });
  }
});

// == MUTATION ENDPOINTS ==

// Helper for mutations with Proactive Normalization and Human-Centric Errors
const executeQuery = async (res, text, params) => {
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // Anticipation : Normalisation automatique de tous les paramètres de type string
    const normalizedParams = params
      ? params.map((p) => {
          if (typeof p === 'string') return normalizeText(p);
          return p;
        })
      : params;

    const result = await pool.query(text, normalizedParams);
    res.json(result.rows[0] || { success: true });
  } catch (err) {
    console.error('Database Error:', err);
    // Escalation : Log de l'erreur dans la table d'audit pour analyse future (Self-Healing Readiness)
    try {
      await pool.query(
        'INSERT INTO public.audit_log (topic, details, timestamp) VALUES ($1, $2, NOW())',
        [
          'QUERY_ERROR',
          JSON.stringify({ error: err.message, code: err.code, query: text, params }),
        ],
      );
    } catch (logErr) {
      originalError('Critical failure in audit logging:', logErr);
    }

    // Map technical codes to human empathy
    if (err.code === '23505') return handleAppError(new AppError('DB_CONFLICT'), res);
    if (err.code === '23503') return handleAppError(new AppError('DB_CONSTRAINT'), res);

    handleAppError(new AppError('FATAL_STRIKE', err.message), res);
  }
};

// -- Menu Items Mutations --

app.post('/api/menu-items', authenticateToken, async (req, res) => {
  const {
    title,
    url,
    menu_order,
    parent_id,
    is_active,
    menu_type,
    target,
    icon,
    label,
    linked_page_id,
  } = req.body;

  // Use explicit defaults to avoid sending undefined to pg
  const params = [
    title || '',
    url || '#',
    menu_order || 0,
    parent_id || null,
    is_active === undefined ? true : is_active,
    menu_type || 'main',
    target || '_self',
    icon || null,
    label || null,
    linked_page_id || null,
  ];

  await executeQuery(
    res,
    'INSERT INTO public.menu_items (title, url, menu_order, parent_id, is_active, menu_type, target, icon, label, linked_page_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
    params,
  );
});

app.put('/api/menu-items/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    url,
    menu_order,
    parent_id,
    is_active,
    menu_type,
    target,
    icon,
    label,
    linked_page_id,
  } = req.body;

  // Build dynamic update query to handle partial updates
  const updates = [];
  const values = [];
  let paramCounter = 1;

  const fields = {
    title,
    url,
    menu_order,
    parent_id,
    is_active,
    menu_type,
    target,
    icon,
    label,
    linked_page_id,
  };

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      updates.push(`${key} = $${paramCounter}`);
      values.push(value);
      paramCounter++;
    }
  }

  if (updates.length === 0) {
    return res.json({ success: true, message: 'No fields to update' });
  }

  values.push(id);
  const sql = `UPDATE public.menu_items SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCounter} RETURNING *`;

  await executeQuery(res, sql, values);
});

app.delete('/api/menu-items/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  await executeQuery(res, 'DELETE FROM public.menu_items WHERE id=$1', [id]);
});

// Blog Categories
app.get('/api/blog-categories', async (req, res) => {
  await getTable(req, res, 'blog_categories', 'name ASC');
});

app.post('/api/blog-categories', authenticateToken, async (req, res) => {
  const { name } = req.body;
  await executeQuery(res, 'INSERT INTO public.blog_categories (name) VALUES ($1) RETURNING *', [
    name,
  ]);
});

app.put('/api/blog-categories/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await executeQuery(res, 'UPDATE public.blog_categories SET name=$1 WHERE id=$2 RETURNING *', [
    name,
    id,
  ]);
});

app.delete('/api/blog-categories/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  await executeQuery(res, 'DELETE FROM public.blog_categories WHERE id=$1', [id]);
});

// Performance Metrics
app.get('/api/performance-metrics', authenticateToken, async (req, res) => {
  await getTable(req, res, 'performance_metrics', 'created_at DESC');
});

app.post('/api/performance-metrics', async (req, res) => {
  const {
    page_url,
    load_time,
    dom_content_loaded,
    first_contentful_paint,
    time_to_interactive,
    connection_type,
  } = req.body;
  try {
    await pool.query(
      'INSERT INTO public.performance_metrics (page_url, load_time, dom_content_loaded, first_contentful_paint, time_to_interactive, connection_type, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [
        page_url,
        load_time,
        dom_content_loaded,
        first_contentful_paint,
        time_to_interactive,
        connection_type,
      ],
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics Events
app.post('/api/analytics/events', async (req, res) => {
  const { event_type, page_url, device_type, country, metadata } = req.body;
  try {
    await pool.query(
      'INSERT INTO public.analytics_events (event_type, page_url, device_type, country, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [event_type, page_url, device_type, country, metadata],
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics/summary', authenticateToken, async (req, res) => {
  try {
    const events = await pool.query(
      'SELECT * FROM public.analytics_events ORDER BY created_at DESC LIMIT 1000',
    );
    const perf = await pool.query(
      'SELECT * FROM public.performance_metrics ORDER BY created_at DESC LIMIT 100',
    );
    res.json({ events: events.rows, performance: perf.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- Blog Endpoints --

// Public Blog Posts
app.get('/api/blog-posts', async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image_url, p.published_at,
        json_build_object('name', c.name) as blog_categories
            FROM public.blog_posts p
            LEFT JOIN public.blog_categories c ON p.category_id = c.id
            WHERE p.published_at IS NOT NULL
            ORDER BY p.published_at DESC
        `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ error: err.message });
  }
});

// Single Blog Post (by slug)
app.get('/api/blog-posts/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT p.title, p.content, p.excerpt, p.cover_image_url, p.published_at, p.created_at,
        json_build_object('name', c.name) as blog_categories
            FROM public.blog_posts p
            LEFT JOIN public.blog_categories c ON p.category_id = c.id
            WHERE p.slug = $1 AND p.published_at IS NOT NULL
        `,
      [slug],
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching blog post:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Blog Posts (All)
app.get('/api/admin/blog-posts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT p.*, json_build_object('name', c.name) as blog_categories
            FROM public.blog_posts p
            LEFT JOIN public.blog_categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Blog Post
app.post('/api/blog-posts', authenticateToken, async (req, res) => {
  const { title, content, excerpt, slug, cover_image_url, category_id, published_at } = req.body;
  await executeQuery(
    res,
    `
        INSERT INTO public.blog_posts(title, content, excerpt, slug, cover_image_url, category_id, published_at, author_id, created_at)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING *
        `,
    [title, content, excerpt, slug, cover_image_url, category_id, published_at, req.user.id],
  );
});

// Update Blog Post
app.put('/api/blog-posts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, slug, cover_image_url, category_id, published_at } = req.body;
  await executeQuery(
    res,
    `
        UPDATE public.blog_posts
        SET title = $1, content = $2, excerpt = $3, slug = $4, cover_image_url = $5, category_id = $6, published_at = $7, updated_at = NOW()
        WHERE id = $8
    RETURNING *
        `,
    [title, content, excerpt, slug, cover_image_url, category_id, published_at, id],
  );
});

// Delete Blog Post
app.delete('/api/blog-posts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  await executeQuery(res, 'DELETE FROM public.blog_posts WHERE id=$1', [id]);
});

// -- Professional Training Endpoints (Unified at line 1621) --

// -- BUSINESS ENGINE : Certifications, Audits & Network --

// 1. Certifications (Verifiable certificates)
app.get('/api/certifications', async (req, res) => {
  await getTable(req, res, 'certifications', 'issued_at DESC');
});

app.post('/api/certifications', authenticateToken, async (req, res) => {
  const { certificate_number, holder_name, type, expiry_date, status, metadata } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.certifications (certificate_number, holder_name, type, issued_at, expiry_date, status, metadata) VALUES ($1, $2, $3, NOW(), $4, $5, $6) RETURNING *',
    [certificate_number, holder_name, type, expiry_date, status, metadata],
  );
});

// 2. Site Audits (Technical inspections)
app.get('/api/audits', authenticateToken, async (req, res) => {
  await getTable(req, res, 'audits', 'audit_date DESC');
});

app.post('/api/audits', authenticateToken, async (req, res) => {
  const { site_name, location, inspector_id, findings, compliance_score, recommendations } =
    req.body;
  await executeQuery(
    res,
    'INSERT INTO public.audits (site_name, location, inspector_id, audit_date, findings, compliance_score, recommendations) VALUES ($1, $2, $3, NOW(), $4, $5, $6) RETURNING *',
    [site_name, location, inspector_id, findings, compliance_score, recommendations],
  );
});

// 3. Electrician Network (Directory of verified pros)
app.get('/api/network/electricians', async (req, res) => {
  await getTable(req, res, 'electricians_network', 'rating DESC, name ASC');
});

app.post('/api/network/electricians', authenticateToken, async (req, res) => {
  const { name, specializations, region, phone, email, projects_count } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.electricians_network (name, specializations, region, phone, email, projects_count, joined_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
    [name, specializations, region, phone, email, projects_count],
  );
});

// Admin Registrations
app.get('/api/training-registrations', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.training_registrations ORDER BY registration_date DESC',
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register for Training (Authenticated)
app.post('/api/training-registrations', authenticateToken, async (req, res) => {
  const {
    training_id,
    participant_name,
    participant_email,
    participant_phone,
    company_name,
    special_requirements,
  } = req.body;
  try {
    const result = await pool.query(
      `
            INSERT INTO public.training_registrations(training_id, user_id, participant_name, participant_email, participant_phone, company_name, special_requirements, registration_date, status, payment_status)
    VALUES($1, $2, $3, $4, $5, $6, $7, NOW(), 'pending', 'pending')
    RETURNING *
        `,
      [
        training_id,
        req.user.id,
        participant_name,
        participant_email,
        participant_phone,
        company_name,
        special_requirements,
      ],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error registering for training:', err);
    res.status(500).json({ error: err.message });
  }
});

// -- Quick Links Endpoints --

app.get('/api/quick-links', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.quick_links WHERE is_active = true ORDER BY display_order ASC',
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching quick links:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quick-links', authenticateToken, async (req, res) => {
  const { title, description, url, icon_name, display_order, is_active } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.quick_links (title, description, url, icon_name, display_order, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [title, description, url, icon_name, display_order, is_active],
  );
});

app.put('/api/quick-links/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, url, icon_name, display_order, is_active } = req.body;
  await executeQuery(
    res,
    'UPDATE public.quick_links SET title=$1, description=$2, url=$3, icon_name=$4, display_order=$5, is_active=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
    [title, description, url, icon_name, display_order, is_active, id],
  );
});

app.delete('/api/quick-links/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  await executeQuery(res, 'DELETE FROM public.quick_links WHERE id=$1', [id]);
});

// -- Partners Endpoints --

app.get('/api/partners', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.partners WHERE is_active = true ORDER BY display_order ASC',
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching partners:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/partners', authenticateToken, async (req, res) => {
  const { name, logo_url, category, display_order, is_active } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.partners (name, logo_url, category, display_order, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, logo_url, category, display_order, is_active],
  );
});

app.put('/api/partners/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, logo_url, category, display_order, is_active } = req.body;
  await executeQuery(
    res,
    'UPDATE public.partners SET name=$1, logo_url=$2, category=$3, display_order=$4, is_active=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
    [name, logo_url, category, display_order, is_active, id],
  );
});

app.delete('/api/partners/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  await executeQuery(res, 'DELETE FROM public.partners WHERE id=$1', [id]);
});

// -- Contact Requests --
app.get('/api/contact-requests', authenticateToken, async (req, res) => {
  await getTable(req, res, 'contact_requests', 'submitted_at DESC');
});

// POST contact-requests — MOVED to CONTACT & EMAIL section (~L3480) with more fields: nom, telephone, sujet, status

app.delete('/api/contact-requests/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.contact_requests WHERE id=$1', [req.params.id]);
});

// -- Documents --
app.get('/api/documents', async (req, res) => {
  await getTable(req, res, 'documents', 'uploaded_at DESC');
});

app.post('/api/documents', authenticateToken, async (req, res) => {
  const { title, description, file_url } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.documents (title, description, file_url, uploaded_at, uploader_id, workflow_state) VALUES ($1, $2, $3, NOW(), $4, $5) RETURNING *',
    [title, description, file_url, req.user.id, 'draft'],
  );
});

app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.documents WHERE id=$1', [req.params.id]);
});

const GED_WORKFLOW_STATES = ['draft', 'review', 'published', 'archived'];
const GED_WORKFLOW_TRANSITIONS = {
  draft: ['review'],
  review: ['draft', 'published'],
  published: ['archived', 'review'],
  archived: ['draft'],
};

const GED_WORKFLOW_ENTITIES = {
  documents: { table: 'public.documents', type: 'document' },
  'media-files': { table: 'public.media_files', type: 'media_file' },
};

const recordGedWorkflowTransition = async ({
  entityId,
  entityType,
  fromState,
  toState,
  changedBy,
  comment,
}) => {
  try {
    await pool.query(
      `INSERT INTO public.document_workflow_transitions
                (entity_id, entity_type, from_state, to_state, changed_by, comment, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [entityId, entityType, fromState, toState, changedBy, comment || null],
    );
    await pool.query(
      `INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, details, timestamp)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        changedBy,
        `${entityType}.workflow.transition`,
        entityType,
        entityId,
        JSON.stringify({ fromState, toState, comment }),
      ],
    );
  } catch (err) {
    console.error('[GED] Failed to record workflow transition:', err);
  }
};

app.post(
  '/api/ged/:entity/:id/transition',
  authenticateToken,
  requirePermission('ged:transition'),
  async (req, res) => {
    try {
      const { entity, id } = req.params;
      const { to_state: toState, comment } = req.body;
      const normalizedTarget = String(toState || '').toLowerCase();

      const entityConfig = GED_WORKFLOW_ENTITIES[entity];
      if (!entityConfig) {
        return res.status(400).json({
          error: "Type d'entité GED invalide",
          valid_entities: Object.keys(GED_WORKFLOW_ENTITIES),
        });
      }

      if (!GED_WORKFLOW_STATES.includes(normalizedTarget)) {
        return res
          .status(400)
          .json({ error: 'Etat de workflow invalide', valid_states: GED_WORKFLOW_STATES });
      }

      const entityResult = await pool.query(
        `SELECT id, workflow_state FROM ${entityConfig.table} WHERE id = $1`,
        [id],
      );
      if (entityResult.rows.length === 0) {
        return res.status(404).json({ error: 'Entité GED introuvable' });
      }

      const fromState = entityResult.rows[0].workflow_state || 'draft';
      if (fromState === normalizedTarget) {
        return res.status(400).json({ error: "L'entité est déjà dans cet état" });
      }

      const allowed = GED_WORKFLOW_TRANSITIONS[fromState] || [];
      if (!allowed.includes(normalizedTarget)) {
        return res.status(400).json({
          error: 'Transition de workflow non autorisée',
          from: fromState,
          to: normalizedTarget,
          allowed,
        });
      }

      const updateResult = await pool.query(
        `UPDATE ${entityConfig.table} SET workflow_state = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [normalizedTarget, id],
      );

      await recordGedWorkflowTransition({
        entityId: id,
        entityType: entityConfig.type,
        fromState,
        toState: normalizedTarget,
        changedBy: req.user.id,
        comment,
      });

      try {
        sendSseEvent('ged:transition', {
          id,
          entity_type: entityConfig.type,
          from_state: fromState,
          to_state: normalizedTarget,
          changed_by: req.user.id,
          comment,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[GED] SSE broadcast failed:', err.message);
      }

      res.json({
        success: true,
        entity: entityConfig.type,
        entity_id: id,
        from_state: fromState,
        to_state: normalizedTarget,
        record: updateResult.rows[0],
      });
    } catch (err) {
      console.error('[GED] Transition failed:', err);
      res.status(500).json({ error: 'Erreur de transition de workflow', details: err.message });
    }
  },
);

app.get(
  '/api/ged/:entity/:id/history',
  authenticateToken,
  requirePermission('ged:transition'),
  async (req, res) => {
    try {
      const { entity, id } = req.params;
      const entityConfig = GED_WORKFLOW_ENTITIES[entity];
      if (!entityConfig) {
        return res.status(400).json({
          error: "Type d'entité GED invalide",
          valid_entities: Object.keys(GED_WORKFLOW_ENTITIES),
        });
      }

      const historyResult = await pool.query(
        `SELECT id, entity_id, entity_type, from_state, to_state, changed_by, comment, created_at
             FROM public.document_workflow_transitions
             WHERE entity_id = $1 AND entity_type = $2
             ORDER BY created_at DESC`,
        [id, entityConfig.type],
      );
      res.json({ entity: entityConfig.type, entity_id: id, history: historyResult.rows });
    } catch (err) {
      console.error('[GED] Fetch history failed:', err);
      res
        .status(500)
        .json({ error: "Impossible de récupérer l'historique de workflow", details: err.message });
    }
  },
);

app.get('/api/ged/workflow/config', authenticateToken, async (req, res) => {
  res.json({
    states: GED_WORKFLOW_STATES,
    transitions: GED_WORKFLOW_TRANSITIONS,
    entities: Object.keys(GED_WORKFLOW_ENTITIES),
  });
});

// -- Site Assets (Resources Page) --
app.get('/api/site-assets', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM public.site_assets';
    let params = [];

    if (category && category !== 'Tous les documents') {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching site assets:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/site-assets', authenticateToken, async (req, res) => {
  const {
    title,
    description,
    category,
    asset_type,
    file_size,
    file_url,
    preview_url,
    is_premium,
    price_fcfy,
    monetization_active,
    metadata,
  } = req.body;

  await executeQuery(
    res,
    `INSERT INTO public.site_assets (
            title, description, category, asset_type, file_size,
            file_url, preview_url, is_premium, price_fcfy,
            monetization_active, metadata, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING *`,
    [
      title,
      description,
      category || 'Général',
      asset_type || 'PDF',
      file_size,
      file_url,
      preview_url,
      is_premium || false,
      price_fcfy || 0,
      monetization_active || false,
      metadata || {},
    ],
  );
});

app.put('/api/site-assets/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    asset_type,
    file_size,
    file_url,
    preview_url,
    is_premium,
    price_fcfy,
    monetization_active,
    metadata,
  } = req.body;

  await executeQuery(
    res,
    `UPDATE public.site_assets SET
            title=$1, description=$2, category=$3, asset_type=$4, file_size=$5,
            file_url=$6, preview_url=$7, is_premium=$8, price_fcfy=$9,
            monetization_active=$10, metadata=$11, updated_at=NOW()
        WHERE id=$12 RETURNING *`,
    [
      title,
      description,
      category,
      asset_type,
      file_size,
      file_url,
      preview_url,
      is_premium,
      price_fcfy,
      monetization_active,
      metadata,
      id,
    ],
  );
});

app.delete('/api/site-assets/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.site_assets WHERE id=$1', [req.params.id]);
});

app.post('/api/assets/:id/download', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'UPDATE public.site_assets SET download_stats = download_stats + 1 WHERE id = $1',
      [id],
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- Events --
app.get('/api/events', async (req, res) => {
  await getTable(req, res, 'events', 'date DESC');
});

app.post('/api/events', authenticateToken, async (req, res) => {
  const { title, date, location, details } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.events (title, date, location, details, created_at, organizer_id) VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING *',
    [title, date, location, details, req.user.id],
  );
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, date, location, details } = req.body;
  await executeQuery(
    res,
    'UPDATE public.events SET title=$1, date=$2, location=$3, details=$4 WHERE id=$5 RETURNING *',
    [title, date, location, details, id],
  );
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.events WHERE id=$1', [req.params.id]);
});

// -- Electrical Standards --
app.get('/api/electrical-standards', async (req, res) => {
  await getTable(req, res, 'electrical_standards', 'code ASC');
});

// SEO Bridge: Fetch standard by its normalized code
app.get('/api/electrical-standards/code/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query('SELECT * FROM public.electrical_standards WHERE code = $1', [
      code,
    ]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Norme non trouvée' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/electrical-standards', authenticateToken, async (req, res) => {
  const { title, code, category, description, version, status, document_url, summary } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.electrical_standards (title, code, category, description, version, status, document_url, summary, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *',
    [title, code, category, description, version, status, document_url, summary],
  );
});

app.put('/api/electrical-standards/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, code, category, description, version, status, document_url, summary } = req.body;
  await executeQuery(
    res,
    'UPDATE public.electrical_standards SET title=$1, code=$2, category=$3, description=$4, version=$5, status=$6, document_url=$7, summary=$8 WHERE id=$9 RETURNING *',
    [title, code, category, description, version, status, document_url, summary, id],
  );
});

app.delete('/api/electrical-standards/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.electrical_standards WHERE id=$1', [req.params.id]);
});

// -- Electrical Equipment --
app.get('/api/electrical-equipment', async (req, res) => {
  await getTable(req, res, 'electrical_equipment', 'name ASC');
});

app.post('/api/electrical-equipment', authenticateToken, async (req, res) => {
  const { name, brand, model, category, description, price, stock_quantity, image_url } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.electrical_equipment (name, brand, model, category, description, price, stock_quantity, image_url, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *',
    [name, brand, model, category, description, price, stock_quantity, image_url],
  );
});

app.put('/api/electrical-equipment/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, brand, model, category, description, price, stock_quantity, image_url } = req.body;
  await executeQuery(
    res,
    'UPDATE public.electrical_equipment SET name=$1, brand=$2, model=$3, category=$4, description=$5, price=$6, stock_quantity=$7, image_url=$8 WHERE id=$9 RETURNING *',
    [name, brand, model, category, description, price, stock_quantity, image_url, id],
  );
});

app.delete('/api/electrical-equipment/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.electrical_equipment WHERE id=$1', [req.params.id]);
});

// -- Gallery Items (Immersive Gallery) --
app.get('/api/gallery-items', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.gallery_items WHERE is_active = true ORDER BY display_order ASC',
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching gallery items:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/gallery-items', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.gallery_items ORDER BY display_order ASC',
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching gallery items:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gallery-items', authenticateToken, async (req, res) => {
  const { title, description, url, type, category, tags, hotspots, display_order, is_active } =
    req.body;
  await executeQuery(
    res,
    `INSERT INTO public.gallery_items (title, description, url, type, category, tags, hotspots, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      title,
      description,
      url,
      type || 'photo',
      category || 'projets',
      tags || [],
      JSON.stringify(hotspots || []),
      display_order || 0,
      is_active !== false,
    ],
  );
});

app.put('/api/gallery-items/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, url, type, category, tags, hotspots, display_order, is_active } =
    req.body;
  await executeQuery(
    res,
    `UPDATE public.gallery_items SET title=$1, description=$2, url=$3, type=$4, category=$5, tags=$6, hotspots=$7, display_order=$8, is_active=$9 WHERE id=$10 RETURNING *`,
    [
      title,
      description,
      url,
      type,
      category,
      tags || [],
      JSON.stringify(hotspots || []),
      display_order,
      is_active,
      id,
    ],
  );
});

app.delete('/api/gallery-items/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.gallery_items WHERE id=$1', [req.params.id]);
});

// -- Newsletter Subscribers --
app.get('/api/newsletter-subscribers', authenticateToken, async (req, res) => {
  await getTable(req, res, 'newsletter_subscribers', 'subscribed_at DESC');
});

app.post('/api/newsletter-subscribers', async (req, res) => {
  const { email, source } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.newsletter_subscribers (email, source, subscribed_at, is_active) VALUES ($1, $2, NOW(), true) ON CONFLICT (email) DO UPDATE SET is_active = true RETURNING *',
    [email, source],
  );
});

// -- Media Files --
app.get('/api/media-files', authenticateToken, async (req, res) => {
  await getTable(req, res, 'media_files', 'uploaded_at DESC');
});

app.post('/api/media-files', authenticateToken, async (req, res) => {
  const {
    file_name,
    file_path,
    file_type,
    file_size,
    mime_type,
    alt_text,
    project_id,
    folder_path,
    status,
    metadata,
  } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.media_files (file_name, file_path, file_type, file_size, mime_type, alt_text, updated_at, uploaded_by, project_id, folder_path, status, metadata) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11) RETURNING *',
    [
      file_name,
      file_path,
      file_type,
      file_size,
      mime_type,
      alt_text,
      req.user.id,
      project_id,
      folder_path || '/',
      status || 'draft',
      metadata || {},
    ],
  );
});

// Real Binary Upload Endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { category } = req.body || {};
    const filePath = req.file.filename; // Just the filename as it's served via /uploads/
    const publicUrl = `/uploads/${filePath}`;

    // Insert into media_files table with document metadata support
    const { project_id, folder_path, status } = req.body || {};
    const result = await pool.query(
      `INSERT INTO public.media_files (file_name, file_path, file_type, file_size, mime_type, uploaded_at, uploaded_by, project_id, folder_path, status, is_active)
             VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, true) RETURNING *`,
      [
        req.file.originalname,
        filePath,
        category || 'other',
        req.file.size,
        req.file.mimetype,
        req.user.id,
        project_id,
        folder_path || '/',
        status || 'draft',
      ],
    );

    res.json({
      success: true,
      file: result.rows[0],
      url: publicUrl,
      path: filePath,
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/media-files/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.media_files WHERE id=$1', [req.params.id]);
});

// Temporary Seed Endpoint
app.get('/api/seed-missing-pages', async (req, res) => {
  try {
    const pagesToSeed = [
      {
        title: 'Expertises Techniques',
        slug: 'expertises-techniques',
        content: '<h1>Expertises Techniques</h1><p>Contenu en cours de restauration...</p>',
        status: 'published',
        menu_order: 10,
      },
      {
        title: 'Formations PROQUELEC',
        slug: 'formations-proquelec',
        content: '<h1>Formations PROQUELEC</h1><p>Découvrez nos formations certifiantes.</p>',
        status: 'published',
        menu_order: 11,
      },
    ];

    const results = [];
    for (const page of pagesToSeed) {
      // Check if exists
      const check = await pool.query('SELECT id FROM public.pages WHERE slug = $1', [page.slug]);
      if (check.rows.length === 0) {
        const insert = await pool.query(
          'INSERT INTO public.pages (title, slug, content, menu_order, status, is_published) VALUES ($1, $2, $3, $4, $5, true) RETURNING *',
          [page.title, page.slug, page.content, page.menu_order, page.status],
        );
        results.push({ slug: page.slug, status: 'created', id: insert.rows[0].id });
      } else {
        results.push({ slug: page.slug, status: 'exists', id: check.rows[0].id });
      }
    }
    res.json(results);
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

// -- Professional Training --
app.get('/api/professional-training', async (req, res) => {
  await getTable(req, res, 'professional_training', 'created_at DESC');
});

app.post('/api/professional-training', authenticateToken, async (req, res) => {
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

app.put('/api/professional-training/:id', authenticateToken, async (req, res) => {
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

app.delete('/api/professional-training/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.professional_training WHERE id=$1', [req.params.id]);
});

// -- Global Site Config --
app.get('/api/site-config', async (req, res) => {
  try {
    const settingsRes = await pool.query('SELECT * FROM public.site_settings LIMIT 1');
    const themeRes = await pool.query('SELECT * FROM public.theme_settings LIMIT 1');
    const pagesRes = await pool.query('SELECT * FROM public.pages ORDER BY menu_order ASC');

    const settings = settingsRes.rows[0] || {};
    const theme = themeRes.rows[0] || {};

    const schema = {
      pages: pagesRes.rows.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        layout:
          typeof p.content_blocks === 'object'
            ? p.content_blocks
            : p.content_blocks
              ? JSON.parse(p.content_blocks)
              : [],
      })),
      theme: {
        primary: theme.primary_color,
        secondary: theme.secondary_color,
        accent: theme.accent_color,
        font: theme.font_family,
        radius: '0.5rem',
      },
      globals: {
        header: { site_name: settings.site_name, logo: settings.logo_url },
        footer: { copyright: settings.copyright_text },
      },
    };
    res.json(schema);
  } catch (err) {
    console.error('Error fetching site config:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/site-config', authenticateToken, async (req, res) => {
  const { schema } = req.body;
  if (!schema) return res.status(400).json({ error: 'Schema invalide' });

  try {
    await pool.query('BEGIN');

    // Update Theme
    if (schema.theme) {
      await pool.query(
        `UPDATE public.theme_settings SET primary_color=$1, secondary_color=$2, accent_color=$3, font_family=$4, updated_at=NOW() WHERE id=1`,
        [schema.theme.primary, schema.theme.secondary, schema.theme.accent, schema.theme.font],
      );
    }

    // Update Settings
    if (schema.globals?.header) {
      await pool.query(
        `UPDATE public.site_settings SET site_name=$1, logo_url=$2, updated_at=NOW() WHERE id=1`,
        [schema.globals.header.site_name, schema.globals.header.logo],
      );
    }

    // Update Pages
    if (schema.pages && Array.isArray(schema.pages)) {
      for (const page of schema.pages) {
        if (page.id && page.layout) {
          await pool.query(
            `UPDATE public.pages SET content_blocks=$1, updated_at=NOW() WHERE id=$2`,
            [JSON.stringify(page.layout), page.id],
          );
        }
      }
    }

    await pool.query('COMMIT');
    res.json({ success: true, message: 'Configuration globale sauvegardée' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error saving site config:', err);
    res.status(500).json({ error: err.message });
  }
});

// -- AI Code Assistant (Migrated from Next.js API) --

app.post('/api/ai-code-assistant', authenticateToken, async (req, res) => {
  try {
    const { prompt, currentCode, pageId, userId, provider } = req.body;

    if (!prompt || !currentCode) {
      return res.status(400).json({ error: 'Missing prompt or currentCode' });
    }

    // Rate Limiting (10 requêtes/min/utilisateur)
    // Check local DB for logs (assuming ai_requests_log table exists or we just proceed)
    // ... (Skipping complex rate limit for now or implementing simple one if table exists)

    const apiKey = process.env.GEMINI_API_KEY;
    let generatedCode;

    try {
      if (!apiKey) {
        throw new Error('Gemini API key not configured on server');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `
Tu es un expert en HTML/Tailwind CSS et SEO.

Code actuel :
${currentCode}

Demande utilisateur :
${prompt}

Règles strictes :
1. Réponds UNIQUEMENT avec le code HTML/Tailwind modifié
2. Pas d'explication, juste le code
3. Préserve la structure existante
4. Utilise Tailwind CSS moderne (v3+)
5. Assure la responsivité (mobile-first)
6. Ajoute les attributs SEO (alt, aria-label, etc.)

Code modifié :
`;

      const result = await model.generateContent(systemPrompt);
      generatedCode = result.response.text();

      // Nettoyer le code
      generatedCode = generatedCode
        .replace(/^```html\n?/, '')
        .replace(/\n?```$/, '')
        .trim();
    } catch (aiError) {
      console.warn('AI Code Assistant using fallback:', aiError.message);

      // Fallback: Return enhanced version of current code
      generatedCode =
        currentCode ||
        `<div class="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg">
    <h2 class="text-3xl font-bold text-gray-800 mb-4">Section Améliorée</h2>
    <p class="text-gray-600 leading-relaxed">
        ${prompt || 'Contenu généré automatiquement'}
    </p>
    <div class="mt-6 flex gap-4">
        <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            En savoir plus
        </button>
        <button class="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            Contact
        </button>
    </div>
</div>`;
    }

    // 1. Save Log (if log table exists - checking schema first or wrapping in try/catch)
    try {
      await pool.query(
        `INSERT INTO public.ai_requests_log (user_id, page_id, prompt, generated_code, ai_mode, ai_provider)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user.id, pageId, prompt, generatedCode, 'external', provider || 'gemini'],
      );
    } catch (e) {
      console.warn('Logging AI request failed (table might be missing), proceeding...', e.message);
    }

    // 2. Versioning
    // Fetch current version
    const pageResult = await pool.query('SELECT version FROM public.pages WHERE id = $1', [pageId]);
    const currentVersion = pageResult.rows[0]?.version || 1;
    const newVersion = currentVersion + 1;

    // Insert version
    try {
      await pool.query(
        `INSERT INTO public.page_versions (page_id, version, content_raw, created_by, ai_history)
                 VALUES ($1, $2, $3, $4, $5)`,
        [
          pageId,
          newVersion,
          generatedCode,
          req.user.id,
          JSON.stringify([
            {
              timestamp: new Date().toISOString(),
              prompt,
              generated_code: generatedCode.substring(0, 200) + '...',
              ai_mode: 'external',
            },
          ]),
        ],
      );
    } catch (e) {
      console.warn('Saving version failed (table might be missing), proceeding...', e.message);
    }

    // Update Page Content
    /* NOTE: The original Next.js endpoint did NOT update the page directly, only created a version.
           But AdminPageEditor typically expects the editor to simple receive the code.
           The hook client code updates the editor content.
           So we just return the code. */

    res.json({
      code: generatedCode,
      version: newVersion,
      provider: provider || 'gemini',
      message: "Code généré avec succès par l'AI",
    });
  } catch (err) {
    console.error('AI Assistant Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'AI Assistant failed',
      code: 'AI_ASSISTANT_FAIL',
    });
  }
});

// -- AI General Generation (Omni-Channel) --
app.post('/api/ai-generate', authenticateToken, async (req, res) => {
  try {
    const { prompt, context, tone, task } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key not configured');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are an AI assistant for the PROQUELEC website admin panel.
Task: ${task}
Context: ${context}
Tone: ${tone || 'professional'}

Instructions:
1. If the task is 'seo', detailed JSON output is expected with 'score' and 'suggestions'.
2. If the task is 'code', return only the code.
3. Be professional and concise.`;

    const result = await model.generateContent(systemPrompt + '\n\nUser Request: ' + prompt);
    const content = result.response.text();

    res.json({ content, success: true });
  } catch (err) {
    console.error('AI Generate Error:', err);
    res.status(500).json({ success: false, message: err.message, code: 'AI_GEN_FAIL' });
  }
});

// POST /api/ai/generate-visual — (REMOVED DUPLICATE: mock-only version)
// Kept the real Python proxy version at line ~581 which connects to the AI backend

// -- Database Initialization (Lazy migration) --
const initDB = async () => {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await pool.query(`
            CREATE TABLE IF NOT EXISTS public.users(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS public.ai_requests_log(
                id SERIAL PRIMARY KEY,
                user_id UUID,
                page_id UUID,
                prompt TEXT,
                generated_code TEXT,
                ai_mode TEXT,
                ai_provider TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS public.pages(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            content TEXT,
            excerpt TEXT,
            meta_description TEXT,
            meta_keywords TEXT,
            meta_robots TEXT DEFAULT 'index,follow',
            featured_image TEXT,
            template TEXT DEFAULT 'default',
            show_hero BOOLEAN DEFAULT true,
            show_footer BOOLEAN DEFAULT true,
            custom_css TEXT,
            custom_js TEXT,
            header_html TEXT,
            footer_html TEXT,
            hero_title TEXT,
            hero_subtitle TEXT,
            hero_background_image TEXT,
            hero_cta_text TEXT,
            hero_cta_link TEXT,
            is_published BOOLEAN DEFAULT false,
            status TEXT DEFAULT 'draft',
            publish_date TIMESTAMP WITH TIME ZONE,
            unpublish_date TIMESTAMP WITH TIME ZONE,
            menu_order INTEGER DEFAULT 0,
            categories TEXT[],
            tags TEXT[],
            author TEXT,
            reading_time INTEGER DEFAULT 0,
            content_blocks JSONB DEFAULT '[]',
            design_options JSONB DEFAULT '{}',
            seo_options JSONB DEFAULT '{}',
            parent_id UUID REFERENCES public.pages(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.page_versions(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
            version INTEGER NOT NULL,
            content_raw TEXT,
            content_hash TEXT,
            diff_from_previous JSONB,
            created_by UUID,
            ai_history JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`);
    // Migration proactive pour les colonnes manquantes
    await pool.query('ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1');
    await pool.query(
      "ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'",
    );
    await pool.query(
      'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true',
    );
    await pool.query(
      "ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS workflow_state TEXT DEFAULT 'draft'",
    );
    await pool.query(
      "ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS workflow_state TEXT DEFAULT 'draft'",
    );
    await pool.query(`
            CREATE TABLE IF NOT EXISTS public.document_workflow_transitions(
                id SERIAL PRIMARY KEY,
                entity_id UUID NOT NULL,
                entity_type TEXT NOT NULL,
                from_state TEXT,
                to_state TEXT NOT NULL,
                changed_by UUID,
                comment TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_document_workflow_transitions_entity_id ON public.document_workflow_transitions(entity_id);
        `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS public.construction_mode(
            id INTEGER PRIMARY KEY,
            is_enabled BOOLEAN DEFAULT false,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_by UUID
        );
        INSERT INTO public.construction_mode (id, is_enabled) VALUES (1, false) ON CONFLICT (id) DO NOTHING;

        -- Versioning Trigger Function
        CREATE OR REPLACE FUNCTION public.auto_page_versioning() RETURNS TRIGGER AS $$
        DECLARE
            previous_content TEXT;
            previous_hash TEXT;
            diff JSONB;
        BEGIN
            -- Ensure we are not in a recursive call
            IF TG_OP = 'UPDATE' AND NEW.version IS NOT NULL AND OLD.version IS NOT NULL AND NEW.version <= OLD.version THEN
                RETURN NEW;
            END IF;

            -- Get previous version content (if exists)
            SELECT content_raw, content_hash
            INTO previous_content, previous_hash
            FROM public.page_versions
            WHERE page_id = NEW.id
            ORDER BY version DESC
            LIMIT 1;

            -- Compute diff
            diff := jsonb_build_object(
                'previous', COALESCE(previous_content, ''),
                'new', COALESCE(NEW.content_raw, '')
            );

            -- Insert new version
            INSERT INTO public.page_versions(
                page_id, version, content_raw, content_hash, diff_from_previous, created_by
            ) VALUES (
                NEW.id,
                COALESCE(OLD.version, 0) + 1,
                COALESCE(NEW.content_raw, ''),
                encode(digest(COALESCE(NEW.content_raw, ''), 'sha256'), 'hex'),
                diff,
                NULL -- auth.uid() might not be available
            );

            -- Update version in pages table
            NEW.version := COALESCE(OLD.version, 0) + 1;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger if not exists
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trig_auto_page_versioning') THEN
                CREATE TRIGGER trig_auto_page_versioning
                BEFORE UPDATE ON public.pages
                FOR EACH ROW
                EXECUTE FUNCTION public.auto_page_versioning();
            END IF;
        END $$;


            CREATE TABLE IF NOT EXISTS public.home_hero(
            id SERIAL PRIMARY KEY,
            title TEXT,
            subtitle TEXT,
            description TEXT,
            cta_text TEXT,
            cta_link TEXT,
            background_url TEXT,
            updated_at TIMESTAMP DEFAULT NOW()
        );
            CREATE TABLE IF NOT EXISTS public.home_slides(
            id SERIAL PRIMARY KEY,
            badge TEXT,
            title TEXT,
            subtitle TEXT,
            description TEXT,
            background_url TEXT,
            cta_text TEXT,
            cta_link TEXT,
            secondary_cta_text TEXT,
            secondary_cta_link TEXT,
            display_order INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT NOW()
        );
            CREATE TABLE IF NOT EXISTS public.home_stats(
            id SERIAL PRIMARY KEY,
            label TEXT,
            value TEXT,
            icon_name TEXT,
            description TEXT,
            is_warning BOOLEAN DEFAULT false,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        );
            CREATE TABLE IF NOT EXISTS public.home_services(
            id SERIAL PRIMARY KEY,
            title TEXT,
            description TEXT,
            icon_name TEXT,
            link TEXT,
            features TEXT[],
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        );
            CREATE TABLE IF NOT EXISTS public.testimonials(
            id SERIAL PRIMARY KEY,
            name TEXT,
            role TEXT,
            content TEXT,
            rating INTEGER DEFAULT 5,
            avatar_url TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
            CREATE TABLE IF NOT EXISTS public.site_config(
            id TEXT PRIMARY KEY,
            schema JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.contact_requests(
            id SERIAL PRIMARY KEY,
            name TEXT,
            email TEXT,
            message TEXT,
            submitted_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.documents(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            file_url TEXT NOT NULL,
            uploaded_at TIMESTAMP DEFAULT NOW(),
            uploader_id UUID
        );
        CREATE TABLE IF NOT EXISTS public.users(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.events(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            date TIMESTAMP NOT NULL,
            location TEXT,
            details TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            organizer_id UUID
        );
        CREATE TABLE IF NOT EXISTS public.blog_categories(
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS public.blog_posts(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            content TEXT,
            excerpt TEXT,
            slug TEXT NOT NULL UNIQUE,
            cover_image_url TEXT,
            category_id INTEGER REFERENCES public.blog_categories(id),
            published_at TIMESTAMP WITH TIME ZONE,
            author_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.electrical_standards(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            category TEXT,
            description TEXT,
            version TEXT,
            status TEXT,
            document_url TEXT,
            summary TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.electrical_equipment(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            brand TEXT,
            model TEXT,
            category TEXT,
            description TEXT,
            price DECIMAL(10,2),
            stock_quantity INTEGER DEFAULT 0,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.professional_training(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            duration_hours INTEGER,
            level TEXT,
            price DECIMAL(10,2),
            max_participants INTEGER,
            instructor_name TEXT,
            location TEXT,
            equipment_provided BOOLEAN DEFAULT false,
            prerequisites TEXT[],
            learning_objectives TEXT[],
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.newsletter_subscribers(
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            source TEXT,
            is_active BOOLEAN DEFAULT true,
            subscribed_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.media_files(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_type TEXT,
            file_size INTEGER,
            mime_type TEXT,
            alt_text TEXT,
            uploaded_at TIMESTAMP DEFAULT NOW(),
            uploaded_by UUID
        );
        CREATE TABLE IF NOT EXISTS public.audit_log(
            id SERIAL PRIMARY KEY,
            user_id UUID,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id TEXT,
            details JSONB,
            timestamp TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.performance_metrics(
            id SERIAL PRIMARY KEY,
            page_url TEXT,
            load_time DECIMAL,
            dom_content_loaded DECIMAL,
            first_contentful_paint DECIMAL,
            time_to_interactive DECIMAL,
            connection_type TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.analytics_events(
            id SERIAL PRIMARY KEY,
            event_type TEXT NOT NULL,
            page_url TEXT,
            device_type TEXT,
            country TEXT,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- BUSINESS ENGINE TABLES
        CREATE TABLE IF NOT EXISTS public.certifications(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            certificate_number TEXT NOT NULL UNIQUE,
            holder_name TEXT NOT NULL,
            type TEXT NOT NULL,
            issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expiry_date TIMESTAMP WITH TIME ZONE,
            status TEXT DEFAULT 'active',
            metadata JSONB DEFAULT '{}'
        );

        CREATE TABLE IF NOT EXISTS public.audits(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            site_name TEXT NOT NULL,
            location TEXT,
            inspector_id UUID,
            audit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            findings TEXT,
            compliance_score INTEGER,
            recommendations TEXT,
            metadata JSONB DEFAULT '{}'
        );

        CREATE TABLE IF NOT EXISTS public.electricians_network(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            specializations TEXT[],
            region TEXT,
            phone TEXT,
            email TEXT,
            rating DECIMAL(3,2) DEFAULT 0.0,
            projects_count INTEGER DEFAULT 0,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_verified BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'
        );

        CREATE TABLE IF NOT EXISTS public.gallery_items(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            url TEXT NOT NULL,
            type TEXT DEFAULT 'photo',
            category TEXT DEFAULT 'projets',
            tags TEXT[],
            hotspots JSONB DEFAULT '[]',
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `);

    // Migration logic for missing columns in existing tables
    console.log('Verifying table structures...');
    await pool.query(`
            ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
            ALTER TABLE public.pages
            ADD COLUMN IF NOT EXISTS excerpt TEXT,
        ADD COLUMN IF NOT EXISTS meta_description TEXT,
            ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
                ADD COLUMN IF NOT EXISTS meta_robots TEXT DEFAULT 'index,follow',
                    ADD COLUMN IF NOT EXISTS featured_image TEXT,
                        ADD COLUMN IF NOT EXISTS template TEXT DEFAULT 'default',
                            ADD COLUMN IF NOT EXISTS show_hero BOOLEAN DEFAULT true,
                                ADD COLUMN IF NOT EXISTS show_footer BOOLEAN DEFAULT true,
                                    ADD COLUMN IF NOT EXISTS custom_css TEXT,
                                        ADD COLUMN IF NOT EXISTS custom_js TEXT,
                                            ADD COLUMN IF NOT EXISTS header_html TEXT,
                                                ADD COLUMN IF NOT EXISTS footer_html TEXT,
                                                    ADD COLUMN IF NOT EXISTS hero_title TEXT,
                                                        ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
                                                            ADD COLUMN IF NOT EXISTS hero_background_image TEXT,
                                                                ADD COLUMN IF NOT EXISTS hero_cta_text TEXT,
                                                                    ADD COLUMN IF NOT EXISTS hero_cta_link TEXT,
                                                                        ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
                                                                            ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
                                                                                ADD COLUMN IF NOT EXISTS publish_date TIMESTAMP WITH TIME ZONE,
                                                                                    ADD COLUMN IF NOT EXISTS unpublish_date TIMESTAMP WITH TIME ZONE,
                                                                                        ADD COLUMN IF NOT EXISTS categories TEXT[],
                                                                                            ADD COLUMN IF NOT EXISTS tags TEXT[],
                                                                                                ADD COLUMN IF NOT EXISTS author TEXT,
                                                                                                    ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0,
                                                                                                        ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]',
                                                                                                            ADD COLUMN IF NOT EXISTS design_options JSONB DEFAULT '{}',
                                                                                                                ADD COLUMN IF NOT EXISTS seo_options JSONB DEFAULT '{}',
                                                                                                                    ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.pages(id),
                                                                                                                    ADD COLUMN IF NOT EXISTS content_raw TEXT,
                                                                                                                    ADD COLUMN IF NOT EXISTS security_level TEXT DEFAULT 'public',
                                                                                                                    ADD COLUMN IF NOT EXISTS immutable BOOLEAN DEFAULT false,
                                                                                                                    ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1
        `);

    // Seed initial pages if missing
    console.log('Ensuring critical pages exist...');
    const initialPages = [
      {
        title: 'À propos de PROQUELEC',
        slug: 'about',
        content:
          "<h2>Notre Mission</h2><p>PROQUELEC est l'organisme national de référence pour la qualité et la sécurité des installations électriques au Sénégal. Depuis 1995, nous œuvrons pour promouvoir l'excellence professionnelle et assurer la conformité aux normes internationales.</p><h2>Nos Valeurs</h2><ul><li><strong>Sécurité :</strong> Promouvoir des installations électriques sûres et fiables</li><li><strong>Qualité :</strong> Assurer la conformité aux normes internationales</li><li><strong>Excellence :</strong> Reconnaître et valoriser les professionnels de qualité</li><li><strong>Innovation :</strong> Promouvoir les meilleures pratiques modernes</li></ul>",
        meta_description:
          "Découvrez PROQUELEC, l'organisme national de référence pour la qualité et la sécurité des installations électriques au Sénégal.",
        hero_title: 'À propos de PROQUELEC',
        hero_subtitle: "L'organisme national de référence pour la qualité électrique au Sénégal",
        menu_order: 1,
      },
      {
        title: 'Nos Activités',
        slug: 'activities',
        content:
          '<h2>Contrôle de conformité</h2><p>Vérification complète et certifications des installations conformes aux normes.</p><h2>Labellisation</h2><p>Attribution du label de qualité après audit rigoureux.</p><h2>Formations</h2><p>Programmes de formation certifiants pour électriciens et techniciens.</p>',
        meta_description:
          'Découvrez toutes nos activités : contrôle de conformité, labellisation, formations, audits énergétiques.',
        hero_title: 'Nos Activités',
        hero_subtitle: "Découvrez l'ensemble de nos services et missions",
        menu_order: 2,
      },
      {
        title: 'Labels & Qualité',
        slug: 'labels',
        content:
          "<h2>Le Label PROQUELEC</h2><p>Le Label PROQUELEC est une marque de qualité qui garantit l'excellence des installations électriques.</p>",
        meta_description:
          "Découvrez le Label PROQUELEC, marque de qualité pour les professionnels de l'électricité au Sénégal.",
        hero_title: 'Nos Labels',
        hero_subtitle: "Le Label PROQUELEC, garantie d'excellence professionnelle",
        menu_order: 3,
      },
      {
        title: 'Certifications',
        slug: 'certifications',
        content:
          '<h2>Programme de Certification</h2><p>Nos certifications valident vos compétences et garantissent votre expertise professionnelle.</p>',
        meta_description:
          'Découvrez nos programmes de certification pour valider vos compétences en électricité.',
        hero_title: 'Certifications',
        hero_subtitle: 'Validez vos compétences avec nos certifications professionnelles',
        menu_order: 4,
      },
      {
        title: 'Documentation',
        slug: 'documents',
        content:
          '<h2>Centre de Documentation</h2><p>Accédez à notre bibliothèque complète de documents techniques et normes.</p>',
        meta_description:
          'Téléchargez nos documents techniques, guides professionnels et ressources.',
        hero_title: 'Documents & Ressources',
        hero_subtitle: 'Bibliothèque complète de documents techniques',
        menu_order: 5,
      },
      {
        title: 'Évènements',
        slug: 'events',
        content:
          '<h2>Calendrier des Évènements</h2><p>Découvrez nos conférences, ateliers et webinaires.</p>',
        meta_description:
          "Découvrez nos événements : conférences, ateliers et formations sur l'électricité au Sénégal.",
        hero_title: 'Évènements',
        hero_subtitle: 'Conférences et ateliers professionnels',
        menu_order: 6,
      },
      {
        title: 'Formations',
        slug: 'formations',
        content:
          '<h2>Centre de Formation</h2><p>Développez vos compétences avec nos formations professionnelles.</p>',
        meta_description: 'Suivez nos formations professionnelles en électricité. Cours certifiés.',
        hero_title: 'Nos Formations',
        hero_subtitle: 'Développez votre expertise électrique',
        menu_order: 7,
      },
      {
        title: 'Expertises Techniques',
        slug: 'expertises-techniques',
        content:
          "<h2>Expertises Techniques</h2><p>Nos domaines d'expertise au service de votre sécurité.</p>",
        meta_description:
          'Découvrez les expertises techniques de PROQUELEC en installations électriques.',
        hero_title: 'Expertises Techniques',
        hero_subtitle: "L'excellence technique au Sénégal",
        menu_order: 8,
      },
      {
        title: 'Formations PROQUELEC',
        slug: 'formations-proquelec',
        content:
          '<h2>Formations PROQUELEC</h2><p>Découvrez nos programmes de formation avancés.</p>',
        meta_description: 'Programmes de formations avancés PROQUELEC pour les professionnels.',
        hero_title: 'Formations PROQUELEC',
        hero_subtitle: 'Votre avenir commence ici',
        menu_order: 9,
      },
      {
        title: 'Contactez-nous',
        slug: 'contact',
        content:
          "<h2>Contact & Localisation</h2><p>Notre équipe d'experts est à votre entière disposition pour répondre à vos questions techniques.</p>",
        meta_description:
          "Contactez PROQUELEC pour vos besoins d'audit, formation ou certification électrique.",
        hero_title: 'Contactez-nous',
        hero_subtitle: "Une équipe d'experts à votre entière disposition",
        menu_order: 10,
      },
      {
        title: 'Mentions Légales',
        slug: 'legal',
        content:
          '<h2>Mentions Légales</h2><p>Responsable du site, hébergement et confidentialité.</p>',
        meta_description: "Mentions légales et conditions d'utilisation du site PROQUELEC.",
        menu_order: 100,
      },
    ];

    for (const p of initialPages) {
      await pool.query(
        `INSERT INTO public.pages(title, slug, content, meta_description, hero_title, hero_subtitle, menu_order, is_published, status)
    VALUES($1, $2, $3, $4, $5, $6, $7, true, 'published')
                 ON CONFLICT(slug) DO UPDATE SET
    title = EXCLUDED.title,
        content = EXCLUDED.content,
        meta_description = EXCLUDED.meta_description,
        hero_title = EXCLUDED.hero_title,
        hero_subtitle = EXCLUDED.hero_subtitle,
        menu_order = EXCLUDED.menu_order,
        updated_at = NOW()
                 WHERE pages.content != EXCLUDED.content OR pages.title != EXCLUDED.title`,
        [
          p.title,
          p.slug,
          p.content,
          p.meta_description,
          p.hero_title,
          p.hero_subtitle,
          p.menu_order,
        ],
      );
    }

    // Seed site_config if empty
    const configCheck = await pool.query('SELECT COUNT(*) FROM public.site_config WHERE id = $1', [
      'global_v1',
    ]);
    if (parseInt(configCheck.rows[0].count) === 0) {
      console.log('Seeding initial site schema...');
      const initialSchema = {
        pages: [
          {
            id: 'home',
            slug: '/',
            title: 'Accueil',
            layout: [
              { id: 'hero', type: 'HeroBanner', settings: {} },
              { id: 'stats', type: 'StatsSection', settings: {} },
              { id: 'services', type: 'ServicesGrid', settings: {} },
            ],
          },
        ],
        theme: {
          primary: '#2376df',
          secondary: '#054393',
          accent: '#ea580c',
          radius: '0.75rem',
          font: 'Inter',
        },
        globals: {
          header: {
            promoText: '',
            backgroundColor: '',
            textColor: '#ffffff',
          },
          footer: {
            backgroundColor: '#111827',
            textColor: '#ffffff',
          },
        },
      };
      await pool.query('INSERT INTO public.site_config (id, schema) VALUES ($1, $2)', [
        'global_v1',
        JSON.stringify(initialSchema),
      ]);
    }

    // Seed home_hero if empty
    const heroCheck = await pool.query('SELECT count(*) FROM public.home_hero');
    if (parseInt(heroCheck.rows[0].count) === 0) {
      await pool.query(`INSERT INTO public.home_hero(title, subtitle, description, cta_text, cta_link)
    VALUES('93% des installations électriques', 'au Sénégal ne sont pas conformes !', 'Enquête nationale PROQUELEC 2012 - Première étude en Afrique révélant un danger imminent', 'Contrôler mon installation', '/contact')`);
    }

    // Seed home_slides if empty
    const slidesCheck = await pool.query('SELECT COUNT(*) FROM public.home_slides');
    if (parseInt(slidesCheck.rows[0].count) === 0) {
      console.log('Seeding home_slides...');
      const defaultSlides = [
        {
          badge: 'PROQUELEC SENEGAL',
          title: 'Promotion de la Qualité des Installations Électriques',
          subtitle: 'Sécurité · Qualité · Formation',
          description:
            'Expert en installations électriques au Sénégal depuis 1995. Nous garantissons la sécurité, la qualité et la conformité de vos projets électriques.',
          background_url:
            'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=2000&auto=format&fit=crop',
          cta_text: 'Nos Services',
          cta_link: '/#services',
          secondary_cta_text: 'Contactez-nous',
          secondary_link: '/contact',
          order: 1,
        },
        {
          badge: 'EXPERTISE 29 ANS',
          title: "L'Audit Électrique pour une Sécurité Totale",
          subtitle: 'Contrôle · Diagnostic · Conformité',
          description:
            'Saviez-vous que 93% des installations au Sénégal ne sont pas conformes ? Nos experts certifiés réalisent des audits approfondis.',
          background_url:
            'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2000&auto=format&fit=crop',
          cta_text: 'Demander un Audit',
          cta_link: '/contact',
          secondary_cta_text: 'Nos Certifications',
          secondary_link: '/labels',
          order: 2,
        },
      ];
      for (const s of defaultSlides) {
        await pool.query(
          'INSERT INTO public.home_slides (badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
          [
            s.badge,
            s.title,
            s.subtitle,
            s.description,
            s.background_url,
            s.cta_text,
            s.cta_link,
            s.secondary_cta_text,
            s.secondary_link,
            s.order,
          ],
        );
      }
    }

    // Seed stats if empty
    const statsCheck = await pool.query('SELECT count(*) FROM public.home_stats');
    if (parseInt(statsCheck.rows[0].count) === 0) {
      await pool.query(`
                INSERT INTO public.home_stats(label, value, icon_name, description, is_warning, display_order) VALUES
        ('Années d''expérience', '29+', 'Award', 'Depuis 1995', false, 0),
        ('Professionnels formés', '1000+', 'Users', 'Électriciens certifiés', false, 1),
        ('Installations contrôlées', '500+', 'CheckCircle', 'Contrôles réalisés', false, 2),
        ('Conformité moyenne', '7%', 'AlertTriangle', 'À améliorer d''urgence', true, 3)
    `);
    }

    // Seed services if empty
    const servicesCheck = await pool.query('SELECT count(*) FROM public.home_services');
    if (parseInt(servicesCheck.rows[0].count) === 0) {
      await pool.query(`
                INSERT INTO public.home_services(title, description, icon_name, link, features, display_order) VALUES
    ('Formations Certifiantes', 'Habilitations électriques et formations aux normes NF C 15-100', 'BookOpen', '/events', ARRAY['Certificats reconnus', 'Formateurs experts', 'Programmes adaptés'], 0),
    ('Contrôles & Audits', 'Vérifications de conformité et diagnostics sécuritaires', 'Shield', '/activities', ARRAY['Normes en vigueur', 'Rapports détaillés', 'Recommandations'], 1),
    ('Efficacité Énergétique', 'Audits énergétiques et optimisation des installations', 'Zap', '/contact', ARRAY['Économies garanties', 'Solutions durables', 'ROI calculé'], 2)
        `);
    }

    // --- ANTICIPATION : Proactive Indexing for Performance ---
    console.log('Optimizing database performance (Proactive Indexing)...');
    await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
            CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
            CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at);
            CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log(timestamp);
        `);

    // --- SELF-HEALING : Ensure Singleton Rows ---
    console.log('Verifying core system singletons...');

    // Site Settings
    await pool.query(`
            CREATE TABLE IF NOT EXISTS public.site_settings(
                id SERIAL PRIMARY KEY,
                site_name TEXT DEFAULT 'PROQUELEC SÉNÉGAL',
                slogan TEXT DEFAULT 'Sécurité · Qualité · Formation',
                logo_url TEXT,
                favicon_url TEXT,
                contact_email TEXT,
                phone_number TEXT,
                address TEXT,
                copyright_text TEXT,
                facebook_url TEXT,
                linkedin_url TEXT,
                twitter_url TEXT,
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
    const settingsCheck = await pool.query(
      'SELECT COUNT(*) FROM public.site_settings WHERE id = 1',
    );
    if (parseInt(settingsCheck.rows[0].count) === 0) {
      await pool.query(
        "INSERT INTO public.site_settings (id, site_name) VALUES (1, 'PROQUELEC SÉNÉGAL')",
      );
    }

    // Theme Settings
    await pool.query(`
            CREATE TABLE IF NOT EXISTS public.theme_settings(
                id SERIAL PRIMARY KEY,
                primary_color TEXT DEFAULT '#2376df',
                secondary_color TEXT DEFAULT '#2C2C2C',
                accent_color TEXT DEFAULT '#ea580c',
                background_color TEXT DEFAULT '#ffffff',
                text_color TEXT DEFAULT '#1f2937',
                font_family TEXT DEFAULT 'Inter',
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
    const themeCheck = await pool.query('SELECT COUNT(*) FROM public.theme_settings WHERE id = 1');
    if (parseInt(themeCheck.rows[0].count) === 0) {
      await pool.query(
        "INSERT INTO public.theme_settings (id, primary_color, secondary_color) VALUES (1, '#2376df', '#2C2C2C')",
      );
    }

    // --- SELF-HEALING MIGRATIONS (Bridge between legacy and modern schema) ---
    await pool.query(`
            DO $$
            BEGIN
                -- Site Settings Missing Columns
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='phone_number') THEN
                    ALTER TABLE public.site_settings ADD COLUMN phone_number TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='facebook_url') THEN
                    ALTER TABLE public.site_settings ADD COLUMN facebook_url TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='linkedin_url') THEN
                    ALTER TABLE public.site_settings ADD COLUMN linkedin_url TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='twitter_url') THEN
                    ALTER TABLE public.site_settings ADD COLUMN twitter_url TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='copyright_text') THEN
                    ALTER TABLE public.site_settings ADD COLUMN copyright_text TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='require_email_confirmation') THEN
                    ALTER TABLE public.site_settings ADD COLUMN require_email_confirmation BOOLEAN DEFAULT false;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='logo_height') THEN
                    ALTER TABLE public.site_settings ADD COLUMN logo_height INTEGER DEFAULT 50;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='logo_scale') THEN
                    ALTER TABLE public.site_settings ADD COLUMN logo_scale DECIMAL DEFAULT 1.2;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='logo_brightness') THEN
                    ALTER TABLE public.site_settings ADD COLUMN logo_brightness INTEGER DEFAULT 100;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='logo_contrast') THEN
                    ALTER TABLE public.site_settings ADD COLUMN logo_contrast INTEGER DEFAULT 100;
                END IF;

                -- Theme Settings Missing Columns
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='accent_color') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN accent_color TEXT DEFAULT '#ea580c';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='background_color') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN background_color TEXT DEFAULT '#ffffff';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='text_color') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN text_color TEXT DEFAULT '#1f2937';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='font_family') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN font_family TEXT DEFAULT 'Inter';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='theme_settings' AND column_name='footer_background_url') THEN
                    ALTER TABLE public.theme_settings ADD COLUMN footer_background_url TEXT;
                END IF;
            END $$;
        `);

    // SEED ADMIN USER IF NOT EXISTS (Recovery & First Run)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@proquelec.com';
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword) {
      const userCheck = await pool.query('SELECT * FROM public.users WHERE email = $1', [
        adminEmail,
      ]);
      if (userCheck.rows.length === 0) {
        console.log('Seeding initial admin user...');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await pool.query(
          'INSERT INTO public.users (email, password_hash, role, name) VALUES ($1, $2, $3, $4)',
          [adminEmail, hashedPassword, 'admin', 'Administrateur'],
        );
      }
    }

    console.log('Database system is fully operational and optimized.');
  } catch (err) {
    console.error('CRITICAL Database Initialization Error:', err);
    // Alert mechanism could be added here
  }
};

// -- Home Page Dynamic Endpoints --

// Slides (Hero)
app.get('/api/home-slides', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.home_slides ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/home-slides', authenticateToken, async (req, res) => {
  const {
    badge,
    title,
    subtitle,
    description,
    background_url,
    cta_text,
    cta_link,
    secondary_cta_text,
    secondary_cta_link,
    display_order,
  } = req.body;
  await executeQuery(
    res,
    `INSERT INTO public.home_slides
    (badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING * `,
    [
      badge,
      title,
      subtitle,
      description,
      background_url,
      cta_text,
      cta_link,
      secondary_cta_text,
      secondary_cta_link,
      display_order,
    ],
  );
});

app.put('/api/home-slides/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    badge,
    title,
    subtitle,
    description,
    background_url,
    cta_text,
    cta_link,
    secondary_cta_text,
    secondary_cta_link,
    display_order,
  } = req.body;
  await executeQuery(
    res,
    `UPDATE public.home_slides
        SET badge = $1, title = $2, subtitle = $3, description = $4, background_url = $5, cta_text = $6, cta_link = $7, secondary_cta_text = $8, secondary_cta_link = $9, display_order = $10
        WHERE id = $11 RETURNING * `,
    [
      badge,
      title,
      subtitle,
      description,
      background_url,
      cta_text,
      cta_link,
      secondary_cta_text,
      secondary_cta_link,
      display_order,
      id,
    ],
  );
});

app.delete('/api/home-slides/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.home_slides WHERE id=$1', [req.params.id]);
});

// Hero (Old/Legacy single item for compatibility if needed)
app.get('/api/home-hero', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.home_hero LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/home-hero', authenticateToken, async (req, res) => {
  const { title, subtitle, description, cta_text, cta_link, background_url } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO public.home_hero(id, title, subtitle, description, cta_text, cta_link, background_url, updated_at)
VALUES(1, $1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT(id) DO UPDATE
             SET title = $1, subtitle = $2, description = $3, cta_text = $4, cta_link = $5, background_url = $6, updated_at = NOW()
RETURNING * `,
      [title, subtitle, description, cta_text, cta_link, background_url],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats
app.get('/api/home-stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.home_stats ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/home-stats', authenticateToken, async (req, res) => {
  const { label, value, icon_name, description, is_warning, display_order } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.home_stats (label, value, icon_name, description, is_warning, display_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [label, value, icon_name, description, is_warning, display_order],
  );
});

app.put('/api/home-stats/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { label, value, icon_name, description, is_warning, display_order } = req.body;
  await executeQuery(
    res,
    'UPDATE public.home_stats SET label=$1, value=$2, icon_name=$3, description=$4, is_warning=$5, display_order=$6 WHERE id=$7 RETURNING *',
    [label, value, icon_name, description, is_warning, display_order, id],
  );
});

app.delete('/api/home-stats/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.home_stats WHERE id=$1', [req.params.id]);
});

// --- Universal Control Engine (Enterprise Grade) ---

// GET/POST /api/site-config — (REMOVED DUPLICATE: simple version)
// Kept the richer transactional version at line ~1817 which assembles full schema with theme+pages+globals

// Logs for traceability
app.get('/api/admin/audit-logs', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.audit_log ORDER BY timestamp DESC LIMIT 100',
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/audit-logs', authenticateToken, async (req, res) => {
  try {
    const { action, entity_type, entity_id, details } = req.body;
    const result = await pool.query(
      'INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, details, timestamp) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [req.user.id, action, entity_type, entity_id, details],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DATABASE EXPLORER (ADMIN ONLY) ---

// List all tables
app.get('/api/admin/db/tables', authenticateToken, async (req, res) => {
  try {
    const query = `
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;
    const result = await pool.query(query);
    res.json(result.rows.map((r) => r.table_name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get table schema and data
app.get('/api/admin/db/tables/:tableName', authenticateToken, async (req, res) => {
  const { tableName } = req.params;
  try {
    // Get columns
    const columnsQuery = `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = $1
            ORDER BY ordinal_position;
        `;
    const columns = await pool.query(columnsQuery, [tableName]);

    // Get data (limit to 100 for safety)
    const data = await pool.query(`SELECT * FROM public."${tableName}" LIMIT 100`);

    res.json({
      columns: columns.rows,
      rows: data.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Execute custom SQL query (admin seulement, SELECT uniquement)
app.post('/api/admin/db/query', authenticateToken, requireAdmin, async (req, res) => {
  const { query } = req.body;
  try {
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'La requête ne peut pas être vide' });
    }
    const trimmed = query.trim().toUpperCase();
    if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('WITH')) {
      return res.status(403).json({ error: 'Seules les requêtes SELECT sont autorisées' });
    }
    const result = await pool.query(query);

    if (Array.isArray(result)) {
      const multiResults = result.map((r) => ({
        command: r.command,
        rowCount: r.rowCount,
        rows: r.rows,
      }));
      return res.json({ multiple: true, results: multiResults });
    }

    res.json({
      rows: result.rows || [],
      rowCount: result.rowCount,
      command: result.command,
    });
  } catch (err) {
    console.error('SQL Execution Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- INTELLIGENCE : Data Aggregation & Trends ---

app.get('/api/intelligence/insights', authenticateToken, async (req, res) => {
  try {
    const insights = {};

    // 1. Certification Trends
    const certs = await pool.query(
      'SELECT type, status, COUNT(*) as count FROM public.certifications GROUP BY type, status',
    );
    insights.certifications = certs.rows;

    // 2. Audit Compliance Heatmap (Simplified by region)
    const audits = await pool.query(
      'SELECT location, AVG(compliance_score) as avg_score, COUNT(*) as volume FROM public.audits GROUP BY location',
    );
    insights.audits = audits.rows;

    // 3. Network Density
    const network = await pool.query(
      'SELECT region, COUNT(*) as pros FROM public.electricians_network WHERE is_verified = true GROUP BY region',
    );
    insights.professionals = network.rows;

    // 4. Growth Metrics
    const growth = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM public.users) as total_users,
                (SELECT COUNT(*) FROM public.contact_requests WHERE submitted_at > NOW() - INTERVAL '30 days') as new_requests_30d
        `);
    insights.growth = growth.rows[0];

    res.json(insights);
  } catch (err) {
    handleAppError(err, res);
  }
});

// Admin Stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    const stats = {};
    // Use try-catch for individual queries to handle missing tables during migration
    const counts = await Promise.allSettled([
      pool.query('SELECT COUNT(*) FROM public.blog_posts'),
      pool.query('SELECT COUNT(*) FROM public.users'),
      pool.query('SELECT COUNT(*) FROM public.events'),
      pool.query('SELECT COUNT(*) FROM public.media_files'),
      pool.query('SELECT COUNT(*) FROM public.ai_requests_log'),
    ]);

    res.json({
      totalPosts: counts[0].status === 'fulfilled' ? parseInt(counts[0].value.rows[0].count) : 0,
      totalUsers: counts[1].status === 'fulfilled' ? parseInt(counts[1].value.rows[0].count) : 0,
      totalEvents: counts[2].status === 'fulfilled' ? parseInt(counts[2].value.rows[0].count) : 0,
      totalDocuments:
        counts[3].status === 'fulfilled' ? parseInt(counts[3].value.rows[0].count) : 0,
      totalAiRequests:
        counts[4].status === 'fulfilled' ? parseInt(counts[4].value.rows[0].count) : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Services
app.get('/api/home-services', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.home_services ORDER BY display_order ASC',
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/home-services', authenticateToken, async (req, res) => {
  const { title, description, icon_name, link, features, display_order } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.home_services (title, description, icon_name, link, features, display_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [title, description, icon_name, link, features, display_order],
  );
});

app.put('/api/home-services/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, icon_name, link, features, display_order } = req.body;
  await executeQuery(
    res,
    'UPDATE public.home_services SET title=$1, description=$2, icon_name=$3, link=$4, features=$5, display_order=$6 WHERE id=$7 RETURNING *',
    [title, description, icon_name, link, features, display_order, id],
  );
});

app.delete('/api/home-services/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.home_services WHERE id=$1', [req.params.id]);
});

// Testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.testimonials ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/testimonials', authenticateToken, async (req, res) => {
  const { name, role, content, rating, avatar_url } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.testimonials (name, role, content, rating, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, role, content, rating, avatar_url],
  );
});

app.put('/api/testimonials/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, role, content, rating, avatar_url } = req.body;
  await executeQuery(
    res,
    'UPDATE public.testimonials SET name=$1, role=$2, content=$3, rating=$4, avatar_url=$5 WHERE id=$6 RETURNING *',
    [name, role, content, rating, avatar_url, id],
  );
});

app.delete('/api/testimonials/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.testimonials WHERE id=$1', [req.params.id]);
});

// --- INTELLIGENCE DE FIN DE CHAÎNE ---

// --- GALLERY ITEMS ENDPOINTS ---
// GET /api/gallery-items — (REMOVED DUPLICATE: identical to line ~1643)

// --- DYNAMIC FORM ENDPOINTS ---
app.get('/api/forms', async (req, res) => {
  try {
    // Mock forms if table doesn't exist yet, or fetch from DB
    // prioritizing DB check
    try {
      const { rows } = await pool.query('SELECT * FROM public.dynamic_forms');
      if (rows.length > 0) return res.json(rows);
    } catch (e) {}

    // Fallback mock data
    res.json([
      {
        name: 'contact',
        title: 'Contactez-nous',
        description: 'Envoyez-nous un message',
        fields: [
          { name: 'name', type: 'text', label: 'Nom', required: true },
          { name: 'email', type: 'email', label: 'Email', required: true },
          { name: 'message', type: 'textarea', label: 'Message', required: true },
        ],
        submit_action: 'database',
      },
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/form-submissions', async (req, res) => {
  try {
    const { form_name, data, submitted_at } = req.body;
    // Create table if not exists
    await pool.query(`
                CREATE TABLE IF NOT EXISTS public.form_submissions(
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    form_name TEXT NOT NULL,
                    data JSONB NOT NULL,
                    submitted_at TIMESTAMP DEFAULT NOW()
                );
            `);

    const result = await pool.query(
      'INSERT INTO public.form_submissions (form_name, data, submitted_at) VALUES ($1, $2, $3) RETURNING *',
      [form_name, JSON.stringify(data), submitted_at],
    );
    res.status(201).json(result.rows[0]);
    try {
      sendSseEvent('page:created', result.rows[0]);
    } catch (e) {
      console.warn('SSE broadcast failed (page:created)', e);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/send-email', async (req, res) => {
  // Placeholder for email sending logic
  console.log('Sending email:', req.body);
  res.json({ success: true, message: 'Email queued for sending' });
});

// --- SETTINGS ENDPOINTS ---
app.put('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    // Simple key-value storage in a settings table
    await pool.query(`
                CREATE TABLE IF NOT EXISTS public.app_kv_settings(
                    key TEXT PRIMARY KEY,
                    value JSONB,
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            `);

    const promises = Object.entries(settings).map(([key, value]) =>
      pool.query(
        'INSERT INTO public.app_kv_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
        [key, JSON.stringify(value)],
      ),
    );

    await Promise.all(promises);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- AI GENERATION ENDPOINT (GENERIC) ---
// POST /api/ai-generate — (REMOVED DUPLICATE: version 2/3)
// Kept the task-aware version at line ~2032 which supports context+tone+task routing

// --- GLOBAL SEARCH ENDPOINT ---
app.get('/api/search', async (req, res) => {
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
          relevance: 1, // Simplified relevance
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
    // This endpoint can also handle the normative search if queried specifically
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
app.get('/api/search/full-text', async (req, res) => {
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

    // Déterminer les tables à interroger
    const tablesToSearch = type ? [type] : Object.keys(searchConfigs);

    for (const tableType of tablesToSearch) {
      if (!searchConfigs[tableType]) continue;

      const config = searchConfigs[tableType];
      const searchQuery = q.replace(/'/g, "''"); // Échapper les guillemets

      // Créer la requête full-text search avec tsvector
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
        // Continue with next table if one fails
      }
    }

    // Trier par pertinence globale
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

// Index creation helper (for admin)
app.post('/api/admin/search/reindex', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Create GIN indexes for full-text search on key tables
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_pages_search ON public.pages
             USING GIN(to_tsvector('french', COALESCE(title || ' ' || content || ' ' || meta_description, '')))`,
      `CREATE INDEX IF NOT EXISTS idx_blog_search ON public.blog_posts
             USING GIN(to_tsvector('french', COALESCE(title || ' ' || content || ' ' || excerpt, '')))`,
      `CREATE INDEX IF NOT EXISTS idx_standards_search ON public.electrical_standards
             USING GIN(to_tsvector('french', COALESCE(title || ' ' || description || ' ' || summary, '')))`,
    ];

    for (const query of indexQueries) {
      await pool.query(query);
    }

    res.json({ success: true, message: 'Search indexes created/updated' });
  } catch (error) {
    console.error('[SEARCH] Reindex failed:', error);
    res.status(500).json({ error: 'Reindex failed', details: error.message });
  }
});

// --- PAGE MANAGEMENT ENDPOINTS ---

app.get('/api/pages', async (req, res) => {
  await getTable(req, res, 'pages', 'menu_order ASC, updated_at DESC');
});
// ^ This is the PRIMARY /api/pages route (old duplicate at ~L1017 was removed)

app.post('/api/pages', authenticateToken, async (req, res) => {
  const { title, slug, content, is_published, meta_description, meta_keywords } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO public.pages (title, slug, content, is_published, meta_description, meta_keywords, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [title, slug, content, is_published || false, meta_description, meta_keywords],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.get('/api/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM public.pages WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Page not found' });
    res.json(rows[0]);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.put('/api/pages/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    slug,
    content,
    content_blocks,
    structure_json,
    is_published,
    meta_description,
    meta_keywords,
  } = req.body;
  const blocksToSave = content_blocks ?? structure_json;
  try {
    const result = await pool.query(
      `UPDATE public.pages
             SET title = COALESCE($1, title),
                 slug = COALESCE($2, slug),
                 content = COALESCE($3, content),
                 content_blocks = COALESCE($4, content_blocks),
                 structure_json = COALESCE($4, structure_json),
                 is_published = COALESCE($5, is_published),
                 meta_description = COALESCE($6, meta_description),
                 meta_keywords = COALESCE($7, meta_keywords),
                 updated_at = NOW()
             WHERE id::text = $8 OR slug = $8 RETURNING *`,
      [
        title,
        slug,
        content,
        blocksToSave
          ? typeof blocksToSave === 'string'
            ? blocksToSave
            : JSON.stringify(blocksToSave)
          : null,
        is_published,
        meta_description,
        meta_keywords,
        id,
      ],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Page not found' });
    if (slug) {
      try {
        await pool.query(
          'UPDATE public.menu_items SET url = $1, updated_at = NOW() WHERE linked_page_id = $2',
          ['/' + result.rows[0].slug, result.rows[0].id],
        );
      } catch (syncErr) {
        console.warn('[MenuSync] Failed to update menu URLs:', syncErr?.message || syncErr);
      }
    }
    res.json(result.rows[0]);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.delete('/api/pages/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM public.pages WHERE id = $1', [req.params.id]);
    res.json({ success: true });
    try {
      sendSseEvent('page:deleted', { id: req.params.id });
    } catch (e) {
      console.warn('SSE broadcast failed (page:deleted)', e);
    }
  } catch (error) {
    handleAppError(error, res);
  }
});

// --- BIBLIOTHÈQUE DE COMPOSANTS/MODÈLES (Builder) ---
app.get('/api/admin/page-components', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM public.page_components ORDER BY category ASC, name ASC',
    );
    res.json(rows);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.post('/api/admin/page-components', authenticateToken, async (req, res) => {
  const { name, category, default_structure, thumbnail_url, is_global, schema_props } = req.body;
  if (!name || !default_structure) {
    return res.status(400).json({ error: 'Name and default_structure are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO public.page_components (name, category, default_structure, thumbnail_url, is_global, schema_props, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [
        name,
        category || 'Mes Sections',
        typeof default_structure === 'string'
          ? default_structure
          : JSON.stringify(default_structure),
        thumbnail_url || null,
        is_global !== undefined ? is_global : false,
        schema_props
          ? typeof schema_props === 'string'
            ? schema_props
            : JSON.stringify(schema_props)
          : '{}',
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.delete('/api/admin/page-components/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM public.page_components WHERE id = $1 RETURNING *',
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Component not found' });
    }
    res.json({ success: true, message: 'Component deleted successfully' });
  } catch (error) {
    handleAppError(error, res);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PAGE TEMPLATES API
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/templates', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM public.page_templates ORDER BY created_at DESC',
    );
    res.json(rows);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.get('/api/templates/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM public.page_templates WHERE id = $1', [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: 'Template not found' });
    res.json(rows[0]);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.post('/api/templates', authenticateToken, async (req, res) => {
  try {
    const { name, description, structure, theme_config, category } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO public.page_templates (name, description, structure, theme_config, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        name,
        description || '',
        structure ? JSON.stringify(structure) : null,
        theme_config ? JSON.stringify(theme_config) : null,
        category || null,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.put('/api/templates/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, structure, theme_config, category, thumbnail } = req.body;
    const { rows } = await pool.query(
      'UPDATE public.page_templates SET name = COALESCE($1, name), description = COALESCE($2, description), structure = COALESCE($3, structure), theme_config = COALESCE($4, theme_config), category = COALESCE($5, category), thumbnail = COALESCE($6, thumbnail), updated_at = NOW() WHERE id = $7 RETURNING *',
      [
        name,
        description,
        structure ? JSON.stringify(structure) : null,
        theme_config ? JSON.stringify(theme_config) : null,
        category,
        thumbnail,
        req.params.id,
      ],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Template not found' });
    res.json(rows[0]);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.delete('/api/templates/:id', authenticateToken, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM public.page_templates WHERE id = $1', [
      req.params.id,
    ]);
    if (rowCount === 0) return res.status(404).json({ error: 'Templatenot found' });
    res.json({ success: true });
  } catch (error) {
    handleAppError(error, res);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin Specialized Page Editor (ICE Engine Support)
// ─────────────────────────────────────────────────────────────────────────────
// Seed Homepage → injects the pixel-perfect structure JSON for BE Builder
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/admin/seed-homepage', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const HOMEPAGE_STRUCTURE = [
      {
        id: 'home-hero-banner',
        type: 'HeroBanner',
        version: 1,
        enabled: true,
        props: { parallax: true, autoplayInterval: 8000 },
        metadata: {
          label: 'Carrousel Hero (Accueil)',
          description: 'Slides chargés depuis la base de données.',
        },
      },
      {
        id: 'home-audience-offers',
        type: 'AudienceOffers',
        version: 1,
        enabled: true,
        props: {},
        metadata: {
          label: 'Offres Audience',
          description: '3 cartes — Électriciens, Professionnels, Membres.',
        },
      },
      {
        id: 'home-vision-mission',
        type: 'VisionMission',
        version: 1,
        enabled: true,
        props: {
          title: 'Garantir la sécurité pour tous les sénégalais.',
          subtitle:
            "Depuis 1995, PROQUELEC s'engage pour la promotion de la qualité des installations électriques.",
          missionTitle: 'Notre Mission',
          missionDesc:
            'Promouvoir la sécurité et la conformité normative à travers la sensibilisation, le diagnostic et la formation.',
          visionTitle: 'Notre Vision',
          visionDesc:
            "Devenir la référence nationale absolue en matière de sécurité électrique et d'innovation normative.",
          image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
          badge: "L'Institution",
        },
        metadata: { label: 'Vision & Mission' },
      },
      {
        id: 'home-landing-stats',
        type: 'LandingStats',
        version: 1,
        enabled: true,
        props: {},
        metadata: { label: 'Statistiques Clés' },
      },
      {
        id: 'home-latest-news',
        type: 'LatestNews',
        version: 1,
        enabled: true,
        props: {},
        metadata: { label: 'Actualités & Blog' },
      },
      {
        id: 'home-partner-logos',
        type: 'PartnerLogos',
        version: 1,
        enabled: true,
        props: {},
        metadata: { label: 'Logos Partenaires' },
      },
    ];

    const structureJson = JSON.stringify(HOMEPAGE_STRUCTURE);

    // Try to find existing home page
    const findResult = await pool.query(
      `SELECT id, slug FROM pages WHERE slug IN ('home', 'home_page', '/') ORDER BY id LIMIT 1`,
    );

    let pageId, action, slug;

    if (findResult.rows.length > 0) {
      const existing = findResult.rows[0];
      await pool.query(`UPDATE pages SET structure_json = $1, updated_at = NOW() WHERE id = $2`, [
        structureJson,
        existing.id,
      ]);
      pageId = existing.id;
      slug = existing.slug;
      action = 'updated';
    } else {
      const insertResult = await pool.query(
        `INSERT INTO pages (title, slug, structure_json, is_published, status, created_at, updated_at)
                 VALUES ($1, $2, $3, true, 'published', NOW(), NOW())
                 RETURNING id, slug`,
        ['Accueil', 'home', structureJson],
      );
      pageId = insertResult.rows[0].id;
      slug = insertResult.rows[0].slug;
      action = 'created';
    }

    console.log(`[Seed] ✅ Homepage seeded (${action}) → id=${pageId}, slug="${slug}"`);
    res.json({ success: true, action, pageId, slug, blocksCount: HOMEPAGE_STRUCTURE.length });
  } catch (error) {
    console.error('[Seed] ❌ Error:', error);
    handleAppError(error, res);
  }
});

app.get('/api/admin/pages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM public.pages ORDER BY updated_at DESC');
    res.json(rows);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.get('/api/admin/pages/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM public.pages WHERE slug = $1 OR id::text = $1',
      [id],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Page not found' });
    res.json(rows[0]);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.put('/api/admin/pages/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    content_raw,
    content,
    content_blocks,
    structure_json,
    design_options,
    security_level,
    immutable,
    title,
    slug,
    meta_description,
    meta_keywords,
    is_published,
    categories,
    tags,
    author,
    excerpt,
    meta_robots,
    featured_image,
    template,
    show_hero,
    show_footer,
    custom_css,
    custom_js,
    header_html,
    footer_html,
    hero_title,
    hero_subtitle,
    hero_background_image,
    hero_cta_text,
    hero_cta_link,
    workflow_status,
    publish_date,
    unpublish_date,
    reading_time,
    theme_config,
  } = req.body;

  const blocksToSave = content_blocks ?? structure_json;
  const statusVal = workflow_status;

  try {
    // Use COALESCE to only update provided fields, or keep existing ones
    const result = await pool.query(
      `UPDATE public.pages
             SET content_raw = COALESCE($1, content_raw),
                 content = COALESCE($2, content),
                 content_blocks = COALESCE($3, content_blocks),
                 structure_json = COALESCE($3, structure_json),
                 design_options = COALESCE($4, design_options),
                 security_level = COALESCE($5, security_level),
                 immutable = COALESCE($6, immutable),
                 title = COALESCE($7, title),
                 slug = COALESCE($8, slug),
                 meta_description = COALESCE($9, meta_description),
                 meta_keywords = COALESCE($10, meta_keywords),
                 is_published = COALESCE($11, is_published),
                 categories = COALESCE($12, categories),
                 tags = COALESCE($13, tags),
                 author = COALESCE($14, author),
                 excerpt = COALESCE($16, excerpt),
                 meta_robots = COALESCE($17, meta_robots),
                 featured_image = COALESCE($18, featured_image),
                 template = COALESCE($19, template),
                 show_hero = COALESCE($20, show_hero),
                 show_footer = COALESCE($21, show_footer),
                 custom_css = COALESCE($22, custom_css),
                 custom_js = COALESCE($23, custom_js),
                 header_html = COALESCE($24, header_html),
                 footer_html = COALESCE($25, footer_html),
                 hero_title = COALESCE($26, hero_title),
                 hero_subtitle = COALESCE($27, hero_subtitle),
                 hero_background_image = COALESCE($28, hero_background_image),
                 hero_cta_text = COALESCE($29, hero_cta_text),
                 hero_cta_link = COALESCE($30, hero_cta_link),
                 status = COALESCE($31, status),
                 publish_date = COALESCE($32, publish_date),
                 unpublish_date = COALESCE($33, unpublish_date),
                 reading_time = COALESCE($34, reading_time),
                 theme_config = COALESCE($35, theme_config),
                 version = version + 1,
                 updated_at = NOW()
             WHERE slug = $15 OR id::text = $15 RETURNING *`,
      [
        content_raw,
        content,
        blocksToSave
          ? typeof blocksToSave === 'string'
            ? blocksToSave
            : JSON.stringify(blocksToSave)
          : null,
        design_options
          ? typeof design_options === 'string'
            ? design_options
            : JSON.stringify(design_options)
          : null,
        security_level,
        immutable,
        title,
        slug,
        meta_description,
        meta_keywords,
        is_published,
        categories,
        tags,
        author,
        id, // $15
        excerpt,
        meta_robots,
        featured_image,
        template,
        show_hero,
        show_footer, // $16 - $21
        custom_css,
        custom_js,
        header_html,
        footer_html, // $22 - $25
        hero_title,
        hero_subtitle,
        hero_background_image,
        hero_cta_text,
        hero_cta_link, // $26 - $30
        statusVal,
        publish_date,
        unpublish_date,
        reading_time, // $31 - $34
        theme_config
          ? typeof theme_config === 'string'
            ? theme_config
            : JSON.stringify(theme_config)
          : null, // $35
      ],
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Page not found' });

    // Sync menu URLs if slug was changed
    if (slug) {
      try {
        await pool.query(
          'UPDATE public.menu_items SET url = $1, updated_at = NOW() WHERE linked_page_id = $2',
          ['/' + result.rows[0].slug, result.rows[0].id],
        );
      } catch (syncErr) {
        console.warn('[MenuSync] Failed to update menu URLs:', syncErr?.message || syncErr);
      }
    }

    // Save version only when explicitly requested (avoid creating a DB version on every autosave)
    if (req.body && req.body.create_version) {
      try {
        await pool.query(
          'INSERT INTO public.page_versions (page_id, content_raw, version, created_at, created_by) VALUES ($1, $2, $3, NOW(), $4)',
          [result.rows[0].id, result.rows[0].content_raw, result.rows[0].version, req.user?.id],
        );
      } catch (verr) {
        console.error('[PageVersions] Failed to create version:', verr?.message || verr);
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.get(
  '/api/admin/page-versions/:id/:version',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id, version } = req.params;
      const { rows } = await pool.query(
        'SELECT * FROM public.page_versions WHERE page_id = $1 AND version = $2',
        [id, version],
      );
      if (rows.length === 0) return res.status(404).json({ error: 'Version not found' });
      res.json(rows[0]);
    } catch (error) {
      handleAppError(error, res);
    }
  },
);

// --- NEW GOD BUILDER ENDPOINTS (DRAFTS & VERSIONS) ---

app.put('/api/admin/pages/:id/draft', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { draft_json } = req.body;
    const { rows } = await pool.query(
      `UPDATE public.pages
             SET draft_json = $1,
                 updated_at = NOW()
             WHERE slug = $2 OR id::text = $2 RETURNING *`,
      [
        draft_json
          ? typeof draft_json === 'string'
            ? draft_json
            : JSON.stringify(draft_json)
          : null,
        id,
      ],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Page not found' });
    res.json({ success: true, page: rows[0] });
  } catch (error) {
    handleAppError(error, res);
  }
});

app.get('/api/admin/pages/:id/versions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pageRes = await pool.query(
      'SELECT id FROM public.pages WHERE slug = $1 OR id::text = $1',
      [id],
    );
    if (pageRes.rows.length === 0) return res.status(404).json({ error: 'Page not found' });
    const pageUuid = pageRes.rows[0].id;

    const { rows } = await pool.query(
      'SELECT id, page_id, version_name, created_at, created_by FROM public.page_versions WHERE page_id = $1 ORDER BY created_at DESC',
      [pageUuid],
    );
    res.json(rows);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.get(
  '/api/admin/pages/:id/versions/:versionId',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { versionId } = req.params;
      const { rows } = await pool.query('SELECT * FROM public.page_versions WHERE id = $1', [
        versionId,
      ]);
      if (rows.length === 0) return res.status(404).json({ error: 'Version not found' });
      res.json(rows[0]);
    } catch (error) {
      handleAppError(error, res);
    }
  },
);

app.post('/api/admin/pages/:id/versions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { version_name, structure_json } = req.body;

    const pageRes = await pool.query(
      'SELECT id FROM public.pages WHERE slug = $1 OR id::text = $1',
      [id],
    );
    if (pageRes.rows.length === 0) return res.status(404).json({ error: 'Page not found' });
    const pageUuid = pageRes.rows[0].id;

    const insertRes = await pool.query(
      `INSERT INTO public.page_versions (page_id, version_name, structure_json, created_at, created_by)
             VALUES ($1, $2, $3, NOW(), $4) RETURNING *`,
      [
        pageUuid,
        version_name || `Sauvegarde du ${new Date().toLocaleString('fr-FR')}`,
        structure_json
          ? typeof structure_json === 'string'
            ? structure_json
            : JSON.stringify(structure_json)
          : null,
        req.user?.username || req.user?.id || 'admin',
      ],
    );

    // Cap at 50 versions max
    const countRes = await pool.query(
      'SELECT COUNT(*) FROM public.page_versions WHERE page_id = $1',
      [pageUuid],
    );
    const count = parseInt(countRes.rows[0].count);
    if (count > 50) {
      const limit = count - 50;
      await pool.query(
        'DELETE FROM public.page_versions WHERE id IN (SELECT id FROM public.page_versions WHERE page_id = $1 ORDER BY created_at ASC LIMIT $2)',
        [pageUuid, limit],
      );
    }

    res.status(201).json(insertRes.rows[0]);
  } catch (error) {
    handleAppError(error, res);
  }
});

// --- AI CODE ASSISTANT (ICE Engine Helper) ---
// POST /api/ai-code-assistant — (REMOVED DUPLICATE)
// Kept the version at line ~1898 which includes rate limit logic and DB logging

// --- AI CONTENT GENERATOR ---
// POST /api/ai-generate — (REMOVED DUPLICATE: version 3/3)
// Kept the task-aware version at line ~2032

// --- CREWAI CORE ORCHESTRATOR ---
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

// --- CONTACT & EMAIL ---
app.post('/api/contact-requests', async (req, res) => {
  const { nom, email, telephone, sujet, message } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO public.contact_requests (nom, email, telephone, sujet, message, submitted_at, status) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING *',
      [nom, email, telephone, sujet, message, 'nouveau'],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    handleAppError(error, res);
  }
});

app.post('/api/email/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    const template = emailTemplates.welcome(name || 'Utilisateur');
    const result = await sendEmail({ to: email, ...template });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Erreur d'envoi d'email", details: err.message });
  }
});

app.post('/api/email/formation-confirmation', async (req, res) => {
  try {
    const { email, formationName, name } = req.body;
    const template = emailTemplates.formationConfirmation(formationName, name || 'Utilisateur');
    const result = await sendEmail({ to: email, ...template });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Erreur d'envoi d'email", details: err.message });
  }
});

app.post('/api/email/certification-notification', async (req, res) => {
  try {
    const { email, certificationName, name } = req.body;
    const template = emailTemplates.certificationNotification(
      certificationName,
      name || 'Utilisateur',
    );
    const result = await sendEmail({ to: email, ...template });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Erreur d'envoi d'email", details: err.message });
  }
});

// ============================================
// PHASE 7: GED ROUTES
// ============================================

// Register permissions routes
const permissionsRouter = require('./routes/permissions');
app.use('/api/permissions', permissionsRouter);

// Register versions routes
const versionsRouter = require('./routes/versions');
app.use('/api/versions', versionsRouter);

// Register audit routes
const auditRouter = require('./routes/audit');
app.use('/api/audit', auditRouter);

// Register office suite routes
const officeRouter = require('./routes/office');
app.use('/api/office', officeRouter);

// Register academy routes
const academyRouter = require('./routes/academy');
app.use('/api/academy', academyRouter);

// --- AI PROXY / PING ---
app.post('/api/ai/ping-provider', authenticateToken, requireAdmin, async (req, res) => {
  const { providerId, apiKey } = req.body;

  // For local/sovereign
  if (providerId === 'lovable') {
    return res.json({ success: true, latency: 1 });
  }

  if (providerId === 'ollama') {
    try {
      const start = Date.now();
      const resp = await fetch('http://localhost:11434/api/tags');
      const latency = Date.now() - start;
      if (resp.ok) return res.json({ success: true, latency });
      else return res.status(503).json({ success: false, message: 'Ollama service offline' });
    } catch (e) {
      return res.status(503).json({ success: false, message: 'Ollama service unreachable' });
    }
  }

  if (!apiKey) return res.status(400).json({ success: false, message: 'Clé API manquante' });

  try {
    let url = '';
    let headers = { 'Content-Type': 'application/json' };
    let options = { method: 'GET', headers };

    switch (providerId) {
      case 'openai':
        url = 'https://api.openai.com/v1/models';
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'anthropic':
        url = 'https://api.anthropic.com/v1/messages';
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        options.method = 'POST';
        options.body = JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        });
        break;
      case 'gemini':
        url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        break;
      case 'deepseek':
        url = 'https://api.deepseek.com/models';
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'tavily':
        url = 'https://api.tavily.com/search';
        options.method = 'POST';
        options.body = JSON.stringify({ api_key: apiKey, query: 'ping', max_results: 1 });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Provider inconnu' });
    }

    const start = Date.now();
    const response = await fetch(url, options);
    const latency = Date.now() - start;

    if (response.ok) {
      res.json({ success: true, latency });
    } else {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {}
      console.warn(`[AI-PING] Provider ${providerId} returned error:`, errorText);
      res
        .status(response.status)
        .json({ success: false, message: `Rejet par ${providerId}`, details: errorText });
    }
  } catch (error) {
    console.error(`[AI-PING] Error pinging ${providerId}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- AI DEEP DIAGNOSTIC (WORLD CLASS) ---
app.post('/api/ai/diagnostic', authenticateToken, requireAdmin, async (req, res) => {
  const { providerId, apiKey } = req.body;
  const diagnostics = {
    network: { latency: 0, status: 'unknown', region: 'Detecting...' },
    performance: { tps: 0, ttft: 0, loadFactor: 0 },
    knowledge: { semanticScore: 0, version: 'N/A' },
    security: { encrypted: true, protocol: 'TLS 1.3' },
    overallGrade: 'I',
  };

  try {
    const startPing = Date.now();
    let pingUrl = '';
    let pingOptions = { method: 'GET', headers: {} };

    if (providerId === 'openai') {
      pingUrl = 'https://api.openai.com/v1/models';
      pingOptions.headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (providerId === 'anthropic') {
      pingUrl = 'https://api.anthropic.com/v1/messages';
      pingOptions.headers['x-api-key'] = apiKey;
      pingOptions.headers['anthropic-version'] = '2023-06-01';
      pingOptions.method = 'POST';
      pingOptions.body = JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      });
    } else if (providerId === 'gemini') {
      pingUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    } else if (providerId === 'deepseek') {
      pingUrl = 'https://api.deepseek.com/models';
      pingOptions.headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      return res.json({ success: true, message: 'Local node diagnostic complete', diagnostics });
    }

    const pingResp = await fetch(pingUrl, pingOptions);
    diagnostics.network.latency = Date.now() - startPing;
    diagnostics.network.status = pingResp.ok ? 'optimal' : 'degraded';

    const testPrompt = "Explique brièvement la loi d'Ohm. Réponds en moins de 10 mots.";
    const startStress = Date.now();
    let testResponse = '';

    if (providerId === 'openai') {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 20,
        }),
      });
      const d = await resp.json();
      testResponse = d.choices?.[0]?.message?.content || '';
    } else if (providerId === 'gemini') {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: testPrompt }] }] }),
        },
      );
      const d = await resp.json();
      testResponse = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    const stressDuration = Date.now() - startStress;
    diagnostics.performance.ttft = stressDuration;
    diagnostics.performance.tps = Math.round(testResponse.length / 4 / (stressDuration / 1000));

    let score = 0;
    if (diagnostics.network.latency < 200) score += 40;
    else if (diagnostics.network.latency < 500) score += 20;
    if (
      testResponse.toLowerCase().includes('u=ri') ||
      testResponse.toLowerCase().includes('tension')
    )
      score += 50;
    if (diagnostics.performance.tps > 20) score += 10;

    if (score >= 90) diagnostics.overallGrade = 'S';
    else if (score >= 70) diagnostics.overallGrade = 'A';
    else if (score >= 50) diagnostics.overallGrade = 'B';
    else diagnostics.overallGrade = 'C';

    res.json({ success: true, diagnostics });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- SCANNER DE CONFORMITÉ IA (RÉEL & ENTRAÎNABLE) ---
app.post('/api/ai/scan-compliance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: 'Système IA non configuré (Clé GEMINI_API_KEY manquante dans .env)',
        code: 'AI_CONFIG_MISSING',
      });
    }
    if (!imageBase64)
      return res.status(400).json({
        success: false,
        message: 'Aucune image satellite transmise',
        code: 'MISSING_PAYLOAD',
      });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const systemPrompt = `
            TU ES L'EXPERT ULTIME EN CONFORMITÉ ÉLECTRIQUE PROQUELEC.
            TA MISSION : Scanner l'image fournie et détecter toute non-conformité majeure selon la norme NF C 15-100.

            DIRECTIVES STRICTES :
            1. Analyse les disjoncteurs, le câblage, l'étiquetage et l'état général.
            2. Pour chaque anomalie, donne : Localisation, Risque (Incendie, Électrocution), Référence Normative.
            3. Sois extrêmement précis, professionnel et sévère. Ne laisse passer aucun défaut de sécurité.

            FORMAT DE RÉPONSE (JSON uniquement) :
            {
                "conforme": boolean,
                "score_securite": number (0-100),
                "anomalies": [
                    { "type": string, "description": string, "gravite": "critique" | "majeure" | "mineure", "norme": string }
                ],
                "recommandations": [string],
                "verdict_expert": string
            }
        `;

    // Clean base64 if needed
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const result = await generateWithRetry(model, [
      systemPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Extraction du JSON (parfois l'IA met des markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsedData = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { error: 'Erreur de formatage IA', raw: text };

    res.json({ success: true, analysis: parsedData });
  } catch (error) {
    console.error('Compliance Scan Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ai/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.ai_requests_log ORDER BY created_at DESC LIMIT 50',
    );
    res.json({ success: true, logs: result.rows });
  } catch (error) {
    console.error('Fetch AI Logs Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- EXPERT SEO IA (WORLD CLASS) ---
app.post('/api/ai/seo-analyze', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, slug } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message:
          "Le système IA (Google Gemini) n'est pas encore configuré (Clé GEMINI_API_KEY manquante dans .env).",
        code: 'AI_CONFIG_MISSING',
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const systemPrompt = `
            TU ES L'EXPERT SEO RÉFÉRENT POUR PROQUELEC (Entreprise d'électricité au Sénégal).
            TA MISSION : Analyser le contenu d'une page web et fournir des recommandations SEO critiques pour maximiser la visibilité sur Google.

            CONTEXTE : PROQUELEC intervient dans le tertiaire, l'industrie et le résidentiel. Mots-clés cibles : électricité, installation électrique, maintenance, NF C 15-100, Sénégal, Dakar, dépannage.

            ANALYSE DEMANDÉE :
            1. Évaluer la pertinence du titre et du contenu.
            2. Générer un Meta Title optimisé (max 60 chars).
            3. Générer une Meta Description captivante (max 160 chars).
            4. Suggérer 5 mots-clés LSI (indexation sémantique latente).
            5. Donner un score SEO global de 0 à 100.

            FORMAT DE RÉPONSE (JSON uniquement) :
            {
                "score": number,
                "meta_title": string,
                "meta_description": string,
                "keywords_suggested": string[],
                "analysis": string,
                "improvements": string[]
            }
        `;

    const userPrompt = `
            Titre de la page : ${title}
            Slug : ${slug}
            Contenu : ${content?.substring(0, 5000)}
        `;

    const result = await generateWithRetry(model, [systemPrompt, userPrompt]);
    const responseText = result.response.text();

    // Extract JSON using regex
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const seoData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!seoData) {
      throw new Error("L'IA n'a pas renvoyé de format JSON valide.");
    }

    // Log to AI requests table for audit
    try {
      await pool.query(
        `INSERT INTO public.ai_requests_log (user_id, endpoint, prompt, response, created_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
        [
          req.user.id,
          '/api/ai/seo-analyze',
          (systemPrompt + userPrompt).substring(0, 500),
          JSON.stringify(seoData),
        ],
      );
    } catch (logErr) {
      console.warn('Failed to log AI request:', logErr.message);
    }

    res.json({ success: true, seo: seoData });
  } catch (error) {
    console.error('SEO Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de l'analyse SEO",
      code: 'AI_SEO_FAIL',
    });
  }
});

// --- SYSTEM CONTROL API ---
app.get('/api/admin/system/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const statuses = {
      backend: {
        id: 'node',
        name: 'Serveur Principal',
        status: 'online',
        port: port,
        type: 'Node.js',
      },
      ai: {
        id: 'python',
        name: 'Cerveau IA Expert',
        status: pythonProcess ? 'online' : 'offline',
        port: 8002,
        type: 'Python/Haystack',
      },
      database: { id: 'db', name: 'Base de Données', status: 'unknown', type: 'PostgreSQL' },
    };

    // DB Check
    try {
      const dbRes = await pool.query('SELECT version()');
      statuses.database.status = 'online';
      statuses.database.details = dbRes.rows[0].version;
    } catch (e) {
      statuses.database.status = 'offline';
      statuses.database.error = e.message;
    }

    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
});

app.get('/api/admin/system/logs', authenticateToken, requireAdmin, (req, res) => {
  res.json({ logs: logBuffer });
});

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

// -- Electrical Certifications --
app.get('/api/electrical-certifications', async (req, res) => {
  await getTable(req, res, 'electrical_certifications', 'name ASC');
});

app.post('/api/electrical-certifications', authenticateToken, async (req, res) => {
  const {
    name,
    code,
    description,
    validity_period,
    required_training_hours,
    certification_body,
    cost,
    requirements,
    is_active,
  } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.electrical_certifications (name, code, description, validity_period, required_training_hours, certification_body, cost, requirements, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *',
    [
      name,
      code,
      description,
      validity_period,
      required_training_hours,
      certification_body,
      cost,
      requirements,
      is_active !== false,
    ],
  );
});

app.put('/api/electrical-certifications/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    name,
    code,
    description,
    validity_period,
    required_training_hours,
    certification_body,
    cost,
    requirements,
    is_active,
  } = req.body;
  await executeQuery(
    res,
    'UPDATE public.electrical_certifications SET name=$1, code=$2, description=$3, validity_period=$4, required_training_hours=$5, certification_body=$6, cost=$7, requirements=$8, is_active=$9, updated_at=NOW() WHERE id=$10 RETURNING *',
    [
      name,
      code,
      description,
      validity_period,
      required_training_hours,
      certification_body,
      cost,
      requirements,
      is_active,
      id,
    ],
  );
});

app.delete('/api/electrical-certifications/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.electrical_certifications WHERE id=$1', [
    req.params.id,
  ]);
});

// -- Download Buttons (Configurable CTA Buttons) --
app.get('/api/download-buttons', async (req, res) => {
  await getTable(req, res, 'download_buttons', 'created_at DESC');
});

app.post('/api/download-buttons', authenticateToken, async (req, res) => {
  const { title, bucket, path, icon, color, visible } = req.body;
  await executeQuery(
    res,
    'INSERT INTO public.download_buttons (title, bucket, path, icon, color, visible, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
    [title, bucket, path, icon, color, visible !== false],
  );
});

app.put('/api/download-buttons/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, bucket, path, icon, color, visible } = req.body;
  await executeQuery(
    res,
    'UPDATE public.download_buttons SET title=$1, bucket=$2, path=$3, icon=$4, color=$5, visible=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
    [title, bucket, path, icon, color, visible, id],
  );
});

app.delete('/api/download-buttons/:id', authenticateToken, async (req, res) => {
  await executeQuery(res, 'DELETE FROM public.download_buttons WHERE id=$1', [req.params.id]);
});

// -- Normative Articles (Search endpoint for AI Expert Lab) --
app.get('/api/normative-articles', async (req, res) => {
  try {
    const { query } = req.query;
    let result;
    if (query) {
      result = await pool.query(
        `SELECT * FROM public.electrical_standards
                 WHERE title ILIKE $1 OR description ILIKE $1 OR code ILIKE $1 OR summary ILIKE $1
                 ORDER BY code ASC LIMIT 50`,
        [`%${query}%`],
      );
    } else {
      result = await pool.query(
        'SELECT * FROM public.electrical_standards ORDER BY code ASC LIMIT 50',
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching normative articles:', err);
    res.status(500).json({ error: err.message });
  }
});

// ELECTRO-GED 4.0: Routes extraites dans des modules séparés
const projectsRouter = require('./routes/projects');
const inspectionsRouter = require('./routes/inspections');
const observatoireRouter = require('./routes/observatoire');
app.use('/api', projectsRouter);
app.use('/api', inspectionsRouter);
app.use('/api', observatoireRouter);

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

// Final error middleware - Transforme les crashes en messages humains
app.use((err, req, res, next) => {
  console.error('SERVER CRASH DETECTED:', err);
  handleAppError(err, res);
});

// --- MODULE OBSERVATOIRE (COSSUEL) ---

// 1. Stats Globales
app.get('/api/observatoire/stats', authenticateToken, async (req, res) => {
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

// 2. Dossiers Récents
app.get('/api/observatoire/dossiers', authenticateToken, async (req, res) => {
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

// 3. Stats par Région (pour la Carte)
app.get('/api/observatoire/map/stats', authenticateToken, async (req, res) => {
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

// 4. Déclenchement Manuel Sync (Admin)
const { runSyncCycle } = require('./sync-engine');
app.post('/api/observatoire/sync/trigger', authenticateToken, requireAdmin, async (req, res) => {
  try {
    runSyncCycle().catch((err) => console.error('[SYNC] Manual trigger error:', err));
    res.json({ message: 'Synchronisation déclenchée. Consultez les logs pour le résultat.' });
  } catch (err) {
    console.error('[SYNC] Trigger failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mount Modular Templates Route
const templatesModule = require('./modules/templates/templates.routes');
app.use('/api', templatesModule.router);

// Démarrage de l'initialisation DB puis du serveur
initDB()
  .then(() => {
    startSyncEngine(pool); // Démarrer le moteur de sync
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('CRITICAL: Database initialization failed:', err);
    // On lance quand même le serveur pour le debug
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port} (DEGRADED MODE - DB INIT FAILED)`);
    });
  });
