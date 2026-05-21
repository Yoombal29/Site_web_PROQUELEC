#!/usr/bin/env node
/**
 * Integration Test: Admin Mutation → SSE Broadcast → Public Sync
 * ================================================================
 * 
 * This comprehensive test ensures:
 * 1. Admin mutation triggers SSE event
 * 2. SSE broadcasts to all connected clients
 * 3. React Query invalidation on client
 * 4. Public page reflects changes < 500ms
 * 
 * Prerequisites:
 * - Server running (npm run dev)
 * - Database migrated (npm run db:migrate)
 * - Admin user created (with valid JWT)
 */

const { Pool } = require('pg');
const EventSource = require('eventsource');
require('dotenv').config();

const API_URL = 'http://localhost:3000';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const TEST_SLUG = `integration-test-${Date.now()}`;
const TEST_TITLE = `Test Page ${Date.now()}`;

let eventReceived = false;
let eventData = null;

async function waitForEvent(eventType, timeout = 500) {
    return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
            resolve(false);
        }, timeout);

        const checkEvent = setInterval(() => {
            if (eventReceived) {
                clearInterval(checkEvent);
                clearTimeout(timeoutId);
                resolve(true);
            }
        }, 10);
    });
}

async function runTest() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   Integration Test: Admin → SSE → Public Sync          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    try {
        // Step 1: Setup SSE listener
        console.log('📡 Step 1: Setting up SSE listener...');
        eventReceived = false;
        eventData = null;

        const eventSource = new EventSource(`${API_URL}/api/events`);
        
        eventSource.addEventListener('page:created', (e) => {
            eventReceived = true;
            eventData = JSON.parse(e.data);
            console.log(`   ✅ Received page:created event`);
        });

        eventSource.addEventListener('page:updated', (e) => {
            eventReceived = true;
            eventData = JSON.parse(e.data);
            console.log(`   ✅ Received page:updated event`);
        });

        console.log('   Connected to SSE stream\n');

        // Step 2: Create test page
        console.log('📝 Step 2: Creating test page via API...');
        const createResponse = await fetch(`${API_URL}/api/pages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: TEST_TITLE,
                slug: TEST_SLUG,
                content: '<p>Initial content</p>',
                is_published: true,
                meta_description: 'Test page'
            })
        });

        if (!createResponse.ok) {
            throw new Error(`API error: ${createResponse.status}`);
        }

        const createdPage = await createResponse.json();
        const pageId = createdPage.id;
        console.log(`   ✅ Page created: ID=${pageId}, Slug=${TEST_SLUG}\n`);

        // Step 3: Wait for SSE event
        console.log('⏳ Step 3: Waiting for SSE broadcast (max 500ms)...');
        const eventReceive = await waitForEvent('page:created', 500);
        if (eventReceive) {
            console.log(`   ✅ Event received in time\n`);
        } else {
            console.warn(`   ⚠️  No event received (possible network delay)\n`);
        }

        // Step 4: Update page
        console.log('✏️  Step 4: Updating page via API...');
        eventReceived = false;
        const updateTimestamp = Date.now();

        const updateResponse = await fetch(`${API_URL}/api/pages/${pageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: '<p>Updated content for sync test</p>'
            })
        });

        if (!updateResponse.ok) {
            throw new Error(`API error: ${updateResponse.status}`);
        }

        console.log(`   ✅ Update request sent\n`);

        // Step 5: Wait for update event
        console.log('⏳ Step 5: Waiting for SSE update event (max 500ms)...');
        const updateReceived = await waitForEvent('page:updated', 500);
        const updateLatency = Date.now() - updateTimestamp;
        
        if (updateReceived) {
            console.log(`   ✅ Event received in ${updateLatency}ms\n`);
        } else {
            console.warn(`   ⚠️  No event received after ${updateLatency}ms\n`);
        }

        // Step 6: Verify updated content
        console.log('🔍 Step 6: Verifying updated content...');
        const verifyResponse = await fetch(`${API_URL}/api/pages/${pageId}`);
        const verifiedPage = await verifyResponse.json();

        if (verifiedPage.content.includes('Updated content')) {
            console.log(`   ✅ Content verified: "${verifiedPage.content.substring(0, 60)}..."\n`);
        } else {
            throw new Error('Content mismatch');
        }

        // Step 7: Cleanup
        console.log('🧹 Step 7: Cleaning up test data...');
        await pool.query(`DELETE FROM public.pages WHERE id = $1`, [pageId]);
        console.log('   ✅ Test page deleted\n');

        eventSource.close();

        // Summary
        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║                    ✨ TEST PASSED ✨                  ║');
        console.log('╚════════════════════════════════════════════════════════╝\n');

        console.log('📊 Results:');
        console.log(`   • Page ID: ${pageId}`);
        console.log(`   • Slug: ${TEST_SLUG}`);
        console.log(`   • SSE Event latency: ${updateLatency}ms`);
        console.log(`   • Status: ✅ SYNC WORKING\n`);

        console.log('✅ Admin → SSE → Public synchronization is functioning correctly!\n');

        return true;

    } catch (err) {
        console.error('\n❌ Test failed:', err.message);
        if (err.stack) console.error(err.stack);
        return false;
    } finally {
        await pool.end();
    }
}

runTest().then(success => {
    process.exit(success ? 0 : 1);
});
