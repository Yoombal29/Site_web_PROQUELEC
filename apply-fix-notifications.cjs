const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5437,
  user: 'postgres',
  password: 'proquelec_secure_db_pass',
  database: 'proquelec'
});

async function applyFix() {
  try {
    console.log('Connexion à PostgreSQL...');
    await client.connect();
    
    console.log('Lecture du script SQL...');
    const sql = fs.readFileSync('./scripts/fix-notifications.sql', 'utf-8');
    
    console.log('Exécution du script...');
    await client.query(sql);
    
    console.log('✅ Fix appliqué avec succès!');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await client.end();
  }
}

applyFix();
