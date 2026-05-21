const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function initializeDatabase() {
    try {
        console.log('Reading SQL file...');
        const sqlFile = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

        console.log('Executing SQL...');
        await pool.query(sqlFile);

        console.log('✅ Database initialized successfully!');

        // Check if admin user exists
        const adminCheck = await pool.query(`SELECT * FROM auth.users WHERE email = 'admin@proquelec.sn'`);
        if (adminCheck.rows.length > 0) {
            console.log('✅ Admin user exists');
            console.log('Admin user details:', {
                id: adminCheck.rows[0].id,
                email: adminCheck.rows[0].email,
                role: adminCheck.rows[0].role,
                confirmed_at: adminCheck.rows[0].confirmed_at
            });
        } else {
            console.log('⚠️  Admin user not found');
        }

    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        console.error('Full error:', error);
    } finally {
        await pool.end();
    }
}

initializeDatabase();
