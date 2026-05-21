
import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';

export interface NormativeArticle {
  book_ref: string;
  title: string;
  chapter_ref: string;
  article_ref: string;
  content_exact: string;
  safety_objective: string;
  application_conditions: string;
  prohibitions: string[];
  formulas: unknown;
}

export function useSovereignAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const querySovereignEngine = async (userQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      // Search via local API
      const articles = await apiFetch<unknown[]>(`/api/normative-articles?query=${encodeURIComponent(userQuery)}`);

      // RÈGLE DE REFUS AUTOMATIQUE
      if (!articles || articles.length === 0) {
        return {
          status: 'refused',
          message: "Aucune référence normative exacte trouvée dans le Corpus PROQUELEC pour cette requête spécifique.",
          source: null
        };
      }

      // CONSTRUCTION DE LA RÉPONSE NORMÉE
      const firstArticle = articles[0];
      const normRef = firstArticle.ref_code || firstArticle.normative_books?.ref_code || 'NS 01.001';

      let response = `**Référence Normative : ${normRef}, ${firstArticle.chapter_ref}, ${firstArticle.article_ref}**

${firstArticle.content_exact}

**Objectif de sécurité :** ${firstArticle.safety_objective || 'Non spécifié'}

**Conditions d'application :** ${firstArticle.application_conditions || 'Non spécifié'}`;

      // Ajout des interdictions si présentes
      if (firstArticle.prohibitions && firstArticle.prohibitions.length > 0) {
        response += `\n\n**⚠️ INTERDICTIONS DIRECTES :**\n${firstArticle.prohibitions.map((p: string) => `- ${p}`).join('\n')}`;
      }

      return {
        status: 'accepted',
        content: response,
        articles: articles
      };

    } catch (err: unknown) {
      console.error("Sovereign Engine Error:", err);
      setError(err.message);
      return {
        status: 'refused',
        message: `Erreur technique : ${err.message}`,
        source: null
      };
    } finally {
      setLoading(false);
    }
  };

  return { querySovereignEngine, loading, error };
}