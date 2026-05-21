const { Pool } = require('pg');
require('dotenv').config();

// Configuration de la connexion PostgreSQL locale (remplace Supabase)

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('connect', (client) => {
    client.query('SET client_encoding TO \'UTF8\'');
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
});

module.exports = { pool };
