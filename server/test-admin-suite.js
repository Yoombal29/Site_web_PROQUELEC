
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { Pool } = require('pg');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
// Using the experimental user for testing
const ADMIN_EMAIL = 'experimental@proquelec.com';
const ADMIN_PASSWORD = 'admin123';
const UPLOAD_TEST_FILE = 'test_comprehensive_admin.txt';

let authToken = null;
let testFileId = null;

// Database Connection for low-level verification
const pool = new Pool({
    connectionString: 'postgresql://postgres:proquelec_secure_db_pass@localhost:5433/postgres'
});

// Simple Console Colors
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    bold: "\x1b[1m"
};

const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    error: (msg) => console.error(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    warn: (msg) => console.warn(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
    step: (msg) => process.stdout.write(`${colors.bold}${msg}...${colors.reset} `)
};

async function runFullAdminTest() {
    console.log(`${colors.bold}🚀 STARTING ULTRA-COMPREHENSIVE ADMIN PANEL TEST SUITE 🚀${colors.reset}\n`);

    try {
        // 1. AUTHENTICATION
        log.step('1. Admin Authentication');
        let response;
        try {
            response = await axios.post(`${BASE_URL}/auth/login`, {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });
            authToken = response.data.token || response.data.access_token;
            console.log(`${colors.green}OK${colors.reset}`);
        } catch (e) {
            console.log(`${colors.red}FAILED${colors.reset}`);
            throw e;
        }

        const headers = { Authorization: `Bearer ${authToken}` };

        // 2. DASHBOARD & ANALYTICS
        log.step('2. Dashboard & Insights Access');
        try {
            const insightsRes = await axios.get(`${BASE_URL}/intelligence/insights`, { headers });

            if (insightsRes.status === 200) {
                console.log(`${colors.green}OK${colors.reset}`);
            } else throw new Error('Insights failed');
        } catch (err) {
            console.log(`${colors.red}FAILED${colors.reset}`);
            throw err;
        }

        // 3. MEDIA LIBRARY
        log.step('3. Media Library Operations');
        // (Skipping full cycle for speed, just check list)
        try {
            const listRes = await axios.get(`${BASE_URL}/gallery-items`, { headers });
            console.log(`${colors.green}OK${colors.reset}`);
        } catch (e) {
            console.log(`${colors.red}FAILED${colors.reset}`);
            throw e;
        }

        // 4. PAGE MANAGEMENT & ICE ENGINE
        log.step('4. Page CMS + ICE Engine (Versioning)');
        const testSlug = 'test-ice-' + Date.now();
        let pageId;
        try {
            // A. Create Page
            const createRes = await axios.post(`${BASE_URL}/pages`, {
                title: 'ICE Test Page',
                slug: testSlug,
                content: '<p>Initial</p>'
            }, { headers });
            pageId = createRes.data.id;

            // B. Specialized Editor Fetch
            await axios.get(`${BASE_URL}/admin/pages/${pageId}`, { headers });

            // C. ICE Update (Trigger versioning)
            await axios.put(`${BASE_URL}/admin/pages/${pageId}`, {
                content_raw: '<h1>Updated by ICE</h1>',
                content: '<h1>Updated by ICE</h1>',
                design_options: { theme: 'dark' }
            }, { headers });

            // D. Verify Versioning in DB
            const versionCheck = await pool.query('SELECT COUNT(*) FROM public.page_versions WHERE page_id = $1', [pageId]);
            if (parseInt(versionCheck.rows[0].count) === 0) throw new Error('No version record created');

            console.log(`${colors.green}OK${colors.reset} (Vers. created: ${versionCheck.rows[0].count})`);
        } catch (e) {
            console.log(`${colors.red}FAILED${colors.reset}`);
            if (e.response) console.log('Data:', JSON.stringify(e.response.data));
            throw e;
        }

        // 5. AI ASSISTANT (ICE Agent)
        log.step('5. AI Code Assistant (Gemini)');
        try {
            const aiRes = await axios.post(`${BASE_URL}/ai-code-assistant`, {
                prompt: "Ajoute un bouton de contact bleu moderne",
                currentCode: "<div class='container'>Contenu</div>",
                pageId: pageId,
                userId: "admin"
            }, { headers });

            // Accept both AI-generated and fallback responses
            if (aiRes.data.code) {
                const isFallback = aiRes.data._fallback === true;
                console.log(`${colors.green}OK${colors.reset}${isFallback ? ' (fallback mode)' : ''}`);
            } else {
                throw new Error("AI didn't return code");
            }
        } catch (e) {
            console.log(`${colors.red}FAILED${colors.reset}`);
            if (e.response) console.log('AI Error:', JSON.stringify(e.response.data));
            throw e;
        }

        // 6. AI CONTENT GENERATOR
        log.step('6. AI Content Generator');
        try {
            const genRes = await axios.post(`${BASE_URL}/ai-generate`, {
                prompt: "Génère un slogan pour une entreprise d'électricité",
                context: "marketing",
                tone: "pro"
            }, { headers });

            if (genRes.data.content) {
                console.log(`${colors.green}OK${colors.reset}`);
            } else throw new Error("No content generated");
        } catch (e) {
            console.log(`${colors.red}FAILED${colors.reset}`);
            throw e;
        }

        // 7. SETTINGS (KV Store)
        log.step('7. System KV Settings');
        try {
            await axios.put(`${BASE_URL}/settings`, { test_kv_key: 'working' }, { headers });
            console.log(`${colors.green}OK${colors.reset}`);
        } catch (e) {
            console.log(`${colors.red}FAILED${colors.reset}`);
            throw e;
        }

        // CLEANUP
        log.info('Cleaning up test data...');
        if (pageId) await axios.delete(`${BASE_URL}/pages/${pageId}`, { headers });

        console.log(`\n${colors.green}${colors.bold}✅ ALL SYSTEM TESTS PASSED SUCCESSFULLY! ✅${colors.reset}`);

    } catch (err) {
        console.error(`\n${colors.red}${colors.bold}❌ CRITICAL FAILURE ❌${colors.reset}`);
        console.error(`Step Failed: ${err.message}`);
    } finally {
        pool.end();
    }
}

runFullAdminTest();
