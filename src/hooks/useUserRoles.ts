
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';
import { apiFetch } from "@/lib/api-client";

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
        const data = await apiFetch<UserRoleData[]>('/api/user-roles');
        return data || [];
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
      await apiFetch(`/api/user-roles/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role, status })
      });
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
      await apiFetch(`/api/user-roles/${userId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      toast.success("Rôle retiré.");
    }
  });
}
