const { startSyncEngine } = require('./server/sync-engine/index.js');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function testSync() {
    console.log('Testing Sync Engine...');
    try {
        await startSyncEngine(pool);
        // Wait a bit for async stuff
        setTimeout(() => {
            console.log('Test finished (timeout), check logs.');
            process.exit(0);
        }, 5000);
    } catch (e) {
        console.error('Sync Error:', e);
        process.exit(1);
    }
}

testSync();
