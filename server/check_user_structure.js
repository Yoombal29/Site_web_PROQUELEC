const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkUserStructure() {
    try {
        // Vérifier la structure de la table users
        const columnsResult = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);

        console.log('Structure de la table users:');
        columnsResult.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
        });

        // Rechercher l'utilisateur
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            ['oumarkebe@proquelec.sn']
        );

        if (userResult.rows.length > 0) {
            console.log('\n✅ Utilisateur trouvé:');
            const user = userResult.rows[0];
            console.log('Colonnes disponibles:', Object.keys(user));
            console.log('Email:', user.email);
            console.log('Username:', user.username || 'N/A');
        } else {
            console.log('\n❌ Utilisateur non trouvé avec cet email.');

            // Lister tous les emails
            const allUsers = await pool.query('SELECT id, email, username FROM users LIMIT 10');
            console.log('\nPremiers utilisateurs dans la base:');
            allUsers.rows.forEach(u => {
                console.log(`  - ${u.email} (ID: ${u.id})`);
            });
        }

    } catch (err) {
        console.error('Erreur:', err.message);
    } finally {
        await pool.end();
    }
}

checkUserStructure();
