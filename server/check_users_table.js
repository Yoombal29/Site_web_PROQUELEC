const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkUsersTable() {
    try {
        // Vérifier la structure de la table users
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);

        console.log('Structure de la table users:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });

        // Vérifier si l'utilisateur existe
        const userResult = await pool.query(
            'SELECT id, email, username FROM users WHERE email = $1',
            ['oumarkebe@proquelec.sn']
        );

        if (userResult.rows.length > 0) {
            console.log('\nUtilisateur trouvé:', userResult.rows[0]);
        } else {
            console.log('\nUtilisateur non trouvé avec cet email.');
        }
    } catch (err) {
        console.error('Erreur:', err);
    } finally {
        await pool.end();
    }
}

checkUsersTable();
