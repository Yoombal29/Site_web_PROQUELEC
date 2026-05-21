// DIRECT DB APPROACH (Bypassing Auth API since routes don't exist publicly)
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const API_URL = 'http://localhost:3000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

async function simulate() {
    try {
        console.log('🔄 Simulation Started (Direct DB Mode)...');

        // 1. CREATE INSPECTOR USER DIRECTLY IN DB
        const email = 'inspector_sim_direct@proquelec.sn';
        const password = 'password123';
        const passwordHash = await bcrypt.hash(password, 10);

        let userId;
        try {
            const userRes = await pool.query(
                `INSERT INTO public.users (email, password_hash, role, is_active)
                 VALUES ($1, $2, 'installer', true)
                 ON CONFLICT (email) DO UPDATE SET password_hash = $2
                 RETURNING id`,
                [email, passwordHash]
            );
            userId = userRes.rows[0].id;
            console.log(`✅ Inspector Created/Updated (ID: ${userId})`);
        } catch (e) {
            console.error('❌ User Creation Failed:', e.message);
            return;
        }

        // 2. GENERATE TOKEN (mimicking what the server does)
        const token = jwt.sign({ id: userId, email, role: 'installer' }, JWT_SECRET, { expiresIn: '7d' });
        console.log('✅ Token Generated.');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 3. GET LAST PROJECT
        const projRes = await fetch(`${API_URL}/projects`, { headers });
        if (!projRes.ok) throw new Error('Failed to fetch projects');
        const projects = await projRes.json();
        const lastProject = projects[0];

        if (!lastProject) {
            console.error('❌ No projects found! Please create a project first via the UI.');
            return;
        }
        console.log(`📂 Inspecting Project: "${lastProject.title}" (ID: ${lastProject.id})`);

        // 4. GET CHECKLIST
        const checkRes = await fetch(`${API_URL}/checklists`, { headers });
        if (!checkRes.ok) throw new Error('Failed to fetch checklists');
        const checklists = await checkRes.json();
        const checklist = checklists.find(c => c.category === 'residentiel') || checklists[0];

        if (!checklist) {
            console.error('❌ No checklist template found.');
            return;
        }
        console.log(`📋 Using Checklist: "${checklist.title}"`);

        // 5. GET ITEMS
        const itemsRes = await fetch(`${API_URL}/checklists/${checklist.id}/items`, { headers });
        const items = await itemsRes.json();
        console.log(`📝 Checking ${items.length} points...`);

        // 6. GENERATE RESULTS (Realistic Simulation)
        const results = items.map(item => {
            const section = (item.section || 'General').toLowerCase();
            let isCompliant = true;

            // Realistic scenario: 
            // - Grounding (Terre) -> 95% OK
            // - Protection -> 80% OK
            // - Wiring/Prises -> 40% OK (Critical!)
            if (section.includes('terre') || section.includes('ground')) {
                isCompliant = Math.random() > 0.05; // 95%
            } else if (section.includes('protection') || section.includes('tableau')) {
                isCompliant = Math.random() > 0.2; // 80%
            } else if (section.includes('prise') || section.includes('fil') || section.includes('cable')) {
                isCompliant = Math.random() > 0.6; // 40% (Bad!)
            }

            return {
                item_id: item.id,
                value: { answer: isCompliant },
                is_compliant: isCompliant,
                comment: isCompliant ? 'Conforme NS 01-001' : '⚠️ Non-conforme: Risque détecté'
            };
        });

        // 7. SUBMIT INSPECTION → TRIGGERS AUTHORITY ENGINE
        console.log('🚀 Submitting Inspection Report...');
        const submitRes = await fetch(`${API_URL}/inspections`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                project_id: lastProject.id,
                checklist_id: checklist.id,
                location_gps: { lat: 14.7167, lng: -17.4677 },
                results
            })
        });

        if (!submitRes.ok) {
            const err = await submitRes.json();
            throw new Error(`Submission Failed: ${err.error || submitRes.statusText}`);
        }

        const inspection = await submitRes.json();
        console.log(`🎉 INSPECTION SUCCESS (ID: ${inspection.id})`);
        console.log(`✅ Compliance Score Recalculated with BREAKDOWN.`);
        console.log(`✅ Audit Trail Entry Created.`);
        console.log(`👉 Check the UI (Project Detail > left sidebar) to see the Breakdown visualization!`);
        console.log(`👉 Also check theAudit tab for the audit trail!`);

    } catch (err) {
        console.error('❌ Simulation Error:', err.message);
    } finally {
        await pool.end();
    }
}

simulate();
