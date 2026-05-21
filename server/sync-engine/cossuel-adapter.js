/**
 * Adaptateur pour l'API COSSUEL (https://espace.cossuel.sn)
 * 
 * Rôle : 
 * - Authentification (Token Management)
 * - Récupération des dossiers et inspections
 * - Mode MOCK pour le développement sans accès direct
 */

const axios = require('axios'); // Assurez-vous d'avoir axios ou utilisez fetch

// Configuration
const COSSUEL_API_URL = process.env.COSSUEL_API_URL || 'https://espace.cossuel.sn/api'; // URL hypothétique
const COSSUEL_USERNAME = process.env.COSSUEL_USERNAME;
const COSSUEL_PASSWORD = process.env.COSSUEL_PASSWORD;
const IS_MOCK_MODE = true; // Force le mode Mock pour l'instant

// Mock Data pour la simulation
const MOCK_DATA = {
    dossiers: [
        { id: 'DOS-2024-001', region: 'Dakar', status: 'CONFORME', type: 'Residentiel', date: '2024-01-15' },
        { id: 'DOS-2024-002', region: 'Thies', status: 'NON_CONFORME', type: 'Tertiaire', date: '2024-01-16' },
        { id: 'DOS-2024-003', region: 'Saint-Louis', status: 'A_PROGRAMMER', type: 'Industriel', date: '2024-01-17' },
        { id: 'DOS-2024-004', region: 'Dakar', status: 'REJETE', type: 'Residentiel', date: '2024-01-18' },
        { id: 'DOS-2024-005', region: 'Ziguinchor', status: 'CONFORME', type: 'Residentiel', date: '2024-01-19' },
    ]
};

class CossuelAdapter {
    constructor() {
        this.token = null;
    }

    async authenticate() {
        if (IS_MOCK_MODE) {
            console.log('[COSSUEL] Mock Authentication Success');
            this.token = 'mock-token-123';
            return;
        }

        try {
            // Implémentation réelle (à activer plus tard)
            // const res = await axios.post(`${COSSUEL_API_URL}/login`, { username: COSSUEL_USERNAME, password: COSSUEL_PASSWORD });
            // this.token = res.data.token;
        } catch (error) {
            console.error('[COSSUEL] Auth Failed:', error.message);
            throw error;
        }
    }

    async fetchRecentDossiers(days = 7) {
        if (!this.token) await this.authenticate();

        if (IS_MOCK_MODE) {
            console.log(`[COSSUEL] Fetching dossiers for last ${days} days (MOCK)`);
            // Générer un peu plus de données aléatoires pour le réalisme
            const regions = ['Dakar', 'Thies', 'Diourbel', 'Saint-Louis', 'Ziguinchor', 'Kaolack'];
            const statuses = ['CONFORME', 'NON_CONFORME', 'A_PROGRAMMER', 'INSPECTE'];

            const extraData = Array.from({ length: 20 }, (_, i) => ({
                id: `DOS-MOCK-${100 + i}`,
                region: regions[Math.floor(Math.random() * regions.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                type: Math.random() > 0.7 ? 'Industriel' : 'Residentiel',
                date: new Date(Date.now() - Math.floor(Math.random() * days * 86400000)).toISOString()
            }));

            return [...MOCK_DATA.dossiers, ...extraData];
        }

        // Real API Call
        // const res = await axios.get(`${COSSUEL_API_URL}/dossier/all?since=${days}`, { headers: { Authorization: `Bearer ${this.token}` } });
        // return res.data;
    }

    async fetchInspectionDetails(dossierId) {
        if (IS_MOCK_MODE) {
            return {
                id: `INSP-${dossierId}`,
                dossier_id: dossierId,
                inspector: 'Inspecteur Test',
                date: new Date().toISOString(),
                result: Math.random() > 0.8 ? 'CONFORME' : 'NON_CONFORME',
                defects: ['Mise à la terre insuffisante', 'Câblage non sécurisé']
            };
        }
    }
}

module.exports = new CossuelAdapter();
