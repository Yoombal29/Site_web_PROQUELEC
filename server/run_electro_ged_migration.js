const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js'); // Use the established connection logic

async function runMigration() {
    const filePath = path.join(__dirname, 'migrations', '20260213_create_projects.sql');
    console.log(`Reading SQL file: ${filePath}`);

    try {
        const sql = fs.readFileSync(filePath, 'utf8');

        // Split on semicolons if needed, but simple query() usually handles it
        // Or send as one block
        console.log('Applying ELECTRO-GED 4.0 Migration...');
        const result = await pool.query(sql); // Send the whole SQL string

        console.log('✅ ELECTRO-GED 4.0 Migration successful!');
        console.log('Structure "Projet" & "Compliance" added.');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
