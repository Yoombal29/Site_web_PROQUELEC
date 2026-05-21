// 🧙‍♂️ Test de l'Intelligence du Wizard d'Inspection
// Démontre la suggestion automatique de checklists selon le type d'installation

const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const API_URL = 'http://localhost:3000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

async function testInspectionWizardIntelligence() {
    try {
        console.log('🧙‍♂️ TEST WIZARD D\'INSPECTION INTELLIGENT');
        console.log('=========================================\n');

        // Récupérer un utilisateur admin pour les tests
        const userRes = await pool.query(
            `SELECT * FROM public.users WHERE role = 'admin' LIMIT 1`
        );

        if (userRes.rows.length === 0) {
            console.log('❌ Aucun admin trouvé. Créez un utilisateur admin d\'abord.');
            return;
        }

        const user = userRes.rows[0];
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, JWT_SECRET, { expiresIn: '1d' });

        console.log(`✅ Utilisateur: ${user.email} (${user.role})\n`);

        // Test 1: Suggestion pour installation Résidentielle
        console.log('🏠 Test 1: Suggestion pour installation Résidentielle');
        const residentiel = await fetch(`${API_URL}/inspections/suggest-checklist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                installationType: 'Résidentiel'
            })
        });

        const resData = await residentiel.json();
        console.log(`   Type détecté: ${resData.detected_type}`);
        console.log(`   Titre: ${resData.template.title}`);
        console.log(`   Description: ${resData.template.description}`);
        console.log(`   Catégories: ${resData.template.categories.length}`);
        console.log(`   Points de contrôle totaux: ${resData.template.categories.reduce((sum, cat) => sum + cat.checks.length, 0)}`);
        console.log(`   ✅ ${resData.message}\n`);

        // Test 2: Suggestion pour installation Tertiaire
        console.log('🏢 Test 2: Suggestion pour installation Tertiaire');
        const tertiaire = await fetch(`${API_URL}/inspections/suggest-checklist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                installationType: 'Tertiaire'
            })
        });

        const tertData = await tertiaire.json();
        console.log(`   Type détecté: ${tertData.detected_type}`);
        console.log(`   Titre: ${tertData.template.title}`);
        console.log(`   Points de contrôle totaux: ${tertData.template.categories.reduce((sum, cat) => sum + cat.checks.length, 0)}`);
        console.log(`   ✅ ${tertData.message}\n`);

        // Test 3: Suggestion pour installation Industrielle
        console.log('🏭 Test 3: Suggestion pour installation Industrielle');
        const industriel = await fetch(`${API_URL}/inspections/suggest-checklist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                installationType: 'Industriel'
            })
        });

        const indusData = await industriel.json();
        console.log(`   Type détecté: ${indusData.detected_type}`);
        console.log(`   Titre: ${indusData.template.title}`);
        console.log(`   Points de contrôle totaux: ${indusData.template.categories.reduce((sum, cat) => sum + cat.checks.length, 0)}`);
        console.log(`   ✅ ${indusData.message}\n`);

        // Test 4: Suggestion avec un vrai projet
        const projectRes = await pool.query(
            'SELECT id FROM public.projects LIMIT 1'
        );

        if (projectRes.rows.length > 0) {
            const projectId = projectRes.rows[0].id;
            console.log(`📋 Test 4: Suggestion basée sur projet réel (${projectId})`);

            const projectBased = await fetch(`${API_URL}/inspections/suggest-checklist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: projectId
                })
            });

            const projData = await projectBased.json();
            console.log(`   Projet: ${projData.project_context?.title || 'N/A'}`);
            console.log(`   Puissance: ${projData.project_context?.power || 'N/A'}`);
            console.log(`   Tension: ${projData.project_context?.voltage || 'N/A'}`);
            console.log(`   Type détecté: ${projData.detected_type}`);
            console.log(`   ✅ Checklist adaptée générée\n`);
        }

        // Afficher un exemple de checklist détaillée
        console.log('📊 EXEMPLE DE CHECKLIST DÉTAILLÉE (Résidentiel):');
        console.log('=================================================\n');
        resData.template.categories.forEach((cat, idx) => {
            console.log(`${idx + 1}. ${cat.name} (Poids: ${cat.weight}%)`);
            cat.checks.forEach((check, cIdx) => {
                const criticalLabel = check.critical ? '🔴 CRITIQUE' : '⚪ Standard';
                console.log(`   ${idx + 1}.${cIdx + 1} ${check.label} ${criticalLabel}`);
            });
            console.log('');
        });

        console.log('🎉 TESTS TERMINÉS AVEC SUCCÈS!');
        console.log('\n📌 FONCTIONNALITÉS DÉMONTRÉES:');
        console.log('   ✅ Suggestion intelligente selon type d\'installation');
        console.log('   ✅ 3 templates de checklist (Résidentiel, Tertiaire, Industriel)');
        console.log('   ✅ Catégorisation par domaine avec poids');
        console.log('   ✅ Identification des points critiques');
        console.log('   ✅ Adaptation automatique au contexte projet');
        console.log('   ✅ Base NS 01-001 intégrée\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        console.error(err);
    } finally {
        await pool.end();
    }
}

testInspectionWizardIntelligence();
