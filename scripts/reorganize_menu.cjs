const pkg = require('pg');
const { Pool } = pkg;
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function syncMenu() {
    const client = await pool.connect();
    try {
        console.log('--- DÉBUT DE LA RÉORGANISATION DU MENU (DB DIRECT) ---');
        await client.query('BEGIN');

        // 1. Désactiver les anciens menus de type 'main'
        console.log('Désactivation des anciens menus principaux...');
        await client.query("UPDATE public.menu_items SET is_active = false WHERE menu_type = 'main'");

        const menuPlan = [
            { title: 'ACCUEIL', url: '/', order: 0 },
            {
                title: 'QUI SOMMES-NOUS ?', url: '#', order: 1,
                children: [
                    { title: 'Présentation de PROQUELEC', url: '/about' },
                    { title: 'Historique (1995 → aujourd’hui)', url: '/about#history' },
                    { title: 'Vision & Valeurs', url: '/about#values' },
                    { title: 'Équipe dirigeante', url: '/about#leadership' },
                    { title: 'Gouvernance', url: '/about#governance' },
                    { title: 'Partenaires institutionnels', url: '/about#partners' },
                    { title: 'Rapport annuel', url: '/documents#reports' }
                ]
            },
            {
                title: 'UTILITÉ PUBLIQUE', url: '#', order: 2,
                children: [
                    { title: 'Pour les Autorités', url: '/avantages?type=member' },
                    { title: 'Pour les Ménages', url: '/avantages?type=electrician' },
                    { title: 'Pour les Professionnels', url: '/avantages?type=company' },
                    { title: 'Pour les Collectivités locales', url: '/avantages?type=member#collectivities' },
                    { title: 'Pour les Marchés', url: '/showroom#markets' }
                ]
            },
            {
                title: 'NOS ACTIONS', url: '/activities', order: 3,
                children: [
                    { title: 'Sensibilisation & Vulgarisation', url: '/activities#awareness' },
                    { title: 'Diagnostics électriques', url: '/activities#diagnostics' },
                    { title: 'Mise en conformité', url: '/activities#compliance' },
                    { title: 'Sécurisation des marchés', url: '/activities#markets' },
                    { title: 'Études et expertises', url: '/activities#studies' }
                ]
            },
            {
                title: 'FORMATION & CERTIFICATION', url: '/formations', order: 4,
                children: [
                    { title: 'Catalogue des formations', url: '/formations' },
                    { title: 'Calendrier des sessions', url: '/events?type=formation' },
                    { title: 'Inscription en ligne', url: '/contact?subject=inscription' },
                    { title: 'Certification des électriciens', url: '/certifications' },
                    { title: 'Ressources pédagogiques', url: '/documents#pedagogy' }
                ]
            },
            {
                title: 'NORMES & RESSOURCES', url: '/documents', order: 5,
                children: [
                    { title: 'Normes électriques', url: '/documents#norms' },
                    { title: 'Guides pratiques', url: '/documents#guides' },
                    { title: 'Mementos téléchargeables', url: '/documents#mementos' },
                    { title: 'Fiches conseils', url: '/documents#tips' },
                    { title: 'FAQ', url: '/faq' }
                ]
            },
            {
                title: 'PROJETS & RÉALISATIONS', url: '/showroom', order: 6,
                children: [
                    { title: 'Marchés sécurisés', url: '/showroom#markets' },
                    { title: 'Partenariat avec SENELEC', url: '/showroom#senelec' },
                    { title: 'Photos avant/après', url: '/showroom#gallery' }
                ]
            },
            {
                title: 'ACTUALITÉS & ÉVÉNEMENTS', url: '/blog', order: 7,
                children: [
                    { title: 'Toute l\'actualité', url: '/blog' },
                    { title: 'Évènements à venir', url: '/events' },
                    { title: 'Communiqués de presse', url: '/blog?category=presse' }
                ]
            },
            {
                title: 'PARTENAIRES', url: '/about#partners', order: 8
            },
            {
                title: 'CONTACT', url: '/contact', order: 9,
                children: [
                    { title: 'Demande de diagnostic', url: '/contact?type=diagnostic' },
                    { title: 'Demande de conseil', url: '/contact?type=conseil' },
                    { title: 'Nous trouver', url: '/contact#map' }
                ]
            }
        ];

        for (const parent of menuPlan) {
            console.log(`Création de l'item parent: ${parent.title}`);
            const parentRes = await client.query(
                'INSERT INTO public.menu_items (title, url, menu_order, is_active, menu_type, target) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [parent.title, parent.url, parent.order, true, 'main', '_self']
            );
            const parentId = parentRes.rows[0].id;

            if (parent.children) {
                let childOrder = 0;
                for (const child of parent.children) {
                    console.log(`  > Création du sous-menu: ${child.title}`);
                    await client.query(
                        'INSERT INTO public.menu_items (title, url, menu_order, parent_id, is_active, menu_type, target) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                        [child.title, child.url, childOrder++, parentId, true, 'main', '_self']
                    );
                }
            }
        }

        // 2. Désactiver les anciens menus de type 'footer'
        console.log('Désactivation des anciens menus de pied de page...');
        await client.query("UPDATE public.menu_items SET is_active = false WHERE menu_type = 'footer'");

        const footerPlan = [
            { title: 'Espace Autorités', url: '/avantages?type=member', order: 0 },
            { title: 'Espace Ménages', url: '/avantages?type=electrician', order: 1 },
            { title: 'Espace Professionnels', url: '/avantages?type=company', order: 2 },
            { title: 'Espace Partenaires', url: '/auth#partner', order: 3 },
            { title: 'Espace Presse', url: '/blog?category=presse', order: 4 },
            { title: 'Mentions Légales', url: '/legal', order: 5 }
        ];

        for (const f of footerPlan) {
            console.log(`Création de l'item footer: ${f.title}`);
            await client.query(
                'INSERT INTO public.menu_items (title, url, menu_order, is_active, menu_type, target) VALUES ($1, $2, $3, $4, $5, $6)',
                [f.title, f.url, f.order, true, 'footer', '_self']
            );
        }

        await client.query('COMMIT');
        console.log('--- RÉORGANISATION TERMINÉE AVEC SUCCÈS ---');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur lors de la réorganisation du menu:', error);
    } finally {
        client.release();
        pool.end();
    }
}

syncMenu();
