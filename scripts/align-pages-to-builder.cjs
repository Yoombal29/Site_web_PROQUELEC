/**
 * Script pour rattacher toutes les pages existantes au BE BUILDER et aligner les slugs
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

async function alignPages() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Analyse des pages existantes dans la base de données...');
        
        // Récupérer toutes les pages de la DB
        const { rows: dbPages } = await client.query('SELECT id, title, slug FROM pages ORDER BY slug');
        console.log(`📊 ${dbPages.length} pages trouvées dans la base de données`);
        
        // Créer un map des pages DB par slug
        const dbPagesBySlug = new Map();
        dbPages.forEach(page => {
            dbPagesBySlug.set(page.slug, page);
        });
        
        // Créer un map des pages DB par ID
        const dbPagesById = new Map();
        dbPages.forEach(page => {
            dbPagesById.set(page.id, page);
        });
        
        console.log('\n📋 Pages à traiter:');
        
        // Pour chaque page dans pages_list.txt
        for (const pageFromList of PAGES_FROM_LIST) {
            const dbPage = dbPagesById.get(pageFromList.id);
            
            if (dbPage) {
                // La page existe dans la DB avec le même ID
                if (dbPage.slug !== pageFromList.slug) {
                    console.log(`🔄 Mise à jour du slug: ${dbPage.slug} → ${pageFromList.slug} (${pageFromList.title})`);
                    await client.query(
                        'UPDATE pages SET slug = $1 WHERE id = $2',
                        [pageFromList.slug, pageFromList.id]
                    );
                } else {
                    console.log(`✅ Page déjà alignée: /${pageFromList.slug} (${pageFromList.title})`);
                }
            } else {
                // La page n'existe pas dans la DB avec cet ID
                // Vérifier si le slug existe déjà
                const existingWithSlug = dbPagesBySlug.get(pageFromList.slug);
                
                if (existingWithSlug) {
                    // Le slug existe mais avec un ID différent, mettre à jour l'ID
                    console.log(`🔄 Mise à jour de l'ID pour slug existant: /${pageFromList.slug}`);
                    await client.query(
                        'UPDATE pages SET id = $1 WHERE slug = $2',
                        [pageFromList.id, pageFromList.slug]
                    );
                } else {
                    // Créer la page
                    console.log(`➕ Création de la page: /${pageFromList.slug} (${pageFromList.title})`);
                    await client.query(
                        `INSERT INTO pages (id, title, slug, is_published, template) 
                         VALUES ($1, $2, $3, true, 'default')`,
                        [pageFromList.id, pageFromList.title, pageFromList.slug]
                    );
                }
            }
        }
        
        // Identifier les pages en trop dans la DB (qui ne sont pas dans pages_list.txt)
        const listIds = new Set(PAGES_FROM_LIST.map(p => p.id));
        const listSlugs = new Set(PAGES_FROM_LIST.map(p => p.slug));
        
        console.log('\n🗑️ Pages à supprimer (non dans pages_list.txt):');
        for (const dbPage of dbPages) {
            if (!listIds.has(dbPage.id) && !listSlugs.has(dbPage.slug)) {
                console.log(`🗑️ Suppression: /${dbPage.slug} (${dbPage.title}) - ID: ${dbPage.id}`);
                await client.query('DELETE FROM pages WHERE id = $1', [dbPage.id]);
            }
        }
        
        console.log('\n✅ Alignement terminé avec succès!');
        
        // Afficher le résultat final
        console.log('\n📊 État final des pages:');
        const { rows: finalPages } = await client.query('SELECT slug, title FROM pages ORDER BY slug');
        finalPages.forEach(page => {
            console.log(`- /${page.slug} (${page.title})`);
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

alignPages().catch(console.error);
