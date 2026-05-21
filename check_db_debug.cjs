const { Pool } = require('pg');

async function checkDb() {
    const urls = [
        "postgresql://postgres:proquelec_secure_db_pass@localhost:5432/postgres",
        "postgresql://postgres:proquelec_secure_db_pass@localhost:5433/postgres"
    ];

    for (const url of urls) {
        console.log(`\n🔍 Vérification de : ${url}`);
        const pool = new Pool({ connectionString: url });
        try {
            const res = await pool.query("SELECT count(*) FROM public.users");
            console.log(`✅ SUCCÈS : ${res.rows[0].count} utilisateurs trouvés.`);
        } catch (e) {
            console.log(`❌ ÉCHEC : ${e.message}`);
        }
        await pool.end();
    }
}

checkDb();
