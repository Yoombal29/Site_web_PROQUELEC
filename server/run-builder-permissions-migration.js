const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runBuilderPermsMigration() {
  try {
    console.log('🔐 Installation des permissions Builder RBAC...\n');

    const migrationPath = path.join(__dirname, 'migrations', '20260606_builder_permissions.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);

    console.log('\n✅ Migration Builder Permissions terminée !');

    // Vérification
    const result = await pool.query(`
      SELECT p.name, p.description,
        (SELECT COUNT(*) FROM public.role_permissions rp WHERE rp.permission_id = p.id) as role_count
      FROM public.permissions p
      WHERE p.category = 'builder'
      ORDER BY p.name
    `);

    console.log('\n📋 Permissions builder installées :');
    result.rows.forEach(row => {
      console.log(`   - ${row.name} (${row.role_count} rôle(s))`);
    });

    // Vérification matrice par rôle
    const matrix = await pool.query(`
      SELECT rp.role, p.name as permission
      FROM public.role_permissions rp
      JOIN public.permissions p ON rp.permission_id = p.id
      WHERE p.category = 'builder'
      ORDER BY rp.role, p.name
    `);

    const roleMatrix = {};
    matrix.rows.forEach(({ role, permission }) => {
      if (!roleMatrix[role]) roleMatrix[role] = [];
      roleMatrix[role].push(permission);
    });

    console.log('\n🎯 Matrice par rôle :');
    Object.entries(roleMatrix).forEach(([role, perms]) => {
      console.log(`   ${role}: ${perms.join(', ')}`);
    });

  } catch (err) {
    console.error('❌ Erreur migration:', err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

runBuilderPermsMigration();
