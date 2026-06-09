const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const sqlPath = __dirname + '/create_cossuel_tables.sql';
if (!fs.existsSync(sqlPath)) {
  console.error('Fichier SQL introuvable:', sqlPath);
  process.exit(2);
}

const sql = fs.readFileSync(sqlPath, 'utf8');
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL introuvable dans .env');
  process.exit(2);
}

const pool = new Pool({ connectionString });

(async () => {
  const client = await pool.connect();
  try {
    console.log('Exécution du script SQL:', sqlPath);
    await client.query(sql);
    console.log('✅ Tables COSSUEL créées / vérifiées avec succès.');
  } catch (e) {
    console.error('Erreur lors de l\'exécution du script SQL:', e.message || e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
