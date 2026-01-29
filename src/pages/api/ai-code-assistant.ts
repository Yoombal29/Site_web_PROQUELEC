import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { prompt, currentCode, pageId, userId } = req.body;

        if (!prompt || !currentCode) {
            return res.status(400).json({ error: "Missing prompt or currentCode" });
        }

        // Rate Limiting (10 requêtes/min/utilisateur)
        const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
        const { data: recentRequests, error: rateLimitError } = await supabase
            .from("ai_requests_log")
            .select("created_at")
            .eq("user_id", userId)
            .gte("created_at", oneMinuteAgo);

        if (rateLimitError) {
            console.error("Rate limit check error:", rateLimitError);
        }

        if (recentRequests && recentRequests.length >= 10) {
            return res.status(429).json({
                error: "Rate limit exceeded. Max 10 requests per minute."
            });
        }

        // Get AI config
        const { data: config } = await supabase
            .from("ai_config")
            .select("*")
            .single();

        if (!config || config.mode === 'external') {
            // Use Gemini API
            const apiKey = config?.external_api_key || process.env.GEMINI_API_KEY;

            if (!apiKey) {
                return res.status(500).json({
                    error: "Gemini API key not configured"
                });
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
            let generatedCode = result.response.text();

            // Nettoyer le code (enlever les markdown backticks si présents)
            generatedCode = generatedCode
                .replace(/^```html\n?/, '')
                .replace(/\n?```$/, '')
                .trim();

            // Log de la requête AI
            await supabase.from("ai_requests_log").insert({
                user_id: userId,
                page_id: pageId,
                prompt,
                generated_code: generatedCode,
                ai_mode: 'external',
                ai_provider: config?.external_provider || 'gemini'
            });

            // Versioning : Créer une nouvelle version
            const { data: currentPage } = await supabase
                .from("pages")
                .select("content_raw, version")
                .eq("id", pageId)
                .single();

            const newVersion = (currentPage?.version || 1) + 1;

            await supabase.from("page_versions").insert({
                page_id: pageId,
                version: newVersion,
                content_raw: generatedCode,
                content_hash: Buffer.from(generatedCode).toString('base64'),
                created_by: userId,
                ai_history: [{
                    timestamp: new Date().toISOString(),
                    prompt,
                    generated_code: generatedCode.substring(0, 200) + '...',
                    user_feedback: 'pending',
                    ai_mode: 'external'
                }]
            });

            return res.status(200).json({
                code: generatedCode,
                version: newVersion,
                ai_mode: 'external',
                message: "Code généré avec succès par l'AI"
            });
        } else {
            // Mode local (à implémenter dans Phase 4)
            return res.status(501).json({
                error: "AI locale non encore implémentée. Utilisez le mode externe."
            });
        }
    } catch (err: any) {
        console.error("AI Assistant Error:", err);
        return res.status(500).json({
            error: err.message || "AI Assistant failed"
        });
    }
}
