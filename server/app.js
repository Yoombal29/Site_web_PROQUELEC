const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { AppError, handleAppError } = require('./core/errors');
const { getLogs, httpLogger } = require('./core/logger');
const { sendSseEvent, addSseClient, removeSseClient, getSseStats } = require('./core/sse');

function createApp() {
    const app = express();

    // ---- Global Middleware ----
    app.use(httpLogger);
    app.use(cors());
    app.use(helmet());
    app.use(express.json({ limit: '500mb' }));
    app.use(express.urlencoded({ limit: '500mb', extended: true }));

    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: { error: 'Trop de requêtes, réessayez plus tard' },
        standardHeaders: true,
        legacyHeaders: false
    });
    app.use('/api/', apiLimiter);

    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: { error: 'Trop de tentatives, réessayez plus tard' },
        standardHeaders: true,
        legacyHeaders: false
    });
    app.use('/api/auth/', authLimiter);

    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // --- SSE Endpoint ---
    app.get('/api/events', (req, res) => {
        res.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
        });
        res.flushHeaders && res.flushHeaders();
        res.write(':connected\n\n');

        addSseClient(res);
        console.log(`[SSE] Client connected. Active: ${getSseStats().activeConnections}`);

        req.on('close', () => {
            removeSseClient(res);
            console.log(`[SSE] Client disconnected. Active: ${getSseStats().activeConnections}`);
        });

        req.on('error', (err) => {
            console.warn(`[SSE] Client error:`, err.message);
            removeSseClient(res);
        });
    });

    app.get('/api/events/stats', (req, res) => {
        res.json({ ...getSseStats(), timestamp: new Date().toISOString() });
    });

    // --- Health Check (runtime capability system) ---
    const { healthRoute, getHealthReport } = require('./core/runtime');
    app.get('/api/health', (req, res) => {
        try {
            const { pool } = require('./core/database');
            pool.query('SELECT 1').then(() => {
                res.json(getHealthReport());
            }).catch(() => {
                res.status(503).json({ ...getHealthReport(), status: 'degraded' });
            });
        } catch {
            res.status(503).json({ ...getHealthReport(), status: 'degraded' });
        }
    });

    app.get('/health', async (req, res) => {
        try {
            const { pool } = require('./core/database');
            const start = Date.now();
            const dbResult = await pool.query('SELECT NOW() as now, version()');
            const duration = Date.now() - start;
            res.json({
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                database: { status: 'healthy', latency: `${duration}ms`, version: dbResult.rows[0].version },
                environment: process.env.NODE_ENV || 'development'
            });
        } catch (err) {
            res.status(503).json({
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                database: { status: 'degraded', error: err.message },
                environment: process.env.NODE_ENV || 'development'
            });
        }
    });

    app.get('/', (req, res) => {
        res.json({
            status: 'running',
            message: 'PROQUELEC Enterprise API is active',
            features: ['Self-Healing', 'Auto-Normalization', 'Deep-Diagnostics'],
            version: '1.2.0'
        });
    });

    // ---- Mount Modules ----
    const modules = [
        'auth',
        'users',
        'pages',
        'blog',
        'settings',
        'cms',
        'catalog',
        'ai',
        'storage',
        'ged',
        'analytics',
        'payments',
        'esign',
        'builder',
        'templates',
    ];

    for (const moduleName of modules) {
        try {
            const moduleRoutes = require(`./modules/${moduleName}/${moduleName}.routes`);
            app.use(moduleRoutes.basePath || '/api', moduleRoutes.router);
            console.log(`[MODULE] Mounted: ${moduleName}`);
        } catch (err) {
            if (err.code !== 'MODULE_NOT_FOUND') {
                console.error(`[MODULE] Error mounting ${moduleName}:`, err.message);
            }
        }
    }

    // Mount existing legacy route files
    try {
        app.use('/api/permissions', require('./routes/permissions'));
        app.use('/api/versions', require('./routes/versions'));
        app.use('/api/audit', require('./routes/audit'));
        app.use('/api/office', require('./routes/office'));
        app.use('/api/academy', require('./routes/academy'));
        app.use('/api', require('./routes/projects'));
        app.use('/api', require('./routes/inspections'));
        app.use('/api', require('./routes/observatoire'));
        console.log('[MODULE] Mounted legacy routes');
    } catch (err) {
        console.warn('[MODULE] Some legacy route files not available:', err.message);
    }

    // ---- Webhooks (no auth) ----
    const paymentService = require('./modules/payments/payments.service');

    app.post('/api/webhooks/paydunya', async (req, res) => {
        try {
            const result = paymentService.verifyWebhook(req.body);
            console.log('[WEBHOOK] PayDunya IPN:', result.status, result.invoiceToken);

            // Update order status in DB if available
            try {
                const { pool } = require('./core/database');
                if (result.status === 'COMPLETED' || result.status === 'completed') {
                    await pool.query(
                        `UPDATE public.orders SET payment_status = 'paid', status = 'confirmed', updated_at = NOW()
                         WHERE payment_token = $1`,
                        [result.invoiceToken]
                    );
                }
            } catch (dbErr) {
                console.warn('[WEBHOOK] DB update failed:', dbErr.message);
            }

            res.json({ success: true });
        } catch (err) {
            console.error('[WEBHOOK] PayDunya error:', err.message);
            res.status(400).json({ error: err.message });
        }
    });

    // ---- System Logs ----
    app.get('/api/admin/system/logs', (req, res) => {
        res.json({ logs: getLogs() });
    });

    // ---- Catch-all 404 for API ----
    app.use('/api', (req, res) => {
        handleAppError(new AppError('DB_NOT_FOUND', `L'endpoint ${req.originalUrl} n'existe pas encore sur ce serveur.`), res);
    });

    // ---- Global Error Handler ----
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            console.error('JSON Parsing Error:', err.message);
            return res.status(400).json({ error: 'JSON Invalide', message: err.message });
        }
        console.error('SERVER CRASH DETECTED:', err);
        handleAppError(err, res);
    });

    return app;
}

module.exports = { createApp, sendSseEvent };
