
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./useSession";

export type AppRole = 'admin' | 'secondary_admin' | 'partner' | 'user';

/**
 * Hook pour récupérer le rôle précis de l'utilisateur connecté.
 */
export function useUserRole() {
    const { user } = useSession();

    const { data: role, isLoading, error } = useQuery({
        queryKey: ["user-role", user?.id],
        enabled: !!user,
        queryFn: async (): Promise<AppRole> => {
            if (!user) return 'user';

            try {
                const { data, error } = await supabase
                    .from("user_roles")
                    .select("role, status")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (error) {
                    console.error('Error fetching user role:', error);
                    return 'user';
                }

                return (data?.role as AppRole) || 'user';
            } catch (err) {
                console.error('Exception in user role check:', err);
                return 'user';
            }
        },
        staleTime: 60_000,
    });

    const { data: status } = useQuery({
        queryKey: ["user-status", user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data } = await supabase.from("user_roles").select("status").eq("user_id", user?.id).maybeSingle();
            return data?.status || 'active';
        }
    });

    return {
        role: role || 'user',
        status: status || 'active',
        isAdmin: role === 'admin',
        isSecondaryAdmin: role === 'secondary_admin',
        isPartner: role === 'partner',
        isPending: status === 'pending',
        isLoading,
        error
    };
}
