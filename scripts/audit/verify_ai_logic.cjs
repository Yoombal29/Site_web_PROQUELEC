
const axios = require('axios');
const tests = [
    'salam',
    'piscine',
    'picine profondeur',
    'hauteur disjoncteur',
    'disjoncteur'
];

async function run() {
    console.log('--- STARTING COGNITIVE AI VERIFICATION (V7 DEBUG) ---');
    for (const q of tests) {
        try {
            console.log(`Testing: "${q}"...`);
            const r = await axios.post('http://localhost:3000/api/ai/chat', {
                query: q,
                session_id: 'v7_test_' + Date.now(),
                persona: 'installateur'
            });
            console.log(`QUERY: ${q}`);
            console.log(`INTENT: ${r.data.intent}`);
            console.log(`RESPONSE: ${r.data.response ? r.data.response.substring(0, 300) : 'NO RESPONSE DATA'}...`);
            console.log('-----------------------------------');
        } catch (e) {
            console.log(`QUERY: ${q}`);
            console.log(`ERROR MSG: ${e.message}`);
            if (e.code) console.log(`CODE: ${e.code}`);
            if (e.response) {
                console.log(`STATUS: ${e.response.status}`);
                console.log(`DATA: ${JSON.stringify(e.response.data)}`);
            }
            console.log('-----------------------------------');
        }
    }
    console.log('--- END VERIFICATION ---');
}

run().catch(err => console.error("FATAL ERROR:", err));
