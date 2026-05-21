import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'editor' | 'moderator' | 'user' | 'partner' | 'secondary_admin';
  status: 'active' | 'inactive' | 'pending' | boolean;
  lastLogin: Date | null;
  createdAt: Date;
  avatar?: string;
  department?: string;
  permissions: string[];
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  permissions: string[];
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("/api/users", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();

      setUsers((data || []).map((user: unknown) => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        role: user.role || 'user',
        status: user.status === true || user.status === 'active' ? 'active' : 'inactive',
        lastLogin: user.last_login ? new Date(user.last_login) : null,
        createdAt: user.created_at ? new Date(user.created_at) : new Date(),
        avatar: user.avatar_url,
        department: user.department,
        permissions: user.permissions || []
      })));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createUser = useCallback(async (userData: CreateUserData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("/api/auth/register", { // Reusing register endpoint if possible or common endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: userData.email,
          password: 'Password123!', // Temporary default password for created users
          role: userData.role
        })
      });

      if (!res.ok) throw new Error("Failed to create user");

      toast({
        title: "Utilisateur créé",
        description: `${userData.email} a été ajouté avec succès (Pass provisoire: Password123!)`
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'utilisateur",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchUsers]);

  // Updated stubs for the rest to avoid errors, real implementation can be added to backend later
  const updateUser = useCallback(async (id: string, updates: Partial<UserProfile>) => {
    toast({ title: "Info", description: "Mise à jour non implémentée sur l'API" });
  }, [toast]);

  const deleteUser = useCallback(async (id: string) => {
    toast({ title: "Info", description: "Suppression non implémentée sur l'API" });
  }, [toast]);

  const changeUserStatus = useCallback(async (id: string, status: UserProfile['status']) => {
    toast({ title: "Info", description: "Changement de statut non implémenté sur l'API" });
  }, [toast]);

  return {
    users,
    isLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    changeUserStatus
  };
}