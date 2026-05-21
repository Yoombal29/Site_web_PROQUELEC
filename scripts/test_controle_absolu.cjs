/**
 * 🧪 TEST COMPLET - CONTRÔLE ABSOLU (FINAL)
 * Vérifie toutes les fonctionnalités du panneau d'édition avancée
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000';
const TIMEOUT = 5000; // 5s timeout

// Couleurs pour la console
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let token = null;
let results = [];
let userId = null;
let testPageId = null;

// Config axios par défaut
axios.defaults.timeout = TIMEOUT;

async function login() {
    try {
        const res = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'admin@proquelec.sn',
            password: 'ProQuElec@2025!'
        });
        token = res.data.access_token;
        userId = res.data.user.id;
        console.log(`${GREEN}✅ Authentification réussie (ID: ${userId})${RESET}\n`);
    } catch (e) {
        console.error('Login failed:', e.response ? e.response.data : e.message);
        throw e;
    }
}

function recordTest(name, status, details = '') {
    results.push({ name, status, details });
    const icon = status ? `${GREEN}✅` : `${RED}❌`;
    console.log(`${icon} ${name}${RESET}${details ? ` - ${details}` : ''}`);
}

async function testFeature(name, testFn) {
    try {
        await testFn();
        recordTest(name, true);
    } catch (err) {
        const msg = err.response ?
            `${err.response.status} ${JSON.stringify(err.response.data)}` :
            err.message;
        recordTest(name, false, msg);
    }
}

async function runTests() {
    console.log(`\n${BLUE}🔷 AUDIT COMPLET - CONTRÔLE ABSOLU 🔷${RESET}\n`);
    console.log('='.repeat(60) + '\n');

    // =============================================
    // 1. AUTHENTIFICATION
    // =============================================
    console.log(`${YELLOW}📌 1. AUTHENTIFICATION & SÉCURITÉ${RESET}`);
    await testFeature('Login Admin', login);

    // Test Health au lieu de insights inexistant
    await testFeature('API Health Check', async () => {
        const res = await axios.get(`${API_URL}/api/health`);
        if (res.status !== 200) throw new Error('Status non 200');
    });

    // =============================================
    // 2. GESTION DES PAGES (CRUD)
    // =============================================
    console.log(`\n${YELLOW}📌 2. GESTION DES PAGES (CRUD)${RESET}`);

    await testFeature('Récupérer liste des pages', async () => {
        const res = await axios.get(`${API_URL}/api/pages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!Array.isArray(res.data)) throw new Error('Format invalide');

        // Prendre la première page pour les tests suivants
        if (res.data.length > 0) {
            testPageId = res.data[0].id;
            console.log(`   📝 Page test sélectionnée: ${res.data[0].title} (${testPageId})`);
        }
    });

    if (testPageId) {
        await testFeature('Lire page spécifique (Admin)', async () => {
            const res = await axios.get(`${API_URL}/api/admin/pages/${testPageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.id !== testPageId) throw new Error('ID incorrect');
        });

        await testFeature('Modifier page (ICE Engine)', async () => {
            // Utilisation d'un contenu fictif pour ne pas casser la prod
            const res = await axios.put(`${API_URL}/api/admin/pages/${testPageId}`, {
                content_raw: '<!-- TEST ICE AUTO --> ' + Date.now(),
                design_options: { theme: 'dark_mode_test' }
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (!res.data.version) console.warn('   ⚠️ Warning: Version non retournée');
        });
    } else {
        console.log(`${RED}⚠️ Pas de page disponible, tests suivants annulés.${RESET}`);
    }

    // =============================================
    // 3. PARAMÈTRES & MÉDIAS
    // =============================================
    console.log(`\n${YELLOW}📌 3. PARAMÈTRES & MÉDIAS${RESET}`);

    await testFeature('Lister fichiers médias', async () => {
        const res = await axios.get(`${API_URL}/api/media-files`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    });

    // =============================================
    // 4. INTELLIGENCE ARTIFICIELLE
    // =============================================
    console.log(`\n${YELLOW}📌 4. IA GENERATIVE${RESET}`);

    if (testPageId) {
        await testFeature('AI Code Assistant', async () => {
            const res = await axios.post(`${API_URL}/api/ai-code-assistant`, {
                prompt: 'Génère un bouton bleu',
                currentCode: '<div></div>',
                pageId: testPageId,
                userId: userId,
                provider: 'gemini'
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (!res.data.code) throw new Error('Réponse vide');
            console.log('   🤖 Code généré avec succès');
        });
    }

    await testFeature('AI SEO Analyze', async () => {
        const res = await axios.post(`${API_URL}/api/ai/seo-analyze`, {
            title: 'Test SEO',
            slug: 'test-seo',
            content: 'Contenu riche pour analyse.'
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (!res.data.seo) throw new Error('Pas de données SEO');
        console.log('   🔍 Analyse SEO complétée');
    });

    // =============================================
    // RÉSUMÉ FINAL
    // =============================================
    console.log('\n' + '='.repeat(60));
    const passed = results.filter(r => r.status).length;
    const failed = results.filter(r => !r.status).length;

    console.log(`\n${BLUE}📊 RÉSUMÉ FINAL${RESET}`);
    console.log(`${GREEN}✅ Réussis: ${passed}${RESET}`);
    console.log(`${RED}❌ Échoués: ${failed}${RESET}`);

    if (results.length > 0) {
        console.log(`📈 Score: ${Math.round((passed / results.length) * 100)}%\n`);
    }
}

runTests().catch(e => {
    console.error(`\n${RED}🛑 ERREUR CRITIQUE DU SCRIPT:${RESET}`, e);
});
