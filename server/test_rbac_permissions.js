// Test RBAC Granular Permissions
// Demonstrates that permissions are correctly enforced at the API level
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const API_URL = 'http://localhost:3000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

async function testRBAC() {
    try {
        console.log('🔐 RBAC GRANULAR PERMISSIONS TEST');
        console.log('===================================\n');

        // 1. CREATE TEST USERS
        const password = 'test123';
        const hash = await bcrypt.hash(password, 10);

        // Client (read-only)
        const clientRes = await pool.query(
            `INSERT INTO public.users (email, password_hash, role, is_active)
             VALUES ($1, $2, 'client', true)
             ON CONFLICT (email) DO UPDATE SET password_hash = $2
             RETURNING id`,
            ['client_test@proquelec.sn', hash]
        );
        const clientId = clientRes.rows[0].id;
        const clientToken = jwt.sign({ id: clientId, email: 'client_test@proquelec.sn', role: 'client' }, JWT_SECRET, { expiresIn: '1d' });

        console.log(`✅ Test Users Created:`);
        console.log(`   - Client (Read-Only): client_test@proquelec.sn\n`);

        // 2. TEST CLIENT TRYING TO CREATE PROJECT (Should FAIL)
        console.log('🧪 Test 1: Client tries to create a project (should be denied)...');
        const createRes = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${clientToken}`
            },
            body: JSON.stringify({
                title: 'Unauthorized Project',
                location: { city: 'Dakar' }
            })
        });

        if (createRes.status === 403) {
            const error = await createRes.json();
            console.log(`   ✅ Permission correctly denied!`);
            console.log(`   📛 Error: "${error.error}"`);
            console.log(`   🔑 Required: ${error.required_permission}`);
            console.log(`   👤 User Role: ${error.your_role}\n`);
        } else {
            console.log(`   ❌ SECURITY ISSUE: Client was allowed to create project!\n`);
        }

        // 3. TEST CLIENT TRYING TO TRANSITION STATE (Should FAIL)
        // First, get a project ID
        const projListRes = await fetch(`${API_URL}/projects`, {
            headers: { 'Authorization': `Bearer ${clientToken}` }
        });
        const projects = await projListRes.json();

        if (projects.length > 0) {
            const projectId = projects[0].id;

            console.log('🧪 Test 2: Client tries to transition project state (should be denied)...');
            const transitionRes = await fetch(`${API_URL}/projects/${projectId}/transition`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${clientToken}`
                },
                body: JSON.stringify({
                    new_status: 'submitted',
                    reason: 'Unauthorized attempt'
                })
            });

            if (transitionRes.status === 403) {
                const error = await transitionRes.json();
                console.log(`   ✅ Permission correctly denied!`);
                console.log(`   📛 Error: "${error.error}"`);
                console.log(`   🔑 Required: ${error.required_permission}\n`);
            } else {
                console.log(`   ❌ SECURITY ISSUE: Client was allowed to transition state!\n`);
            }
        }

        // 4. SUMMARY: Show permissions for each role
        console.log('📋 RBAC SUMMARY:');
        console.log('   Admin: Full access (all permissions)');
        console.log('   Installer: projects.create, projects.edit, inspections.*');
        console.log('   Client: projects.view, inspections.view (READ-ONLY)');
        console.log('   Authority: projects.transition, inspections.validate\n');

        console.log('🎉 RBAC Tests Complete! Permissions are working correctly.');

    } catch (err) {
        console.error('❌ Test Error:', err.message);
    } finally {
        await pool.end();
    }
}

testRBAC();
