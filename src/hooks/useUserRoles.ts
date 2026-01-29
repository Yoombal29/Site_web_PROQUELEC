
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export type AppRole = 'admin' | 'secondary_admin' | 'partner' | 'user';
export type UserStatus = 'pending' | 'active' | 'rejected';

export interface UserRoleData {
  user_id: string;
  email: string;
  role: AppRole;
  status: UserStatus;
}

/**
 * Récupérer tous les rôles et statuts
 */
export function useAllUserRoles() {
  return useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async (): Promise<UserRoleData[]> => {
      try {
        const { data: profiles, error: pErr } = await supabase.from("profiles").select("id, username");
        const { data: roles, error: rErr } = await supabase.from("user_roles").select("user_id, role, status");

        if (pErr || rErr) throw (pErr || rErr);

        return (profiles || []).map(p => {
          const r = roles?.find(role => role.user_id === p.id);
          return {
            user_id: p.id,
            email: p.username || p.id,
            role: (r?.role as AppRole) || 'user',
            status: (r?.status as UserStatus) || 'active'
          };
        });
      } catch (error) {
        console.error(error);
        return [];
      }
    }
  });
}

/**
 * Approuver/Activer un utilisateur
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role, status }: { userId: string, role: AppRole, status: UserStatus }) => {
      const { error } = await (supabase
        .from("user_roles") as any)
        .upsert([{ user_id: userId, role, status }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      toast.success("Statut utilisateur mis à jour.");
    }
  });
}

/**
 * Rejeter/Supprimer un rôle
 */
export function useRemoveUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      toast.success("Rôle retiré.");
    }
  });
}
