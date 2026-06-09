// Complete GED System Audit Script
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function auditGEDSystem() {
    console.log('🔍 AUDIT COMPLET DU SYSTÈME GED\n');
    console.log('='.repeat(60));

    const results = {
        database: { passed: 0, failed: 0, warnings: [] },
        api: { passed: 0, failed: 0, warnings: [] },
        ui: { passed: 0, failed: 0, warnings: [] }
    };

    try {
        // ============================================
        // 1. DATABASE AUDIT
        // ============================================
        console.log('\n📊 1. AUDIT BASE DE DONNÉES\n');

        // Check required tables
        const requiredTables = [
            'users',
            'media_files',
            'user_groups',
            'user_group_members',
            'document_permissions',
            'audit_logs'
        ];

        for (const table of requiredTables) {
            const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);

            if (result.rows[0].exists) {
                console.log(`   ✅ Table '${table}' existe`);
                results.database.passed++;
            } else {
                console.log(`   ❌ Table '${table}' MANQUANTE`);
                results.database.failed++;
            }
        }

        // Check media_files columns for versioning
        const versionColumns = ['version', 'parent_version_id', 'is_latest', 'version_comment'];
        const columns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'media_files'
    `);
        const columnNames = columns.rows.map(r => r.column_name);

        console.log('\n   Colonnes de versioning:');
        for (const col of versionColumns) {
            if (columnNames.includes(col)) {
                console.log(`   ✅ Colonne '${col}' présente`);
                results.database.passed++;
            } else {
                console.log(`   ❌ Colonne '${col}' MANQUANTE`);
                results.database.failed++;
            }
        }

        // Check functions
        const requiredFunctions = [
            'user_has_permission',
            'get_document_versions',
            'increment_version',
            'log_audit',
            'get_document_audit_trail',
            'get_user_activity'
        ];

        console.log('\n   Fonctions SQL:');
        for (const func of requiredFunctions) {
            const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM pg_proc 
          WHERE proname = $1
        )
      `, [func]);

            if (result.rows[0].exists) {
                console.log(`   ✅ Fonction '${func}' existe`);
                results.database.passed++;
            } else {
                console.log(`   ❌ Fonction '${func}' MANQUANTE`);
                results.database.failed++;
            }
        }

        // Check triggers
        const triggers = await pool.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_name LIKE '%audit%' OR trigger_name LIKE '%version%'
    `);

        console.log(`\n   Triggers automatiques: ${triggers.rows.length}`);
        triggers.rows.forEach(t => {
            console.log(`   ✅ ${t.trigger_name} sur ${t.event_object_table}`);
            results.database.passed++;
        });

        // ============================================
        // 2. API ROUTES AUDIT
        // ============================================
        console.log('\n\n🔌 2. AUDIT API ROUTES\n');

        const routeFiles = [
            'server/routes/permissions.js',
            'server/routes/versions.js',
            'server/routes/audit.js'
        ];

        for (const file of routeFiles) {
            const fullPath = path.join(process.cwd(), file);
            if (fs.existsSync(fullPath)) {
                console.log(`   ✅ ${file} existe`);
                results.api.passed++;

                // Check file content
                const content = fs.readFileSync(fullPath, 'utf8');
                const routes = content.match(/router\.(get|post|put|delete)\(/g) || [];
                console.log(`      → ${routes.length} endpoints définis`);
            } else {
                console.log(`   ❌ ${file} MANQUANT`);
                results.api.failed++;
            }
        }

        // Check server registration
        const serverPath = path.join(process.cwd(), 'server/index.js');
        const serverContent = fs.readFileSync(serverPath, 'utf8');

        console.log('\n   Enregistrement dans server/index.js:');
        const registrations = [
            { name: 'permissions', pattern: /app\.use\(['"]\/api\/permissions/ },
            { name: 'versions', pattern: /app\.use\(['"]\/api\/versions/ },
            { name: 'audit', pattern: /app\.use\(['"]\/api\/audit/ }
        ];

        for (const reg of registrations) {
            if (reg.pattern.test(serverContent)) {
                console.log(`   ✅ Route '/api/${reg.name}' enregistrée`);
                results.api.passed++;
            } else {
                console.log(`   ❌ Route '/api/${reg.name}' NON ENREGISTRÉE`);
                results.api.failed++;
            }
        }

        // ============================================
        // 3. UI COMPONENTS AUDIT
        // ============================================
        console.log('\n\n🎨 3. AUDIT COMPOSANTS UI\n');

        const uiComponents = [
            'src/components/PermissionEditor.tsx',
            'src/components/VersionHistory.tsx',
            'src/components/AuditViewer.tsx',
            'src/components/DocumentManager.tsx',
            'src/components/AIDocumentChat.tsx'
        ];

        for (const component of uiComponents) {
            const fullPath = path.join(process.cwd(), component);
            if (fs.existsSync(fullPath)) {
                console.log(`   ✅ ${component} existe`);
                results.ui.passed++;
            } else {
                console.log(`   ❌ ${component} MANQUANT`);
                results.ui.failed++;
            }
        }

        // Check DocumentManager integration
        const docManagerPath = path.join(process.cwd(), 'src/components/DocumentManager.tsx');
        const docManagerContent = fs.readFileSync(docManagerPath, 'utf8');

        console.log('\n   Intégration dans DocumentManager:');
        const integrations = [
            { name: 'PermissionEditor import', pattern: /import.*PermissionEditor/ },
            { name: 'VersionHistory import', pattern: /import.*VersionHistory/ },
            { name: 'AuditViewer import', pattern: /import.*AuditViewer/ },
            { name: 'Shield icon', pattern: /<Shield/ },
            { name: 'History icon', pattern: /<History/ },
            { name: 'Activity icon', pattern: /<Activity/ }
        ];

        for (const integration of integrations) {
            if (integration.pattern.test(docManagerContent)) {
                console.log(`   ✅ ${integration.name}`);
                results.ui.passed++;
            } else {
                console.log(`   ❌ ${integration.name} MANQUANT`);
                results.ui.failed++;
            }
        }

        // ============================================
        // 5. SUMMARY
        // ============================================
        console.log('\n\n' + '='.repeat(60));
        console.log('📋 RÉSUMÉ DE L\'AUDIT\n');

        const totalPassed = results.database.passed + results.api.passed + results.ui.passed;
        const totalFailed = results.database.failed + results.api.failed + results.ui.failed;
        const totalTests = totalPassed + totalFailed;

        console.log(`✅ Tests réussis: ${totalPassed}/${totalTests}`);
        console.log(`❌ Tests échoués: ${totalFailed}/${totalTests}`);

        console.log('\nDétails par catégorie:');
        console.log(`  - Base de données: ${results.database.passed}/${results.database.passed + results.database.failed} ✅`);
        console.log(`  - API Routes: ${results.api.passed}/${results.api.passed + results.api.failed} ✅`);
        console.log(`  - UI Components: ${results.ui.passed}/${results.ui.passed + results.ui.failed} ✅`);

        if (totalFailed === 0) {
            console.log('\n🎉 SYSTÈME GED COMPLET ET OPÉRATIONNEL !');
            console.log('✅ Prêt pour déploiement / mise en production');
        } else {
            console.log('\n⚠️  CORRECTIONS NÉCESSAIRES AVANT CONTINuer');
        }

        console.log('\n' + '='.repeat(60));

        return results;

    } catch (error) {
        console.error('❌ Erreur durant l\'audit:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

auditGEDSystem().catch(console.error);
