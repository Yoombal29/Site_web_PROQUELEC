
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: "postgresql://postgres:proquelec_secure_db_pass@localhost:5433/postgres"
});

async function resetPassword() {
    const email = 'oumarkebe@proquelec.sn';
    const newPassword = 'proquelec2026'; // Mot de passe temporaire

    try {
        console.log(`Initialisation de la réinitialisation pour : ${email}...`);

        // Générer le hash
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hashSync(newPassword, saltRounds);

        // Mettre à jour dans la base de données
        const res = await pool.query(
            'UPDATE public.users SET password_hash = $1, is_active = true WHERE email = $2 RETURNING id',
            [hashedPassword, email]
        );

        if (res.rows.length > 0) {
            console.log(`✅ Succès ! Le mot de passe de ${email} a été mis à jour.`);
            console.log(`🔑 Nouveau mot de passe : ${newPassword}`);
        } else {
            console.log(`❌ Utilisateur ${email} non trouvé dans la base de données.`);
        }
    } catch (err) {
        console.error('Erreur lors de la réinitialisation :', err.message);
    } finally {
        await pool.end();
    }
}

resetPassword();
