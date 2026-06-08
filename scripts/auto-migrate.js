import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const migrationsDir = path.join(process.cwd(), 'corpus-db', 'migrations');

if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Dossier des migrations non trouvé: ${migrationsDir}`);
    process.exit(1);
}

const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

console.log(`🚀 Système Auto-Migrate PROQUELEC`);
console.log(`📂 Dossier: ${migrationsDir}`);
console.log(`📊 ${files.length} fichiers SQL trouvés`);


// Helper to run SQL in docker via STDIN (safer for Windows/Special chars)
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/postgres';
const parsedUrl = new URL(dbUrl);
const dbName = (parsedUrl.pathname || '').replace(/^\//, '') || 'postgres';

const resolveDbContainer = () => {
    const configured = process.env.DB_CONTAINER_NAME || process.env.POSTGRES_CONTAINER;
    const candidates = [
        configured,
        'site-proquelec-db-1',
        'site-proquelec_db_1',
        'proquelec-db',
        'proquelec_db'
    ].filter(Boolean);

    try {
        const names = execFileSync('docker', ['ps', '--format', '{{.Names}}'], {
            stdio: ['ignore', 'pipe', 'pipe']
        }).toString().split(/\r?\n/).filter(Boolean);

        return candidates.find(name => names.includes(name))
            || names.find(name => /proquelec.*db|db.*proquelec/i.test(name))
            || candidates[0];
    } catch {
        return candidates[0];
    }
};

const dbContainer = resolveDbContainer();
console.log(`🐘 Conteneur DB: ${dbContainer}`);

const runPsql = (args, sql) => execFileSync('docker', [
    'exec',
    '-i',
    dbContainer,
    'psql',
    '-U',
    'postgres',
    '-d',
    dbName,
    ...args
], {
    input: sql,
    stdio: ['pipe', 'pipe', 'pipe']
});

const runSql = (sql, logError = true) => {
    try {
        return runPsql(['-t'], sql).toString().trim();
    } catch (e) {
        if (logError) console.error("SQL Error:", e.message);
        throw e;
    }
}

// 1. Ensure Meta Table Exists
try {
    runSql(`CREATE TABLE IF NOT EXISTS _migrations_meta (filename TEXT PRIMARY KEY, applied_at TIMESTAMP DEFAULT NOW());`, false);
} catch (e) {
    console.log("ℹ️  Info: Database not ready or table creation failed. Will attempt full run.");
}

// 2. Get Applied Migrations
let applied = new Set();
try {
    const rows = runSql(`SELECT filename FROM _migrations_meta;`);
    rows.split('\n').filter(Boolean).forEach(r => applied.add(r.trim()));
} catch (e) {
    console.log("ℹ️  Could not fetch migrations history.");
}

console.log(`🚀 Système Auto-Migrate PROQUELEC (Smart Mode)`);
console.log(`📂 Dossier: ${migrationsDir}`);
console.log(`📊 ${files.length} fichiers totaux | ${applied.size} déjà appliqués`);

let newCount = 0;

for (const file of files) {
    if (applied.has(file)) {
        // Skip silently for speed
        continue;
    }

    process.stdout.write(`📡 Migration NOUVELLE : ${file} ... `);
    try {
        const filePath = path.join(migrationsDir, file);
        const sqlContent = fs.readFileSync(filePath);
        runPsql([], sqlContent);

        // Mark as applied
        runSql(`INSERT INTO _migrations_meta (filename) VALUES ('${file}');`);

        console.log('✅ OK');
        newCount++;
    } catch (error) {
        console.log('⚠️ ERREUR (Ignorée)');
    }
}

if (newCount === 0) {
    console.log('✨ Tout est à jour ! (Démarrage instantané)');
} else {
    console.log(`✨ ${newCount} nouvelles migrations appliquées.`);
}

