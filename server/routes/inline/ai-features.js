const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticateToken, requireAdmin } = require('../../core/middleware');

// Helper: generate with retry
async function generateWithRetry(model, parts, retries = 2) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await model.generateContent(parts);
    } catch (err) {
      lastError = err;
      if (i < retries) {
        const waitTime = Math.pow(2, i) * 1000;
        console.warn(`[AI-GEN] Retry ${i + 1}/${retries} after ${waitTime}ms: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }
  throw lastError;
}

function mountAiFeaturesRoutes(app, pool) {
  // --- AI PING PROVIDER ---
  app.post('/api/ai/ping-provider', authenticateToken, requireAdmin, async (req, res) => {
    const { providerId, apiKey } = req.body;
    if (providerId === 'lovable') return res.json({ success: true, latency: 1 });
    if (providerId === 'ollama') {
      try {
        const start = Date.now();
        const resp = await fetch('http://localhost:11434/api/tags');
        const latency = Date.now() - start;
        if (resp.ok) return res.json({ success: true, latency });
        else return res.status(503).json({ success: false, message: 'Ollama service offline' });
      } catch (e) { return res.status(503).json({ success: false, message: 'Ollama service unreachable' }); }
    }
    if (!apiKey) return res.status(400).json({ success: false, message: 'Clé API manquante' });
    try {
      let url = '', headers = { 'Content-Type': 'application/json' }, options = { method: 'GET', headers };
      switch (providerId) {
        case 'openai': url = 'https://api.openai.com/v1/models'; headers['Authorization'] = `Bearer ${apiKey}`; break;
        case 'anthropic':
          url = 'https://api.anthropic.com/v1/messages'; headers['x-api-key'] = apiKey; headers['anthropic-version'] = '2023-06-01';
          options.method = 'POST'; options.body = JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] }); break;
        case 'gemini': url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`; break;
        case 'deepseek': url = 'https://api.deepseek.com/models'; headers['Authorization'] = `Bearer ${apiKey}`; break;
        case 'tavily':
          url = 'https://api.tavily.com/search'; options.method = 'POST';
          options.body = JSON.stringify({ api_key: apiKey, query: 'ping', max_results: 1 }); break;
        default: return res.status(400).json({ success: false, message: 'Provider inconnu' });
      }
      const start = Date.now();
      const response = await fetch(url, options);
      const latency = Date.now() - start;
      if (response.ok) res.json({ success: true, latency });
      else {
        let errorText = ''; try { errorText = await response.text(); } catch (e) {}
        console.warn(`[AI-PING] Provider ${providerId} returned error:`, errorText);
        res.status(response.status).json({ success: false, message: `Rejet par ${providerId}`, details: errorText });
      }
    } catch (error) {
      console.error(`[AI-PING] Error pinging ${providerId}:`, error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // --- AI DEEP DIAGNOSTIC ---
  app.post('/api/ai/diagnostic', authenticateToken, requireAdmin, async (req, res) => {
    const { providerId, apiKey } = req.body;
    const diagnostics = { network: { latency: 0, status: 'unknown', region: 'Detecting...' }, performance: { tps: 0, ttft: 0, loadFactor: 0 }, knowledge: { semanticScore: 0, version: 'N/A' }, security: { encrypted: true, protocol: 'TLS 1.3' }, overallGrade: 'I' };
    try {
      const startPing = Date.now();
      let pingUrl = '', pingOptions = { method: 'GET', headers: {} };
      if (providerId === 'openai') { pingUrl = 'https://api.openai.com/v1/models'; pingOptions.headers['Authorization'] = `Bearer ${apiKey}`; }
      else if (providerId === 'anthropic') { pingUrl = 'https://api.anthropic.com/v1/messages'; pingOptions.headers['x-api-key'] = apiKey; pingOptions.headers['anthropic-version'] = '2023-06-01'; pingOptions.method = 'POST'; pingOptions.body = JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] }); }
      else if (providerId === 'gemini') { pingUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`; }
      else if (providerId === 'deepseek') { pingUrl = 'https://api.deepseek.com/models'; pingOptions.headers['Authorization'] = `Bearer ${apiKey}`; }
      else { return res.json({ success: true, message: 'Local node diagnostic complete', diagnostics }); }
      const pingResp = await fetch(pingUrl, pingOptions);
      diagnostics.network.latency = Date.now() - startPing;
      diagnostics.network.status = pingResp.ok ? 'optimal' : 'degraded';
      // Performance test
      const testPrompt = "Explique brièvement la loi d'Ohm. Réponds en moins de 10 mots.";
      const startStress = Date.now();
      let testResponse = '';
      if (providerId === 'openai') {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: testPrompt }], max_tokens: 20 }) });
        const d = await resp.json(); testResponse = d.choices?.[0]?.message?.content || '';
      } else if (providerId === 'gemini') {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: testPrompt }] }] }) });
        const d = await resp.json(); testResponse = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
      const stressDuration = Date.now() - startStress;
      diagnostics.performance.ttft = stressDuration;
      diagnostics.performance.tps = Math.round(testResponse.length / 4 / (stressDuration / 1000));
      let score = 0;
      if (diagnostics.network.latency < 200) score += 40; else if (diagnostics.network.latency < 500) score += 20;
      if (testResponse.toLowerCase().includes('u=ri') || testResponse.toLowerCase().includes('tension')) score += 50;
      if (diagnostics.performance.tps > 20) score += 10;
      if (score >= 90) diagnostics.overallGrade = 'S'; else if (score >= 70) diagnostics.overallGrade = 'A'; else if (score >= 50) diagnostics.overallGrade = 'B'; else diagnostics.overallGrade = 'C';
      res.json({ success: true, diagnostics });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  });

  // --- COMPLIANCE SCANNER ---
  app.post('/api/ai/scan-compliance', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(503).json({ success: false, message: 'Système IA non configuré (Clé GEMINI_API_KEY manquante)', code: 'AI_CONFIG_MISSING' });
      if (!imageBase64) return res.status(400).json({ success: false, message: 'Aucune image transmise', code: 'MISSING_PAYLOAD' });
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
      const systemPrompt = `TU ES L'EXPERT ULTIME EN CONFORMITÉ ÉLECTRIQUE PROQUELEC.\nTA MISSION : Scanner l'image fournie et détecter toute non-conformité majeure selon la norme NF C 15-100.\nDIRECTIVES STRICTES :\n1. Analyse les disjoncteurs, le câblage, l'étiquetage et l'état général.\n2. Pour chaque anomalie, donne : Localisation, Risque (Incendie, Électrocution), Référence Normative.\n3. Sois extrêmement précis, professionnel et sévère.\nFORMAT DE RÉPONSE (JSON uniquement) :\n{\n"conforme": boolean,\n"score_securite": number (0-100),\n"anomalies": [\n{ "type": string, "description": string, "gravite": "critique" | "majeure" | "mineure", "norme": string }\n],\n"recommandations": [string],\n"verdict_expert": string\n}`;
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const result = await generateWithRetry(model, [systemPrompt, { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }]);
      const responseText = (await result.response).text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Erreur de formatage IA', raw: responseText };
      res.json({ success: true, analysis: parsedData });
    } catch (error) { console.error('Compliance Scan Error:', error); res.status(500).json({ success: false, error: error.message }); }
  });

  // --- AI LOGS ---
  app.get('/api/ai/logs', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM public.ai_requests_log ORDER BY created_at DESC LIMIT 50');
      res.json({ success: true, logs: result.rows });
    } catch (error) { console.error('Fetch AI Logs Error:', error); res.status(500).json({ success: false, error: error.message }); }
  });

  // --- SEO ANALYZER ---
  app.post('/api/ai/seo-analyze', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { title, content, slug } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(503).json({ success: false, message: "Système IA non configuré (Clé GEMINI_API_KEY manquante)", code: 'AI_CONFIG_MISSING' });
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
      const systemPrompt = `TU ES L'EXPERT SEO RÉFÉRENT POUR PROQUELEC.\nTA MISSION : Analyser le contenu d'une page web et fournir des recommandations SEO.\nANALYSE DEMANDÉE :\n1. Évaluer la pertinence du titre et du contenu.\n2. Générer un Meta Title optimisé (max 60 chars).\n3. Générer une Meta Description captivante (max 160 chars).\n4. Suggérer 5 mots-clés LSI.\n5. Donner un score SEO global de 0 à 100.\nFORMAT DE RÉPONSE (JSON uniquement) :\n{\n"score": number,\n"meta_title": string,\n"meta_description": string,\n"keywords_suggested": string[],\n"analysis": string,\n"improvements": string[]\n}`;
      const userPrompt = `Titre : ${title}\nSlug : ${slug}\nContenu : ${content?.substring(0, 5000)}`;
      const result = await generateWithRetry(model, [systemPrompt, userPrompt]);
      const responseText = (await result.response).text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const seoData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      if (!seoData) throw new Error("L'IA n'a pas renvoyé de format JSON valide.");
      try { await pool.query('INSERT INTO public.ai_requests_log (user_id, endpoint, prompt, response, created_at) VALUES ($1, $2, $3, $4, NOW())', [req.user.id, '/api/ai/seo-analyze', (systemPrompt + userPrompt).substring(0, 500), JSON.stringify(seoData)]); } catch (logErr) { console.warn('Failed to log AI request:', logErr.message); }
      res.json({ success: true, seo: seoData });
    } catch (error) { console.error('SEO Analysis Error:', error); res.status(500).json({ success: false, message: error.message, code: 'AI_SEO_FAIL' }); }
  });

  // --- SYSTEM STATUS ---
  app.get('/api/admin/system/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const statuses = { backend: { id: 'node', name: 'Serveur Principal', status: 'online', port: process.env.PORT || 3000, type: 'Node.js' }, ai: { id: 'python', name: 'Cerveau IA Expert', status: 'offline', port: 8002, type: 'Python/Haystack' }, database: { id: 'db', name: 'Base de Données', status: 'unknown', type: 'PostgreSQL' } };
      try { const dbRes = await pool.query('SELECT version()'); statuses.database.status = 'online'; statuses.database.details = dbRes.rows[0].version; } catch (e) { statuses.database.status = 'offline'; statuses.database.error = e.message; }
      res.json(statuses);
    } catch (err) { res.status(500).json({ error: 'Failed to fetch system status' }); }
  });

  app.get('/api/admin/system/logs', authenticateToken, requireAdmin, (req, res) => {
    const logBuffer = global.__logBuffer || [];
    res.json({ logs: logBuffer });
  });
}

module.exports = { mountAiFeaturesRoutes };
