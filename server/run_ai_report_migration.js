// Script pour ajouter les colonnes AI report
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
    try {
        console.log('🔧 Ajout des colonnes AI report...\n');

        const sql = fs.readFileSync('server/migrations/20260214_ai_report_columns.sql', 'utf8');

        await pool.query(sql);

        console.log('✅ Migration terminée avec succès!');
        console.log('   - Colonne ai_report ajoutée');
        console.log('   - Colonne ai_report_generated_at ajoutée\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
    } finally {
        await pool.end();
    }
}

runMigration();
