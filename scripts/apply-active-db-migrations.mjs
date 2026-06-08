import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ override: true });

const { Pool } = pg;
const cwd = process.cwd();
const migrationFiles = process.argv
  .slice(2)
  .map((file) => file.replace(/\\/g, '/'))
  .filter((file) => file.endsWith('.sql'));

if (migrationFiles.length === 0) {
  console.log('Active DB migrations: no changed SQL files.');
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.log('Active DB migrations: DATABASE_URL is not set, skipping.');
  process.exit(0);
}

function safeDatabaseLabel(databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    return `${parsed.hostname}:${parsed.port || '5432'}/${parsed.pathname.replace(/^\//, '')}`;
  } catch {
    return 'invalid-url';
  }
}

function resolveMigrationPath(file) {
  const fullPath = path.resolve(cwd, file);
  const relative = path.relative(cwd, fullPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Migration path escapes repository: ${file}`);
  }
  return fullPath;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  console.log(`Active DB migrations: ${safeDatabaseLabel(process.env.DATABASE_URL)}`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations_meta (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT NOW()
    );
  `);

  let appliedCount = 0;
  for (const file of migrationFiles) {
    const fullPath = resolveMigrationPath(file);
    const filename = path.basename(file);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Migration file not found: ${file}`);
    }

    const alreadyApplied = await pool.query(
      'SELECT 1 FROM _migrations_meta WHERE filename = $1 LIMIT 1;',
      [filename],
    );
    if (alreadyApplied.rowCount > 0) {
      console.log(`Active DB migrations: ${filename} already applied.`);
      continue;
    }

    process.stdout.write(`Active DB migrations: applying ${filename} ... `);
    const sql = fs.readFileSync(fullPath, 'utf8');
    await pool.query(sql);
    await pool.query(
      'INSERT INTO _migrations_meta (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING;',
      [filename],
    );
    appliedCount += 1;
    console.log('OK');
  }

  console.log(`Active DB migrations: ${appliedCount} applied.`);
} finally {
  await pool.end();
}
