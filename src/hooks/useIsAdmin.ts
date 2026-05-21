
import { useUserRole } from "./useUserRole";

/**
 * Utilitaire pour savoir si l'utilisateur courant est admin.
 * Version migrée vers l'API locale.
 */
export function useIsAdmin() {
  const { isAdmin, isLoading } = useUserRole();

  return { isAdmin, isLoading, error: null };
}
