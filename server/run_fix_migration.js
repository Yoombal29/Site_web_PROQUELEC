const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js');

async function runMigration() {
    const filePath = path.join(__dirname, 'migrations', '20260213_fix_inspection_unique.sql');
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
        console.log('✅ FIX Migration successful! Unique constraint added.');
    } catch (err) {
        if (err.code === '42710') { console.log('✅ Constraint is already there.'); }
        else { console.error('❌ Migration failed:', err); }
    } finally {
        await pool.end();
    }
}
runMigration();
