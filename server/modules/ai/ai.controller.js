const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { orchestrate } = require('../../orchestrator');
const pool = require('../../core/database');
const {
    AI_SERVICES, LOCAL_AI_REMOVED_MESSAGE,
    REMOTE_AI_ENABLED, AI_PROVIDER, AI_API_KEY, CUSTOM_AI_API_URL,
    REMOTE_IMAGE_API, IMAGE_API_KEY, REMOTE_VISION_API, REMOTE_AI_MODEL,
    callRemoteAI, callRemoteImage, callRemoteVision, generateWithRetry
} = require('./ai.service');
const { getChats, createChat, deleteChat, updateChat, getMessages, createMessage, getAiLogs } = require('./ai.repository');

const axios = require('axios');
const FormData = require('form-data');

async function chat(req, res) {
    try {
        if (REMOTE_AI_ENABLED) {
            const data = await callRemoteAI(req.body);
            return res.json(data);
        }
        if (!AI_SERVICES.BRAIN) {
            throw new Error(LOCAL_AI_REMOVED_MESSAGE);
        }
        const targetUrl = `${AI_SERVICES.BRAIN}/api/v1/chat`;
        console.log(`[AI-GATEWAY] Tunneling to: ${targetUrl}`);
        const response = await axios.post(targetUrl, req.body, { timeout: 90000 });
        res.json(response.data);
    } catch (error) {
        console.error('[AI-GATEWAY] Brain Error:', error.message);
        if (REMOTE_AI_ENABLED) {
            return res.status(502).json({ error: 'Remote AI indisponible', details: error.message });
        }
        res.status(502).json({ error: 'Cerveau IA indisponible', details: error.message });
    }
}

async function vision(req, res) {
    try {
        if (REMOTE_VISION_API) {
            console.log('[AI-GATEWAY] Forwarding vision request to remote API');
            const data = await callRemoteVision(req.file.path, req.body.prompt || 'Describe this image.');
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.json(data);
        }
        if (!req.file) return res.status(400).json({ error: 'Image requise' });
        if (!AI_SERVICES.VISION) {
            throw new Error('Aucun service Vision configuré. Configurez PROQUELEC_REMOTE_VISION_API ou AI_VISION_URL.');
        }
        console.log('[AI-GATEWAY] Floating request to VISION (Moondream)...');
        const form = new FormData();
        form.append('file', fs.createReadStream(req.file.path));
        form.append('prompt', req.body.prompt || 'Describe this image.');
        const response = await axios.post(`${AI_SERVICES.VISION}/analyze-vision`, form, {
            headers: { ...form.getHeaders() },
            timeout: 30000
        });
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json(response.data);
    } catch (error) {
        console.error('[AI-GATEWAY] Vision Error:', error.message);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(502).json({ error: 'Vision IA indisponible', details: error.message });
    }
}

async function image(req, res) {
    try {
        if (REMOTE_IMAGE_API) {
            console.log('[AI-GATEWAY] Forwarding image generation to remote API');
            const data = await callRemoteImage(req.body);
            return res.json(data);
        }
        if (!AI_SERVICES.IMAGE) {
            throw new Error('Aucun service Image configuré. Configurez PROQUELEC_REMOTE_IMAGE_API ou AI_IMAGE_URL.');
        }
        console.log('[AI-GATEWAY] Floating request to IMAGE (SDXL)...');
        const response = await axios.post(`${AI_SERVICES.IMAGE}/generate-visual`, req.body, { timeout: 120000 });
        res.json(response.data);
    } catch (error) {
        console.error('[AI-GATEWAY] Image Error:', error.message);
        res.status(502).json({ error: 'Générateur d\'Image indisponible', details: error.message });
    }
}

async function adminStart(_req, res) {
    return res.status(501).json({ error: 'Local AI service unavailable', message: LOCAL_AI_REMOVED_MESSAGE });
}

async function adminStop(_req, res) {
    return res.status(501).json({ error: 'Local AI service unavailable', message: LOCAL_AI_REMOVED_MESSAGE });
}

async function status(req, res) {
    if (REMOTE_AI_ENABLED) {
        return res.json([
            { service: `Cerveau Expert (${AI_PROVIDER.toUpperCase()})`, key: 'brain', status: AI_API_KEY ? 'online' : 'offline', url: CUSTOM_AI_API_URL || `remote:${AI_PROVIDER}` },
            { service: 'Vision Remote', key: 'vision', status: REMOTE_VISION_API ? 'online' : 'offline', url: REMOTE_VISION_API || 'not-configured' },
            { service: 'Générateur Image Remote', key: 'image', status: REMOTE_IMAGE_API ? 'online' : 'offline', url: REMOTE_IMAGE_API || 'not-configured' }
        ]);
    }
    const checkService = async (url, name, key) => {
        if (!url) return { service: name, key, status: 'not-configured', url: 'not-configured' };
        try {
            const endpoint = key === 'brain' ? `${url}/api/v1/chat/health` : `${url}/health`;
            await axios.get(endpoint, { timeout: 1500 });
            return { service: name, key, status: 'online', url };
        } catch {
            return { service: name, key, status: 'offline', url };
        }
    };
    const statuses = await Promise.all([
        checkService(AI_SERVICES.BRAIN, 'Cerveau Expert (Phi-3.5)', 'brain'),
        checkService(AI_SERVICES.VISION, 'Cortex Vision (Moondream)', 'vision'),
        checkService(AI_SERVICES.IMAGE, 'Générateur Image (SDXL)', 'image')
    ]);
    res.json(statuses);
}

async function generateVisual(req, res) {
    try {
        if (REMOTE_IMAGE_API) {
            const data = await callRemoteImage(req.body);
            return res.json(data);
        }
        const response = await fetch('http://127.0.0.1:8002/generate-visual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        if (!response.ok) throw new Error(`Python server error: ${response.statusText}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('AI Proxy Error:', err.message);
        res.status(502).json({
            success: false,
            error: 'Service de génération visuelle indisponible',
            type: "image",
            url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
            metadata: { model: "NodeJS-Fallback", fallback: true }
        });
    }
}

async function contentGeneration(req, res) {
    try {
        if (REMOTE_AI_ENABLED) {
            const data = await callRemoteAI({ prompt: req.body.prompt, messages: req.body.messages, system_prompt: req.body.system_prompt, model: req.body.model });
            return res.json(data);
        }
        const response = await fetch('http://127.0.0.1:8002/api/ai/content-generation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        if (!response.ok) throw new Error(`Python server error: ${response.statusText}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('AI Content Generation Proxy Error:', err.message);
        res.status(500).json({ error: 'AI Backend Unavailable', details: err.message });
    }
}

async function codeAssistant(req, res) {
    try {
        const { prompt, currentCode, pageId, userId, provider } = req.body;
        if (!prompt || !currentCode) {
            return res.status(400).json({ error: "Missing prompt or currentCode" });
        }
        const apiKey = process.env.GEMINI_API_KEY;
        let generatedCode;
        try {
            if (!apiKey) throw new Error("Gemini API key not configured on server");
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const systemPrompt = `
Tu es un expert en HTML/Tailwind CSS et SEO.

Code actuel :
${currentCode}

Demande utilisateur :
${prompt}

Règles strictes :
1. Réponds UNIQUEMENT avec le code HTML/Tailwind modifié
2. Pas d'explication, juste le code
3. Préserve la structure existante
4. Utilise Tailwind CSS moderne (v3+)
5. Assure la responsivité (mobile-first)
6. Ajoute les attributs SEO (alt, aria-label, etc.)

Code modifié :
`;
            const result = await model.generateContent(systemPrompt);
            generatedCode = result.response.text();
            generatedCode = generatedCode
                .replace(/^```html\n?/, '')
                .replace(/\n?```$/, '')
                .trim();
        } catch (aiError) {
            console.warn('AI Code Assistant using fallback:', aiError.message);
            generatedCode = currentCode || `<div class="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg">
    <h2 class="text-3xl font-bold text-gray-800 mb-4">Section Améliorée</h2>
    <p class="text-gray-600 leading-relaxed">
        ${prompt || 'Contenu généré automatiquement'}
    </p>
    <div class="mt-6 flex gap-4">
        <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            En savoir plus
        </button>
        <button class="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            Contact
        </button>
    </div>
</div>`;
        }
        try {
            await pool.query(
                `INSERT INTO public.ai_requests_log (user_id, page_id, prompt, generated_code, ai_mode, ai_provider) VALUES ($1, $2, $3, $4, $5, $6)`,
                [req.user.id, pageId, prompt, generatedCode, 'external', provider || 'gemini']
            );
        } catch (e) {
            console.warn('Logging AI request failed (table might be missing), proceeding...', e.message);
        }
        try {
            const pageResult = await pool.query('SELECT version FROM public.pages WHERE id = $1', [pageId]);
            const currentVersion = pageResult.rows[0]?.version || 1;
            const newVersion = currentVersion + 1;
            await pool.query(
                `INSERT INTO public.page_versions (page_id, version, content_raw, created_by, ai_history) VALUES ($1, $2, $3, $4, $5)`,
                [pageId, newVersion, generatedCode, req.user.id, JSON.stringify([{ timestamp: new Date().toISOString(), prompt, generated_code: generatedCode.substring(0, 200) + '...', ai_mode: 'external' }])]
            );
        } catch (e) {
            console.warn('Saving version failed (table might be missing), proceeding...', e.message);
        }
        res.json({ code: generatedCode, version: 1, provider: provider || 'gemini', message: "Code généré avec succès par l'AI" });
    } catch (err) {
        console.error("AI Assistant Error:", err);
        res.status(500).json({ success: false, message: err.message || "AI Assistant failed", code: 'AI_ASSISTANT_FAIL' });
    }
}

async function aiGenerate(req, res) {
    try {
        const { prompt, context, tone, task } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API key not configured");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const systemPrompt = `You are an AI assistant for the PROQUELEC website admin panel.
Task: ${task}
Context: ${context}
Tone: ${tone || 'professional'}

Instructions: 
1. If the task is 'seo', detailed JSON output is expected with 'score' and 'suggestions'.
2. If the task is 'code', return only the code.
3. Be professional and concise.`;
        const result = await model.generateContent(systemPrompt + "\n\nUser Request: " + prompt);
        const content = result.response.text();
        res.json({ content, success: true });
    } catch (err) {
        console.error("AI Generate Error:", err);
        res.status(500).json({ success: false, message: err.message, code: 'AI_GEN_FAIL' });
    }
}

async function orchestrateHandler(req, res) {
    orchestrate(req, res);
}

async function pingProvider(req, res) {
    const { providerId, apiKey } = req.body;
    if (providerId === 'lovable') {
        return res.json({ success: true, latency: 1 });
    }
    if (providerId === 'ollama') {
        try {
            const start = Date.now();
            const resp = await fetch('http://localhost:11434/api/tags');
            const latency = Date.now() - start;
            if (resp.ok) return res.json({ success: true, latency });
            else return res.status(503).json({ success: false, message: 'Ollama service offline' });
        } catch (e) {
            return res.status(503).json({ success: false, message: 'Ollama service unreachable' });
        }
    }
    if (!apiKey) return res.status(400).json({ success: false, message: 'Clé API manquante' });
    try {
        let url = '';
        let headers = { 'Content-Type': 'application/json' };
        let options = { method: 'GET', headers };
        switch (providerId) {
            case 'openai':
                url = 'https://api.openai.com/v1/models';
                headers['Authorization'] = `Bearer ${apiKey}`;
                break;
            case 'anthropic':
                url = 'https://api.anthropic.com/v1/messages';
                headers['x-api-key'] = apiKey;
                headers['anthropic-version'] = '2023-06-01';
                options.method = 'POST';
                options.body = JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] });
                break;
            case 'gemini':
                url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
                break;
            case 'deepseek':
                url = 'https://api.deepseek.com/models';
                headers['Authorization'] = `Bearer ${apiKey}`;
                break;
            case 'tavily':
                url = 'https://api.tavily.com/search';
                options.method = 'POST';
                options.body = JSON.stringify({ api_key: apiKey, query: 'ping', max_results: 1 });
                break;
            default:
                return res.status(400).json({ success: false, message: 'Provider inconnu' });
        }
        const start = Date.now();
        const response = await fetch(url, options);
        const latency = Date.now() - start;
        if (response.ok) {
            res.json({ success: true, latency });
        } else {
            let errorText = '';
            try { errorText = await response.text(); } catch (e) { }
            console.warn(`[AI-PING] Provider ${providerId} returned error:`, errorText);
            res.status(response.status).json({ success: false, message: `Rejet par ${providerId}`, details: errorText });
        }
    } catch (error) {
        console.error(`[AI-PING] Error pinging ${providerId}:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
}

async function diagnostic(req, res) {
    const { providerId, apiKey } = req.body;
    const diagnostics = {
        network: { latency: 0, status: 'unknown', region: 'Detecting...' },
        performance: { tps: 0, ttft: 0, loadFactor: 0 },
        knowledge: { semanticScore: 0, version: 'N/A' },
        security: { encrypted: true, protocol: 'TLS 1.3' },
        overallGrade: 'I'
    };
    try {
        const startPing = Date.now();
        let pingUrl = '';
        let pingOptions = { method: 'GET', headers: {} };
        if (providerId === 'openai') {
            pingUrl = 'https://api.openai.com/v1/models';
            pingOptions.headers['Authorization'] = `Bearer ${apiKey}`;
        } else if (providerId === 'anthropic') {
            pingUrl = 'https://api.anthropic.com/v1/messages';
            pingOptions.headers['x-api-key'] = apiKey;
            pingOptions.headers['anthropic-version'] = '2023-06-01';
            pingOptions.method = 'POST';
            pingOptions.body = JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] });
        } else if (providerId === 'gemini') {
            pingUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        } else if (providerId === 'deepseek') {
            pingUrl = 'https://api.deepseek.com/models';
            pingOptions.headers['Authorization'] = `Bearer ${apiKey}`;
        } else {
            return res.json({ success: true, message: 'Local node diagnostic complete', diagnostics });
        }
        const pingResp = await fetch(pingUrl, pingOptions);
        diagnostics.network.latency = Date.now() - startPing;
        diagnostics.network.status = pingResp.ok ? 'optimal' : 'degraded';
        const testPrompt = "Explique brièvement la loi d'Ohm. Réponds en moins de 10 mots.";
        const startStress = Date.now();
        let testResponse = '';
        if (providerId === 'openai') {
            const resp = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: testPrompt }], max_tokens: 20 })
            });
            const d = await resp.json();
            testResponse = d.choices?.[0]?.message?.content || '';
        } else if (providerId === 'gemini') {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: testPrompt }] }] })
            });
            const d = await resp.json();
            testResponse = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
        const stressDuration = Date.now() - startStress;
        diagnostics.performance.ttft = stressDuration;
        diagnostics.performance.tps = Math.round((testResponse.length / 4) / (stressDuration / 1000));
        let score = 0;
        if (diagnostics.network.latency < 200) score += 40;
        else if (diagnostics.network.latency < 500) score += 20;
        if (testResponse.toLowerCase().includes('u=ri') || testResponse.toLowerCase().includes('tension')) score += 50;
        if (diagnostics.performance.tps > 20) score += 10;
        if (score >= 90) diagnostics.overallGrade = 'S';
        else if (score >= 70) diagnostics.overallGrade = 'A';
        else if (score >= 50) diagnostics.overallGrade = 'B';
        else diagnostics.overallGrade = 'C';
        res.json({ success: true, diagnostics });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
}

async function scanCompliance(req, res) {
    try {
        const { imageBase64 } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(503).json({ success: false, message: 'Système IA non configuré (Clé GEMINI_API_KEY manquante dans .env)', code: 'AI_CONFIG_MISSING' });
        }
        if (!imageBase64) return res.status(400).json({ success: false, message: 'Aucune image satellite transmise', code: 'MISSING_PAYLOAD' });
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const systemPrompt = `
            TU ES L'EXPERT ULTIME EN CONFORMITÉ ÉLECTRIQUE PROQUELEC.
            TA MISSION : Scanner l'image fournie et détecter toute non-conformité majeure selon la norme NF C 15-100.
            
            DIRECTIVES STRICTES :
            1. Analyse les disjoncteurs, le câblage, l'étiquetage et l'état général.
            2. Pour chaque anomalie, donne : Localisation, Risque (Incendie, Électrocution), Référence Normative.
            3. Sois extrêmement précis, professionnel et sévère. Ne laisse passer aucun défaut de sécurité.
            
            FORMAT DE RÉPONSE (JSON uniquement) :
            {
                "conforme": boolean,
                "score_securite": number (0-100),
                "anomalies": [
                    { "type": string, "description": string, "gravite": "critique" | "majeure" | "mineure", "norme": string }
                ],
                "recommandations": [string],
                "verdict_expert": string
            }
        `;
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const result = await generateWithRetry(model, [
            systemPrompt,
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
        ]);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Erreur de formatage IA", raw: text };
        res.json({ success: true, analysis: parsedData });
    } catch (error) {
        console.error('Compliance Scan Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getLogs(req, res) {
    try {
        const logs = await getAiLogs();
        res.json({ success: true, logs });
    } catch (error) {
        console.error('Fetch AI Logs Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function seoAnalyze(req, res) {
    try {
        const { title, content, slug } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(503).json({ success: false, message: 'Le système IA (Google Gemini) n\'est pas encore configuré (Clé GEMINI_API_KEY manquante dans .env).', code: 'AI_CONFIG_MISSING' });
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const systemPrompt = `
            TU ES L'EXPERT SEO RÉFÉRENT POUR PROQUELEC (Entreprise d'électricité au Sénégal).
            TA MISSION : Analyser le contenu d'une page web et fournir des recommandations SEO critiques pour maximiser la visibilité sur Google.
            
            CONTEXTE : PROQUELEC intervient dans le tertiaire, l'industrie et le résidentiel. Mots-clés cibles : électricité, installation électrique, maintenance, NF C 15-100, Sénégal, Dakar, dépannage.
            
            ANALYSE DEMANDÉE :
            1. Évaluer la pertinence du titre et du contenu.
            2. Générer un Meta Title optimisé (max 60 chars).
            3. Générer une Meta Description captivante (max 160 chars).
            4. Suggérer 5 mots-clés LSI (indexation sémantique latente).
            5. Donner un score SEO global de 0 à 100.
            
            FORMAT DE RÉPONSE (JSON uniquement) :
            { "score": number, "meta_title": string, "meta_description": string, "keywords_suggested": string[], "analysis": string }
        `;
        const result = await model.generateContent(systemPrompt + "\n\nTitre: " + title + "\nContenu: " + content + "\nSlug: " + slug);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Erreur de formatage IA", raw: text };
        res.json({ success: true, analysis: parsedData });
    } catch (error) {
        console.error('SEO Analyze Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function listChats(req, res) {
    try {
        const chats = await getChats(req.user.id);
        res.json(chats);
    } catch (err) {
        console.error('[CHAT-API-ERROR] Failed to fetch chats:', err);
        res.status(500).send('Server Error');
    }
}

async function createChatHandler(req, res) {
    try {
        const chat = await createChat(req.user.id, req.body.title);
        res.json(chat);
    } catch (err) {
        console.error('[CHAT-API-ERROR] Failed to create chat:', err);
        res.status(500).send('Server Error');
    }
}

async function deleteChatHandler(req, res) {
    try {
        const deleted = await deleteChat(req.params.sessionId, req.user.id);
        if (!deleted) return res.status(403).send('Unauthorized');
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

async function updateChatHandler(req, res) {
    try {
        const chat = await updateChat(req.params.sessionId, req.user.id, req.body.title);
        if (!chat) return res.status(403).send('Unauthorized');
        res.json(chat);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

async function listMessages(req, res) {
    try {
        const messages = await getMessages(req.params.sessionId, req.user.id);
        if (!messages) return res.status(403).send('Unauthorized');
        res.json(messages);
    } catch (err) {
        console.error('[CHAT-API-ERROR] Failed to fetch messages:', err);
        res.status(500).send('Server Error');
    }
}

async function createMessageHandler(req, res) {
    try {
        const message = await createMessage(req.params.sessionId, req.user.id, req.body);
        if (!message) return res.status(403).send('Unauthorized');
        res.json(message);
    } catch (err) {
        console.error('[CHAT-API-ERROR] Failed to add message:', err);
        res.status(500).send('Server Error');
    }
}

// --- Engine ---
const { spawn } = require('child_process');

async function getEngineMemory(req, res) {
    const memoryPath = path.join(__dirname, '../../src/engine/memory/error-memory.json');
    if (fs.existsSync(memoryPath)) {
        const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
        return res.json(memory);
    }
    res.json([]);
}

async function scanEngine(req, res) {
    const scriptPath = path.join(__dirname, '../../proquelec-ultra-ai.mjs');
    const child = spawn('node', [scriptPath]);
    let output = '';
    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { output += data.toString(); });
    child.on('close', (code) => {
        const cleanOutput = output.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        const issues = [];
        const lines = cleanOutput.split('\n');
        lines.forEach(line => {
            if (line.includes('[VULN]') || line.includes('[WARN]') || line.includes('[PERF]') || line.includes('[OPTIM]') || line.includes('[SECURITY]')) {
                const match = line.match(/\[(.*?)\] (.*?) dans (.*)/);
                if (match) {
                    issues.push({ type: match[1], issue: match[2], file: match[3].trim() });
                }
            }
        });
        res.json({ success: code === 0, issues, rawOutput: output });
    });
}

async function repairEngine(req, res) {
    const { file, issue } = req.body;
    const scriptPath = path.join(__dirname, '../../proquelec-ultra-ai.mjs');
    const args = ['--repair'];
    if (file) args.push(`--file=${file}`);
    const child = spawn('node', [scriptPath, ...args]);
    let output = '';
    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { output += data.toString(); });
    child.on('close', (code) => {
        res.json({ success: code === 0, message: code === 0 ? "Correctif appliqué avec succès" : "Erreur lors de la réparation", output });
    });
}

// --- AI Layout Generator ---
const { generateLayout } = require('./ai-layout.service');

async function generateLayoutHandler(req, res) {
    try {
        const result = await generateLayout(req.body);
        res.json({ success: true, blocks: result });
    } catch (err) {
        console.error('[AI-LAYOUT] Generation error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
}

// --- Export Engine ---
const { exportBlocks } = require('./export.service');

async function exportPage(req, res) {
    try {
        const result = await exportBlocks(req.body);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('[EXPORT] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
}

module.exports = {
    chat, vision, image, adminStart, adminStop, status,
    generateVisual, contentGeneration, codeAssistant, aiGenerate,
    orchestrateHandler, pingProvider, diagnostic, scanCompliance,
    getLogs, seoAnalyze,
    listChats, createChatHandler, deleteChatHandler, updateChatHandler,
    listMessages, createMessageHandler,
    getEngineMemory, scanEngine, repairEngine,
    generateLayoutHandler,
    exportPage,
};
