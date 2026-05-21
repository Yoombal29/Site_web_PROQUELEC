import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Un hook personnalisé qui enrobe useMutation pour fournir
 * une gestion d'erreur et une notification automatique et robuste.
 */
export function useSafeMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
options: UseMutationOptions<TData, TError, TVariables, TContext>)
{
  return useMutation({
    ...options,
    onError: (error: unknown, variables, context) => {
      // 1. Log détaillé côté client pour le debug
      console.error(`[Mutation Error] Action échouée:`, {
        message: error.message,
        details: error.details,
        variables
      });

      // 2. Notification utilisateur intelligente
      const errorMessage = error.details || error.message || "Une erreur inattendue est survenue";
      toast.error("Échec de l'opération", {
        description: errorMessage,
        duration: 5000
      });

      // 3. Appel du callback original si présent
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    onSuccess: (data, variables, context) => {
      // Notification de succès optionnelle (souvent gérée dans le composant)
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    }
  });
}