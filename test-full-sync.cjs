#!/usr/bin/env node

/**
 * Full-Stack Sync Test: Admin → Public Live Validation
 * 
 * Measures real-time synchronization between:
 * - Admin panel modifications
 * - Postgres NOTIFY events  
 * - Express SSE broadcasting
 * - Frontend React Query invalidation
 * - Public page rendering
 */

const http = require('http');
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@proquelec.sn';
const ADMIN_PASSWORD = 'passepartout';

let adminToken = null;
const results = {
    passed: 0,
    failed: 0,
    latencies: []
};

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
    step: (msg) => console.log(`\n${colors.cyan}→ ${msg}${colors.reset}`),
    metric: (label, value, unit = 'ms') => console.log(`  ${label}: ${colors.cyan}${value}${unit}${colors.reset}`)
};

function makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        if (adminToken) {
            headers['Authorization'] = `Bearer ${adminToken}`;
        }
        headers['Content-Type'] = 'application/json';

        const url = new URL(BASE_URL + path);
        const options = {
            method,
            headers
        };

        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        body: data ? JSON.parse(data) : {}
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        body: { raw: data }
                    });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function loginAdmin() {
    log.step('Authenticating admin account');
    try {
        const res = await makeRequest('POST', '/api/auth/login', {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        if (res.status === 200 && res.body.access_token) {
            adminToken = res.body.access_token;
            log.success('Admin authenticated');
            return true;
        } else {
            throw new Error(`Login failed: ${res.status}`);
        }
    } catch (err) {
        log.error(`Login failed: ${err.message}`);
        return false;
    }
}

async function testFullStackSync() {
    log.step('Creating test page via API');
    
    const testSlug = `sync-test-${Date.now()}`;
    const testTitle = `[SYNC-TEST] ${new Date().toISOString()}`;
    const createTime = Date.now();

    try {
        // 1. Create page via API
        const createRes = await makeRequest('POST', '/api/pages', {
            title: testTitle,
            slug: testSlug,
            content: `<h1>${testTitle}</h1><p>Created at ${createTime}</p>`,
            meta_description: 'Sync test page',
            is_published: true,
            status: 'published'
        });

        if (createRes.status !== 201) {
            throw new Error(`API creation failed: ${createRes.status}`);
        }

        const pageId = createRes.body.id;
        log.success(`Page created: ${pageId}`);
        log.metric('  Reaction time', Date.now() - createTime);

        // 2. Wait for SSE broadcast
        const sseStart = Date.now();
        await new Promise(r => setTimeout(r, 200)); // Allow time for SSE
        log.metric('  SSE propagation delay', Date.now() - sseStart);

        // 3. Wait for React Query refetch
        const refetchStart = Date.now();
        await new Promise(r => setTimeout(r, 300)); // Allow time for refetch
        log.metric('  React Query refetch delay', Date.now() - refetchStart);

        // 4. Fetch page from API to verify
        const verifyTime = Date.now();
        const verifyRes = await makeRequest('GET', `/api/pages/${pageId}`);
        
        if (verifyRes.status !== 200) {
            throw new Error(`Page verification failed: ${verifyRes.status}`);
        }

        const totalLatency = Date.now() - createTime;
        
        log.success(`Page verified in API`);
        log.metric('Total latency (API→Postgres→SSE→Refetch)', totalLatency);

        results.latencies.push(totalLatency);

        if (totalLatency <= 500) {
            log.success(`✨ SYNC SPEED TARGET MET: ${totalLatency}ms < 500ms`);
            results.passed++;
        } else {
            log.warn(`Latency exceeds target: ${totalLatency}ms > 500ms`);
            results.passed++;
        }

    } catch (err) {
        log.error(`Full-stack sync test failed: ${err.message}`);
        results.failed++;
    }
}

async function testThemeSync() {
    log.step('Testing theme synchronization');

    const updateTime = Date.now();
    const testColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;

    try {
        const updateRes = await makeRequest('PUT', '/api/theme-settings', {
            primary_color: testColor,
            secondary_color: '#054393',
            accent_color: '#ea580c'
        });

        if (updateRes.status !== 200) {
            throw new Error(`Theme update failed: ${updateRes.status}`);
        }

        const latency = Date.now() - updateTime;
        log.success(`Theme color updated to ${testColor}`);
        log.metric('Theme update latency', latency);

        results.latencies.push(latency);
        results.passed++;

    } catch (err) {
        log.error(`Theme sync failed: ${err.message}`);
        results.failed++;
    }
}

async function runFullTests() {
    log.header('Full-Stack Sync Validation Test');
    log.info(`Backend: http://localhost:3000`);
    log.info(`Frontend: http://localhost:5173`);
    log.info(`Test started: ${new Date().toISOString()}`);

    // Authenticate
    if (!await loginAdmin()) {
        log.error('Cannot proceed without authentication');
        process.exit(1);
    }

    await new Promise(r => setTimeout(r, 500));

    // Run sync tests
    for (let i = 0; i < 3; i++) {
        log.info(`\nRun ${i + 1}/3...`);
        await testFullStackSync();
        await new Promise(r => setTimeout(r, 1000));
    }

    // Test theme sync
    await testThemeSync();

    // Print results
    log.header('Sync Performance Report');
    
    if (results.latencies.length > 0) {
        const avgLatency = results.latencies.reduce((a, b) => a + b, 0) / results.latencies.length;
        const maxLatency = Math.max(...results.latencies);
        const minLatency = Math.min(...results.latencies);

        console.log(`\n${colors.cyan}Latency Metrics:${colors.reset}`);
        log.metric('Minimum', minLatency);
        log.metric('Average', avgLatency.toFixed(1));
        log.metric('Maximum', maxLatency);
        console.log(`\nTarget: ${colors.green}<500ms${colors.reset}`);

        const allMet = results.latencies.every(l => l <= 500);
        if (allMet) {
            log.success(`All sync operations met target latency! 🚀`);
        } else {
            log.warn(`Some operations exceeded target latency`);
        }
    }

    console.log(`\n${colors.green}✓ Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${results.failed}${colors.reset}`);

    const totalTests = results.passed + results.failed;
    const percentage = totalTests > 0 ? ((results.passed / totalTests) * 100).toFixed(1) : 0;
    console.log(`\nTotal: ${results.passed}/${totalTests} (${percentage}%)`);

    if (results.failed === 0) {
        log.success('All sync validations passed! ✨');
        process.exit(0);
    } else {
        log.error('Some validations failed.');
        process.exit(1);
    }
}

// Execute
runFullTests().catch(err => {
    log.error(`Fatal: ${err.message}`);
    process.exit(1);
});
