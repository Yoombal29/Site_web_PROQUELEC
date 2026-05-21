const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js'); // Use established connection

async function runMigration() {
    const filePath = path.join(__dirname, 'migrations', '20260213_create_inspections.sql');
    console.log(`Reading SQL file: ${filePath}`);

    try {
        const sql = fs.readFileSync(filePath, 'utf8');

        console.log('Applying INSPECTION MODULE Migration...');
        await pool.query(sql); // Execute SQL

        console.log('✅ INSPECTION MODULE Migration successful!');
        console.log('Tables "Inspections", "Checklists", "Results" created.');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
