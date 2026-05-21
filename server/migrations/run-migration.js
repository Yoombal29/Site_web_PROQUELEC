const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'proquelec',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

async function runMigration(migrationFile) {
    const migrationPath = path.join(__dirname, migrationFile);

    if (!fs.existsSync(migrationPath)) {
        console.error(`❌ Migration file not found: ${migrationPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log(`🚀 Running migration: ${migrationFile}`);

    try {
        await pool.query(sql);
        console.log(`✅ Migration completed successfully: ${migrationFile}`);
    } catch (error) {
        console.error(`❌ Migration failed: ${migrationFile}`);
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

const migrationFile = process.argv[2];

if (!migrationFile) {
    console.error('Usage: node run-migration.js <migration-file.sql>');
    process.exit(1);
}

runMigration(migrationFile);
