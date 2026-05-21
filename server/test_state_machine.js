// Test script for Authority 2.0 State Machine
// Simulates a complete regulatory lifecycle: draft → submitted → under_review → validated
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const API_URL = 'http://localhost:3000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

async function testStateMachine() {
    try {
        console.log('🏛️ AUTHORITY 2.0 - STATE MACHINE TEST');
        console.log('======================================\n');

        // 1. CREATE TEST USERS (installer + authority)
        const installerEmail = 'installer_test@proquelec.sn';
        const authorityEmail = 'authority_test@proquelec.sn';
        const password = 'test123';
        const hash = await bcrypt.hash(password, 10);

        let installerId, authorityId;

        // Create Installer
        const installerRes = await pool.query(
            `INSERT INTO public.users (email, password_hash, role, is_active)
             VALUES ($1, $2, 'installer', true)
             ON CONFLICT (email) DO UPDATE SET password_hash = $2
             RETURNING id`,
            [installerEmail, hash]
        );
        installerId = installerRes.rows[0].id;

        // Create Authority
        const authorityRes = await pool.query(
            `INSERT INTO public.users (email, password_hash, role, is_active)
             VALUES ($1, $2, 'admin', true)
             ON CONFLICT (email) DO UPDATE SET password_hash = $2
             RETURNING id`,
            [authorityEmail, hash]
        );
        authorityId = authorityRes.rows[0].id;

        console.log(`✅ Users Created:`);
        console.log(`   - Installer: ${installerEmail} (ID: ${installerId})`);
        console.log(`   - Authority: ${authorityEmail} (ID: ${authorityId})\n`);

        // 2. Generate Tokens
        const installerToken = jwt.sign({ id: installerId, email: installerEmail, role: 'installer' }, JWT_SECRET, { expiresIn: '1d' });
        const authorityToken = jwt.sign({ id: authorityId, email: authorityEmail, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });

        // 3. Get a test project (or create one)
        const headers = (token) => ({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        const projRes = await fetch(`${API_URL}/projects`, { headers: headers(installerToken) });
        const projects = await projRes.json();
        const project = projects[0];

        if (!project) {
            console.error('❌ No project found. Please create a project first.');
            return;
        }

        const projectId = project.id;
        const currentStatus = project.regulatory_status || 'draft';
        console.log(`📂 Test Project: "${project.title}"`);
        console.log(`   Current Status: ${currentStatus}\n`);

        // 4. TEST SEQUENCE: draft → submitted → under_review → validated
        console.log('🔄 TRANSITION SEQUENCE:\n');

        // Transition 1: draft → submitted (by installer)
        if (currentStatus === 'draft') {
            console.log('1️⃣  Submitting project (draft → submitted)...');
            const res1 = await fetch(`${API_URL}/projects/${projectId}/transition`, {
                method: 'POST',
                headers: headers(installerToken),
                body: JSON.stringify({
                    new_status: 'submitted',
                    reason: '[TEST] Installation terminée, soumission pour examen réglementaire'
                })
            });

            if (!res1.ok) {
                const err = await res1.json();
                console.error(`   ❌ Failed: ${err.error || JSON.stringify(err)}`);
                console.error(`   Full Error:`, err);
                return;
            }

            const data1 = await res1.json();
            console.log(`   ✅ ${data1.message}`);
            console.log(`   📝 Audit Signature: ${data1.transition.from} → ${data1.transition.to}\n`);
        }

        // Transition 2: submitted → under_review (by authority)
        console.log('2️⃣  Moving to review (submitted → under_review)...');
        const res2 = await fetch(`${API_URL}/projects/${projectId}/transition`, {
            method: 'POST',
            headers: headers(authorityToken),
            body: JSON.stringify({
                new_status: 'under_review',
                reason: '[TEST] Dossier reçu, début de l\'examen technique par l\'autorité'
            })
        });

        if (!res2.ok) {
            const err = await res2.json();
            console.error(`   ❌ Failed: ${err.error}`);
            return;
        }

        const data2 = await res2.json();
        console.log(`   ✅ ${data2.message}`);
        console.log(`   📝 Audit Signature: ${data2.transition.from} → ${data2.transition.to}\n`);

        // Transition 3: under_review → validated (by authority)
        console.log('3️⃣  Validating project (under_review → validated)...');
        const res3 = await fetch(`${API_URL}/projects/${projectId}/transition`, {
            method: 'POST',
            headers: headers(authorityToken),
            body: JSON.stringify({
                new_status: 'validated',
                reason: '[TEST] Conformité NS 01-001 vérifiée, projet validé par l\'autorité'
            })
        });

        if (!res3.ok) {
            const err = await res3.json();
            console.error(`   ❌ Failed: ${err.error}`);
            return;
        }

        const data3 = await res3.json();
        console.log(`   ✅ ${data3.message}`);
        console.log(`   📝 Audit Signature: ${data3.transition.from} → ${data3.transition.to}\n`);

        console.log('🎉 STATE MACHINE TEST COMPLETE!');
        console.log('👉 Check the UI to see:');
        console.log('   - Regulatory Status Badge (should show "VALIDATED" in green)');
        console.log('   - Audit Tab (3 state transition entries with SHA-256 signatures)');
        console.log('   - "Archive" button should now be available\n');

    } catch (err) {
        console.error('❌ Test Error:', err.message);
    } finally {
        await pool.end();
    }
}

testStateMachine();
