import { apiFetch } from "@/lib/api-client";
import { logger } from "@/lib/logger";

export type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIServiceOptions = {
  mode: "Gratuit" | "Premium" | "Interne";
  requestType: "Calcul" | "Analyse" | "Schéma" | "Rapport" | "Formation" | "AdminProquelec" | "Strategie";
  model?: string;
  agent?: string;
  context?: unknown;
};

export const UnifiedAIService = {
  async chat(messages: AIMessage[], options: AIServiceOptions) {
    const userRole = localStorage.getItem('user_role') || 'public';

    try {
      return await apiFetch("/api/ai/orchestrate", {
        method: "POST",
        body: JSON.stringify({
          userRole,
          requestType: options.requestType,
          mode: options.mode,
          payload: messages[messages.length - 1].content,
          context: options.context
        })
      });
    } catch (error: unknown) {
      logger.error(`[UnifiedAIService] Échec de l'orchestrateur IA: ${error.message}`, { options });

      // Mode dégradé : Retourner un message poli expliquant que le service est surchargé
      return {
        content: "Désolé, nos serveurs d'intelligence artificielle subissent actuellement une forte charge. Veuillez réessayer dans quelques instants ou contacter le support technique si le problème persiste.",
        isDegraded: true
      };
    }
  },

  async analyzeDocument(fileName: string, fileDescription: string = "") {
    const userRole = localStorage.getItem('user_role') || 'public';

    return apiFetch("/api/ai/orchestrate", {
      method: "POST",
      body: JSON.stringify({
        userRole,
        requestType: "Analyse",
        mode: "Interne",
        // Special protocol for the orchestrator to recognize doc analysis
        payload: `[SYSTEM_DOC_ANALYSIS] Filename: ${fileName}. Description: ${fileDescription}. Tâche: Classifie ce document dans une des catégories (formation, procedure, technique, legal, commercial) et suggère 3 tags pertinents. Réponds en JSON: { "category": "...", "tags": "tag1, tag2", "summary": "..." }`
      })
    });
  }
};