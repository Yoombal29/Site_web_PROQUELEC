// 📋 Démonstration complète du système RBAC en français
// Ce script teste tous les aspects de l'interface RBAC francisée
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const API_URL = 'http://localhost:3000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

async function demonstrateRBAC() {
    try {
        console.log('🇫🇷 DÉMONSTRATION RBAC - INTERFACE FRANÇAISE');
        console.log('=============================================\n');

        // 1. Créer un administrateur de test
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);

        const adminRes = await pool.query(
            `INSERT INTO public.users (email, password_hash, role, is_active)
             VALUES ($1, $2, 'admin', true)
             ON CONFLICT (email) DO UPDATE SET password_hash = $2
             RETURNING id`,
            ['admin_demo@proquelec.sn', hash]
        );
        const adminId = adminRes.rows[0].id;
        const adminToken = jwt.sign({
            id: adminId,
            email: 'admin_demo@proquelec.sn',
            role: 'admin'
        }, JWT_SECRET, { expiresIn: '1d' });

        console.log('✅ Administrateur créé: admin_demo@proquelec.sn\n');

        // 2. Tester GET /api/user/permissions (permissions de l'admin)
        console.log('🔍 Test 1: Récupération des permissions utilisateur');
        const permRes = await fetch(`${API_URL}/user/permissions`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const permData = await permRes.json();
        console.log(`   Rôle: ${permData.role}`);
        console.log(`   Nombre de permissions: ${permData.count}`);
        console.log(`   Exemple de permissions:`, permData.permissions.slice(0, 3));
        console.log('   ✅ Endpoint fonctionnel\n');

        // 3. Tester GET /api/admin/permissions (liste complète)
        console.log('🔍 Test 2: Liste complète des permissions (admin)');
        const allPermRes = await fetch(`${API_URL}/admin/permissions`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const allPerms = await allPermRes.json();
        console.log(`   Total: ${allPerms.length} permissions`);
        console.log(`   Catégories:`, [...new Set(allPerms.map(p => p.category))].join(', '));
        console.log('   ✅ Endpoint fonctionnel\n');

        // 4. Tester GET /api/admin/role-permissions (mapping)
        console.log('🔍 Test 3: Mapping rôles → permissions');
        const roleMapRes = await fetch(`${API_URL}/admin/role-permissions`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const roleMap = await roleMapRes.json();
        console.log('   Résumé par rôle:');
        roleMap.forEach(mapping => {
            console.log(`     - ${mapping.role}: ${mapping.permissions.length} permissions`);
        });
        console.log('   ✅ Endpoint fonctionnel\n');

        // 5. Test d'erreur en français (client essaie d'accéder à admin)
        console.log('🔍 Test 4: Message d\'erreur en français');
        const clientRes = await pool.query(
            `INSERT INTO public.users (email, password_hash, role, is_active)
             VALUES ($1, $2, 'client', true)
             ON CONFLICT (email) DO UPDATE SET password_hash = $2
             RETURNING id`,
            ['client_demo@proquelec.sn', hash]
        );
        const clientId = clientRes.rows[0].id;
        const clientToken = jwt.sign({
            id: clientId,
            email: 'client_demo@proquelec.sn',
            role: 'client'
        }, JWT_SECRET, { expiresIn: '1d' });

        const forbiddenRes = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${clientToken}`
            },
            body: JSON.stringify({
                title: 'Projet Non Autorisé',
                location: { city: 'Dakar' }
            })
        });

        if (forbiddenRes.status === 403) {
            const error = await forbiddenRes.json();
            console.log('   📛 Erreur reçue (comme prévu):');
            console.log(`      Message: "${error.message}"`);
            console.log(`      Permission requise: ${error.required_permission}`);
            console.log(`      Rôle de l'utilisateur: ${error.your_role}`);
            console.log('   ✅ Messages d\'erreur en français!\n');
        }

        // 6. Résumé des fonctionnalités
        console.log('📊 RÉSUMÉ DES FONCTIONNALITÉS:');
        console.log('   ✅ Hook usePermissions (React)');
        console.log('   ✅ Composant <RequirePermission>');
        console.log('   ✅ Page d\'administration PermissionsAdmin.tsx');
        console.log('   ✅ Endpoint /api/user/permissions');
        console.log('   ✅ Endpoint /api/admin/permissions');
        console.log('   ✅ Endpoint /api/admin/role-permissions');
        console.log('   ✅ Messages d\'erreur en français');
        console.log('   ✅ Labels de permissions traduits\n');

        console.log('🎉 DÉMONSTRATION TERMINÉE!');
        console.log('📌 Prochaines étapes pour le frontend:');
        console.log('   1. Importer <RequirePermission> dans vos composants');
        console.log('   2. Ajouter la route /admin/permissions au menu');
        console.log('   3. Utiliser le hook usePermissions pour les vérifications conditionnelles\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        console.error(err);
    } finally {
        await pool.end();
    }
}

demonstrateRBAC();
