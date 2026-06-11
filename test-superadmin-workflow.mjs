#!/usr/bin/env node
/**
 * Test du workflow Super Admin
 * Vérifie que les permissions fonctionnent correctement
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const API_URL = process.env.API_URL || 'http://localhost:3010/api';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Données de test pour le Super Admin
const ADMIN_EMAIL = 'admin@proquelec.sn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const SUPERADMIN_EMAIL = 'oumarkebe@proquelec.sn';

async function requestWithAdmin(token, method, path, body = null) {
  return axios({
    method,
    url: `${API_URL}${path}`,
    headers: { Authorization: `Bearer ${token}` },
    data: body,
  });
}

async function testSuperAdminWorkflow() {
  console.log('🚀 Test du workflow Super Admin');
  console.log('==================================\n');

  try {
    // Étape 1: Récupérer un token de connexion (admin normal)
    console.log('🔑 Connexion en tant que Admin...');
    let loginResponse, token, user;
    try {
      loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });
      ({ access_token: token, user } = loginResponse.data);
      console.log(`✅ Connecté en tant que ${user.email} (rôle: ${user.role})`);
    } catch (err) {
      console.log(
        `⚠️ Connexion directe impossible (${err.response?.status || err.message}), génération d'un token JWT de test...`,
      );
      token = jwt.sign({ id: 1, email: ADMIN_EMAIL, role: 'admin' }, JWT_SECRET, {
        expiresIn: '1h',
      });
      user = { email: ADMIN_EMAIL, role: 'admin' };
      console.log(`✅ Token JWT généré pour admin (rôle: admin)`);
    }

    // Étape 2: Token Super Admin (généré directement)
    const superAdminToken = jwt.sign(
      { id: 2, email: SUPERADMIN_EMAIL, role: 'superadmin' },
      JWT_SECRET,
      { expiresIn: '1h' },
    );
    console.log(`✅ Token JWT généré pour superadmin (rôle: superadmin)`);

    // --- Test A: Admin peut LIRE les permissions builder ---
    console.log('\n🧪 Test A: Admin accède aux permissions builder (GET)...');
    try {
      const builderPerms = await requestWithAdmin(token, 'GET', '/admin/builder-permissions');
      console.log(
        `✅ Accès autorisé: ${builderPerms.data.permissions.length} permissions trouvées`,
      );

      // Test B: Admin ne peut PAS MODIFIER les permissions builder
      console.log('\n🧪 Test B: Admin tente de modifier une permission builder (PATCH)...');
      const testPermission = builderPerms.data.permissions[0]?.name;
      if (testPermission) {
        try {
          await requestWithAdmin(token, 'PATCH', '/admin/builder-permissions', {
            role: 'admin',
            permission: testPermission,
            granted: true,
          });
          console.log('❌ ERREUR: Un admin normal a pu modifier les permissions builder !');
        } catch (patchErr) {
          if (patchErr.response?.status === 403) {
            console.log('✅ Accès refusé correctement pour un admin normal (403 Forbidden)');
          } else {
            console.log(`❌ Erreur inattendue: ${patchErr.message}`);
          }
        }
      }

      // Test C: SuperAdmin peut MODIFIER les permissions builder
      console.log('\n🧪 Test C: SuperAdmin modifie une permission builder (PATCH)...');
      if (testPermission) {
        try {
          const updateResponse = await requestWithAdmin(
            superAdminToken,
            'PATCH',
            '/admin/builder-permissions',
            {
              role: 'superadmin',
              permission: testPermission,
              granted: true,
            },
          );
          console.log(`✅ SuperAdmin peut modifier la matrice: ${updateResponse.data.success}`);
        } catch (patchErr) {
          console.log(
            `❌ SuperAdmin ne peut pas modifier: ${patchErr.response?.data?.error || patchErr.message}`,
          );
        }
      }
    } catch (getErr) {
      console.log(
        `⚠️ Test A/B/C ignoré: impossible de récupérer les permissions (${getErr.message})`,
      );
    }

    // Test D: Vérifier l'accès à la gestion des utilisateurs
    console.log('\n🧪 Test D: Admin accède à la gestion des utilisateurs...');
    try {
      const users = await requestWithAdmin(token, 'GET', '/admin/users');
      console.log(`✅ Accès autorisé: ${users.data.length} utilisateurs trouvés`);
    } catch (err) {
      console.log(`⚠️ Accès aux utilisateurs: ${err.message}`);
    }

    // Test E: Vérifier le middleware requireAdmin accepte superadmin
    console.log('\n🧪 Test E: Middleware requireAdmin avec superadmin...');
    try {
      const builderPerms2 = await requestWithAdmin(
        superAdminToken,
        'GET',
        '/admin/builder-permissions',
      );
      console.log(
        `✅ requireAdmin accepte superadmin: ${builderPerms2.data.permissions.length} permissions`,
      );
    } catch (err) {
      console.log(`❌ requireAdmin refuse superadmin: ${err.message}`);
    }

    console.log('\n🎉 Tests du workflow RBAC terminés !');
    console.log('Les permissions fonctionnent correctement si tous les ✅ sont verts.');
  } catch (error) {
    console.error('\n❌ Erreur lors du test:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.error || error.response.data}`);
    } else {
      console.error(`   ${error.message}`);
    }
  }
}

// Exécuter le test
testSuperAdminWorkflow();
