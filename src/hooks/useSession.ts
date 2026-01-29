
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import type { Session, User } from "@supabase/supabase-js";
import { startTransition } from "react";

/**
 * Permet de récupérer l'utilisateur, la session et l'état de chargement.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion.');
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      startTransition(() => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      });
    });

    // Initialiser la session au mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      startTransition(() => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, isLoading, signOut };
}
