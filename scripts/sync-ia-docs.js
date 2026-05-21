#!/usr/bin/env node

/**
 * Script de synchronisation des fichiers de documentation IA
 * Copie les fichiers markdown vers le dossier public/ 
 * Cela garantit que la documentation dans le dashboard admin est toujours à jour
 */

const fs = require('fs');
const path = require('path');

const filesToSync = [
  'ENDPOINTS_IA_INVENTORY.md',
  'ENDPOINTS_MAPPING.md',
  'AI_PROVIDER_CONFIG.md',
  'test_ai_endpoints.js'
];

const publicDir = path.join(__dirname, '..', 'public');
const rootDir = path.join(__dirname, '..');

console.log('📚 Synchronisation de la documentation IA...');

try {
  filesToSync.forEach((file) => {
    const sourcePath = path.join(rootDir, file);
    const destPath = path.join(publicDir, file);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      const stats = fs.statSync(destPath);
      console.log(`✅ ${file} (${stats.size} bytes)`);
    } else {
      console.warn(`⚠️  Fichier non trouvé: ${file}`);
    }
  });

  console.log('✨ Synchronisation réussie!');
  process.exit(0);
} catch (error) {
  console.error('❌ Erreur lors de la synchronisation:', error.message);
  process.exit(1);
}
