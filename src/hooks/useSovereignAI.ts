
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NormativeArticle {
    book_ref: string;
    title: string;
    chapter_ref: string;
    article_ref: string;
    content_exact: string;
    safety_objective: string;
    application_conditions: string;
    prohibitions: string[];
    formulas: any;
    alfresco_node_id?: string;
}

export function useSovereignAI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const querySovereignEngine = async (userQuery: string) => {
        setLoading(true);
        setError(null);

        try {
            // 1. RECHERCHE DIRECTE DANS LE CORPUS SQL (Bypass TypeScript types)
            const searchTerm = `%${userQuery.split(' ').slice(0, 3).join('%')}%`;

            const { data: articles, error: dbError } = await (supabase as any)
                .from('normative_articles')
                .select(`
          content_exact, 
          article_ref, 
          chapter_ref,
          safety_objective,
          application_conditions,
          prohibitions,
          formulas,
          alfresco_node_id,
          normative_books!inner (
            ref_code,
            title
          )
        `)
                .ilike('content_exact', searchTerm)
                .limit(5);

            if (dbError) {
                console.error("DB Error:", dbError);
                return {
                    status: 'refused',
                    message: `Erreur de base de données : ${dbError.message}. Vérifiez que les tables normatives sont bien créées.`,
                    source: null
                };
            }

            // 2. RÈGLE DE REFUS AUTOMATIQUE
            if (!articles || articles.length === 0) {
                return {
                    status: 'refused',
                    message: "Aucune référence normative disponible dans le Corpus PROQUELEC.",
                    source: null
                };
            }

            // 3. CONSTRUCTION DE LA RÉPONSE NORMÉE
            const firstArticle = articles[0];
            const normRef = firstArticle.normative_books?.ref_code || 'NS 01.001';

            const response = `**Référence Normative : ${normRef}, ${firstArticle.chapter_ref}, ${firstArticle.article_ref}**

${firstArticle.content_exact}

**Objectif de sécurité :** ${firstArticle.safety_objective || 'Non spécifié'}

**Conditions d'application :** ${firstArticle.application_conditions || 'Non spécifié'}`;

            return {
                status: 'accepted',
                content: response,
                articles: articles
            };

        } catch (err: any) {
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
