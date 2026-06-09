/**
 * Script de synchronisation des documents PROQUELEC vers la base de connaissances RAG
 *
 * Copie les documents clés depuis les dossiers source vers server/knowledge_base/
 * et convertit les PDF en texte Markdown.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_DIR = path.resolve(__dirname, '../server/knowledge_base');

// Sources documents
const SOURCES = {
  'NS_C14-100': {
    src: 'C:/Users/User/Documents/PROQUELEC/3. COMPTE RENDU/Cahier des Charges Atelier adaptation NFC 14 100 en NS.doc',
    dest: 'NS_C14_100_adaptation.doc',
    desc: 'Cahier des charges adaptation NF C14-100 en norme sénégalaise'
  },
  'NF_C14-100_devis': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/5. NORMES/Devis formation NF C14100 SENELEC octobre 2019.pdf',
    dest: 'NF_C14-100_formation.pdf',
    desc: 'Formation NF C14-100 SENELEC'
  },
  'NF_C15-100': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/5. NORMES/nfc-15-100-pdf-free.pdf',
    dest: 'NF_C15-100_free.pdf',
    desc: 'NF C15-100 (version libre)'
  },
  'NS_01-001_PDF': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/5. NORMES/Norme NS 01-001.pdf',
    dest: 'NS_01-001_PDF.pdf',
    desc: 'Norme NS 01-001 PDF original'
  },
  'NF_C18-510_PDF': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/5. NORMES/Norme-NF-C-18-510.pdf',
    dest: 'NF_C18-510_PDF.pdf',
    desc: 'Norme NF C18-510 PDF original'
  },
  'Info_PROQUELEC': {
    src: 'C:/Users/User/Documents/PROQUELEC/2. PROJET/1. STAND PROQUELEC 2025 KINGFATH/VERSION FINAL/Information sur PROQUELEC.pdf',
    dest: 'Information_PROQUELEC.pdf',
    desc: 'Information sur PROQUELEC'
  },
  'Guide_IEI': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/8. MEMENTO ET GUIDE PROQUELEC/guideproquelec/Guide IEI domestiques (1).pdf',
    dest: 'Guide_IEI_domestiques.pdf',
    desc: 'Guide installations électriques intérieures domestiques'
  },
  'Guide_IEI_ER': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/8. MEMENTO ET GUIDE PROQUELEC/guideproquelec/Guide installations électriques intétieures ERP ERT 2 final.docx',
    dest: 'Guide_IEI_ERP_ERT.docx',
    desc: 'Guide installations électriques ERP ERT'
  },
  'Guide_37500': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/8. MEMENTO ET GUIDE PROQUELEC/GUIDE INSTALLATION 37500 MENAGES.pdf',
    dest: 'Guide_37500_menages.pdf',
    desc: 'Guide installation 37500 ménages'
  },
  'Depliant_Proquelec': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/8. MEMENTO ET GUIDE PROQUELEC/1. DEPLIANT FICHE ET BROCHURE 2025/[Dépliant] Infos Proquelec V2.pdf',
    dest: 'Depliant_Proquelec_2025.pdf',
    desc: 'Dépliant informations PROQUELEC 2025'
  },
  'Presentation_Proquelec': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/8. MEMENTO ET GUIDE PROQUELEC/1. DEPLIANT FICHE ET BROCHURE 2025/Présentation Proquelec 2024.pdf',
    dest: 'Presentation_Proquelec_2024.pdf',
    desc: 'Présentation PROQUELEC 2024'
  },
  'NF_C11-201': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/5. NORMES/Norme NF C/NF C11-201-A1-decembre-2004-Réseau de distribution public d\'énergie.pdf',
    dest: 'NF_C11-201_reseau_distribution.pdf',
    desc: 'NF C11-201 Réseau de distribution public'
  },
  'NF_C62-411': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/5. NORMES/Norme NF C/NF C62-411.pdf',
    dest: 'NF_C62-411_parafoudres.pdf',
    desc: 'NF C62-411 Parafoudres'
  },
  'NF_EN_62561': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/5. NORMES/NF EN 62561-1.pdf',
    dest: 'NF_EN_62561-1_parafoudres.pdf',
    desc: 'NF EN 62561-1 Parafoudres'
  },
  'KEKEMONO': {
    src: 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/8. MEMENTO ET GUIDE PROQUELEC/KEKEMONO A4.pdf',
    dest: 'Guide_technique_KEKEMONO.pdf',
    desc: 'Guide technique KEKEMONO'
  }
};

// Cahiers techniques Schneider
const SCHNEIDER_DIR = 'C:/Users/User/Documents/PROQUELEC/6. DOC INTERNE PROQUELEC/8. MEMENTO ET GUIDE PROQUELEC/doc Schneider/cahier technique schneider/';

async function copyPDFToMarkdown(srcPath, destName) {
  try {
    if (!fs.existsSync(srcPath)) {
      console.warn(`  ⚠️ Introuvable: ${srcPath}`);
      return false;
    }

    const ext = path.extname(srcPath).toLowerCase();
    const baseName = path.basename(destName, path.extname(destName));

    if (ext === '.pdf') {
      // Extraire le texte du PDF et le sauvegarder en Markdown
      const dataBuffer = fs.readFileSync(srcPath);
      const data = await pdfParse(dataBuffer);
      const text = data.text || '';

      if (text.length > 100) {
        const mdContent = `# ${baseName.replace(/_/g, ' ')}\n\n*Source: ${srcPath}*\n*Pages: ${data.numpages}*\n*Extraire le: ${new Date().toISOString()}*\n\n${text}`;
        const mdPath = path.join(KB_DIR, `${baseName}.md`);
        fs.writeFileSync(mdPath, mdContent, 'utf-8');
        console.log(`  ✅ PDF → MD: ${baseName}.md (${text.length}c, ${data.numpages}p.)`);
        return true;
      } else {
        console.warn(`  ⚠️ PDF vide ou scanné: ${destName} (${text.length}c)`);
        return false;
      }
    } else if (ext === '.doc' || ext === '.docx') {
      // Pour les DOC/DOCX, copie simple (traitement ultérieur)
      const destPath = path.join(KB_DIR, destName);
      fs.copyFileSync(srcPath, destPath);
      console.log(`  📄 DOC copié: ${destName}`);
      return true;
    }
  } catch (err) {
    console.error(`  ❌ Erreur ${destName}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Synchronisation des documents vers la base RAG ===\n');

  let copied = 0;
  let errors = 0;

  // Copier les documents principaux
  for (const [key, info] of Object.entries(SOURCES)) {
    process.stdout.write(`${info.desc}... `);
    const ok = await copyPDFToMarkdown(info.src, info.dest);
    if (ok) copied++;
    else errors++;
  }

  console.log(`\n=== Résultat: ${copied} documents copiés, ${errors} erreurs ===\n`);

  console.log('Pour intégrer ces documents au RAG, redémarrez le serveur ou appelez:\n  ragService.reload()\n');
}

main().catch(console.error);
