
const fs = require('fs');
const crypto = require('crypto');

const secret = 'sovereign_secure_key_proquelec_2026';

function gen(role) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
        role,
        iss: 'proquelec',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365 * 10)
    })).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(header + '.' + payload).digest('base64url');
    return header + '.' + payload + '.' + signature;
}

const anonKey = gen('anon');
const serviceKey = gen('service_role');

if (fs.existsSync('.env')) {
    let env = fs.readFileSync('.env', 'utf8');
    env = env.replace(/VITE_ANON_KEY=.*/, `VITE_ANON_KEY=${anonKey}`);
    env = env.replace(/SERVICE_ROLE_KEY=.*/, `SERVICE_ROLE_KEY=${serviceKey}`);
    fs.writeFileSync('.env', env);
    console.log('✅ .env updated with fresh JWTs');
}
console.log('ANON:', anonKey);
