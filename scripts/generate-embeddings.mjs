/**
 * Script de pré-génération des embeddings vectoriels.
 * À exécuter une seule fois pour préparer le cache.
 * Usage: node scripts/generate-embeddings.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_DIR = path.resolve(__dirname, '../server/knowledge_base');
const CACHE_FILE = path.resolve(KB_DIR, '.chunks_cache.json');

async function main() {
  console.log('=== GÉNÉRATION DES EMBEDDINGS VECTORIELS ===\n');

  // Vérifier que le cache existe
  if (!fs.existsSync(CACHE_FILE)) {
    console.log('❌ Cache introuvable. Démarrez d\'abord le serveur pour générer les chunks.');
    process.exit(1);
  }

  // Charger le cache
  const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
  const cache = JSON.parse(raw);
  const chunks = cache.chunks || cache;

  // Vérifier si les embeddings existent déjà
  if (cache.embeddings && cache.embeddings.length === chunks.length) {
    console.log(`✅ Embeddings déjà présents : ${cache.embeddings.length} vecteurs`);
    const sure = process.argv.includes('--force');
    if (!sure) {
      console.log('Pour regénérer, ajoutez --force');
      process.exit(0);
    }
  }

  console.log(`Chunks à traiter : ${chunks.length}`);
  console.log('Chargement du modèle d\'embedding...');

  // Importer le modèle
  const { pipeline } = await import('@xenova/transformers');
  const model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true
  });

  console.log('Modèle chargé. Génération des embeddings...\n');

  const embeddings = [];
  const batchSize = 100; // Batch plus grand pour accélérer
  const startTime = Date.now();

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map(c => (c.text || '').substring(0, 300)); // 300c suffit

    const result = await model(texts, { pooling: 'mean', normalize: true });
    const data = result.tolist ? result.tolist() : Array.from(result.data);

    if (Array.isArray(data[0])) {
      for (const vec of data) embeddings.push(vec);
    } else {
      const dim = 384;
      for (let j = 0; j < data.length; j += dim) {
        embeddings.push(data.slice(j, j + dim));
      }
    }

    const pct = ((i + batchSize) / chunks.length * 100).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const rate = (i + batchSize) / Math.max(parseInt(elapsed), 1);
    const eta = ((chunks.length - i - batchSize) / Math.max(rate, 1)).toFixed(0);
    process.stdout.write(`\r${pct}% — ${Math.min(i + batchSize, chunks.length)}/${chunks.length} — ${rate.toFixed(0)}/s — ETA ${eta}s`);
  }

  // Sauvegarder
  const cacheData = { chunks, embeddings };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData), 'utf-8');

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n✅ ${embeddings.length} embeddings générés en ${totalTime}s`);
  console.log(`Cache mis à jour : ${CACHE_FILE}`);
}

main().catch(err => {
  console.error('\n❌ Erreur:', err.message);
  process.exit(1);
});
