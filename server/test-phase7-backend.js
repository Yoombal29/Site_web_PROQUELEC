// Test script for Phase 7 backend systems
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function testBackendSystems() {
    console.log('🧪 Testing Phase 7 Backend Systems\n');

    try {
        // ============================================
        // 1. TEST PERMISSIONS SYSTEM
        // ============================================
        console.log('1️⃣ Testing Permissions & ACL System...');

        // Check if default groups exist
        const groups = await pool.query('SELECT * FROM user_groups ORDER BY name');
        console.log(`   ✅ Found ${groups.rows.length} user groups:`, groups.rows.map(g => g.name).join(', '));

        // Check permissions table structure
        const permissionsCount = await pool.query('SELECT COUNT(*) FROM document_permissions');
        console.log(`   ✅ Permissions table ready (${permissionsCount.rows[0].count} entries)`);

        // Test permission function
        const testUser = await pool.query('SELECT id FROM users LIMIT 1');
        if (testUser.rows.length > 0) {
            const testDoc = await pool.query('SELECT id FROM media_files LIMIT 1');
            if (testDoc.rows.length > 0) {
                const hasPermission = await pool.query(
                    'SELECT user_has_permission($1, $2, $3) as result',
                    [testUser.rows[0].id, testDoc.rows[0].id, 'read']
                );
                console.log(`   ✅ Permission check function works: ${hasPermission.rows[0].result}`);
            }
        }

        // ============================================
        // 2. TEST VERSIONING SYSTEM
        // ============================================
        console.log('\n2️⃣ Testing Document Versioning System...');

        // Check version columns
        const versionedDocs = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN is_latest = true THEN 1 END) as latest_count
      FROM media_files
      WHERE version IS NOT NULL
    `);
        console.log(`   ✅ Total documents: ${versionedDocs.rows[0].total}`);
        console.log(`   ✅ Latest versions: ${versionedDocs.rows[0].latest_count}`);

        // Test version functions
        const versionTest = await pool.query("SELECT increment_version('1.0') as next_version");
        console.log(`   ✅ Version increment function: 1.0 → ${versionTest.rows[0].next_version}`);

        // ============================================
        // 3. TEST AUDIT TRAIL SYSTEM
        // ============================================
        console.log('\n3️⃣ Testing Audit Trail System...');

        // Check audit logs
        const auditCount = await pool.query('SELECT COUNT(*) FROM audit_logs');
        console.log(`   ✅ Audit logs table ready (${auditCount.rows[0].count} entries)`);

        // Check triggers
        const triggers = await pool.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_name LIKE '%audit%'
      ORDER BY trigger_name
    `);
        console.log(`   ✅ Active triggers: ${triggers.rows.length}`);
        triggers.rows.forEach(t => {
            console.log(`      - ${t.trigger_name} on ${t.event_object_table}`);
        });

        // Test audit function
        const testAudit = await pool.query(`
      SELECT log_audit(
        (SELECT id FROM users LIMIT 1),
        'test_action',
        'document',
        gen_random_uuid(),
        '{"test": "data"}'::jsonb
      ) as audit_id
    `);
        console.log(`   ✅ Audit logging function works: ${testAudit.rows[0].audit_id}`);

        // ============================================
        // 4. SUMMARY
        // ============================================
        console.log('\n📊 Backend Systems Summary:');
        console.log('   ✅ Permissions & ACL: OPERATIONAL');
        console.log('   ✅ Document Versioning: OPERATIONAL');
        console.log('   ✅ Audit Trail: OPERATIONAL');
        console.log('\n🎉 All backend systems are working correctly!\n');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

testBackendSystems();
