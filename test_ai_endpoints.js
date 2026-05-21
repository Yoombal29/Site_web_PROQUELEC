#!/usr/bin/env node

/**
 * Script de validation des endpoints IA distants
 * Usage: node test_ai_endpoints.js [--verbose]
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const VERBOSE = process.argv.includes('--verbose');
const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000';

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.cyan}=== ${msg} ===${colors.reset}\n`)
};

// Validateur de configuration
async function validateConfig() {
  log.section('Validation Configuration IA');

  const required = ['PROQUELEC_REMOTE_AI', 'PROQUELEC_AI_PROVIDER', 'PROQUELEC_API_KEY'];
  const optional = ['PROQUELEC_REMOTE_IMAGE_API', 'PROQUELEC_IMAGE_API_KEY', 'PROQUELEC_REMOTE_VISION_API'];

  let allValid = true;

  console.log('Variables obligatoires:');
  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      log.error(`${key} n'est pas définie`);
      allValid = false;
    } else {
      const masked = value.substring(0, 20) + '...';
      log.success(`${key} = ${masked}`);
    }
  }

  console.log('\nVariables optionnelles:');
  for (const key of optional) {
    const value = process.env[key];
    if (value) {
      const masked = value.substring(0, 20) + '...';
      log.success(`${key} = ${masked}`);
    } else {
      log.warning(`${key} non configurée (optionnel)`);
    }
  }

  return allValid;
}

// Test d'endpoint
async function testEndpoint(name, method, path, payload, expectedFields = []) {
  log.section(`Test: ${name}`);

  try {
    const url = `${API_BASE}${path}`;
    log.info(`${method} ${url}`);
    
    if (VERBOSE) {
      console.log('Payload:', JSON.stringify(payload, null, 2));
    }

    const response = await axios({
      method,
      url,
      data: payload,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer test-token`
      }
    });

    log.success(`Status: ${response.status}`);

    if (VERBOSE) {
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }

    // Valider champs attendus
    let fieldsValid = true;
    for (const field of expectedFields) {
      if (!response.data[field]) {
        log.warning(`Champ attendu "${field}" manquant`);
        fieldsValid = false;
      } else {
        log.success(`Champ "${field}" présent`);
      }
    }

    return { success: true, status: response.status, data: response.data, fieldsValid };
  } catch (error) {
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      if (VERBOSE && error.response.data) {
        console.log('Error:', JSON.stringify(error.response.data, null, 2));
      }
      return { success: false, status: error.response.status, error: error.response.data };
    } else if (error.code === 'ECONNREFUSED') {
      log.error(`Impossible de se connecter à ${API_BASE}`);
      return { success: false, error: 'Connection refused' };
    } else {
      log.error(`${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

// Tests des endpoints
async function runTests() {
  const results = {
    chat: false,
    image: false,
    contentGeneration: false,
    vision: false,
    status: false
  };

  // 1. Status check
  log.section('Vérification Statut Général');
  try {
    const resp = await axios.get(`${API_BASE}/api/ai/status`, {
      timeout: 5000,
      headers: { 'Authorization': 'Bearer test-token' }
    });
    log.success('Statut des services:');
    if (Array.isArray(resp.data)) {
      resp.data.forEach(svc => {
        const status = svc.status === 'online' ? '🟢' : '🔴';
        console.log(`  ${status} ${svc.service} (${svc.key}): ${svc.status}`);
      });
    }
    results.status = true;
  } catch (err) {
    log.error(`Statut indisponible: ${err.message}`);
  }

  // 2. Test Chat
  const chatTest = await testEndpoint(
    'Chat Endpoint',
    'POST',
    '/api/ai/chat',
    {
      messages: [
        { role: 'system', content: 'Tu es un assistant utile et parlant français.' },
        { role: 'user', content: 'Dis moi un conseil sur la sécurité électrique au Sénégal en 20 mots max.' }
      ],
      max_tokens: 100,
      temperature: 0.5
    },
    ['choices', 'model']
  );
  results.chat = chatTest.success;

  // 3. Test Content Generation
  const contentTest = await testEndpoint(
    'Content Generation Endpoint',
    'POST',
    '/api/ai/content-generation',
    {
      prompt: 'Génère un titre d\'article sur les normes électriques au Sénégal.',
      system_prompt: 'Tu es expert en électricité et normes techniques.',
      max_tokens: 100
    },
    ['content', 'model']
  );
  results.contentGeneration = contentTest.success;

  // 4. Test Image Generation
  const imageTest = await testEndpoint(
    'Image Generation Endpoint',
    'POST',
    '/api/ai/image',
    {
      prompt: 'Une installation électrique moderne et sécurisée au Sénégal, style dessin technique',
      size: '512x512',
      n: 1
    },
    ['data', 'created']
  );
  results.image = imageTest.success;

  // 5. Test Vision (simulation)
  log.section('Test: Vision Endpoint');
  try {
    // Créer une image de test simple
    const testImagePath = path.join(__dirname, 'test_image.jpg');
    if (!fs.existsSync(testImagePath)) {
      log.warning('Image de test non trouvée, création d\'une image placeholder');
      // Pour un vrai test, il faudrait une vraie image
      log.info('Pour tester vision avec votre image: curl -F "image=@votre_image.jpg" -F "prompt=Describe this" http://localhost:3000/api/ai/vision');
    } else {
      log.info(`Envoi image: ${testImagePath}`);
      log.warning('Test vision ignoré (nécessite une vraie image)');
    }
  } catch (err) {
    log.warning(`Vision non testée: ${err.message}`);
  }

  return results;
}

// Rapport final
function generateReport(results) {
  log.section('Résumé des Tests');

  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(v => v === true).length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`Tests réussis: ${passed}/${total} (${percentage}%)`);
  console.log('');
  console.log('Détails:');
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`  ${icon} ${test}`);
  });

  if (percentage === 100) {
    log.success('Toute la configuration est valide! 🎉');
    process.exit(0);
  } else if (percentage >= 75) {
    log.warning('Configuration partiellement valide. Vérifier les erreurs ci-dessus.');
    process.exit(1);
  } else {
    log.error('Configuration invalide. Consulter AI_PROVIDER_CONFIG.md pour l\'aide.');
    process.exit(2);
  }
}

// Main
(async () => {
  console.log(`${colors.bold}${colors.cyan}VALIDATEUR D'ENDPOINTS IA DISTANTS${colors.reset}`);
  console.log(`API Base: ${API_BASE}`);
  console.log('');

  const configValid = await validateConfig();
  
  if (!configValid) {
    log.error('Configuration incomplète. Impossible de continuer.');
    process.exit(1);
  }

  const results = await runTests();
  generateReport(results);
})();
