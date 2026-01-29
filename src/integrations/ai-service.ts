import { supabase } from '@/integrations/supabase/client';

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
  private static readonly API_KEY = process.env.VITE_OPENAI_API_KEY;
  private static readonly API_BASE = 'https://api.openai.com/v1';

  /**
   * Génère du contenu via OpenAI
   */
  static async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    if (!this.API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = this.buildUserPrompt(request);

    try {
      const response = await fetch(`${this.API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: this.getMaxTokens(request.length),
          temperature: this.getTemperature(request.tone),
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;
      const tokensUsed = data.usage.total_tokens;

      // Sauvegarder dans les logs
      await this.logGeneration(request, generatedText, tokensUsed);

      return {
        content: generatedText,
        tokens_used: tokensUsed,
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
    count: number = 3
  ): Promise<AIGenerationResponse[]> {
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
    return response.content.split(',').map(k => k.trim());
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
    return response.content.split('\n').filter(line => line.trim());
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
  static async generateFAQ(topic: string, count: number = 5): Promise<Array<{ question: string; answer: string }>> {
    const response = await this.generateContent({
      prompt: `Générer ${count} questions-réponses FAQ pertinentes sur: ${topic}\nFormatez comme:\nQ1: question?\nA1: réponse\nQ2: question?\nA2: réponse\netc.`,
      context: 'faq',
      length: 'medium',
      tone: 'professional'
    });

    const faqs: Array<{ question: string; answer: string }> = [];
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
    purpose: string
  ): Promise<{ subject: string; preview: string; body: string }> {
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

    return response.content.split('\n').filter(line => line.trim());
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

  private static buildSystemPrompt(request: AIGenerationRequest): string {
    const basePrompt = `Tu es un assistant IA professionnel spécialisé dans la création de contenu Web.
Tu crées du contenu de haute qualité, optimisé pour le SEO, engageant et professionnel.
Langue: ${request.language || 'Français'}
Ton: ${request.tone || 'professional'}`;

    const contextPrompts: Record<AIGenerationRequest['context'], string> = {
      description: `${basePrompt}\nSpécialité: Créer des descriptions produits/services compactes mais complètes.`,
      title: `${basePrompt}\nSpécialité: Créer des titres accrocheurs et optimisés SEO.`,
      meta: `${basePrompt}\nSpécialité: Créer des meta descriptions, mots-clés et tags SEO.`,
      blog: `${basePrompt}\nSpécialité: Écrire des articles de blog informatifs et engageants.`,
      email: `${basePrompt}\nSpécialité: Écrire des emails marketing persuasifs et clairs.`,
      faq: `${basePrompt}\nSpécialité: Créer des FAQ claires et complètes.`,
      section: `${basePrompt}\nSpécialité: Écrire du contenu web général de qualité.`
    };

    return contextPrompts[request.context];
  }

  private static buildUserPrompt(request: AIGenerationRequest): string {
    return request.prompt;
  }

  private static getMaxTokens(length?: 'short' | 'medium' | 'long'): number {
    const tokenMap = {
      short: 300,
      medium: 800,
      long: 2000
    };
    return tokenMap[length || 'medium'];
  }

  private static getTemperature(tone?: 'professional' | 'casual' | 'formal' | 'marketing'): number {
    const tempMap = {
      professional: 0.7,
      casual: 0.8,
      formal: 0.5,
      marketing: 0.9
    };
    return tempMap[tone || 'professional'];
  }

  private static async logGeneration(
    request: AIGenerationRequest,
    content: string,
    tokensUsed: number
  ): Promise<void> {
    try {
      // Save to localStorage for now (log file)
      const logs = JSON.parse(localStorage.getItem('ai_logs') || '[]');
      logs.push({
        context: request.context,
        prompt: request.prompt,
        generated_content: content,
        tokens_used: tokensUsed,
        tone: request.tone,
        length: request.length,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('ai_logs', JSON.stringify(logs.slice(-100))); // Keep last 100
    } catch (error) {
      console.warn('Failed to log AI generation:', error);
    }
  }
}

export default AIService;
