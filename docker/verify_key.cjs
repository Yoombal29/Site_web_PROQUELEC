
const crypto = require('crypto');

const secret = 'sovereign_secure_key_proquelec_2026';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY5NjYxMDMxLCJleHAiOjIwODUwMjEwMzF9.Ogs9QlGJImh3E2SP_rlCzHAHeIdhTYRW7GW5rfQptEI';

const [header, payload, signature] = token.split('.');
const expectedSignature = crypto.createHmac('sha256', secret)
    .update(header + '.' + payload)
    .digest('base64url');

console.log('Valid:', signature === expectedSignature);
console.log('Payload:', Buffer.from(payload, 'base64url').toString());
