const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const AI_SERVICES = {
    BRAIN: process.env.AI_BRAIN_URL || '',
    VISION: process.env.AI_VISION_URL || '',
    IMAGE: process.env.AI_IMAGE_URL || ''
};

const LOCAL_AI_REMOVED_MESSAGE = 'Le backend local haystack_backend a été retiré. Configurez un service distant (PROQUELEC_REMOTE_AI=1 / PROQUELEC_AI_PROVIDER / AI_BRAIN_URL / PROQUELEC_REMOTE_VISION_API).';

const REMOTE_AI_ENABLED = ["1", "true"].includes((process.env.PROQUELEC_REMOTE_AI || "").toLowerCase()) || !!process.env.PROQUELEC_AI_PROVIDER || !!process.env.PROQUELEC_AI_API_URL;
const AI_PROVIDER = (process.env.PROQUELEC_AI_PROVIDER || "openai").toLowerCase();
const AI_API_KEY = process.env.PROQUELEC_API_KEY;
const CUSTOM_AI_API_URL = process.env.PROQUELEC_AI_API_URL;
const REMOTE_IMAGE_API = process.env.PROQUELEC_REMOTE_IMAGE_API;
const IMAGE_API_KEY = process.env.PROQUELEC_IMAGE_API_KEY;
const REMOTE_VISION_API = process.env.PROQUELEC_REMOTE_VISION_API || REMOTE_IMAGE_API;
const REMOTE_AI_MODEL = process.env.PROQUELEC_AI_MODEL || (AI_PROVIDER === 'anthropic' ? 'claude-3.5' : 'gpt-4o');

function normalizeProvider(provider) {
    const alias = {
        chatgpt: 'openai',
        gpt: 'openai',
        openai: 'openai',
        anthropic: 'anthropic',
        claude: 'anthropic',
        'claude-2': 'anthropic',
        'claude-3': 'anthropic'
    };
    return alias[provider?.toLowerCase()] || provider?.toLowerCase();
}

async function callRemoteAI(body) {
    if (!AI_API_KEY && !CUSTOM_AI_API_URL) {
        throw new Error('PROQUELEC_API_KEY ou PROQUELEC_AI_API_URL requis pour remote AI.');
    }
    const provider = CUSTOM_AI_API_URL ? null : normalizeProvider(AI_PROVIDER);
    const headers = { 'Content-Type': 'application/json' };
    if (CUSTOM_AI_API_URL) {
        if (AI_API_KEY) headers.Authorization = `Bearer ${AI_API_KEY}`;
        const response = await axios.post(CUSTOM_AI_API_URL, body, { headers, timeout: 90000 });
        return response.data;
    }
    if (provider === 'anthropic') {
        headers['x-api-key'] = AI_API_KEY;
        const messages = body.messages || [];
        let prompt = body.prompt || '';
        if (messages.length) {
            prompt = messages.map((m) => {
                if (m.role === 'user') return `\n\nHuman: ${m.content}`;
                if (m.role === 'assistant') return `\n\nAssistant: ${m.content}`;
                return '';
            }).join('');
        }
        if (!prompt.includes('Human:') && !prompt.includes('Assistant:')) {
            prompt = `\n\nHuman: ${body.prompt || ''}\n\nAssistant:`;
        }
        const payload = {
            model: body.model || REMOTE_AI_MODEL,
            prompt,
            max_tokens_to_sample: body.max_tokens || 1024,
            temperature: body.temperature ?? 0.2
        };
        const response = await axios.post('https://api.anthropic.com/v1/complete', payload, { headers, timeout: 90000 });
        return response.data;
    }
    headers.Authorization = `Bearer ${AI_API_KEY}`;
    const messages = body.messages || [];
    if (body.prompt && !messages.length) {
        messages.push({ role: 'user', content: body.prompt });
    }
    if (body.system_prompt && !messages.some((m) => m.role === 'system')) {
        messages.unshift({ role: 'system', content: body.system_prompt });
    }
    const payload = {
        model: body.model || REMOTE_AI_MODEL,
        messages,
        max_tokens: body.max_tokens || 1024,
        temperature: body.temperature ?? 0.2
    };
    const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, { headers, timeout: 90000 });
    return response.data;
}

async function callRemoteImage(body) {
    if (!REMOTE_IMAGE_API) {
        throw new Error('PROQUELEC_REMOTE_IMAGE_API requis pour image remote.');
    }
    const headers = { 'Content-Type': 'application/json' };
    if (IMAGE_API_KEY) headers.Authorization = `Bearer ${IMAGE_API_KEY}`;
    const response = await axios.post(REMOTE_IMAGE_API, body, { headers, timeout: 120000 });
    return response.data;
}

async function callRemoteVision(filePath, prompt) {
    if (!REMOTE_VISION_API) {
        throw new Error('PROQUELEC_REMOTE_VISION_API ou PROQUELEC_REMOTE_IMAGE_API requis pour vision remote.');
    }
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    if (prompt) form.append('prompt', prompt);
    const headers = form.getHeaders();
    if (IMAGE_API_KEY) headers.Authorization = `Bearer ${IMAGE_API_KEY}`;
    const response = await axios.post(REMOTE_VISION_API, form, { headers, timeout: 60000 });
    return response.data;
}

async function generateWithRetry(model, parts, maxRetries = 3) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await model.generateContent(parts);
        } catch (error) {
            lastError = error;
            if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Resource has been exhausted')) {
                const waitTime = Math.pow(2, i) * 1000;
                console.warn(`[AI-RETRY] 429 detected, waiting ${waitTime}ms before retry ${i + 1}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

module.exports = {
    AI_SERVICES,
    LOCAL_AI_REMOVED_MESSAGE,
    REMOTE_AI_ENABLED,
    AI_PROVIDER,
    AI_API_KEY,
    CUSTOM_AI_API_URL,
    REMOTE_IMAGE_API,
    IMAGE_API_KEY,
    REMOTE_VISION_API,
    REMOTE_AI_MODEL,
    normalizeProvider,
    callRemoteAI,
    callRemoteImage,
    callRemoteVision,
    generateWithRetry
};
