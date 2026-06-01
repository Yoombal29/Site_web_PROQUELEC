const { Pool } = require('pg');
require('dotenv').config({ path: './.env' }); // Adjust path if needed

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function audit() {
    try {
        console.log("=== AUDIT GLOBAL DE SYNCHRONISATION ===");

        // 1. Check site_settings columns
        console.log("\n[1] Vérification de la table 'site_settings'...");
        const settingsCols = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'site_settings'
        `);
        const cols = settingsCols.rows.map(r => r.column_name);

        const expectedCols = [
            'site_name', 'slogan', 'logo_url',
            'contact_email', 'phone_number', 'address',
            'facebook_url', 'linkedin_url',
            'cta_primary_text', 'cta_primary_url',
            'audience_section_title', 'audience_desc_electrician'
        ];

        const missing = expectedCols.filter(c => !cols.includes(c));
        if (missing.length === 0) {
            console.log("✅ Toutes les colonnes attendues sont présentes.");
        } else {
            console.error("❌ Colonnes manquantes:", missing);
        }

        // 2. Check content of site_settings
        console.log("\n[2] Vérification du contenu 'site_settings'...");
        const settings = await pool.query("SELECT * FROM site_settings LIMIT 1");
        if (settings.rows.length > 0) {
            const row = settings.rows[0];
            console.log("   - Site Name:", row.site_name);
            console.log("   - CTA Primary:", row.cta_primary_text || "(vide)", "->", row.cta_primary_url || "(vide)");
            console.log("   - Audience Title:", row.audience_section_title || "(vide)");
        } else {
            console.error("❌ Aucune donnée dans site_settings!");
        }

        // 3. Check download_buttons table
        console.log("\n[3] Vérification de la table 'download_buttons'...");
        const buttonsTable = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'download_buttons'
        `);

        if (buttonsTable.rows.length > 0) {
            console.log("✅ Table 'download_buttons' existe.");
            const buttons = await pool.query("SELECT count(*) as count FROM download_buttons");
            console.log("   - Nombre de boutons configurés:", buttons.rows[0].count);
        } else {
            console.error("❌ Table 'download_buttons' INEXISTANTE.");
            console.log("   -> Cela signifie que la page 'Bouton de Téléchargement' ne fonctionnera pas.");
        }

    } catch (err) {
        console.error("FATAL ERROR during audit:", err);
    } finally {
        await pool.end();
    }
}

audit();
