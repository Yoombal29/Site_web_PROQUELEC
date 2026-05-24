/**
 * Script pour tester l'accès à toutes les pages via le BE BUILDER
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Pages existantes dans pages_list.txt
const PAGES_FROM_LIST = [
    { id: '86d884df-af3b-4f7d-9d1d-0867db9b45b9', title: 'À propos de PROQUELEC', slug: 'about' },
    { id: '460716d7-35a5-4125-8724-c00834ce7014', title: 'Nos Activités', slug: 'activities' },
    { id: 'b3b5e646-4308-47e7-87b4-5da2bca7ea4f', title: 'Certifications PROQUELEC', slug: 'certifications' },
    { id: 'ae9cbebd-b7ba-411a-867c-eaff38b9f257', title: 'Documents & Ressources', slug: 'documents' },
    { id: '009dabdb-6642-451c-a1f3-a6bf94147d0e', title: 'Événements PROQUELEC', slug: 'events' },
    { id: '968e8972-0240-403f-a720-f0823bd7d3cf', title: 'Blog PROQUELEC', slug: 'blog' },
    { id: '518f3467-402f-4cd0-9d1c-9afbd87c55a0', title: 'Nos Labels de Qualité', slug: 'labels' },
    { id: '78502d8a-faf1-45bd-8c44-b3a39bbe2d84', title: 'Contact PROQUELEC', slug: 'contact' },
    { id: '764bf968-dcdc-4d6c-9e94-0121f441ad63', title: 'Formations PROQUELEC', slug: 'formations-proquelec' },
    { id: 'e0a75f20-3465-4aa9-9a16-75c6dc978079', title: 'Actualités', slug: 'actualites' },
    { id: '6219a5b0-02e2-4b63-8e36-33e5826c9b19', title: 'Formations', slug: 'formations' },
    { id: '4cf68e4e-d091-4334-b826-7538f509a11c', title: 'Événements', slug: 'evenements' },
    { id: 'f2f4244c-00f0-4d12-8a58-7d82752dc239', title: 'Nos Produits', slug: 'produits' }
];

async function testBuilderAccess() {
    const client = await pool.connect();
    
    try {
        console.log('🧪 Test d\'accès aux pages via le BE BUILDER...\n');
        
        console.log('📋 URLs du BE BUILDER pour chaque page:');
        console.log('─────────────────────────────────────────');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const page of PAGES_FROM_LIST) {
            // Vérifier que la page existe dans la DB
            const { rows: dbPages } = await client.query(
                'SELECT id, title, slug FROM pages WHERE id = $1 OR slug = $2',
                [page.id, page.slug]
            );
            
            if (dbPages.length > 0) {
                const dbPage = dbPages[0];
                const builderUrl = `/admin/builder/${dbPage.slug}`;
                const builderUrlById = `/admin/builder/${dbPage.id}`;
                
                console.log(`✅ /${dbPage.slug} (${dbPage.title})`);
                console.log(`   Builder URL (slug): ${builderUrl}`);
                console.log(`   Builder URL (ID):   ${builderUrlById}`);
                console.log(`   ID en DB: ${dbPage.id}`);
                console.log(`   ID attendu: ${page.id}`);
                console.log(`   ID match: ${dbPage.id === page.id ? '✅' : '❌'}`);
                console.log();
                
                if (dbPage.id === page.id) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } else {
                console.log(`❌ /${page.slug} (${page.title}) - Page non trouvée dans la DB`);
                console.log();
                errorCount++;
            }
        }
        
        console.log('─────────────────────────────────────────');
        console.log(`📊 Résultat: ${successCount} succès, ${errorCount} erreurs`);
        
        if (errorCount === 0) {
            console.log('✅ Toutes les pages sont correctement alignées pour le BE BUILDER!');
        } else {
            console.log('⚠️ Certaines pages ont des problèmes d\'alignement');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

testBuilderAccess().catch(console.error);
