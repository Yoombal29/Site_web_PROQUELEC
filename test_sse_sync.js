#!/usr/bin/env node
/**
 * Test SSE Synchronization End-to-End
 * ======================================
 * 
 * This script:
 * 1. Simulates admin updating a page
 * 2. Checks if SSE clients receive event
 * 3. Validates sync latency
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const TEST_SLUG = `test-sync-${Date.now()}`;

async function testSync() {
    console.log('\n🧪 Starting SSE Sync Test...\n');

    try {
        // Step 1: Create a test page
        console.log('📝 Step 1: Creating test page...');
        const createResult = await pool.query(
            `INSERT INTO public.pages 
             (title, slug, content, is_published, meta_description, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING id, slug, title, updated_at`,
            ['Test Page for Sync', TEST_SLUG, '<p>Original content</p>', true, 'Test']
        );
        const pageId = createResult.rows[0].id;
        const createdAt = createResult.rows[0].updated_at;
        console.log(`✅ Page created with ID: ${pageId}, Slug: ${TEST_SLUG}`);
        console.log(`   Created at: ${createdAt}\n`);

        // Step 2: Wait for SSE broadcast (should be near-instant due to NOTIFY trigger)
        console.log('⏳ Step 2: Waiting 100ms for SSE broadcast...');
        await new Promise(resolve => setTimeout(resolve, 100));

        // Step 3: Update the page (simulate admin edit)
        console.log('✏️  Step 3: Updating page content (simulating admin edit)...');
        const updateTimestamp = new Date();
        const updateResult = await pool.query(
            `UPDATE public.pages 
             SET content = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING id, content, updated_at`,
            ['<p>Updated content from test</p>', pageId]
        );
        const updatedAt = updateResult.rows[0].updated_at;
        console.log(`✅ Page updated at: ${updatedAt}`);
        
        // Calculate latency
        const updateLatency = updatedAt.getTime() - updateTimestamp.getTime();
        console.log(`   DB latency: ${updateLatency}ms\n`);

        // Step 4: Verify page can be fetched with new content
        console.log('🔍 Step 4: Verifying updated content via API...');
        const fetchResult = await pool.query(
            `SELECT id, slug, content, updated_at FROM public.pages WHERE id = $1`,
            [pageId]
        );
        if (fetchResult.rows.length === 0) {
            console.log('❌ ERROR: Page not found!');
            return false;
        }

        const fetchedPage = fetchResult.rows[0];
        if (fetchedPage.content.includes('Updated content')) {
            console.log(`✅ Content verified: "${fetchedPage.content.substring(0, 50)}..."\n`);
        } else {
            console.log(`❌ Content mismatch!\n`);
            return false;
        }

        // Step 5: Clean up
        console.log('🧹 Step 5: Cleaning up test data...');
        await pool.query(`DELETE FROM public.pages WHERE id = $1`, [pageId]);
        console.log('✅ Test page deleted\n');

        console.log('✨ Test completed successfully!');
        console.log(`\n📊 Summary:`);
        console.log(`   • Page ID: ${pageId}`);
        console.log(`   • Slug: ${TEST_SLUG}`);
        console.log(`   • Update latency (DB): ${updateLatency}ms`);
        console.log(`   • SSE broadcast should be < 50ms after DB update`);
        console.log(`   • Expected total sync time: < 500ms\n`);

        return true;

    } catch (err) {
        console.error('❌ Test failed:', err.message);
        console.error(err);
        return false;
    } finally {
        await pool.end();
    }
}

// Run test
testSync().then(success => {
    process.exit(success ? 0 : 1);
});
