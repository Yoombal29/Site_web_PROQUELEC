
const axios = require('axios');

async function testSEO() {
    const API_URL = 'http://localhost:3000/api';

    // Login to get token
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'experimental@proquelec.com',
            password: 'admin123'
        });
        const token = loginRes.data.token || loginRes.data.access_token;
        console.log('Logged in successfully');

        const headers = { Authorization: `Bearer ${token}` };

        // Test SEO Analysis
        console.log('Testing SEO Analysis...');
        const seoRes = await axios.post(`${API_URL}/ai/seo-analyze`, {
            title: 'Installation Électrique Paris',
            slug: 'installation-electrique-paris',
            content: '<h1>Services d\'électricien à Paris</h1><p>Nous installons des tableaux électriques, des prises et des luminaires partout en Île-de-France. Nos tarifs sont compétitifs et nos techniciens certifiés.</p>'
        }, { headers });

        console.log('SEO Result:', JSON.stringify(seoRes.data, null, 2));

        if (seoRes.data.success) {
            console.log('✅ SEO IA Test Success!');
        } else {
            console.log('❌ SEO IA Test Failed Message:', seoRes.data.message);
        }

    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
}

testSEO();
