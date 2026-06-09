import { CURRENT_SCHEMA_VERSION } from './types';

export interface Migration {
  from: number;
  to: number;
  description: string;
  migrate: (doc: Record<string, unknown>) => Record<string, unknown>;
}

const REGISTRY: Migration[] = [];

export function registerMigration(migration: Migration): void {
  REGISTRY.push(migration);
}

export function getMigrationPath(
  fromVersion: number,
  toVersion: number = CURRENT_SCHEMA_VERSION,
): Migration[] {
  if (fromVersion >= toVersion) return [];

  const path: Migration[] = [];
  let current = fromVersion;

  while (current < toVersion) {
    const mig = REGISTRY.find((m) => m.from === current);
    if (!mig) {
      console.warn(`[Migrations] No migration found from v${current}`);
      break;
    }
    path.push(mig);
    current = mig.to;
  }

  return path;
}

export function applyMigrations(
  doc: Record<string, unknown>,
  fromVersion: number,
): Record<string, unknown> {
  let migrated = { ...doc };
  const path = getMigrationPath(fromVersion);

  for (const migration of path) {
    console.info(`[Migrations] Applying ${migration.description}`);
    migrated = migration.migrate(migrated);
  }

  return migrated;
}

registerMigration({
  from: 0,
  to: 1,
  description: 'v0 → v1: ensure content_blocks array, add schemaVersion',
  migrate: (doc) => {
    const blocks = (doc as Record<string, unknown>).blocks || (doc as Record<string, unknown>).content_blocks || [];
    return {
      ...doc,
      schemaVersion: 1,
      content_blocks: blocks,
    };
  },
});
