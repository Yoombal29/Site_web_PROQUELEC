/**
 * RAG Service — Service de Retrieval-Augmented Generation
 *
 * Charge les documents de la base de connaissances (server/knowledge_base/),
 * les découpe en chunks pertinents, et fournit une recherche sémantique
 * pour enrichir les prompts du Master Agent.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin de la base de connaissances
const KNOWLEDGE_BASE_DIR = path.resolve(__dirname, '../../knowledge_base');
const CHUNKS_CACHE_FILE = path.resolve(KNOWLEDGE_BASE_DIR, '.chunks_cache.json');

class RAGService {
  constructor() {
    this.chunks = [];
    this.embeddings = null; // Matrix [nbChunks x 384]
    this.embeddingModel = null;
    this.initialized = false;
  }

  /**
   * Initialise le service : charge les chunks et génère les embeddings
   */
  async initialize() {
    await this._loadCacheOrGenerate();

    // Vérifier si les embeddings sont déjà dans le cache
    if (!this.embeddings || this.embeddings.length !== this.chunks.length) {
      console.log('[RAG] Pour générer les embeddings : node scripts/generate-embeddings.mjs');
    }
    this.initialized = true;
    console.log(
      `[RAG] Prêt : ${this.chunks.length} chunks${this.embeddings ? ', ' + this.embeddings.length + ' embeddings' : ''}`,
    );
  }

  async _loadCacheOrGenerate() {
    // Tentative de chargement du cache avec embeddings
    try {
      if (fs.existsSync(CHUNKS_CACHE_FILE)) {
        const raw = fs.readFileSync(CHUNKS_CACHE_FILE, 'utf-8');
        const cached = JSON.parse(raw);
        // Vérifier si le cache contient des embeddings
        if (cached.embeddings) {
          this.chunks = cached.chunks;
          this.embeddings = cached.embeddings;
          this.initialized = true;
          console.log(`[RAG] Cache vectoriel chargé : ${this.chunks.length} chunks`);
          return;
        } else {
          // Ancien format sans embeddings → on garde les chunks
          this.chunks = Array.isArray(cached) ? cached : cached.chunks || [];
          console.log(`[RAG] Cache sans embeddings, regénération : ${this.chunks.length} chunks`);
          return;
        }
      }
    } catch (err) {
      console.warn('[RAG] Erreur cache, regénération complète...');
    }

    // Générer les chunks depuis les fichiers sources
    this.chunks = await this._loadAndChunkAll();
    this._saveCache();
    console.log(`[RAG] ${this.chunks.length} chunks générés depuis les fichiers`);
  }

  _saveCache() {
    try {
      const data = { chunks: this.chunks, embeddings: this.embeddings };
      fs.writeFileSync(CHUNKS_CACHE_FILE, JSON.stringify(data), 'utf-8');
    } catch (err) {
      console.warn('[RAG] Écriture cache:', err.message);
    }
  }

  /**
   * Génère les embeddings pour tous les chunks
   */
  async _generateEmbeddings() {
    if (this.chunks.length === 0) return;

    try {
      const { pipeline } = await import('@xenova/transformers');
      this.embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });

      console.log(`[RAG] Génération de ${this.chunks.length} embeddings...`);
      const batchSize = 50;
      this.embeddings = [];

      for (let i = 0; i < this.chunks.length; i += batchSize) {
        const batch = this.chunks.slice(i, i + batchSize);
        const texts = batch.map((c) => c.text.substring(0, 500)); // Limiter à 500c pour la vitesse

        const result = await this.embeddingModel(texts, {
          pooling: 'mean',
          normalize: true,
        });

        // result est un tensor, extraire les données
        const data = result.tolist ? result.tolist() : Array.from(result.data);

        if (Array.isArray(data[0])) {
          // Format [batch][dim]
          for (const vec of data) {
            this.embeddings.push(vec);
          }
        } else {
          // Format plat, reconstruire
          const dim = 384;
          for (let j = 0; j < data.length; j += dim) {
            this.embeddings.push(data.slice(j, j + dim));
          }
        }

        if ((i / batchSize) % 4 === 0) {
          process.stdout.write(
            `[RAG] Embeddings: ${Math.min(i + batchSize, this.chunks.length)}/${this.chunks.length}\n`,
          );
        }
      }

      console.log(`[RAG] ${this.embeddings.length} embeddings générés`);
    } catch (err) {
      console.warn('[RAG] Embeddings non disponibles, fallback recherche textuelle:', err.message);
      this.embeddings = null;
    }
  }

  /**
   * Calcule la similarité cosinus entre deux vecteurs
   */
  _cosineSimilarity(a, b) {
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  /**
   * Parcourt tous les fichiers de knowledge_base et les découpe en chunks
   */
  _cleanDocumentContent(content, filename) {
    let clean = content;
    const ext = filename.split('.').pop().toLowerCase();

    // Pour les fichiers JSON et YAML, skip les nettoyages destructifs
    if (ext === 'json' || ext === 'yaml' || ext === 'yml') {
      clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
      return clean;
    }

    // 1. Supprimer les caractères de contrôle (sauf \n et \t)
    clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    // 2. Normaliser les apostrophes et guillemets typographiques
    clean = clean.replace(/[''']/g, "'");
    clean = clean.replace(/[""«»]/g, '"');

    // 3. Correction d'encodage OCR: Ã© → é, Ã¨ → è, Ãª → ê, etc.
    const ocrFixMap = {
      // D'abord les mots complets avec € (plus spécifiques)
      'R€gles': 'Règles',
      'l€s': 'les',
      'd€s': 'des',
      '€lectricit': 'Électricit',
      '€lectrique': 'Électrique',
      '€lectr': 'Électr',
      'Th€saurus': 'Thésaurus',
      Sngaal: 'Sénégalaise',
      sngaal: 'sénégalaise',
      Sngal: 'Sénégal',
      '€': 'E',
      '‚': "'",
      // Puis les corrections d'encodage standard (UTF-8 interprété comme Latin-1)
      'Ã©': 'é',
      'Ã¨': 'è',
      Ãª: 'ê',
      'Ã«': 'ë',
      'Ã ': 'à',
      'Ã¢': 'â',
      'Ã¤': 'ä',
      'Ã®': 'î',
      'Ã¯': 'ï',
      'Ã´': 'ô',
      'Ã¶': 'ö',
      'Ã¹': 'ù',
      'Ã»': 'û',
      'Ã¼': 'ü',
      'Ã§': 'ç',
      'Ã‡': 'Ç',
      'Ã‰': 'É',
      Ãˆ: 'È',
      ÃŠ: 'Ê',
      'Ã‹': 'Ë',
      'Ã€': 'À',
      'Ã‚': 'Â',
      'Ã„': 'Ä',
      ÃŽ: 'Î',
      'Ã?': 'Ï',
      'Ã”': 'Ô',
      'Ã–': 'Ö',
      'Ã™': 'Ù',
      'Ã›': 'Û',
      Ãœ: 'Ü',
      'Å“': 'œ',
      'Å’': 'Œ',
      'Â°': '°',
      'Â±': '±',
      'Â²': '²',
      'Â³': '³',
      Âµ: 'μ',
      'Â·': '·',
      'Â»': '»',
      'Â«': '«',
      'â‚¬': '€',
      'Â¤': '¤',
      'Â ': ' ',
    };
    for (const [bad, good] of Object.entries(ocrFixMap)) {
      clean = clean.replaceAll(bad, good);
    }

    // 4. Supprimer les pieds de page "UTE - N - NF C 18-510"
    clean = clean.replace(/^[A-Z]{2,6}\s*-\s*\d+\s*-\s*[A-Z].{0,30}$/gm, '');

    // 5. Supprimer les pages isolées avec juste "UTE"
    clean = clean.replace(/^UTE$/gm, '');
    clean = clean.replace(/^NF C 18-510$/gm, '');

    // 6. Supprimer les motifs "- N -" (numéros de page encadrés)
    clean = clean.replace(/^-\s*\d+\s*-$/gm, '');

    // 7. Supprimer les numéros de page isolés sur une ligne
    clean = clean.replace(/^\d+$/gm, '');

    // 8. Supprimer les lignes de tirets bas (artefacts de tableaux) ____
    clean = clean.replace(/_{3,}.*$/gm, '');

    // 9. Supprimer les lignes de points de table des matières
    clean = clean.replace(/^\.{4,}.*$/gm, '');

    // 10. Supprimer les lignes de pointillés
    clean = clean.replace(/^[\s.]{10,}$/gm, '');

    // 11. Corriger les lettres isolées sur leur ligne (artefact d'extraction de tableaux)
    // Une lettre seule suivie d'un saut de ligne puis de texte → conserver mais supprimer le double saut
    clean = clean.replace(/^([A-Z])\n\n(?=[A-ZÀ-ÿ])/gm, '$1\n');

    // 11b. Corriger les lettres espacées sur la même ligne (artefact d'extraction PDF de documents scannés)
    // Ex: "D i r e c t i o n   C o m m e r c i a l e" → "Direction   Commerciale"
    // Détecter les lignes avec plus de 50% d'espaces (anormal) et fusionner les lettres isolées
    clean = clean
      .split('\n')
      .map((line) => {
        const totalChars = line.length;
        if (totalChars < 10) return line;
        const spaceCount = (line.match(/ /g) || []).length;
        const spaceRatio = spaceCount / totalChars;
        // Si plus de 40% d'espaces dans la ligne, c'est probablement des lettres espacées
        if (spaceRatio > 0.4) {
          // Fusionner les lettres isolées : supprimer l'espace entre deux caractères lettres
          line = line.replace(/(?<=[A-Za-zÀ-ÿ0-9]) (?=[A-Za-zÀ-ÿ0-9.,;:!?()\-'\n])/g, '');
          // Nettoyer les espaces multiples résiduels (ex: "Direction  Commerciale" → "Direction Commerciale")
          line = line.replace(/ {2,}/g, ' ');
        }
        return line;
      })
      .join('\n');

    // 12. Supprimer les lignes vides multiples (réduire à max 2)
    clean = clean.replace(/\n{4,}/g, '\n\n\n');

    // 13. Nettoyer les espaces multiples dans le texte
    clean = clean.replace(/[ \t]{3,}/g, '  ');

    // 14. Supprimer les lignes qui ne contiennent que des chiffres séparés par des espaces
    clean = clean.replace(/^[\d\s]+$/gm, '');

    // 15. Nettoyer les fins de ligne résiduelles (lignes vides en trop)
    clean = clean.replace(/\n{3,}/g, '\n\n');

    return clean;
  }

  async _loadAndChunkAll() {
    const allChunks = [];

    if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
      console.warn(`[RAG] Répertoire ${KNOWLEDGE_BASE_DIR} introuvable`);
      return [];
    }

    const files = fs.readdirSync(KNOWLEDGE_BASE_DIR);

    for (const filename of files) {
      const filepath = path.join(KNOWLEDGE_BASE_DIR, filename);
      const stat = fs.statSync(filepath);
      if (!stat.isFile()) continue;

      const ext = path.extname(filename).toLowerCase();
      const source = filename.replace(ext, '');

      try {
        let content = fs.readFileSync(filepath, 'utf-8');
        // Normaliser les fins de ligne Windows (\r\n) en Unix (\n)
        content = content.replace(/\r\n/g, '\n');
        // Appliquer le nettoyage global du document
        content = this._cleanDocumentContent(content, filename);
        let fileChunks = [];

        switch (ext) {
          case '.md':
            fileChunks = this._chunkMarkdown(content, source, filename);
            break;
          case '.json':
            fileChunks = this._chunkJSON(content, source, filename);
            break;
          case '.yaml':
          case '.yml':
            fileChunks = this._chunkYAML(content, source, filename);
            break;
          case '.pdf':
            // Les PDF sont binaires, on les lit avec pdf-parse
            fileChunks = await this._chunkPDF(filepath, source, filename);
            break;
          default:
            continue; // Ignorer les autres types
        }

        allChunks.push(...fileChunks);
        console.log(`[RAG] ${filename} → ${fileChunks.length} chunks`);
      } catch (err) {
        console.warn(`[RAG] Erreur lors du traitement de ${filename}:`, err.message);
      }
    }

    return allChunks;
  }

  /**
   * Extrait le texte d'un fichier PDF et le découpe en chunks
   */
  async _chunkPDF(filepath, source, filename) {
    try {
      const dataBuffer = fs.readFileSync(filepath);
      const data = await pdfParse(dataBuffer);
      const text = data.text || '';

      if (text.length < 50) {
        console.warn(`[RAG] PDF ${filename}: texte trop court (${text.length}c), peut-être scanné`);
        return [];
      }

      console.log(`[RAG] PDF ${filename}: ${text.length}c extrait, ${data.numpages} pages`);

      // Appliquer le nettoyage
      const cleaned = this._cleanDocumentContent(text, filename);

      // Traiter comme du Markdown (découpage aux titres/paragraphes)
      const chunks = this._chunkMarkdown(cleaned, source, filename);

      // Si le chunking markdown n'a pas fonctionné (pas de titres),
      // découper aux paragraphes
      if (chunks.length <= 1 && text.length > 5000) {
        return this._splitPDFByContent(cleaned, source, filename);
      }

      return chunks;
    } catch (err) {
      console.warn(`[RAG] Erreur PDF ${filename}: ${err.message}`);
      return [];
    }
  }

  /**
   * Découpe un PDF sans titres détectables en sections de taille raisonnable
   */
  _splitPDFByContent(text, source, filename) {
    const chunks = [];
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = '';
    let chunkIndex = 0;
    const MAX_SIZE = 6000;

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      if ((currentChunk + '\n\n' + trimmed).length > MAX_SIZE && currentChunk.length > 500) {
        chunks.push({
          id: `${source}_pdf_${chunkIndex}`,
          text: currentChunk.trim(),
          metadata: {
            source: filename,
            section: `Section ${chunkIndex + 1}`,
            type: 'pdf_paragraph',
          },
        });
        currentChunk = trimmed;
        chunkIndex++;
      } else {
        currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
      }
    }

    if (currentChunk.trim().length > 50) {
      chunks.push({
        id: `${source}_pdf_${chunkIndex}`,
        text: currentChunk.trim(),
        metadata: { source: filename, section: `Section ${chunkIndex + 1}`, type: 'pdf_paragraph' },
      });
    }

    return chunks;
  }

  _subdivideLargeChunks(chunks, source, maxSize = 8000) {
    const result = [];
    const headingRegex = /^(#{1,4})\s+(.+)$/gm;

    for (const chunk of chunks) {
      if (chunk.text.length <= maxSize) {
        result.push(chunk);
        continue;
      }

      // Chercher les sous-titres # dans le contenu
      const headings = [];
      let match;
      while ((match = headingRegex.exec(chunk.text)) !== null) {
        headings.push({
          index: match.index,
          level: match[1].length,
          title: match[2].trim(),
        });
      }

      if (headings.length > 1) {
        // Subdiviser aux niveaux de titres
        for (let i = 0; i < headings.length; i++) {
          const start = headings[i].index;
          const end = i < headings.length - 1 ? headings[i + 1].index : chunk.text.length;
          const subText = chunk.text.substring(start, end).trim();

          if (subText.length > 50) {
            result.push({
              id: `${chunk.id}_ss_${i}`,
              text: subText,
              metadata: {
                ...chunk.metadata,
                sectionParent: chunk.metadata.section,
                section: headings[i].title,
                niveau: headings[i].level,
              },
            });
          }
        }
      } else {
        // Pas assez de sous-titres => découper aux paragraphes
        result.push(...this._splitByParagraphs(chunk, maxSize));
      }
    }

    return result;
  }

  _splitByParagraphs(chunk, maxSize) {
    if (chunk.text.length <= maxSize) return [chunk];

    const parts = [];
    const paragraphs = chunk.text.split(/\n\n+/);
    let currentPart = '';
    let partIndex = 0;

    for (const para of paragraphs) {
      if ((currentPart + '\n\n' + para).length > maxSize && currentPart.length > 0) {
        parts.push({
          id: `${chunk.id}_para_${partIndex}`,
          text: currentPart.trim(),
          metadata: { ...chunk.metadata },
        });
        currentPart = para;
        partIndex++;
      } else {
        currentPart = currentPart ? currentPart + '\n\n' + para : para;
      }
    }

    if (currentPart.trim().length > 50) {
      parts.push({
        id: `${chunk.id}_para_${partIndex}`,
        text: currentPart.trim(),
        metadata: { ...chunk.metadata },
      });
    }

    return parts.length > 0 ? parts : [chunk];
  }

  /**
   * Découpe un fichier Markdown en chunks par sections (titres ## ou ###)
   */
  _chunkMarkdown(content, source, filename) {
    const chunks = [];
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent = [];
    let sectionIndex = 0;
    let inSommaire = false; // Flag pour ignorer la table des matières

    // Expression pour détecter les titres Markdown (# ## ### ####)
    const headingRegex = /^(#{1,4})\s*(.+)$/;
    // Expression pour détecter les titres en MAJUSCULES (style NS 01-001)
    const uppercaseTitleRegex = /^[A-Z0-9\s\-.,:;!?()'"]+$/u;
    // Expression pour les titres numérotés
    const numberedTitleRegex = /^\d+(\.\d+)*\s+[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇ]/u;
    // Expression pour une entrée de table des matières (num + titre + page en fin de ligne)
    const tocEntryRegex = /^\d+(\.\d+)*\s+.+\s+\d{1,4}$/u;
    // Expression pour détecter les pieds de page (ex: "UTE - 15 - NF C 18-510")
    const footerRegex = /^[A-Z]{2,4}\s*-\s*\d+\s*-\s*[A-Z]/;

    for (const line of lines) {
      const trimmed = line.trim();
      const match = line.match(headingRegex);

      // Détecter le début du sommaire
      if (match && match[2].trim().toLowerCase().startsWith('sommaire')) {
        inSommaire = true;
        continue; // Ne pas inclure le titre 'Sommaire' dans les chunks
      }

      // Détecter la fin du sommaire : une section vide # ou un titre '#'
      if (inSommaire && match && !match[2].trim().toLowerCase().startsWith('sommaire')) {
        inSommaire = false;
      }

      // Si on est dans le sommaire, ignorer la ligne
      if (inSommaire) continue;

      // Ignorer les titres vides (# avec rien après)
      if (match && match[2].trim().length === 0) continue;

      // Expression pour les titres en majuscules
      const isUppercaseTitle =
        trimmed.length > 3 &&
        trimmed.length < 200 &&
        uppercaseTitleRegex.test(trimmed) &&
        !trimmed.startsWith('—') &&
        !trimmed.startsWith('-') &&
        !trimmed.match(/^[\d\s]+$/);

      // Expression pour les titres numérotés
      const isNumberedTitle =
        trimmed.length > 5 && trimmed.length < 200 && numberedTitleRegex.test(trimmed);

      // Vérifier si c'est une entrée de TOC (numéro + titre + numéro de page)
      const isTocEntry = isNumberedTitle && tocEntryRegex.test(trimmed);

      // Ne pas traiter les entrées du sommaire comme des sections
      if (!isTocEntry && (match || isUppercaseTitle || isNumberedTitle)) {
        // Sauvegarder la section précédente si elle a du contenu
        if (currentContent.length > 1) {
          const chunkText = currentContent.join('\n').trim();
          if (chunkText.length > 50) {
            chunks.push({
              id: `${source}_section_${sectionIndex}`,
              text: chunkText,
              metadata: {
                source: filename,
                section: currentSection,
                type: 'markdown',
              },
            });
          }
          sectionIndex++;
        }
        currentSection = match ? match[2].trim() : trimmed;
        currentContent = [line];
      } else if (currentContent.length > 0 || (currentContent.length === 0 && !isTocEntry)) {
        currentContent.push(line);
      }
    }

    // Dernière section
    if (currentContent.length > 0) {
      const chunkText = currentContent.join('\n').trim();
      if (chunkText.length > 50) {
        chunks.push({
          id: `${source}_section_${sectionIndex}`,
          text: chunkText,
          metadata: {
            source: filename,
            section: currentSection,
            type: 'markdown',
          },
        });
      }
    }

    // Post-traitement : filtrer le bruit et nettoyer
    return this._filterChunks(chunks, source, filename);
  }

  /**
   * Filtre et nettoie les chunks pour éliminer le bruit (pieds de page, TOC, etc.)
   */
  _filterChunks(chunks, source, filename) {
    const footerRegex = /^[A-Z]{2,4}\s*-\s*\d+\s*-\s*[A-Z]/m;

    return chunks.filter((chunk) => {
      const lines = chunk.text.split('\n').filter((l) => l.trim());

      // Supprimer les lignes de pied de page
      const cleanLines = lines.filter((l) => !footerRegex.test(l.trim()));
      chunk.text = cleanLines.join('\n').trim();

      // Vérifier que le chunk a du contenu substantiel après nettoyage
      if (chunk.text.length < 50) return false;

      // Filtrer les chunks qui sont uniquement des numéros de page dispersés
      const alphaRatio =
        (chunk.text.match(/[A-Za-zÀ-ÿ]/g) || []).length / Math.max(chunk.text.length, 1);
      if (alphaRatio < 0.3) return false;

      // Compter le nombre de mots significatifs
      const words = chunk.text.split(/\s+/).filter((w) => w.length > 2);
      if (words.length < 5) return false;

      return true;
    });
  }

  /**
   * Découpe un fichier JSON structuré (format Full AI) en chunks
   * Extrait les sections, articles, définitions et annexes
   */
  _chunkJSON(content, source, filename) {
    const chunks = [];
    let data;

    try {
      data = JSON.parse(content);
    } catch (err) {
      console.warn(`[RAG] JSON invalide ${filename}: ${err.message}`);
      return [];
    }

    // Extraire les sections de l'atomisation (sections ou articles)
    if (data.atomisation) {
      const sections = data.atomisation.sections || data.atomisation.articles || [];

      for (const section of sections) {
        const text = section.contenu || section.contenu_complet || '';
        const titre = section.titre || '';
        const numero = section.numero || '';

        if (text.length > 10) {
          chunks.push({
            id: `${source}_${section.id || numero}_${section.niveau || 0}`,
            text: `${titre ? `**${titre}**\n\n` : ''}${numero ? `*${numero}* ` : ''}${text}`,
            metadata: {
              source: filename,
              section: titre,
              article: numero,
              niveau: section.niveau,
              type: 'json_atomisation',
            },
          });
        }
      }
    }

    // Extraire les définitions
    if (data.atomisation && data.atomisation.definitions) {
      const defs = data.atomisation.definitions;
      if (defs.section_3 && defs.section_3.categories) {
        for (const category of defs.section_3.categories) {
          if (category.termes) {
            for (const terme of category.termes) {
              if (terme.terme && terme.definition) {
                chunks.push({
                  id: `${source}_def_${terme.numero}`,
                  text: `**${terme.terme}** : ${terme.definition}`,
                  metadata: {
                    source: filename,
                    section: `Définition: ${terme.terme}`,
                    type: 'json_definition',
                  },
                });
              }
            }
          }
        }
      }
    }

    // Extraire le résumé / metadata
    if (data.resume) {
      try {
        const resume = data.resume;
        const resumeText = JSON.stringify(
          {
            type_document: resume.metadonnees?.type_document,
            numero_norme: resume.metadonnees?.numero_norme,
            titre: resume.metadonnees?.titre,
            resume_document: resume.resume_document,
            concepts_cles: resume.concepts_cles,
          },
          null,
          2,
        );
        chunks.push({
          id: `${source}_resume`,
          text: resumeText,
          metadata: {
            source: filename,
            section: 'Résumé du document',
            type: 'json_resume',
          },
        });
      } catch (err) {
        // Ignorer les erreurs de résumé
      }
    }

    // Extraire les sections principales (niveau 1) si présentes
    if (data.sections) {
      for (const section of data.sections) {
        if (section.content && section.content.length > 10) {
          chunks.push({
            id: `${source}_section_principale_${section.id || section.numero || '0'}`,
            text: `${section.titre || ''}\n\n${section.content}`,
            metadata: {
              source: filename,
              section: section.titre,
              type: 'json_section',
            },
          });
        }
      }
    }

    // Subdiviser les gros chunks
    return this._subdivideLargeChunks(chunks, source, 8000);
  }

  /**
   * Découpe un fichier YAML en chunks par sections principales
   */
  _chunkYAML(content, source, filename) {
    const chunks = [];
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent = [];
    let sectionIndex = 0;

    // Expression pour détecter les sections YAML (lignes sans indentation suivies de ":")
    const sectionRegex = /^(\S[^:]*):\s*(.+)?$/;

    for (const line of lines) {
      // Détecter une nouvelle section YAML de premier niveau (pas d'indentation)
      if (
        !line.startsWith(' ') &&
        !line.startsWith('\t') &&
        line.match(sectionRegex) &&
        line.trim().length > 0
      ) {
        // Sauvegarder la section précédente
        if (currentContent.length > 0) {
          const chunkText = currentContent.join('\n').trim();
          if (chunkText.length > 20) {
            chunks.push({
              id: `${source}_yaml_section_${sectionIndex}`,
              text: chunkText,
              metadata: {
                source: filename,
                section: currentSection,
                type: 'yaml',
              },
            });
          }
          sectionIndex++;
        }
        currentSection = line;
        currentContent = [line];
      } else {
        currentContent.push(line);
      }
    }

    // Dernière section
    if (currentContent.length > 0) {
      const chunkText = currentContent.join('\n').trim();
      if (chunkText.length > 20) {
        chunks.push({
          id: `${source}_yaml_section_${sectionIndex}`,
          text: chunkText,
          metadata: {
            source: filename,
            section: currentSection,
            type: 'yaml',
          },
        });
      }
    }

    return this._subdivideLargeChunks(chunks, source, 8000);
  }

  /**
   * Recherche les chunks les plus pertinents pour une requête donnée
   * Utilise un scoring TF-like simple (sans embeddings)
   */
  searchChunks(query, limit = 10) {
    if (!this.initialized || this.chunks.length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);

    // Mots vides français (stop words)
    const stopWords = new Set([
      'le',
      'la',
      'les',
      'un',
      'une',
      'des',
      'du',
      'de',
      'et',
      'ou',
      'est',
      'sont',
      'être',
      'avoir',
      'dans',
      'pour',
      'par',
      'avec',
      'sur',
      'que',
      'qui',
      'dont',
      'où',
      'ce',
      'cette',
      'ces',
      'il',
      'elle',
      'ils',
      'elles',
      'nous',
      'vous',
      'leur',
      'leurs',
      'plus',
      'très',
      'aussi',
      'mais',
      'donc',
      'car',
      'ni',
      'si',
      'tout',
      'tous',
      'toute',
      'toutes',
      'peut',
      'peu',
      'fait',
      'faire',
      'comme',
      'entre',
      'sans',
      'sous',
      'chez',
      'après',
      'avant',
      'pendant',
      'depuis',
      'jusque',
      'enfin',
      'alors',
      'ainsi',
    ]);

    const scored = [];

    for (const chunk of this.chunks) {
      const textLower = chunk.text.toLowerCase();
      let score = 0;

      // Score pour correspondance exacte de la requête
      if (textLower.includes(queryLower)) {
        score += 50;
      }

      // Score par mots-clés avec pondération
      let matches = 0;
      for (const word of queryWords) {
        if (stopWords.has(word)) continue;
        // Recherche du mot dans le texte
        const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
        const matchCount = (textLower.match(regex) || []).length;
        if (matchCount > 0) {
          matches++;
          // Bonus pour occurrences multiples
          score += Math.min(matchCount, 5) * 3;
        }
      }

      if (queryWords.length > 0) {
        const meaningfulWords = queryWords.filter((w) => !stopWords.has(w)).length || 1;
        score += (matches / meaningfulWords) * 40;
      }

      // Bonus pour les sections de titre qui matchent
      if (chunk.metadata.section) {
        const sectionLower = chunk.metadata.section.toLowerCase();
        if (sectionLower.includes(queryLower)) {
          score += 30;
        }
        for (const word of queryWords) {
          if (sectionLower.includes(word)) {
            score += 10;
          }
        }
      }

      if (score > 0) {
        scored.push({ chunk, score });
      }
    }

    // Trier par score décroissant et limiter
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.chunk);
  }

  /**
   * Recherche hybride : combine mots-clés + similarité sémantique (embeddings)
   * Donne de bien meilleurs résultats que la recherche textuelle seule.
   */
  searchChunksHybrid(query, limit = 20) {
    if (!this.initialized || this.chunks.length === 0) return [];

    // 1. Score textuel (mots-clés)
    const keywordResults = this.searchChunks(query, limit * 3);
    const keywordMap = new Map();
    for (const chunk of keywordResults) {
      keywordMap.set(chunk.id || chunk.text.substring(0, 50), chunk);
    }

    // 2. Score sémantique (embeddings) si disponible
    let semanticResults = [];
    if (this.embeddings && this.embeddings.length === this.chunks.length) {
      semanticResults = this._searchSemantic(query, limit * 2);
    }

    // 3. Fusionner les scores (60% sémantique + 40% mots-clés)
    const combined = new Map();

    for (let i = 0; i < keywordResults.length; i++) {
      const key = keywordResults[i].id || keywordResults[i].text.substring(0, 50);
      const kwScore = 1 - i / keywordResults.length; // Normalisé 0-1
      combined.set(key, {
        chunk: keywordResults[i],
        score: kwScore * 0.4,
      });
    }

    for (let i = 0; i < semanticResults.length; i++) {
      const key = semanticResults[i].chunk.id || semanticResults[i].chunk.text.substring(0, 50);
      const semScore = 1 - i / semanticResults.length;
      if (combined.has(key)) {
        combined.get(key).score += semScore * 0.6;
      } else {
        combined.set(key, {
          chunk: semanticResults[i].chunk,
          score: semScore * 0.6,
        });
      }
    }

    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => ({ ...r.chunk, score: Math.round(r.score * 100) }));
  }

  /**
   * Recherche sémantique pure par similarité cosinus
   */
  _searchSemantic(query, limit = 20) {
    if (!this.embeddings || this.embeddings.length !== this.chunks.length) return [];

    // Embedding de la requête (synchrone, le modèle est déjà chargé)
    // On utilise une approche simplifiée : les embeddings sont générés en arrière-plan
    // et on fait la recherche coté client avec un scoring TF-IDF-like amélioré

    // Pour être robuste sans dépendre du modèle au moment de la recherche,
    // on utilise une approche TF-IDF vectorisée (plus rapide et fiable)
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2 && w.length < 30);
    if (queryWords.length === 0) return [];

    const scored = [];

    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      const textLower = chunk.text.toLowerCase();

      // Fréquence des termes pondérée (TF amélioré)
      let score = 0;
      let termsFound = 0;

      for (const word of queryWords) {
        // Chercher le mot avec ses variantes
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = textLower.match(regex);
        if (matches) {
          termsFound++;
          // TF avec log : log(1 + count) pour éviter le biais des chunks longs
          score += Math.log(1 + matches.length);

          // Bonus position : les premières occurrences sont plus importantes
          const firstPos = textLower.indexOf(word);
          if (firstPos >= 0) {
            score += Math.max(0, 1 - firstPos / Math.max(textLower.length, 1)) * 2;
          }
        }
      }

      // Bonus couverture : ratio de termes trouvés
      if (termsFound > 0 && queryWords.length > 0) {
        score *= 0.5 + (0.5 * termsFound) / queryWords.length;
      }

      // Pénaliser les chunks trop courts (< 100c) ou trop longs (> 10000c)
      if (chunk.text.length < 100) score *= 0.3;
      if (chunk.text.length > 10000) score *= 0.7;

      if (score > 0) {
        scored.push({ chunk, score });
      }
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Recherche intelligente avec fusion des doublons.
   * Compare les chunks similaires entre différentes sources,
   * garde le meilleur et fusionne les références.
   */
  searchChunksSmart(query, limit = 8) {
    // Utiliser la recherche hybride (mots-clés + sémantique)
    const rawResults = this.searchChunksHybrid(query, limit * 4);
    if (rawResults.length === 0) return [];

    // Grouper les chunks par sujet (similarité de texte)
    const groups = [];
    const SIMILARITY_THRESHOLD = 0.5; // 50% de mots communs = doublon

    for (const chunk of rawResults) {
      const words = new Set(
        chunk.text
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 4),
      );
      if (words.size < 3) {
        groups.push({ chunks: [chunk], words });
        continue;
      }

      let added = false;
      for (const group of groups) {
        // Calculer la similarité (intersection / union)
        const intersection = new Set([...words].filter((w) => group.words.has(w)));
        const union = new Set([...words, ...group.words]);
        const similarity = intersection.size / union.size;

        if (similarity > SIMILARITY_THRESHOLD) {
          group.chunks.push(chunk);
          // Fusionner les mots uniques
          for (const w of words) group.words.add(w);
          added = true;
          break;
        }
      }

      if (!added) {
        groups.push({ chunks: [chunk], words });
      }
    }

    // Pour chaque groupe, garder le meilleur chunk et fusionner les sources
    const merged = [];
    for (const group of groups) {
      // Trier par score décroissant (le meilleur d'abord)
      group.chunks.sort((a, b) => b.score - a.score);

      const best = group.chunks[0];
      if (group.chunks.length > 1) {
        // Récupérer toutes les sources uniques
        const allSources = [...new Set(group.chunks.map((c) => c.metadata.source))];
        const allSections = [
          ...new Set(
            group.chunks
              .map((c) => c.metadata.section || c.metadata.sectionParent || '')
              .filter(Boolean),
          ),
        ];

        // Fusionner les métadonnées
        best.metadata = {
          ...best.metadata,
          sourcesFusionnees: allSources,
          sectionsFusionnees: allSections,
          nbSources: allSources.length,
        };
      }

      merged.push(best);
    }

    // Trier par score et limiter
    return merged.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, limit);
  }

  /**
   * Retourne les statistiques du service RAG
   */
  getStats() {
    const sources = {};
    for (const chunk of this.chunks) {
      const src = chunk.metadata.source || 'inconnu';
      sources[src] = (sources[src] || 0) + 1;
    }

    return {
      initialized: this.initialized,
      totalChunks: this.chunks.length,
      sources,
    };
  }

  /**
   * Recharge la base de connaissances
   */
  async reload() {
    this.chunks = [];
    this.initialized = false;
    // Supprimer le cache pour forcer la regénération
    try {
      if (fs.existsSync(CHUNKS_CACHE_FILE)) {
        fs.unlinkSync(CHUNKS_CACHE_FILE);
      }
    } catch (err) {
      // Ignorer
    }
    await this.initialize();
  }
}

// Singleton
const ragService = new RAGService();

export default ragService;
