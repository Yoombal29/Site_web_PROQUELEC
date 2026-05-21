const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function getAllTables() {
    try {
        // Lister toutes les tables
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('Tables disponibles dans la base de données:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

        // Vérifier si l'email existe dans une table
        console.log('\nRecherche de l\'email oumarkebe@proquelec.sn...');

        // Essayer dans auth_users
        try {
            const authResult = await pool.query(
                'SELECT * FROM auth_users WHERE email = $1',
                ['oumarkebe@proquelec.sn']
            );
            if (authResult.rows.length > 0) {
                console.log('\nTrouvé dans auth_users:');
                console.log(Object.keys(authResult.rows[0]));
            }
        } catch (e) {
            console.log('Table auth_users non trouvée ou erreur:', e.message);
        }

    } catch (err) {
        console.error('Erreur:', err.message);
    } finally {
        await pool.end();
    }
}

getAllTables();
