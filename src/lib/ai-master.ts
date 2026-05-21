
import { expertRag } from './expert-rag.service';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface AIRequest {
  task: 'text' | 'image' | 'translation' | 'seo' | 'code' | 'expert' | 'auto' | 'vision';
  content?: string;
  prompt?: string;
  device?: DeviceType;
  context?: {
    docsContext?: string;
    fileName?: string;
    description?: string;
    [key: string]: unknown;
  };
}

export interface AIResponse {
  success: boolean;
  data: unknown;
  message?: string;
  modelUsed: string;
}

class AIMasterService {
  private static instance: AIMasterService;
  private token: string | null = null;

  // --- OFFICIAL PROQUELEC-AI SQUAD ---
  private models = {
    expert: 'KEBE-PROQ AI (Inspecteur Normatif)',
    image: 'DESSIN-PROQ AI (Dessinateur Technique)',
    translation: 'TRADUC-PROQ AI (Traducteur Technique)',
    seo: 'SEO-PROQ AI (Auditeur Web)',
    text: 'TEXT-PROQ AI (Rédacteur Pédagogue)',
    code: 'DEV-PROQ AI (Développeur)',
    vision: 'SCAN-PROQ AI (Inspecteur Visuel)'
  };

  // STRICT SYSTEM PROMPTS (MILITARY GRADE SCOPE CONTROL)
  private systemPrompts = {
    expert: "Tu es KEBE-PROQ AI, Inspecteur Normatif PROQUELEC. Autorité finale sur la norme NS 01-001. Tu valides ou rejettes les propositions techniques. Pour expliquer des structures complexes, des tableaux électriques ou des flux, utilise TOUJOURS des diagrammes Mermaid (code block ```mermaid) quand c'est pertinent. Tu ne produis PAS d'images bitmap (renvoie vers DESSIN-PROQ AI).",
    image: "Tu es DESSIN-PROQ AI. Tu produis des visuels réalistes, photos et plans complexes. Pour les schémas logiques simples, KEBE-PROQ AI utilise Mermaid. Tu ne donnes JAMAIS d'avis normatif (renvoie vers KEBE-PROQ AI).",
    translation: "Tu es TRADUC-PROQ AI. Tu traduis strictement le contenu fourni. Tu n'interprètes pas la norme.",
    seo: "Tu es SEO-PROQ AI. Tu optimises le contenu web pour Google Sénégal. Tu valides tes mots-clés avec KEBE-PROQ AI.",
    text: "Tu es TEXT-PROQ AI. Tu vulgarises l'information technique pour le grand public, sous le contrôle de KEBE-PROQ AI.",
    code: "Tu es DEV-PROQ AI. Tu codes en React/Tailwind selon les specs validées.",
    vision: "Tu es SCAN-PROQ AI. Tu analyses les photos d'installations pour détecter les non-conformités NS 01-001."
  };

  constructor() {
    // Initialize token if in browser env
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  static getInstance() {
    if (!AIMasterService.instance) {
      AIMasterService.instance = new AIMasterService();
    }
    return AIMasterService.instance;
  }

  async process(request: AIRequest): Promise<AIResponse> {
    const device = request.device || 'desktop';

    // AUTO-ROUTING
    if ((!request.task || request.task === 'auto') && request.prompt) {
      const detectedTask = this.classifyRequest(request.prompt);
      request.task = detectedTask as AIRequest['task'];
    }
    if (!request.task || request.task === 'auto') request.task = 'expert';

    const spec = this.getDeviceSpecialization(device);

    // Refresh token just in case
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }

    try {
      switch (request.task) {
        case 'text': return await this.generateText(request, spec);
        case 'image': return await this.generateImage(request, spec);
        case 'translation': return await this.translate(request);
        case 'seo': return await this.analyzeSEO(request, device);
        case 'code': return await this.optimizeCode(request, device);
        case 'vision': return await this.analyzeVision(request);
        case 'expert': return await this.consultExpert(request);
        default: throw new Error("Agent inconnu.");
      }
    } catch (error: any) {
      return { success: false, data: null, message: error.message, modelUsed: 'PROQUELEC-AI Orchestrator' };
    }
  }

  private classifyRequest(prompt: string): keyof typeof this.models {
    const p = prompt.toLowerCase();

    if (p.includes('dessine') || p.includes('image') || p.includes('photo') || p.includes('visuel') || p.includes('schéma')) return 'image';
    if (p.includes('traduis') || p.includes('traduction') || p.includes('en anglais') || p.includes('en wolof')) return 'translation';
    if (p.includes('seo') || p.includes('référencement') || p.includes('google') || p.includes('mot-clé')) return 'seo';
    if (p.includes('code') || p.includes('script') || p.includes('fonction') || p.includes('react') || p.includes('css')) return 'code';
    if (p.includes('écris') || p.includes('rédige') || p.includes('article') || p.includes('blog') || p.includes('texte')) return 'text';

    if (p.includes('analyse cette photo') || p.includes('vérifie cette image') || p.includes('scan') || p.includes('photo')) return 'vision';

    return 'expert';
  }

  private getDeviceSpecialization(device: DeviceType) {
    return { style: "Standard" };
  }

  private async callBackend(task: string, prompt: string, content?: string, device?: string, extraParams?: any): Promise<any> {
    // SOVEREIGN ROUTING via Node Proxy (/api/ai/...)
    let endpoint = '/api/ai/chat';

    if (task === 'vision') {
      endpoint = '/api/ai/vision';
    } else if (task === 'image') {
      endpoint = '/api/ai/image';
    }

    // Standardized Phi-3.5 Prompt Format (System/User/Assistant)
    const systemPrompt = this.systemPrompts[task as keyof typeof this.systemPrompts] || "Tu es PROQUELEC AI.";

    const body: any = {
      query: content || prompt,
      prompt: prompt, // Raw user prompt
      system_prompt: systemPrompt, // Injected for local cortex
      task: task,
      persona: 'admin',
      session_id: 'live_session_001',
      ...extraParams
    };

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Erreur Agent ${task.toUpperCase()} (Proxy): ${resp.status} - ${errText}`);
    }
    return await resp.json();
  }

  // --- AGENT HANDLERS ---

  private async generateText(req: AIRequest, spec: unknown): Promise<AIResponse> {
    // Pour l'instant on utilise 'expert' pour le texte générique
    const resp = await this.callBackend('expert', req.prompt || "");
    return { success: true, data: resp.response || resp.answer, modelUsed: this.models.text };
  }

  private async generateImage(req: AIRequest, spec: unknown): Promise<AIResponse> {
    const resp = await this.callBackend('image', req.prompt || "");
    // Backend returns { url: ... } or { image_base64: ... }
    return { success: true, data: resp.url || resp.image_url, modelUsed: this.models.image };
  }

  private async translate(req: AIRequest): Promise<AIResponse> {
    const resp = await this.callBackend('translation', req.prompt || "");
    return { success: true, data: resp.content || resp.response, modelUsed: this.models.translation };
  }

  private async analyzeSEO(req: AIRequest, device: DeviceType): Promise<AIResponse> {
    const resp = await this.callBackend('seo', req.prompt || "");
    // Try parse JSON if string
    let data = resp.content || resp.response;
    try { if (typeof data === 'string') data = JSON.parse(data); } catch (e) { }
    return { success: true, data: data, modelUsed: this.models.seo };
  }

  private async optimizeCode(req: AIRequest, device: DeviceType): Promise<AIResponse> {
    const resp = await this.callBackend('code', req.prompt || "");
    return { success: true, data: resp.content || resp.response, modelUsed: this.models.code };
  }

  private async consultExpert(req: AIRequest): Promise<AIResponse> {
    const query = req.prompt || req.content || "";
    // Pass docsContext if available
    const docsContext = req.context?.docsContext as string | undefined;

    // Use ExpertRagService which now talks to /api/ai/chat
    const result = await expertRag.ask(query, docsContext);
    return { success: true, data: result, modelUsed: this.models.expert };
  }

  private async analyzeVision(req: AIRequest): Promise<AIResponse> {
    const resp = await this.callBackend('vision', req.prompt || "");
    return { success: true, data: resp.analysis, modelUsed: this.models.vision };
  }
}

export const aiMaster = AIMasterService.getInstance();