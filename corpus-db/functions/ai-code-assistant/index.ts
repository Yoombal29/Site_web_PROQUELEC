import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============== PROVIDER HANDLERS ==============

async function callOpenAI(prompt: string, code: string, apiKey: string, model: string) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: `Tu es un expert en HTML/Tailwind CSS et SEO. Règles strictes:
1. Réponds UNIQUEMENT avec le code HTML/Tailwind modifié
2. Pas d'explication, juste le code
3. Préserve la structure existante
4. Utilise Tailwind CSS moderne (v3+)
5. Assure la responsivité (mobile-first)
6. Ajoute les attributs SEO (alt, aria-label, etc.)`
                },
                {
                    role: 'user',
                    content: `Code actuel:\n${code}\n\nDemande: ${prompt}\n\nCode modifié:`
                }
            ],
            temperature: 0.3,
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
        throw new Error('OpenAI returned no choices');
    }

    return data.choices[0].message.content;
}

async function callGemini(prompt: string, code: string, apiKey: string, model: string) {
    // Use v1 API for better model availability
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Tu es un expert en HTML/Tailwind CSS et SEO.

Code actuel :
${code}

Demande utilisateur :
${prompt}

Règles strictes :
1. Réponds UNIQUEMENT avec le code HTML/Tailwind modifié
2. Pas d'explication, juste le code
3. Préserve la structure existante
4. Utilise Tailwind CSS moderne (v3+)
5. Assure la responsivité (mobile-first)
6. Ajoute les attributs SEO (alt, aria-label, etc.)

Code modifié:`
                    }]
                }]
            })
        }
    );

    const data = await response.json();

    // Handle rate limiting
    if (response.status === 429) {
        const retryAfter = data.error?.details?.find((d: any) => d.retryDelay)?.retryDelay || '60s';
        throw new Error(`Gemini quota dépassé. Réessayez dans ${retryAfter}`);
    }

    if (!data.candidates || !data.candidates[0]) {
        console.error('Gemini API Response:', data);
        throw new Error(`Gemini API Error: ${data.error?.message || 'No candidates returned'}`);
    }

    return data.candidates[0].content.parts[0].text;
}

async function callOllama(prompt: string, code: string, endpoint: string, model: string) {
    // Default to localhost if not specified, but for Edge Functions this usually needs a public URL 
    // or a tunnel unless self-hosted in same network.
    const url = `${endpoint}/api/generate`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || 'codellama', // Default to codellama or llama3
                prompt: `[INST] Tu es un expert en HTML/Tailwind CSS.
Code actuel :
\`\`\`html
${code}
\`\`\`

Demande : ${prompt}

Réponds UNIQUEMENT avec le code HTML modifié. Pas d'explications.
[/INST]`,
                stream: false,
                options: {
                    temperature: 0.3,
                    num_predict: 4000
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Ollama connection error:", error);
        throw new Error(`Impossible de contacter Ollama sur ${endpoint}. Vérifiez que le serveur est accessible.`);
    }
}

// ============== MAIN HANDLER ==============

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { prompt, currentCode, pageId, userId, provider } = await req.json()

        if (!prompt || !currentCode) {
            return new Response(
                JSON.stringify({ error: 'Missing prompt or currentCode' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Initialize Database client
        const dbClient = createClient(
            Deno.env.get('API_URL') ?? '',
            Deno.env.get('SERVICE_ROLE_KEY') ?? ''
        )

        // Rate Limiting (10 requests/min/user)
        const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
        const { data: recentRequests } = await dbClient
            .from('ai_requests_log')
            .select('created_at')
            .eq('user_id', userId)
            .gte('created_at', oneMinuteAgo)

        if (recentRequests && recentRequests.length >= 10) {
            return new Response(
                JSON.stringify({ error: 'Rate limit exceeded. Max 10 requests per minute.' }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get AI config
        const { data: config } = await dbClient
            .from('ai_config')
            .select('*')
            .single()

        // Determine provider (from request or config default)
        const selectedProvider = provider || config?.default_provider || 'openai';

        let generatedCode: string;
        let usedModel: string;

        // Route to appropriate provider
        switch (selectedProvider) {
            case 'openai': {
                const openaiKey = Deno.env.get('OPENAI_API_KEY');
                if (!openaiKey) {
                    throw new Error('OpenAI API key not configured');
                }
                const model = config?.openai_model || 'gpt-4o-mini';
                usedModel = model;
                generatedCode = await callOpenAI(prompt, currentCode, openaiKey, model);
                break;
            }

            case 'gemini': {
                const geminiKey = config?.external_api_key || Deno.env.get('GEMINI_API_KEY');
                if (!geminiKey) {
                    throw new Error('Gemini API key not configured');
                }
                const model = config?.gemini_model || 'gemini-1.5-flash-latest';
                usedModel = model;
                generatedCode = await callGemini(prompt, currentCode, geminiKey, model);
                break;
            }

            case 'ollama': {
                const endpoint = config?.ollama_endpoint || 'http://localhost:11434';
                // Use a default model if not set in config, e.g., 'llama3' or 'codellama'
                // We'll rely on the config or default to 'codellama'
                const model = config?.openai_model?.includes('gpt') ? 'codellama' : (config?.openai_model || 'codellama');
                // Note: Reusing column or adding specific ollama_model column would be better, 
                // but for now we'll hardcode or use a fallback if not specifically configured.
                // Let's assume 'codellama' as a safe default for code tasks.

                usedModel = 'codellama'; // Or fetch from config if we added an ollama_model column
                generatedCode = await callOllama(prompt, currentCode, endpoint, usedModel);
                break;
            }

            default:
                throw new Error(`Unknown provider: ${selectedProvider}`);
        }

        // Clean code (remove markdown backticks if present)
        generatedCode = generatedCode
            .replace(/^```html\n?/, '')
            .replace(/^```\n?/, '')
            .replace(/\n?```$/, '')
            .trim()

        // Log AI request
        await dbClient.from('ai_requests_log').insert({
            user_id: userId,
            page_id: pageId,
            prompt,
            generated_code: generatedCode,
            ai_mode: 'external',
            ai_provider: selectedProvider,
            provider: selectedProvider // For new column
        })

        // Create new version
        const { data: currentPage } = await dbClient
            .from('pages')
            .select('content_raw, version')
            .eq('id', pageId)
            .single()

        const newVersion = (currentPage?.version || 1) + 1

        await dbClient.from('page_versions').insert({
            page_id: pageId,
            version: newVersion,
            content_raw: generatedCode,
            content_hash: btoa(generatedCode),
            created_by: userId,
            ai_history: [{
                timestamp: new Date().toISOString(),
                prompt,
                provider: selectedProvider,
                model: usedModel,
                generated_code: generatedCode.substring(0, 200) + '...',
                user_feedback: 'pending',
                ai_mode: 'external'
            }]
        })

        return new Response(
            JSON.stringify({
                code: generatedCode,
                version: newVersion,
                provider: selectedProvider,
                model: usedModel,
                ai_mode: 'external',
                message: `Code généré avec succès par ${selectedProvider.toUpperCase()}`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('AI Assistant Error:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'AI Assistant failed' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
