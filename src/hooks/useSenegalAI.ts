/**
 * Hook pour l'IA Souveraine Sénégalisée (NS 01-001 UNIQUEMENT)
 * Version adaptée pour utiliser EXCLUSIVEMENT la norme sénégalaise NS 01-001
 */

import { useState } from 'react';
import { searchNS01001, findArticle } from '@/data/ns01001-loader';
import { apiFetch } from '@/lib/api-client';

export interface SenegalAIResponse {
  status: 'accepted' | 'refused';
  content?: string;
  message?: string;
  articles?: NS01001Rule[];
  metadata?: {
    norme: string;
    rulesFound: number;
    processingTime: number;
  };
}

export function useSenegalAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Requête à l'IA Souveraine Sénégalisée
   * POLITIQUE STRICTE : Uniquement NS 01-001, aucune autre norme
   */
  const querySenegalEngine = async (userQuery: string): Promise<SenegalAIResponse> => {
    const startTime = Date.now();
    setLoading(true);
    setError(null);

    try {
      // VALIDATION : Détection de demandes hors NS 01-001
      if (isOutOfScope(userQuery)) {
        return {
          status: 'refused',
          message: `🇸🇳 **Refus de Conformité**\n\nCette IA est strictement limitée à la **Norme Sénégalaise NS 01-001**.\n\nLes normes internationales (NF C, IEC, IEEE) ne sont pas applicables au Sénégal dans ce contexte.\n\n**Solution** : Reformulez votre question en référence à la NS 01-001 uniquement.`,
          metadata: {
            norme: 'NS 01-001 (Sénégal)',
            rulesFound: 0,
            processingTime: Date.now() - startTime
          }
        };
      }

      // 1. RECHERCHE DANS LE CORPUS ATOMISÉ (API Locale) - Haute Qualité
      let dbArticles: unknown[] = [];
      try {
        dbArticles = await apiFetch<unknown[]>(`/api/normative-articles?query=${encodeURIComponent(userQuery)}`);
      } catch (e) {
        // Fallback to local search if API fails
        console.warn('API search failed, using local search only');
      }

      // 2. RECHERCHE DANS LA BASE LOCALE (JSON) - Large Couverture
      const localRules = searchNS01001(userQuery, 5);

      // Fusionner et Prioriser
      const allArticles: NS01001Rule[] = [];

      if (dbArticles && dbArticles.length > 0) {
        dbArticles.forEach((art: unknown) => {
          allArticles.push({
            id: art.id,
            titre: `${art.ref_code || ''} - ${art.chapter_ref || ''}`,
            article: art.article_ref,
            content: art.content_exact,
            page: 0 // Non disponible en DB atomisée pour l'instant
          });
        });
      }

      // Ajouter les règles locales si pas déjà présentes ou en complément
      localRules.forEach((rule) => {
        if (!allArticles.find((a) => a.article === rule.article)) {
          allArticles.push(rule);
        }
      });

      // RÈGLE DE REFUS : Aucune référence trouvée
      if (allArticles.length === 0) {
        return {
          status: 'refused',
          message: `❌ **Aucune référence trouvée dans la NS 01-001**\n\nVotre question : *"${userQuery}"*\n\nLa base de données normative sénégalaise ne contient pas de réponse directe à cette question.\n\n**Suggestions** :\n- Vérifiez l'orthographe des termes techniques\n- Utilisez des mots-clés de la norme (ex: "protection", "installation", "tableau")`,
          metadata: {
            norme: 'NS 01-001 (Sénégal)',
            rulesFound: 0,
            processingTime: Date.now() - startTime
          }
        };
      }

      // CONSTRUCTION DE LA RÉPONSE NORMÉE SÉNÉGALAISE
      const primaryRule = allArticles[0];
      const response = buildSenegaleseResponse(primaryRule, allArticles);

      return {
        status: 'accepted',
        content: response,
        articles: allArticles,
        metadata: {
          norme: 'NS 01-001 (Sénégal)',
          rulesFound: allArticles.length,
          processingTime: Date.now() - startTime
        }
      };

    } catch (err: unknown) {
      console.error('Erreur Sovereign Engine Sénégal:', err);
      setError(err.message);

      return {
        status: 'refused',
        message: `⚠️ **Erreur Technique**\n\n${err.message}\n\nLe moteur normatif sénégalais a rencontré une erreur. Veuillez réessayer.`,
        metadata: {
          norme: 'NS 01-001 (Sénégal)',
          rulesFound: 0,
          processingTime: Date.now() - startTime
        }
      };
    } finally {
      setLoading(false);
    }
  };

  return { querySenegalEngine, loading, error };
}

/**
 * Détection des requêtes hors champ d'application NS 01-001
 */
function isOutOfScope(query: string): boolean {
  const outOfScopeKeywords = [
  'NF C', 'NFC', 'nf c',
  'IEC', 'CEI',
  'IEEE',
  'UTE',
  'norme française',
  'norme européenne',
  'EN ', ' EN',
  'CENELEC'];


  const lowerQuery = query.toLowerCase();
  return outOfScopeKeywords.some((keyword) => lowerQuery.includes(keyword.toLowerCase()));
}

/**
 * Construction d'une réponse structurée selon le format sénégalais
 */
function buildSenegaleseResponse(primaryRule: NS01001Rule, allRules: NS01001Rule[]): string {
  let response = `## 🇸🇳 Référence Normative Sénégalaise\n\n`;

  // En-tête principal
  response += `**Norme** : NS 01-001 (Norme Sénégalaise d'Installation Électrique)\n`;
  response += `**Article** : ${primaryRule.article}\n`;
  response += `**Section** : ${primaryRule.titre}\n`;
  response += `**Page** : ${primaryRule.page}\n\n`;

  response += `---\n\n`;

  // Contenu de la règle principale
  response += `### 📖 Prescription Normative\n\n`;
  response += `${primaryRule.content}\n\n`;

  // Articles complémentaires si disponibles
  if (allRules.length > 1) {
    response += `---\n\n`;
    response += `### 📚 Articles Connexes\n\n`;

    allRules.slice(1, 3).forEach((rule, idx) => {
      response += `**${idx + 2}. Article ${rule.article}** (Page ${rule.page})\n`;
      response += `${rule.content.substring(0, 150)}...\n\n`;
    });
  }

  // Pied de page légal
  response += `---\n\n`;
  response += `*Extrait de la NS 01-001 - Norme Sénégalaise pour les Installations Électriques*\n`;
  response += `*Cette réponse est basée exclusivement sur le corpus normatif sénégalais (1994 articles)*`;

  return response;
}

/**
 * Helper pour rechercher par article spécifique
 */
export function queryByArticle(articleRef: string): SenegalAIResponse {
  const rule = findArticle(articleRef);

  if (!rule) {
    return {
      status: 'refused',
      message: `Article **${articleRef}** introuvable dans la NS 01-001.`
    };
  }

  return {
    status: 'accepted',
    content: buildSenegaleseResponse(rule, [rule]),
    articles: [rule],
    metadata: {
      norme: 'NS 01-001 (Sénégal)',
      rulesFound: 1,
      processingTime: 0
    }
  };
}