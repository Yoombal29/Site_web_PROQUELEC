const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    console.log('🚀 Starting Office Suite database migration...\n');

    try {
        // Read the SQL migration file
        const sqlPath = path.join(__dirname, 'migrations', 'create_office_documents.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Executing SQL migration...');
        await pool.query(sql);

        console.log('✅ Migration completed successfully!\n');
        console.log('📊 Tables created:');
        console.log('  - office_documents');
        console.log('  - office_document_versions');
        console.log('\n🎉 Office Suite database is ready!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigration();
