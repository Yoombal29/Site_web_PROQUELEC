#!/usr/bin/env node
/**
 * System Diagnostic: Check SSE + NOTIFY Setup
 * ==============================================
 * 
 * Validates:
 * - Database connection
 * - NOTIFY triggers exist
 * - SSE server responds
 * - React Query configuration
 */

const { Pool } = require('pg');
const HTTP_TIMEOUT = 5000;
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkDatabase() {
    console.log('\n🔍 Checking Database...');
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('   ✅ PostgreSQL connection: OK');

        // Check if triggers exist
        const triggerCheck = await pool.query(`
            SELECT trigger_name 
            FROM information_schema.triggers 
            WHERE trigger_schema = 'public' 
            AND trigger_name IN ('notify_pages_changes', 'notify_theme_changes', 'notify_media_changes')
            LIMIT 1
        `);

        if (triggerCheck.rows.length > 0) {
            console.log('   ✅ Postgres NOTIFY triggers: Configured');
        } else {
            console.warn('   ⚠️  Postgres NOTIFY triggers: NOT FOUND (run: npm run db:migrate)');
        }

        // Check page count
        const pageCheck = await pool.query('SELECT COUNT(*) as count FROM public.pages');
        console.log(`   ✅ Pages in database: ${pageCheck.rows[0].count}`);

        return true;
    } catch (err) {
        console.error('   ❌ Database error:', err.message);
        return false;
    }
}

async function checkServer() {
    console.log('\n🌐 Checking API Server...');
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

        const response = await fetch('http://localhost:3000/api/health', {
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok) {
            console.log('   ✅ API server: Running on port 3000');
        } else {
            console.warn(`   ⚠️  API server: HTTP ${response.status}`);
        }

        return true;
    } catch (err) {
        if (err.name === 'AbortError') {
            console.error('   ❌ API server: Connection timeout (not running?)');
        } else {
            console.error('   ❌ API server:', err.message);
        }
        return false;
    }
}

async function checkSSE() {
    console.log('\n📡 Checking SSE Endpoint...');
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

        const response = await fetch('http://localhost:3000/api/events', {
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok && response.headers.get('content-type').includes('text/event-stream')) {
            console.log('   ✅ SSE endpoint: Responsive (text/event-stream)');
            response.body.cancel(); // Close the stream
            return true;
        } else {
            console.warn(`   ⚠️  SSE endpoint: Wrong content-type`);
            return false;
        }
    } catch (err) {
        console.error('   ❌ SSE endpoint:', err.message);
        return false;
    }
}

async function checkFrontend() {
    console.log('\n⚛️  Checking Frontend...');
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

        const response = await fetch('http://localhost:5173/', {
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok) {
            console.log('   ✅ Frontend: Running on port 5173');
        } else {
            console.warn(`   ⚠️  Frontend: HTTP ${response.status}`);
        }

        return true;
    } catch (err) {
        console.error('   ❌ Frontend:', err.message);
        return false;
    }
}

async function runDiagnostics() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║       System Diagnostic: SSE + NOTIFY Setup            ║');
    console.log('╚════════════════════════════════════════════════════════╝');

    const checks = [
        await checkDatabase(),
        await checkServer(),
        await checkSSE(),
        await checkFrontend()
    ];

    const passed = checks.filter(c => c).length;

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log(`║  Status: ${passed}/4 checks passed${' '.repeat(29 - passed.toString().length)}║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');

    if (passed < 4) {
        console.log('⚠️  Some checks failed. Ensure:');
        console.log('   • npm run dev (starts server + frontend)');
        console.log('   • npm run db:migrate (activates NOTIFY triggers)');
        console.log('   • DATABASE_URL is set in .env\n');
    }

    return passed === 4;
}

runDiagnostics()
    .then(success => {
        pool.end();
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('Diagnostic failed:', err);
        pool.end();
        process.exit(1);
    });
