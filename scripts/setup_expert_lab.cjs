const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const blocks = [
    {
        id: uuidv4(),
        type: 'heading',
        version: 1,
        data: { text: 'Expert Lab : L\'accélérateur de conformité Proquelec', level: 'h1', align: 'center' }
    },
    {
        id: uuidv4(),
        type: 'text',
        version: 1,
        data: { content: '<p class="text-xl text-center text-slate-600 max-w-4xl mx-auto my-12">Découvrez une suite d\'outils intelligents conçue spécialement pour les professionnels de l\'électricité au Sénégal. Gagnez en précision, gagnez du temps et garantissez la sécurité de vos installations grâce à notre moteur d\'intelligence normative.</p>' }
    },
    {
        id: uuidv4(),
        type: 'stats',
        version: 1,
        data: {
            items: [
                { label: 'Analyses réalisées', value: '12K+' },
                { label: 'Précision IA', value: '99.8%' },
                { label: 'Gain de temps', value: '75%' },
                { label: 'Experts actifs', value: '450' }
            ]
        }
    },
    {
        id: uuidv4(),
        type: 'divider',
        version: 1,
        data: { style: 'dashed', color: '#e2e8f0', height: 2 }
    },
    {
        id: uuidv4(),
        type: 'heading',
        version: 1,
        data: { text: 'Un écosystème d\'outils de pointe', level: 'h2', align: 'center' }
    },
    {
        id: uuidv4(),
        type: 'feature',
        version: 1,
        data: {
            title: 'Base Normative NS 01-001',
            description: 'Accédez instantanément à toute la documentation technique et réglementaire. Recherchez des articles spécifiques par mots-clés ou par thème.'
        }
    },
    {
        id: uuidv4(),
        type: 'feature',
        version: 1,
        data: {
            title: 'Calculateur de Puissance & Bilan',
            description: 'Gérez vos calculs de section de câbles, chutes de tension et bilans de puissance en toute simplicité selon les abaques officiels.'
        }
    },
    {
        id: uuidv4(),
        type: 'quote',
        version: 1,
        data: {
            text: 'Grâce à l\'Expert Lab, nous avons réduit nos délais de réponse aux appels d\'offres de moitié. C\'est un levier de croissance phénoménal pour notre entreprise.',
            author: 'Ing. Moussa Sarr, Global Élec S.A.'
        }
    },
    {
        id: uuidv4(),
        type: 'heading',
        version: 1,
        data: { text: 'Nos Formules d\'Accompagnement', level: 'h2', align: 'center' }
    },
    {
        id: uuidv4(),
        type: 'pricing',
        version: 1,
        data: {
            title: 'Pack Indépendant',
            price: '25.000 FCFA',
            period: 'mois',
            features: ['Consultation normative illimitée', '10 calculs par mois', 'Support par email'],
            isPopular: false
        }
    },
    {
        id: uuidv4(),
        type: 'pricing',
        version: 1,
        data: {
            title: 'Pack Entreprise',
            price: '75.000 FCFA',
            period: 'mois',
            features: ['Tout le Pack Solo', 'Calculs illimités', 'Génération de rapports PDF', 'Support Prioritaire 24/7'],
            isPopular: true
        }
    },
    {
        id: uuidv4(),
        type: 'cta',
        version: 1,
        data: {
            title: 'Rejoignez l\'élite des installateurs',
            buttonLabel: 'Démarrer mon essai gratuit',
            url: '/auth'
        }
    }
];

async function createPage() {
    try {
        const result = await pool.query(
            'INSERT INTO pages (id, title, slug, content_blocks, is_published, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id',
            [uuidv4(), 'Expert Lab', 'expert-lab', JSON.stringify(blocks), true]
        );
        console.log('Page Expert Lab créée avec succès ! ID:', result.rows[0].id);
    } catch (err) {
        console.error('Erreur lors de la création de la page:', err);
    } finally {
        await pool.end();
    }
}

createPage();
