
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./useSession";

/**
 * Utilitaire pour savoir si l'utilisateur courant est admin.
 * Promeut automatiquement le premier utilisateur en admin s'il n'existe pas encore d'admin.
 */
export function useIsAdmin() {
  const { user } = useSession();

  // Requête vers Supabase pour vérifier le rôle "admin"
  const { data: isAdmin, isLoading, error } = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<boolean> => {
      if (!user) {
        console.log('No user found for admin check');
        return false;
      }
      
      try {
        // 1. Tentez d'abord de promouvoir le premier utilisateur en admin
        // Cette fonction retournera true s'il n'y a pas d'admin et que l'utilisateur a été promu
        const { data: promoteResult, error: promoteError } = await supabase
          .rpc('promote_first_admin');
        
        if (promoteError) {
          console.warn('Error calling promote_first_admin:', promoteError);
          // Continue anyway
        } else if (promoteResult) {
          console.log('User promoted to admin as first admin');
          return true;
        }
        
        // 2. Vérifier si l'utilisateur courant est admin
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
          
        if (error) {
          console.error('Error checking admin status:', error);
          return false;
        }
        
        const result = !!data;
        console.log('Admin check result for user', user.id, ':', result);
        return result;
      } catch (err) {
        console.error('Exception in admin check:', err);
        return false;
      }
    },
    staleTime: 60_000,
  });

  return { isAdmin: isAdmin || false, isLoading, error };
}
