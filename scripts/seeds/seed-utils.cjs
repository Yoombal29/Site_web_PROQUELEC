// Seed utility — shared DB connection and helpers for all seed files.
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (pool) return pool;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for seeding. Set it in .env');
  }
  pool = new Pool({ connectionString: databaseUrl });
  return pool;
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Upsert helper: INSERT ... ON CONFLICT DO UPDATE.
 * Returns the row.
 */
async function upsert(table, data, conflictColumn = 'id') {
  const client = await getPool().connect();
  try {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`);
    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`);

    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders.join(', ')})
      ON CONFLICT (${conflictColumn})
      DO UPDATE SET ${setClauses.join(', ')}
      RETURNING *
    `;

    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Insert many rows in a single batch.
 */
async function insertMany(table, rows, conflictColumn = null) {
  if (rows.length === 0) return [];
  const client = await getPool().connect();
  try {
    const keys = Object.keys(rows[0]);
    const values = [];
    const placeholders = [];

    rows.forEach((row, rowIdx) => {
      const offset = rowIdx * keys.length;
      keys.forEach((key) => {
        values.push(row[key]);
      });
      placeholders.push(
        `(${keys.map((_, i) => `$${offset + i + 1}`).join(', ')})`,
      );
    });

    let query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES ${placeholders.join(', ')}
    `;

    if (conflictColumn) {
      const setClauses = keys.map((k) => `${k} = EXCLUDED.${k}`);
      query += ` ON CONFLICT (${conflictColumn}) DO UPDATE SET ${setClauses.join(', ')}`;
    }

    const result = await client.query(query, values);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Check if a table has rows.
 */
async function hasRows(table) {
  const result = await getPool().query(`SELECT COUNT(*)::int as count FROM ${table}`);
  return result.rows[0].count > 0;
}

/**
 * Truncate a table (use with caution).
 */
async function truncate(table) {
  await getPool().query(`TRUNCATE TABLE ${table} CASCADE`);
}

module.exports = {
  getPool,
  closePool,
  upsert,
  insertMany,
  hasRows,
  truncate,
};
