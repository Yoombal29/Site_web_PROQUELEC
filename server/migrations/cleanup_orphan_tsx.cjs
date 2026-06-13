/**
 * cleanup_orphan_tsx.cjs
 * Supprime les 15 fichiers TSX orphelins dont le contenu a été migré
 * vers des blocs Builder dans la base de données.
 *
 * Usage: node server/migrations/cleanup_orphan_tsx.cjs
 */
const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '../../src/pages');

const ORPHANED_FILES = [
  'News.tsx',
  'PressPage.tsx',
  'Certifications.tsx',
  'FormationCertification.tsx',
  'Trainings.tsx',
  'Blog.tsx',
  'ActualitesEvenements.tsx',
  'NormesRessources.tsx',
  'ProjetsRealisations.tsx',
  'PartenairesPage.tsx',
  'PublicUtility.tsx',
  'Activities.tsx',
  'AdvantagesPage.tsx',
  'Legal.tsx',
  'Contact.tsx',
];

let deleted = 0;
let errors = 0;

console.log('🗑️  Nettoyage des fichiers TSX orphelins...\n');

for (const file of ORPHANED_FILES) {
  const filePath = path.join(PAGES_DIR, file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`   ✅ ${file} supprimé`);
      deleted++;
    } else {
      console.log(`   ⚠️  ${file} déjà supprimé`);
    }
  } catch (err) {
    errors++;
    console.error(`   ❌ ${file}: ${err.message}`);
  }
}

console.log(`\n📊 Résultat : ${deleted} fichiers supprimés, ${errors} erreurs`);
console.log('✅ Nettoyage terminé !');
