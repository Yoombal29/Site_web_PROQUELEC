import { openDB, DBSchema } from 'idb';

interface OfflineDocument {
  id: string;
  title?: string;
  content: unknown;
  updatedAt: number;
  isSynced: boolean;
  serverVersion?: number;
}

interface ProquelecDB extends DBSchema {
  documents: {
    key: string;
    value: OfflineDocument;
  };
}

const DB_NAME = 'proquelec-docs';
const DB_VERSION = 1;

export const dbPromise = openDB<ProquelecDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('documents')) {
      db.createObjectStore('documents', { keyPath: 'id' });
    }
  }
});

export async function saveLocalDocument(doc: OfflineDocument) {
  const db = await dbPromise;
  await db.put('documents', doc);
}

export async function getLocalDocument(id: string) {
  const db = await dbPromise;
  return db.get('documents', id);
}

export async function markAsSynced(id: string, serverVersion?: number) {
  const db = await dbPromise;
  const doc = await db.get('documents', id);
  if (!doc) return;

  await db.put('documents', {
    ...doc,
    isSynced: true,
    serverVersion
  });
}

export async function deleteLocalDocument(id: string) {
  const db = await dbPromise;
  await db.delete('documents', id);
}