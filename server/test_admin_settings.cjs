const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const API_URL = 'http://localhost:3000/api/site-settings';
const SECRET_KEY = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;

async function runTests() {
    try {
        console.log("🔍 [STEP 1] Finding an Admin User...");
        const adminRes = await pool.query("SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1");

        let adminUser = adminRes.rows[0];
        if (!adminUser) {
            console.log("⚠️ No admin found. Creating a temporary test admin...");
            // This assumes users table exists. If not, it will fail.
            const insertRes = await pool.query(
                "INSERT INTO users (email, password_hash, role, is_active, created_at) VALUES ('testadmin@proquelec.sn', 'HASH', 'admin', true, NOW()) RETURNING id, email, role"
            );
            adminUser = insertRes.rows[0];
        }
        console.log(`✅ Admin User Found: ID=${adminUser.id}, Email=${adminUser.email}`);

        console.log("🔑 [STEP 2] Generating JWT Token...");
        const token = jwt.sign(
            { id: adminUser.id, email: adminUser.email, role: adminUser.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        console.log("✅ Token Generated.");

        console.log("📝 [STEP 3] Updating ALL Site Settings via API...");
        const newSettings = {
            site_name: "PROQUELEC TEST " + Date.now(),
            slogan: "Test Slogan Updated",
            audience_section_title: "TEST Services Sur-Mesure",
            audience_desc_electrician: "Updated Description Electrician TEST",
            audience_desc_company: "Updated Description Company TEST",
            audience_desc_member: "Updated Description Member TEST",
            // Add more if needed, but these verify the new columns works
        };

        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newSettings)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API PUT Failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const updatedData = await response.json();
        console.log("✅ API Update Success!");

        console.log("👀 [STEP 4] Verifying Data Persistence...");
        // Fetch again to be sure
        const verifyRes = await fetch(API_URL);
        const verifyData = await verifyRes.json();
        /* handle array or object response */
        const currentSettings = Array.isArray(verifyData) ? verifyData[0] : verifyData;

        let allMatch = true;
        if (currentSettings.site_name !== newSettings.site_name) {
            console.error("❌ Mismatch: site_name");
            allMatch = false;
        }
        if (currentSettings.audience_section_title !== newSettings.audience_section_title) {
            console.error(`❌ Mismatch: audience_section_title (Expected: ${newSettings.audience_section_title}, Got: ${currentSettings.audience_section_title})`);
            allMatch = false;
        }
        if (currentSettings.audience_desc_electrician !== newSettings.audience_desc_electrician) {
            console.error("❌ Mismatch: audience_desc_electrician");
            allMatch = false;
        }

        if (allMatch) {
            console.log("🎉 SUCCESS: All settings updated and verified correctly!");
            console.log("   -> You can check the website now. The header title should be: " + newSettings.site_name);
            console.log("   -> The Audience section title should be: " + newSettings.audience_section_title);
        } else {
            console.error("❌ FAILURE: Verification failed.");
        }

    } catch (err) {
        console.error("❌ TEST FAILED:", err);
    } finally {
        await pool.end();
    }
}

runTests();
