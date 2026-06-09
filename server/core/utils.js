const path = require('path');
const fs = require('fs');

const GHOST_DIR = path.join(__dirname, '..', '.ghost_cache');

const SEMANTIC_DICTIONARY = {
    'senegal': 'Sénégal', 'electricien': 'électricien', 'electricite': 'électricité',
    'securite': 'sécurité', 'qualite': 'qualité', 'formation': 'formation',
    'verification': 'vérification', 'audit': 'audit'
};

function normalizeText(text) {
    if (!text || typeof text !== 'string') return text;

    let normalized = text
        .replace(/S\?N\?GAL/g, 'SÉNÉGAL')
        .replace(/[\u200B-\u200D\uFEFF]/g, '');

    const dictionary = {
        'proqelec': 'PROQUELEC', 'proqueleque': 'PROQUELEC',
        'seneque': 'SENELEC', 'electricien': 'Électricien',
        'electricite': 'Électricité', 'societe': 'Société',
        'senegal': 'Sénégal', 'dakar': 'Dakar',
        'standard': 'Norme', 'norme': 'Norme',
        'calulateur': 'Calculateur', 'calculateure': 'Calculateur',
        'shema': 'Schéma', 'schema': 'Schéma'
    };

    Object.keys(dictionary).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        normalized = normalized.replace(regex, dictionary[key]);
    });

    return normalized.trim();
}

function saveGhostCopy(table, data) {
    try {
        if (!fs.existsSync(GHOST_DIR)) fs.mkdirSync(GHOST_DIR, { recursive: true });
        fs.writeFileSync(path.join(GHOST_DIR, `${table}.json`), JSON.stringify(data, null, 2));
    } catch (e) { console.error('Ghost mirroring failed', e); }
}

function getGhostCopy(table) {
    try {
        const file = path.join(GHOST_DIR, `${table}.json`);
        if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) { return null; }
    return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { normalizeText, saveGhostCopy, getGhostCopy, SEMANTIC_DICTIONARY, sleep };
