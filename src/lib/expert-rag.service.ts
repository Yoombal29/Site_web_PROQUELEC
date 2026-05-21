
/**
 * PROQUELEC Expert-RAG Service (V6+ Unified Client)
 * 
 * ARCHITECTURE :
 * 1. CLIENT LÉGER : Passerelle vers Backend Node (Port 3000 -> Python 8002).
 * 2. COMPATIBLE CHATGPT-LIKE : Utilise l'endpoint /api/ai/chat avec "intent routing".
 */

import { EXPERT_CONFIG } from './expert-rules.config';
import { multiNormService } from '@/services/academy/multiNormService';

export interface KnowledgeSource {
  id: string;
  title: string;
  type: 'norm' | 'report' | 'manual' | 'template';
  content: string;
  metadata: {
    article?: string;
    page?: number;
    standard?: string;
    section?: string;
    topic?: string;
    [key: string]: unknown;
  };
}

class ExpertRagService {
  private static instance: ExpertRagService;

  static getInstance() {
    if (!ExpertRagService.instance) {
      ExpertRagService.instance = new ExpertRagService();
    }
    return ExpertRagService.instance;
  }

  /**
   * Unified query to the Sovereign Backend via Node Proxy
   * Enriched with local RAG from MultiNormService + GED Context
   */
  async ask(query: string, extraContext?: string): Promise<{ answer: string; sources: KnowledgeSource[]; model: string; }> {
    // 1. LOCAL RAG ENRICHMENT (Frontend)
    const localChunks = multiNormService.searchChunks(query, undefined, 3);
    const localContext = localChunks.map((c) => `[CONTEXTE ${c.metadata.normId}]: ${c.text}`).join('\n\n');

    // Combine Local (Code) + GED (Files)
    let fullContext = localChunks.length > 0 ? `[EXTRAITS NORMATIFS LOCAUX]\n${localContext}` : '';
    if (extraContext) {
      fullContext += `\n\n[CONTEXTE DOCUMENTS GED]\n${extraContext}`;
    }

    // 2. FAST PATH (Frontend Router) - Simple keyword matching for speed
    const staticAnswer = this.checkStaticRules(query);
    if (staticAnswer && !extraContext) { // Skip static if we have specific docs context
      // If extraContext is present, we prefer asking the AI to analyze it.
      return {
        answer: staticAnswer,
        sources: [{ id: 'fast-path', title: 'Règlementation Directe', type: 'manual', content: staticAnswer, metadata: {} }],
        model: 'PROQUELEC Instant Reflex (Frontend)'
      };
    }

    // 3. BACKEND PATH (Sovereign V6 Engine via Proxy)
    try {
      // Enrich the query with combined context for the backend
      const enrichedQuery = fullContext ?
        `[CONTEXTE TECHNIQUE FOURNI]\n${fullContext}\n\n[REQUÊTE UTILISATEUR]\n${query}` :
        query;

      const token = localStorage.getItem('token');
      // Use Local Node Proxy (/api/ai/chat)
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Pass Frontend Auth
        },
        body: JSON.stringify({
          query: enrichedQuery,
          // We pass the raw query separately if the backend supports "system" + "user" split, 
          // but keeping it simple with enriched query in 'query' field works for most Haystack pipelines.
          prompt: query,
          task: 'expert',
          persona: "installateur"
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns standard response format
        return {
          answer: data.response || data.answer || "Réponse reçue (Format inconnu)",
          sources: localChunks.map((c) => ({
            id: c.id,
            title: c.metadata.titre || 'Extrait Contextuel',
            type: 'norm',
            content: c.text,
            metadata: { standard: c.metadata.normId }
          })),
          model: `PROQUELEC V6+ (${data.intent || 'Expert'})`
        };
      } else {
        // Fallback to local RAG if backend is down
        console.error('AI Proxy Error:', await response.text());
        if (localChunks.length > 0) {
          return {
            answer: `Le moteur expert est temporairement indisponible, mais j'ai trouvé ces extraits pertinents :\n\n${localContext}`,
            sources: [],
            model: 'Local RAG Fallback'
          };
        }
        return this.offlineResponse("Le moteur souverain V6 est inaccessible (Proxy Error).");
      }
    } catch (error) {
      // Fallback to local RAG on network error
      if (localChunks.length > 0) {
        return {
          answer: `Erreur de connexion au serveur expert. Voici ce que j'ai trouvé localement :\n\n${localContext}`,
          sources: [],
          model: 'Local RAG Fallback'
        };
      }
      return this.offlineResponse(`Connexion échouée: ${error.message}`);
    }
  }

  /**
   * Internal Router for Fast Path
   */
  private checkStaticRules(query: string): string | null {
    const q = query.toLowerCase();

    // 1. Detect Room/Context
    let detectedRoom: keyof typeof EXPERT_CONFIG.rooms | null = null;
    for (const [key, config] of Object.entries(EXPERT_CONFIG.rooms)) {
      if (config.keywords.some((k) => q.includes(k))) {
        detectedRoom = key as keyof typeof EXPERT_CONFIG.rooms;
        break;
      }
    }

    // 2. Detect Concept
    if (q.includes('hauteur') || q.includes('haut')) {
      if (detectedRoom === 'SDB') return EXPERT_CONFIG.staticRules.heights.SDB;

      // Only return general height if specifically asking for sockets (prises)
      // to avoid incorrect answers for other components like disjoncteurs.
      if (q.includes('prise') || q.includes('socle')) {
        return EXPERT_CONFIG.staticRules.heights.general;
      }

      // Otherwise, let the backend (AI) handle the specific technical requirement
      return null;
    }

    if (detectedRoom === 'SDB' && (q.includes('volume') || q.includes('zone'))) {
      // const vol2Keys = EXPERT_CONFIG.rooms.SDB.keywords.filter((k) => k === 'volume 2' || k === 'zone 2');
      return EXPERT_CONFIG.staticRules.volumes.SDB_VOL2;
    }

    if (detectedRoom === 'CUI' && (q.includes('combien') || q.includes('nombre') || q.includes('prise'))) {
      return EXPERT_CONFIG.staticRules.counts.CUI;
    }

    return null;
  }


  private offlineResponse(reason: string = "Moteur déconnecté."): { answer: string; sources: KnowledgeSource[]; model: string; } {
    return {
      answer: `### ⚠️ **Service Indisponible**\n\n${reason}\n\nAssurez-vous que le backend (Node + Python) est lancé.`,
      sources: [],
      model: 'Offline Mode'
    };
  }
}

export const expertRag = ExpertRagService.getInstance();