const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function updatePassword(email, newPassword) {
    try {
        // Générer le hash du nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        const result = await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING id, email',
            [hashedPassword, email]
        );

        if (result.rowCount === 0) {
            console.log(`❌ Utilisateur avec l'email ${email} non trouvé.`);
        } else {
            console.log(`✅ Mot de passe mis à jour avec succès pour ${email}`);
            console.log(`   ID utilisateur: ${result.rows[0].id}`);
            console.log(`   Nouveau mot de passe: ${newPassword}`);
        }
    } catch (err) {
        console.error('❌ Erreur lors de la mise à jour du mot de passe:', err.message);
    } finally {
        await pool.end();
    }
}

// Mettre à jour le mot de passe pour le compte de test
updatePassword('experimental@proquelec.com', 'admin123');
