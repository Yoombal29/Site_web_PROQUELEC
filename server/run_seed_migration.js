const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js');

async function runMigration() {
    const filePath = path.join(__dirname, 'migrations', '20260213_seed_real_checklists.sql');
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
        console.log('✅ SEED Migration successful! Real NS 01-001 Checklists inserted.');
    } catch (err) {
        if (String(err).includes('already exists')) { console.log('✅ Seed already applied (or partial).'); }
        else { console.error('❌ Seeding failed:', err); }
    } finally {
        await pool.end();
    }
}
runMigration();
