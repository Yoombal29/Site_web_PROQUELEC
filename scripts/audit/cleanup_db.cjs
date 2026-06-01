const path = require('path');
const { Pool } = require(path.join(__dirname, 'server', 'node_modules', 'pg'));
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
    console.log("=== NETTOYAGE BASE DE DONNÉES ===\n");

    // 1. Supprimer le doublon de site_settings (garder id=1)
    const ss = await pool.query("SELECT id, site_name, updated_at FROM site_settings ORDER BY id");
    console.log("[site_settings] Lignes trouvées:", ss.rows.length);
    ss.rows.forEach(r => console.log(`  id=${r.id}: "${r.site_name}" (updated: ${r.updated_at})`));

    if (ss.rows.length > 1) {
        await pool.query("DELETE FROM site_settings WHERE id != 1");
        console.log("  ✅ Doublons supprimés, seul id=1 conservé.\n");
    }

    // 2. Nettoyer construction_mode (garder seulement la dernière entrée)
    const cm = await pool.query("SELECT count(*) as c FROM construction_mode");
    console.log(`[construction_mode] ${cm.rows[0].c} lignes trouvées`);

    if (parseInt(cm.rows[0].c) > 1) {
        // Garder la ligne avec l'id le plus grand (la plus récente)
        const latest = await pool.query("SELECT id FROM construction_mode ORDER BY id DESC LIMIT 1");
        const keepId = latest.rows[0].id;
        const del = await pool.query("DELETE FROM construction_mode WHERE id != $1", [keepId]);
        console.log(`  ✅ ${del.rowCount} lignes supprimées, seul id=${keepId} conservé.\n`);
    }

    // Vérification
    const ss2 = await pool.query("SELECT count(*) as c FROM site_settings");
    const cm2 = await pool.query("SELECT count(*) as c FROM construction_mode");
    console.log("\n=== VÉRIFICATION ===");
    console.log(`  site_settings: ${ss2.rows[0].c} ligne(s)`);
    console.log(`  construction_mode: ${cm2.rows[0].c} ligne(s)`);

    await pool.end();
    console.log("\n✅ Nettoyage DB terminé.");
})();
