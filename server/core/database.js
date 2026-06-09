const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', (client) => {
    client.query('SET client_encoding TO \'UTF8\'');
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
});

async function query(text, params) {
    return pool.query(text, params);
}

async function getClient() {
    return pool.connect();
}

module.exports = { pool, query, getClient };
