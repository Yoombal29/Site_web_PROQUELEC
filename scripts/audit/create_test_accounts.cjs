/**
 * Script de création des comptes test pour chaque type d'utilisateur
 * Usage: node create_test_accounts.cjs
 */
require('dotenv/config');
const { Pool } = require('pg');
const bcrypt = require('./server/node_modules/bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const TEST_ACCOUNTS = [
    { email: 'admin@proquelec.sn', password: 'passepartout', role: 'admin', label: 'Administrateur' },
    { email: 'electricien@proquelec.sn', password: 'passepartout', role: 'electricien', label: 'Électricien' },
    { email: 'entreprise@proquelec.sn', password: 'passepartout', role: 'entreprise', label: 'Entreprise / Professionnel' },
    { email: 'membre@proquelec.sn', password: 'passepartout', role: 'membre', label: 'Membre PROQUELEC' },
    { email: 'partenaire@proquelec.sn', password: 'passepartout', role: 'partner', label: 'Partenaire' },
    { email: 'admin2@proquelec.sn', password: 'passepartout', role: 'secondary_admin', label: 'Admin Secondaire' },
];

async function main() {
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║   CRÉATION DES COMPTES TEST - PROQUELEC          ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    try {
        // Ensure users table has the right columns
        await pool.query(`
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company TEXT;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    `);

        for (const account of TEST_ACCOUNTS) {
            const hash = await bcrypt.hash(account.password, 10);

            // Upsert — update if exists, create if not
            const result = await pool.query(`
        INSERT INTO public.users (email, password_hash, role, is_active, full_name)
        VALUES ($1, $2, $3, true, $4)
        ON CONFLICT (email) DO UPDATE SET
          password_hash = $2,
          role = $3,
          is_active = true,
          full_name = $4
        RETURNING id, email, role
      `, [account.email, hash, account.role, `Test ${account.label}`]);

            const user = result.rows[0];
            console.log(`  ✅ ${account.label.padEnd(25)} → ${user.email} (rôle: ${user.role})`);
        }

        console.log('\n  ───────────────────────────────────────');
        console.log('  📧 Mot de passe commun: passepartout');
        console.log('  ───────────────────────────────────────\n');

        // Show summary
        const allUsers = await pool.query('SELECT id, email, role, is_active FROM public.users ORDER BY role, email');
        console.log('  📋 Tous les utilisateurs en base:');
        allUsers.rows.forEach(u => {
            console.log(`     ${u.is_active ? '🟢' : '🔴'} ${u.email.padEnd(30)} rôle: ${u.role}`);
        });

    } catch (err) {
        console.error('❌ Erreur:', err.message);
    } finally {
        await pool.end();
        console.log('\n  ✅ Terminé.\n');
    }
}

main();
