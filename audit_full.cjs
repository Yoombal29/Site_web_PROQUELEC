const path = require('path');
const { Pool } = require(path.join(__dirname, 'server', 'node_modules', 'pg'));
const jwt = require(path.join(__dirname, 'server', 'node_modules', 'jsonwebtoken'));
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const BASE = 'http://localhost:3000';

async function audit() {
    const results = { ok: [], fail: [], warn: [] };

    // Generate admin token
    const adminRes = await pool.query("SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1");
    const admin = adminRes.rows[0];
    if (!admin) { console.error("❌ No admin user found!"); return; }
    const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // All frontend API endpoints to test
    const endpoints = [
        // === PUBLIC GET endpoints ===
        { method: 'GET', path: '/api/health', label: 'Health Check' },
        { method: 'GET', path: '/api/site-settings', label: 'Site Settings (GET)' },
        { method: 'GET', path: '/api/theme-settings', label: 'Theme Settings (GET)' },
        { method: 'GET', path: '/api/menu-items', label: 'Menu Items' },
        { method: 'GET', path: '/api/pages', label: 'Pages CMS' },
        { method: 'GET', path: '/api/home-slides', label: 'Home Slides' },
        { method: 'GET', path: '/api/home-stats', label: 'Home Stats' },
        { method: 'GET', path: '/api/home-services', label: 'Home Services' },
        { method: 'GET', path: '/api/testimonials', label: 'Testimonials' },
        { method: 'GET', path: '/api/partners', label: 'Partners' },
        { method: 'GET', path: '/api/blog-posts', label: 'Blog Posts' },
        { method: 'GET', path: '/api/blog-categories', label: 'Blog Categories' },
        { method: 'GET', path: '/api/documents', label: 'Documents' },
        { method: 'GET', path: '/api/site-assets', label: 'Site Assets' },
        { method: 'GET', path: '/api/certifications', label: 'Certifications' },
        { method: 'GET', path: '/api/construction-mode', label: 'Construction Mode' },
        { method: 'GET', path: '/api/quick-links', label: 'Quick Links' },
        { method: 'GET', path: '/api/network/electricians', label: 'Electricians Network' },
        { method: 'GET', path: '/api/professional-training', label: 'Professional Training' },
        { method: 'GET', path: '/api/electrical-certifications', label: 'Electrical Certifications' },
        { method: 'GET', path: '/api/electrical-standards', label: 'Electrical Standards' },
        { method: 'GET', path: '/api/electrical-equipment', label: 'Electrical Equipment' },
        { method: 'GET', path: '/api/events', label: 'Events' },
        { method: 'GET', path: '/api/home-hero', label: 'Home Hero' },
        { method: 'GET', path: '/api/download-buttons', label: 'Download Buttons' },

        // === AUTHENTICATED GET endpoints ===
        { method: 'GET', path: '/api/auth/me', label: 'Auth Me', auth: true },
        { method: 'GET', path: '/api/users', label: 'Users List', auth: true },
        { method: 'GET', path: '/api/performance-metrics', label: 'Performance Metrics', auth: true },
        { method: 'GET', path: '/api/analytics/summary', label: 'Analytics Summary', auth: true },
        { method: 'GET', path: '/api/media-files', label: 'Media Files', auth: true },
        { method: 'GET', path: '/api/admin/audit-logs', label: 'Audit Logs', auth: true },
        { method: 'GET', path: '/api/admin/system/status', label: 'System Status', auth: true },
        { method: 'GET', path: '/api/admin/system/logs', label: 'System Logs', auth: true },
        { method: 'GET', path: '/api/ai/logs', label: 'AI Logs', auth: true },
        { method: 'GET', path: '/api/normative-articles', label: 'Normative Articles', auth: false },
    ];

    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║         AUDIT GLOBAL DE SYNCHRONISATION API              ║");
    console.log("║  Frontend Hooks ↔ Backend Endpoints ↔ Base de données    ║");
    console.log("╚═══════════════════════════════════════════════════════════╝\n");

    for (const ep of endpoints) {
        try {
            const opts = ep.auth ? { headers } : {};
            const res = await fetch(`${BASE}${ep.path}`, opts);
            const status = res.status;

            if (status >= 200 && status < 300) {
                results.ok.push(`✅ [${status}] ${ep.method} ${ep.path} — ${ep.label}`);
            } else if (status === 404) {
                results.fail.push(`❌ [404] ${ep.method} ${ep.path} — ${ep.label} → ENDPOINT MANQUANT`);
            } else if (status === 401 || status === 403) {
                results.warn.push(`⚠️  [${status}] ${ep.method} ${ep.path} — ${ep.label} → Auth requise`);
            } else {
                results.warn.push(`⚠️  [${status}] ${ep.method} ${ep.path} — ${ep.label}`);
            }
        } catch (err) {
            results.fail.push(`❌ [ERR] ${ep.method} ${ep.path} — ${ep.label} → ${err.message}`);
        }
    }

    // === DB TABLE EXISTENCE CHECK ===
    console.log("\n────── VÉRIFICATION DES TABLES DE DONNÉES ──────\n");
    const requiredTables = [
        'site_settings', 'theme_settings', 'users', 'menu_items', 'pages',
        'home_slides', 'home_stats', 'home_services', 'testimonials', 'partners',
        'blog_posts', 'blog_categories', 'documents', 'site_assets', 'certifications',
        'construction_mode', 'quick_links', 'electricians_network', 'professional_training',
        'electrical_certifications', 'electrical_standards', 'electrical_equipment',
        'contact_requests', 'media_files', 'performance_metrics', 'analytics_events',
        'download_buttons', 'events',
    ];

    const existingTables = await pool.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    `);
    const tableNames = existingTables.rows.map(r => r.table_name);

    for (const t of requiredTables) {
        if (tableNames.includes(t)) {
            const countRes = await pool.query(`SELECT count(*) as c FROM public.${t}`);
            console.log(`  ✅ ${t} (${countRes.rows[0].c} lignes)`);
        } else {
            console.log(`  ❌ ${t} — TABLE MANQUANTE`);
            results.fail.push(`❌ Table manquante: ${t}`);
        }
    }

    // === PRINT RESULTS ===
    console.log("\n\n╔═══════════════════════════════════════════════════════════╗");
    console.log("║                RÉSULTATS DE L'AUDIT                      ║");
    console.log("╚═══════════════════════════════════════════════════════════╝\n");

    console.log("── ENDPOINTS FONCTIONNELS ──");
    results.ok.forEach(r => console.log("  " + r));

    if (results.warn.length > 0) {
        console.log("\n── AVERTISSEMENTS ──");
        results.warn.forEach(r => console.log("  " + r));
    }

    if (results.fail.length > 0) {
        console.log("\n── ❌ PROBLÈMES CRITIQUES ──");
        results.fail.forEach(r => console.log("  " + r));
    }

    console.log(`\n\n═══ RÉSUMÉ: ${results.ok.length} OK | ${results.warn.length} WARN | ${results.fail.length} FAIL ═══`);

    await pool.end();
}

audit().catch(err => { console.error("FATAL:", err); process.exit(1); });
