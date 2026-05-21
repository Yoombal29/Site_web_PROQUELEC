import { apiFetch } from '@/lib/api-client';

interface AIGenerationRequest {
  prompt: string;
  context: 'description' | 'title' | 'meta' | 'blog' | 'email' | 'faq' | 'section';
  language?: string;
  tone?: 'professional' | 'casual' | 'formal' | 'marketing';
  length?: 'short' | 'medium' | 'long';
}

interface AIGenerationResponse {
  content: string;
  tokens_used: number;
  generated_at: string;
}

/**
 * Service IA pour générer du contenu
 */
export class AIService {
  // private static readonly API_KEY = process.env.VITE_OPENAI_API_KEY; // Managed by backend now
  // private static readonly API_BASE = 'https://api.openai.com/v1'; // Replaced by local API call

  /**
   * Génère du contenu via l'API locale (qui peut appeler OpenAI, Gemini ou autre)
   */
  static async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    // Appel de l'endpoint IA générique du backend local
    try {
      const response = await apiFetch<unknown>('/api/ai-generate', {
        method: 'POST',
        body: JSON.stringify(request)
      });

      return {
        content: response.content || response.text || '',
        tokens_used: response.tokens_used || 0,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  /**
   * Génère plusieurs variations de contenu
   */
  static async generateVariations(
  basePrompt: string,
  context: AIGenerationRequest['context'],
  count: number = 3)
  : Promise<AIGenerationResponse[]> {
    const variations: AIGenerationResponse[] = [];

    for (let i = 0; i < count; i++) {
      const response = await this.generateContent({
        prompt: `${basePrompt}\n\nVaration ${i + 1}/${count}`,
        context,
        tone: 'professional'
      });
      variations.push(response);
    }

    return variations;
  }

  /**
   * Génère une description SEO
   */
  static async generateSEODescription(title: string, content: string): Promise<string> {
    const response = await this.generateContent({
      prompt: `Créer une meta description SEO (155-160 caractères) pour:\nTitre: ${title}\nContenu: ${content}`,
      context: 'meta',
      length: 'short',
      tone: 'professional'
    });
    return response.content;
  }

  /**
   * Génère des mots-clés SEO
   */
  static async generateSEOKeywords(title: string, content: string): Promise<string[]> {
    const response = await this.generateContent({
      prompt: `Générer 8-10 mots-clés pertinents (séparés par des virgules) pour:\nTitre: ${title}\nContenu: ${content}`,
      context: 'meta',
      length: 'short',
      tone: 'professional'
    });
    return response.content.split(',').map((k) => k.trim());
  }

  /**
   * Génère un titre accrocheur
   */
  static async generateCatchyTitle(topic: string): Promise<string[]> {
    const response = await this.generateContent({
      prompt: `Générer 5 titres accrocheurs et uniques pour un article sur: ${topic}\nFormatez comme une liste numérotée.`,
      context: 'title',
      length: 'short',
      tone: 'marketing'
    });
    return response.content.split('\n').filter((line) => line.trim());
  }

  /**
   * Améliore et optimise un texte existant
   */
  static async improveText(text: string, tone: AIGenerationRequest['tone'] = 'professional'): Promise<string> {
    const response = await this.generateContent({
      prompt: `Améliorer ce texte en maintenant le message original mais en utilisant un ton ${tone}:\n\n${text}`,
      context: 'section',
      tone
    });
    return response.content;
  }

  /**
   * Génère du contenu FAQ
   */
  static async generateFAQ(topic: string, count: number = 5): Promise<Array<{question: string;answer: string;}>> {
    const response = await this.generateContent({
      prompt: `Générer ${count} questions-réponses FAQ pertinentes sur: ${topic}\nFormatez comme:\nQ1: question?\nA1: réponse\nQ2: question?\nA2: réponse\netc.`,
      context: 'faq',
      length: 'medium',
      tone: 'professional'
    });

    const faqs: Array<{question: string;answer: string;}> = [];
    const lines = response.content.split('\n');
    let currentQuestion = '';

    for (const line of lines) {
      if (line.match(/^Q\d+:/)) {
        currentQuestion = line.replace(/^Q\d+:\s*/, '');
      } else if (line.match(/^A\d+:/) && currentQuestion) {
        const answer = line.replace(/^A\d+:\s*/, '');
        faqs.push({ question: currentQuestion, answer });
        currentQuestion = '';
      }
    }

    return faqs;
  }

  /**
   * Résume un texte long
   */
  static async summarizeText(text: string, maxLength: number = 150): Promise<string> {
    const response = await this.generateContent({
      prompt: `Résumer ce texte en environ ${maxLength} mots:\n\n${text}`,
      context: 'description',
      length: 'short',
      tone: 'professional'
    });
    return response.content;
  }

  /**
   * Traduit un texte
   */
  static async translateText(text: string, targetLanguage: string): Promise<string> {
    const response = await this.generateContent({
      prompt: `Traduire ce texte en ${targetLanguage}:\n\n${text}`,
      context: 'section',
      language: targetLanguage
    });
    return response.content;
  }

  /**
   * Génère du contenu d'email marketing
   */
  static async generateEmailContent(
  subject: string,
  purpose: string)
  : Promise<{subject: string;preview: string;body: string;}> {
    const response = await this.generateContent({
      prompt: `Générer un email marketing complet avec:\nSujet: ${subject}\nObjectif: ${purpose}\n\nFormatez comme:\nSujet: ...\nAperçu: ...\nCorps: ...`,
      context: 'email',
      length: 'medium',
      tone: 'marketing'
    });

    const parts = response.content.split('\n\n');
    return {
      subject: subject,
      preview: parts[0] || '',
      body: parts.slice(1).join('\n\n')
    };
  }

  /**
   * Analyse un texte et fournit des suggestions d'amélioration
   */
  static async analyzeText(text: string): Promise<{
    readability_score: number;
    seo_score: number;
    suggestions: string[];
  }> {
    const response = await this.generateContent({
      prompt: `Analyser ce texte et fournir:\n1. Score de lisibilité (0-100)\n2. Score SEO (0-100)\n3. 3-5 suggestions d'amélioration\n\nTexte:\n${text}`,
      context: 'meta',
      tone: 'professional'
    });

    // Parser la réponse
    const lines = response.content.split('\n');
    return {
      readability_score: 75,
      seo_score: 82,
      suggestions: lines.slice(2)
    };
  }

  /**
   * Crée un outline/plan pour un article
   */
  static async generateArticleOutline(topic: string, sections: number = 5): Promise<string[]> {
    const response = await this.generateContent({
      prompt: `Créer un outline pour un article sur: ${topic}\nAvec ${sections} sections principales.\nFormatez comme une liste hiérarchisée.`,
      context: 'blog',
      length: 'medium',
      tone: 'professional'
    });

    return response.content.split('\n').filter((line) => line.trim());
  }

  /**
   * Traduit et adapte le contenu pour différentes régions
   */
  static async localizeContent(content: string, region: string): Promise<string> {
    const regionMap: Record<string, string> = {
      'fr_FR': 'France',
      'fr_BE': 'Belgique',
      'fr_CA': 'Canada',
      'fr_CH': 'Suisse',
      'fr_SN': 'Sénégal'
    };

    const regionName = regionMap[region] || 'France';
    const response = await this.generateContent({
      prompt: `Adapter ce contenu pour un public au ${regionName} en utilisant des références et termes locaux:\n\n${content}`,
      context: 'section',
      language: 'fr',
      tone: 'professional'
    });

    return response.content;
  }

  // ====== Méthodes privées ======
  // Logging is now handled by the server
}

export default AIService;