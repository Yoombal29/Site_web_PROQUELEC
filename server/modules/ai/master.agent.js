/**
 * Master Agent PROQUELEC — Orchestrateur multi-providers avec RAG
 *
 * Supporte 12+ fournisseurs d'IA avec fallback automatique,
 * gestion des clés API, statistiques d'usage et health checks.
 *
 * Variables d'environnement :
 *   PROQUELEC_API_KEY          = Clé par défaut (pour tous les providers compatibles OpenAI)
 *   PROQUELEC_AI_PROVIDER      = Provider par défaut (groq, openai, anthropic, gemini, etc.)
 *   PROQUELEC_AI_MODEL         = Modèle spécifique (optionnel)
 *   PROQUELEC_API_BASE_URL     = URL API custom (optionnel)
 *
 *   # Clés spécifiques par provider (optionnelles, sinon utilise PROQUELEC_API_KEY)
 *   PROQUELEC_OPENAI_KEY
 *   PROQUELEC_ANTHROPIC_KEY
 *   PROQUELEC_GROQ_KEY
 *   PROQUELEC_GEMINI_KEY
 *   PROQUELEC_MISTRAL_KEY
 *   PROQUELEC_DEEPSEEK_KEY
 *   PROQUELEC_TOGETHER_KEY
 *   PROQUELEC_OPENROUTER_KEY
 */

import axios from 'axios';
import ragService from './rag.service.js';

// ═══════════════════════════════════════════════════════════════
//  CONFIGURATION DES 12+ PROVIDERS
// ═══════════════════════════════════════════════════════════════

const PROVIDERS = {
  // === Haut de gamme (performance) ===
  openai: {
    baseURL: 'https://api.openai.com/v1',
    models: {
      'gpt-4o': { context: 128000, cost: '$$$', speed: 'fast' },
      'gpt-4o-mini': { context: 128000, cost: '$', speed: 'fast' },
      'gpt-4-turbo': { context: 128000, cost: '$$$', speed: 'medium' },
      'o1-mini': { context: 128000, cost: '$$', speed: 'medium' },
    },
    defaultModel: 'gpt-4o-mini',
    envKey: 'PROQUELEC_OPENAI_KEY',
    apiKeyRequired: true,
  },
  anthropic: {
    baseURL: 'https://api.anthropic.com/v1',
    models: {
      'claude-3-5-sonnet-20241022': { context: 200000, cost: '$$$', speed: 'medium' },
      'claude-3-haiku-20240307': { context: 200000, cost: '$', speed: 'fast' },
    },
    defaultModel: 'claude-3-5-sonnet-20241022',
    envKey: 'PROQUELEC_ANTHROPIC_KEY',
    apiKeyRequired: true,
    headers: (apiKey) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    }),
    formatRequest: (messages) => {
      const systemMsg = messages.find((m) => m.role === 'system');
      const userMsgs = messages.filter((m) => m.role !== 'system');
      return {
        system: systemMsg?.content || '',
        messages: userMsgs,
        max_tokens: 4096,
      };
    },
    formatResponse: (data) => data.content?.[0]?.text || '',
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    models: {
      'gemini-1.5-pro': { context: 1000000, cost: '$$', speed: 'medium' },
      'gemini-1.5-flash': { context: 1000000, cost: '$', speed: 'fast' },
      'gemini-2.0-flash': { context: 1000000, cost: '$', speed: 'fast' },
    },
    defaultModel: 'gemini-1.5-flash',
    envKey: 'PROQUELEC_GEMINI_KEY',
    apiKeyRequired: true,
    headers: () => ({ 'Content-Type': 'application/json' }),
    formatRequest: (messages, model, apiKey) => {
      const systemMsg = messages.find((m) => m.role === 'system');
      const userMsgs = messages.filter((m) => m.role !== 'system');
      const contents = userMsgs.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      return {
        contents,
        systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
      };
    },
    buildUrl: (baseURL, model, apiKey) =>
      `${baseURL}/models/${model}:generateContent?key=${apiKey}`,
    formatResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || '',
  },

  // === Rapides et gratuits / abordables ===
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    models: {
      'llama-3.3-70b-versatile': { context: 32768, cost: 'free', speed: 'fast' },
      'llama-3.1-8b-instant': { context: 32768, cost: 'free', speed: 'fastest' },
      'mixtral-8x7b-32768': { context: 32768, cost: 'free', speed: 'fast' },
      'gemma2-9b-it': { context: 8192, cost: 'free', speed: 'fast' },
    },
    defaultModel: 'llama-3.3-70b-versatile',
    envKey: 'PROQUELEC_GROQ_KEY',
    apiKeyRequired: true,
  },
  together: {
    baseURL: 'https://api.together.xyz/v1',
    models: {
      'meta-llama/Llama-3.3-70B-Instruct-Turbo': { context: 131072, cost: '$', speed: 'fast' },
      'mistralai/Mixtral-8x22B-Instruct-v0.1': { context: 65536, cost: '$', speed: 'medium' },
      'deepseek-ai/DeepSeek-V3': { context: 65536, cost: '$', speed: 'medium' },
    },
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    envKey: 'PROQUELEC_TOGETHER_KEY',
    apiKeyRequired: true,
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    models: {
      'meta-llama/llama-3.3-70b-instruct': { context: 32768, cost: '$', speed: 'fast' },
      'openai/gpt-4o': { context: 128000, cost: '$$$', speed: 'fast' },
      'anthropic/claude-3.5-sonnet': { context: 200000, cost: '$$$', speed: 'medium' },
      'google/gemini-1.5-flash': { context: 1000000, cost: '$', speed: 'fast' },
      'qwen/qwen-2.5-72b-instruct': { context: 32768, cost: '$', speed: 'fast' },
    },
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    envKey: 'PROQUELEC_OPENROUTER_KEY',
    apiKeyRequired: true,
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://proquelec.sn',
      'X-Title': 'PROQUELEC Expert IA',
    }),
  },
  fireworks: {
    baseURL: 'https://api.fireworks.ai/inference/v1',
    models: {
      'accounts/fireworks/models/llama-v3p3-70b-instruct': {
        context: 32768,
        cost: '$',
        speed: 'fast',
      },
      'accounts/fireworks/models/mixtral-8x22b-instruct': {
        context: 65536,
        cost: '$',
        speed: 'medium',
      },
    },
    defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    envKey: 'PROQUELEC_FIREWORKS_KEY',
    apiKeyRequired: true,
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    models: {
      'deepseek-chat': { context: 65536, cost: '$', speed: 'fast' },
      'deepseek-reasoner': { context: 65536, cost: '$', speed: 'medium' },
    },
    defaultModel: 'deepseek-chat',
    envKey: 'PROQUELEC_DEEPSEEK_KEY',
    apiKeyRequired: true,
  },
  mistral: {
    baseURL: 'https://api.mistral.ai/v1',
    models: {
      'mistral-large-latest': { context: 128000, cost: '$$', speed: 'fast' },
      'mistral-medium-latest': { context: 32000, cost: '$', speed: 'fast' },
      'open-mistral-nemo': { context: 128000, cost: 'free', speed: 'fast' },
    },
    defaultModel: 'mistral-large-latest',
    envKey: 'PROQUELEC_MISTRAL_KEY',
    apiKeyRequired: true,
  },

  // === Locaux et spécialisés ===
  ollama: {
    baseURL: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
    models: {
      'llama3.1:8b': { context: 8192, cost: 'local', speed: 'varies' },
      'mistral:7b': { context: 8192, cost: 'local', speed: 'varies' },
      'qwen2.5:7b': { context: 32768, cost: 'local', speed: 'varies' },
    },
    defaultModel: 'llama3.1:8b',
    envKey: null,
    apiKeyRequired: false,
    headers: () => ({ 'Content-Type': 'application/json' }),
    buildUrl: (baseURL, model) => `${baseURL}/v1/chat/completions`,
  },
};

// ═══════════════════════════════════════════════════════════════
//  SYSTÈME DE PROMPS
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPTS = {
  expert: `Tu es l'Agent Maître de PROQUELEC Sénégal — Expert en normes électriques.

TON RÔLE :
- Autorité technique sur les normes NS 01-001, NF C18-510, NF C15-100, NF C14-100.
- Tu réponds en t'appuyant sur les extraits de la base documentaire fournis.
- Tu aides à la conformité et à la sécurité électrique.

RÈGLES D'OR :
- Utilise Mermaid pour les diagrammes complexes.
- Cite toujours les articles et sections pertinents de la norme.
- Base-toi sur les extraits fournis, ne invente pas.
- Priorise la sécurité électrique et la conformité normative.`,

  text: `Tu es un rédacteur technique PROQUELEC.
Génère du contenu clair, précis et professionnel en français.
Adapte le ton au public cible (professionnels ou grand public).`,

  code: `Tu es un développeur PROQUELEC spécialisé React/TypeScript/Tailwind.
Produis du code propre, fonctionnel et commenté en français.
Respecte les bonnes pratiques et la sécurité.`,

  translation: `Tu es un traducteur technique. Traduis précisément le contenu fourni.
Conserve la terminologie technique. Ne fais pas d'ajouts ni d'interprétations.`,
};

const DEFAULT_SYSTEM_PROMPT = SYSTEM_PROMPTS.expert;

// ═══════════════════════════════════════════════════════════════
//  GESTION DES CLÉS API
// ═══════════════════════════════════════════════════════════════

function getApiKey(providerName) {
  const provider = PROVIDERS[providerName];
  if (!provider) return null;

  // Clé spécifique au provider
  if (provider.envKey && process.env[provider.envKey]) {
    return process.env[provider.envKey];
  }

  // Clé par défaut (compatible OpenAI)
  if (providerName !== 'anthropic' && providerName !== 'gemini' && providerName !== 'ollama') {
    return process.env.PROQUELEC_API_KEY || null;
  }

  return null;
}

function getAvailableProviders() {
  const available = [];
  for (const [name, provider] of Object.entries(PROVIDERS)) {
    if (!provider.apiKeyRequired || getApiKey(name)) {
      available.push({
        name,
        defaultModel: provider.defaultModel,
        models: Object.entries(provider.models).map(([model, info]) => ({
          model,
          ...info,
        })),
      });
    }
  }
  return available;
}

// ═══════════════════════════════════════════════════════════════
//  STATISTIQUES D'USAGE
// ═══════════════════════════════════════════════════════════════

const usageStats = {
  totalCalls: 0,
  successCalls: 0,
  failedCalls: 0,
  byProvider: {},
  byModel: {},
  startTime: Date.now(),
};

function trackUsage(providerName, model, success, latencyMs) {
  usageStats.totalCalls++;
  if (success) usageStats.successCalls++;
  else usageStats.failedCalls++;

  if (!usageStats.byProvider[providerName]) {
    usageStats.byProvider[providerName] = { calls: 0, success: 0, failed: 0, totalLatency: 0 };
  }
  usageStats.byProvider[providerName].calls++;
  usageStats.byProvider[providerName][success ? 'success' : 'failed']++;
  usageStats.byProvider[providerName].totalLatency += latencyMs;

  if (!usageStats.byModel[model]) {
    usageStats.byModel[model] = { calls: 0, success: 0, totalLatency: 0 };
  }
  usageStats.byModel[model].calls++;
  if (success) usageStats.byModel[model].success++;
  usageStats.byModel[model].totalLatency += latencyMs;
}

// ═══════════════════════════════════════════════════════════════
//  CŒUR DU MASTER AGENT
// ═══════════════════════════════════════════════════════════════

function buildUserMessage(prompt, task, context, useRag) {
  let ragContext = '';

  if (useRag && prompt && typeof prompt === 'string' && prompt.trim().length > 0) {
    try {
      const relevantChunks = ragService.searchChunksSmart(prompt, 7);
      if (relevantChunks.length > 0) {
        ragContext =
          '\n\n--- EXTRAITS DE LA BASE DOCUMENTAIRE ---\n\n' +
          relevantChunks
            .map(
              (chunk, i) =>
                `[Source: ${chunk.metadata.source || 'documentation'}` +
                (chunk.metadata.section ? ` | ${chunk.metadata.section}` : '') +
                (chunk.metadata.article ? ` | Art. ${chunk.metadata.article}` : '') +
                `]\n${chunk.text}`,
            )
            .join('\n---\n') +
          '\n\n--- FIN DES EXTRAITS ---\n';
      }
    } catch (e) {
      console.warn('[RAG]', e.message);
    }
  }

  return ragContext
    ? `${ragContext}\n\nQUESTION: ${prompt}`
    : `Contexte: ${JSON.stringify(context || {})}. Tâche: ${task}. Prompt: ${prompt}`;
}

async function callProvider(providerName, model, messages, signal) {
  const provider = PROVIDERS[providerName];
  if (!provider) throw new Error(`Provider inconnu: ${providerName}`);

  const apiKey = getApiKey(providerName);
  if (provider.apiKeyRequired && !apiKey) {
    throw new Error(`Clé API manquante pour ${providerName}`);
  }

  const startTime = Date.now();

  // Adapter le format de requête selon le provider
  let requestBody;
  let requestUrl;
  let requestHeaders;

  if (provider.formatRequest) {
    // Provider avec format personnalisé (Anthropic, Gemini)
    requestBody = provider.formatRequest(messages, model, apiKey);
    requestUrl = provider.buildUrl
      ? provider.buildUrl(provider.baseURL, model, apiKey)
      : `${provider.baseURL}/messages`;
    requestHeaders = provider.headers
      ? provider.headers(apiKey)
      : { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  } else {
    // Format OpenAI-compatible (défaut pour la plupart)
    requestBody = {
      model,
      messages,
      temperature: 0.2,
      max_tokens: 4096,
    };
    requestUrl = provider.buildUrl
      ? provider.buildUrl(provider.baseURL, model, apiKey)
      : `${provider.baseURL}/chat/completions`;
    requestHeaders = provider.headers
      ? provider.headers(apiKey)
      : { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  }

  const response = await axios.post(requestUrl, requestBody, {
    headers: requestHeaders,
    timeout: 90000,
    signal,
  });

  const latency = Date.now() - startTime;

  // Extraire la réponse selon le format du provider
  let content;
  if (provider.formatResponse) {
    content = provider.formatResponse(response.data);
  } else {
    content = response.data.choices?.[0]?.message?.content || '';
  }

  trackUsage(providerName, model, true, latency);

  return { content, model, provider: providerName, latency };
}

async function tryProviders(providers, model, messages, signal) {
  const errors = [];

  for (const { name, models } of providers) {
    const modelToUse = model || models[0]?.model || PROVIDERS[name].defaultModel;
    try {
      const result = await callProvider(name, modelToUse, messages, signal);
      return result;
    } catch (err) {
      if (err.name === 'CanceledError') throw err;
      errors.push({ provider: name, error: err.message });
      console.warn(`[${name}] Échec: ${err.message}`);
    }
  }

  throw new Error(
    `Tous les providers ont échoué:\n${errors.map((e) => `- ${e.provider}: ${e.error}`).join('\n')}`,
  );
}

async function callLLM(prompt, task, context, options = {}) {
  const {
    provider: preferredProvider,
    model: preferredModel,
    useRag = true,
    signal = null,
  } = options;

  // Construire le message
  const systemPrompt = SYSTEM_PROMPTS[task] || DEFAULT_SYSTEM_PROMPT;
  const userMessage = buildUserMessage(prompt, task, context, useRag);
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  // Déterminer les providers disponibles
  let providers = getAvailableProviders();
  if (providers.length === 0) {
    throw new Error('Aucun provider IA configuré. Ajoutez PROQUELEC_API_KEY dans .env');
  }

  // Si un provider préféré est demandé, le mettre en premier
  if (preferredProvider) {
    const idx = providers.findIndex((p) => p.name === preferredProvider);
    if (idx > 0) {
      const [picked] = providers.splice(idx, 1);
      providers.unshift(picked);
    }
  }

  return await tryProviders(providers, preferredModel, messages, signal);
}

// ═══════════════════════════════════════════════════════════════
//  ROUTE PRINCIPALE
// ═══════════════════════════════════════════════════════════════

export async function masterRoute(req, res) {
  try {
    const {
      task = 'expert',
      prompt,
      context = {},
      provider: preferredProvider,
      model: preferredModel,
      useRag = true,
    } = req.body;

    const result = await callLLM(prompt, task, context, {
      provider: preferredProvider,
      model: preferredModel,
      useRag,
    });

    res.status(200).json({
      success: true,
      data: result.content,
      text: result.content,
      code: result.content,
      response: result.content,
      provider: result.provider,
      modelUsed: result.model,
      latencyMs: result.latency,
    });
  } catch (error) {
    console.error('[Master Agent]', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur du Master Agent',
      details: error.message,
    });
  }
}

// ═══════════════════════════════════════════════════════════════
//  ROUTE DE STATUS / DIAGNOSTIC
// ═══════════════════════════════════════════════════════════════

export async function masterStatusRoute(req, res) {
  const available = getAvailableProviders();
  const uptime = Math.floor((Date.now() - usageStats.startTime) / 1000);

  const providersStatus = {};
  for (const [name, provider] of Object.entries(PROVIDERS)) {
    const hasKey = !provider.apiKeyRequired || !!getApiKey(name);
    const stats = usageStats.byProvider[name] || { calls: 0, success: 0, failed: 0 };
    providersStatus[name] = {
      configured: hasKey,
      models: Object.keys(provider.models),
      defaultModel: provider.defaultModel,
      usage: {
        calls: stats.calls,
        successRate: stats.calls > 0 ? Math.round((stats.success / stats.calls) * 100) + '%' : '-',
        avgLatency: stats.calls > 0 ? Math.round(stats.totalLatency / stats.calls) + 'ms' : '-',
      },
    };
  }

  res.json({
    success: true,
    uptime: `${Math.floor(uptime / 60)}m ${uptime % 60}s`,
    totalCalls: usageStats.totalCalls,
    successCalls: usageStats.successCalls,
    failedCalls: usageStats.failedCalls,
    providers: providersStatus,
    availableProviders: available.map((p) => p.name),
    defaultProvider: process.env.PROQUELEC_AI_PROVIDER || 'groq',
    ragAvailable: ragService.initialized,
    ragChunks: ragService.chunks?.length || 0,
  });
}
