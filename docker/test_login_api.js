
const axios = require('axios');

async function testLogin() {
    const url = 'http://localhost:3102/auth/v1/token?grant_type=password';
    const data = {
        email: 'oumarkebe@proquelec.sn',
        password: 'Touba28!'
    };
    const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY5NjYxMDMxLCJleHAiOjIwODUwMjEwMzF9.Ogs9QlGJImh3E2SP_rlCzHAHeIdhTYRW7GW5rfQptEI'
    };

    try {
        const response = await axios.post(url, data, { headers });
        console.log('Success:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('Error:', error.response ? error.response.status : error.message);
        if (error.response) {
            console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testLogin();
