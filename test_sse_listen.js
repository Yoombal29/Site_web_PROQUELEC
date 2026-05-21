#!/usr/bin/env node
/**
 * Test SSE Connection & Event Broadcasting
 * =========================================
 * 
 * This script:
 * 1. Opens an SSE connection to /api/events
 * 2. Waits for events
 * 3. Logs any events received
 */

const EventSource = require('eventsource');

const SSE_URL = 'http://localhost:3000/api/events';

console.log('\n🔗 Connecting to SSE stream...');
console.log(`   URL: ${SSE_URL}\n`);

const eventSource = new EventSource(SSE_URL);

let eventCount = 0;
const startTime = Date.now();

eventSource.addEventListener('page:created', (e) => {
    eventCount++;
    console.log(`\n📥 Event #${eventCount}: page:created`);
    try {
        const data = JSON.parse(e.data);
        console.log(`   Page: "${data.title}" (slug: ${data.slug})`);
        console.log(`   Timestamp: ${new Date().toISOString()}`);
    } catch (err) {
        console.log(`   Error parsing: ${err.message}`);
    }
});

eventSource.addEventListener('page:updated', (e) => {
    eventCount++;
    console.log(`\n📥 Event #${eventCount}: page:updated`);
    try {
        const data = JSON.parse(e.data);
        console.log(`   Page: "${data.title}" (slug: ${data.slug})`);
        console.log(`   Updated at: ${data.updated_at}`);
        console.log(`   Timestamp: ${new Date().toISOString()}`);
    } catch (err) {
        console.log(`   Error parsing: ${err.message}`);
    }
});

eventSource.addEventListener('page:deleted', (e) => {
    eventCount++;
    console.log(`\n📥 Event #${eventCount}: page:deleted`);
    try {
        const data = JSON.parse(e.data);
        console.log(`   Page ID: ${data.id}`);
        console.log(`   Timestamp: ${new Date().toISOString()}`);
    } catch (err) {
        console.log(`   Error parsing: ${err.message}`);
    }
});

eventSource.addEventListener('theme:updated', (e) => {
    eventCount++;
    console.log(`\n📥 Event #${eventCount}: theme:updated`);
    try {
        const data = JSON.parse(e.data);
        console.log(`   Primary color: ${data.primary_color}`);
        console.log(`   Timestamp: ${new Date().toISOString()}`);
    } catch (err) {
        console.log(`   Error parsing: ${err.message}`);
    }
});

eventSource.addEventListener('media:uploaded', (e) => {
    eventCount++;
    console.log(`\n📥 Event #${eventCount}: media:uploaded`);
    try {
        const data = JSON.parse(e.data);
        console.log(`   File: ${data.file_name || data.filename}`);
        console.log(`   Timestamp: ${new Date().toISOString()}`);
    } catch (err) {
        console.log(`   Error parsing: ${err.message}`);
    }
});

eventSource.addEventListener('media:deleted', (e) => {
    eventCount++;
    console.log(`\n📥 Event #${eventCount}: media:deleted`);
    try {
        const data = JSON.parse(e.data);
        console.log(`   File: ${data.file_name}`);
        console.log(`   Timestamp: ${new Date().toISOString()}`);
    } catch (err) {
        console.log(`   Error parsing: ${err.message}`);
    }
});

eventSource.addEventListener('cache:purged', (e) => {
    eventCount++;
    console.log(`\n📥 Event #${eventCount}: cache:purged`);
    try {
        const data = JSON.parse(e.data);
        console.log(`   Paths purged: ${data.paths?.length || 0}`);
        console.log(`   Timestamp: ${new Date().toISOString()}`);
    } catch (err) {
        console.log(`   Error parsing: ${err.message}`);
    }
});

eventSource.onerror = (err) => {
    const elapsed = Date.now() - startTime;
    console.log(`\n❌ Connection closed after ${elapsed}ms`);
    console.log(`   Events received: ${eventCount}`);
    if (eventCount === 0) {
        console.log('   ⚠️  No events received. Check:');
        console.log('      1. Server is running (npm run dev)');
        console.log('      2. SSE endpoint is accessible');
        console.log('      3. Database migrations were applied');
    }
    process.exit(eventCount > 0 ? 0 : 1);
};

console.log('✅ Connected! Listening for events...');
console.log('💡 Tip: Make changes in admin UI to trigger events\n');
console.log('Press Ctrl+C to stop listening.\n');

// Auto-stop after 2 minutes
setTimeout(() => {
    const elapsed = Date.now() - startTime;
    console.log(`\n⏸️  Timeout after ${elapsed}ms`);
    console.log(`   Events received: ${eventCount}`);
    eventSource.close();
    process.exit(0);
}, 120000); // 2 minutes
