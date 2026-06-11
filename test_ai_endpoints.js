#!/usr/bin/env node

/**
 * Validation des endpoints IA PROQUELEC.
 *
 * Usage:
 *   node test_ai_endpoints.js
 *   node test_ai_endpoints.js --verbose
 *
 * Le projet est en ESM (`type: module`), ce script utilise donc `import`.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERBOSE = process.argv.includes('--verbose');
const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  info: (message) => console.log(`${colors.cyan}i ${message}${colors.reset}`),
  success: (message) => console.log(`${colors.green}OK ${message}${colors.reset}`),
  error: (message) => console.log(`${colors.red}KO ${message}${colors.reset}`),
  warning: (message) => console.log(`${colors.yellow}WARN ${message}${colors.reset}`),
  section: (message) =>
    console.log(`\n${colors.bold}${colors.cyan}=== ${message} ===${colors.reset}\n`),
};

async function validateConfig() {
  log.section('Validation configuration IA');

  const required = ['PROQUELEC_REMOTE_AI', 'PROQUELEC_AI_PROVIDER', 'PROQUELEC_API_KEY'];
  const optional = [
    'PROQUELEC_REMOTE_IMAGE_API',
    'PROQUELEC_IMAGE_API_KEY',
    'PROQUELEC_REMOTE_VISION_API',
  ];

  let allValid = true;

  console.log('Variables obligatoires:');
  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      log.error(`${key} n'est pas définie`);
      allValid = false;
    } else {
      log.success(`${key} = ${value.substring(0, 20)}...`);
    }
  }

  console.log('\nVariables optionnelles:');
  for (const key of optional) {
    const value = process.env[key];
    if (value) {
      log.success(`${key} = ${value.substring(0, 20)}...`);
    } else {
      log.warning(`${key} non configurée`);
    }
  }

  return allValid;
}

async function testEndpoint(name, method, endpoint, payload, expectedFields = []) {
  log.section(`Test: ${name}`);

  try {
    const url = `${API_BASE}${endpoint}`;
    log.info(`${method} ${url}`);

    if (VERBOSE && payload) {
      console.log('Payload:', JSON.stringify(payload, null, 2));
    }

    const response = await axios({
      method,
      url,
      data: payload,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
    });

    log.success(`Status: ${response.status}`);

    if (VERBOSE) {
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }

    for (const field of expectedFields) {
      if (!response.data?.[field]) {
        log.warning(`Champ attendu "${field}" manquant`);
      } else {
        log.success(`Champ "${field}" présent`);
      }
    }

    return true;
  } catch (error) {
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      if (VERBOSE && error.response.data) {
        console.log('Error:', JSON.stringify(error.response.data, null, 2));
      }
      return false;
    }

    if (error.code === 'ECONNREFUSED') {
      log.error(`Impossible de se connecter à ${API_BASE}`);
      return false;
    }

    log.error(error.message);
    return false;
  }
}

async function runTests() {
  const results = {
    status: false,
    chat: false,
    contentGeneration: false,
    image: false,
    vision: false,
  };

  log.section('Statut général');
  try {
    const response = await axios.get(`${API_BASE}/api/ai/status`, {
      timeout: 5000,
      headers: { Authorization: 'Bearer test-token' },
    });
    if (VERBOSE) {
      console.log(JSON.stringify(response.data, null, 2));
    }
    log.success('Statut IA disponible');
    results.status = true;
  } catch (error) {
    log.error(`Statut indisponible: ${error.message}`);
  }

  results.chat = await testEndpoint(
    'Chat',
    'POST',
    '/api/ai/chat',
    {
      messages: [
        { role: 'system', content: 'Tu es un assistant PROQUELEC parlant français.' },
        {
          role: 'user',
          content: 'Donne un conseil de sécurité électrique au Sénégal en 20 mots maximum.',
        },
      ],
      max_tokens: 100,
      temperature: 0.5,
    },
    ['choices', 'model'],
  );

  results.contentGeneration = await testEndpoint(
    'Content generation',
    'POST',
    '/api/ai/content-generation',
    {
      prompt: "Génère un titre d'article sur les normes électriques au Sénégal.",
      system_prompt: 'Tu es expert en électricité et normes techniques.',
      max_tokens: 100,
    },
    ['content', 'model'],
  );

  results.image = await testEndpoint(
    'Image',
    'POST',
    '/api/ai/image',
    {
      prompt: 'Installation électrique moderne et sécurisée au Sénégal, style dessin technique.',
      size: '512x512',
      n: 1,
    },
    ['data', 'created'],
  );

  log.section('Vision');
  const testImagePath = path.join(__dirname, 'test_image.jpg');
  if (fs.existsSync(testImagePath)) {
    log.warning('Test vision non automatisé ici : utilisez le formulaire multipart du backend.');
  } else {
    log.info('Aucune image test_image.jpg trouvée, test vision ignoré.');
  }

  return results;
}

function report(results) {
  log.section('Résumé');

  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`Tests réussis: ${passed}/${total} (${percentage}%)`);
  for (const [name, ok] of Object.entries(results)) {
    console.log(`  ${ok ? 'OK' : 'KO'} ${name}`);
  }

  if (percentage === 100) process.exit(0);
  if (percentage >= 75) process.exit(1);
  process.exit(2);
}

console.log(`${colors.bold}${colors.cyan}VALIDATEUR ENDPOINTS IA PROQUELEC${colors.reset}`);
console.log(`API Base: ${API_BASE}`);

const configValid = await validateConfig();
if (!configValid) {
  log.error('Configuration incomplète. Consultez AI_PROVIDER_CONFIG.md.');
  process.exit(1);
}

report(await runTests());
