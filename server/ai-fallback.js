/**
 * AI Fallback Handlers
 * Provides intelligent fallback responses when Gemini API is unavailable
 */

const seoFallback = (title, slug, content) => {
    const contentText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = contentText.split(' ').length;
    const hasLocalKeywords = /paris|île-de-france|électricien|installation/i.test(contentText);
    const titleLength = title.length;

    // Calculate score based on basic SEO factors
    let score = 50;
    if (titleLength > 30 && titleLength < 60) score += 10;
    if (wordCount > 300) score += 15;
    if (hasLocalKeywords) score += 15;
    if (slug && slug.length > 5) score += 10;

    return {
        score: Math.min(score, 95),
        meta_title: titleLength > 60 ? title.substring(0, 57) + '...' : title + ' | PROQUELEC',
        meta_description: contentText.substring(0, 155) + '...',
        keywords_suggested: [
            'électricien Paris',
            'installation électrique',
            'dépannage électrique',
            'mise aux normes',
            'électricité professionnelle'
        ],
        analysis: `Analyse basée sur ${wordCount} mots. ${hasLocalKeywords ? 'Mots-clés locaux détectés.' : 'Ajoutez des mots-clés locaux.'} Le titre ${titleLength < 60 ? 'est bien dimensionné' : 'devrait être raccourci'}.`,
        improvements: [
            wordCount < 300 ? "Enrichir le contenu (minimum 300 mots recommandé)" : "Contenu suffisamment détaillé",
            !hasLocalKeywords ? "Ajouter des mots-clés géolocalisés (Paris, Île-de-France)" : "Optimiser la densité des mots-clés locaux",
            "Ajouter des balises H2/H3 structurées",
            "Inclure des liens internes vers d'autres services",
            "Optimiser les images avec attributs alt descriptifs"
        ],
        _fallback: true
    };
};

const codeAssistantFallback = (prompt, currentCode) => {
    const enhancedCode = currentCode || `<div class="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg">
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

    return {
        code: enhancedCode,
        explanation: "Code généré en mode fallback (AI temporairement indisponible)",
        _fallback: true
    };
};

const contentGeneratorFallback = (prompt, context, tone) => {
    const templates = {
        professionnel: `En tant qu'experts dans le domaine de l'électricité, nous comprenons l'importance de ${prompt}. Notre équipe qualifiée met son expertise à votre service pour garantir des installations conformes aux normes en vigueur.`,
        technique: `${prompt} nécessite une approche méthodique et rigoureuse. Nos techniciens certifiés utilisent des équipements de pointe pour assurer la qualité et la sécurité de chaque intervention.`,
        commercial: `Découvrez nos solutions pour ${prompt}. Bénéficiez de notre expertise reconnue et de tarifs compétitifs. Contactez-nous dès aujourd'hui pour un devis gratuit !`
    };

    return {
        content: templates[tone] || templates.professionnel,
        _fallback: true
    };
};

module.exports = {
    seoFallback,
    codeAssistantFallback,
    contentGeneratorFallback
};
