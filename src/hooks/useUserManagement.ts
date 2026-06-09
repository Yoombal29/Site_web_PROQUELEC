import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'moderator' | 'user' | 'partner' | 'secondary_admin';
  status: 'active' | 'inactive' | boolean;
  createdAt: Date;
  permissions?: string[];
}

export interface CreateUserData {
  email: string;
  role: string;
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("/api/admin/users", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();

      setUsers((data || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        status: user.is_active === true ? 'active' : 'inactive',
        createdAt: user.created_at ? new Date(user.created_at) : new Date(),
        permissions: []
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

  const createUser = useCallback(async (userData: CreateUserData & { password?: string }) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const body = {
        email: userData.email,
        password: userData.password || 'Password123!',
        role: userData.role
      };
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create user');
      }

      toast({
        title: "Utilisateur créé",
        description: `${userData.email} a été ajouté avec succès (Pass provisoire: ${body.password})`
      });
      await fetchUsers();
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
  const updateUser = useCallback(async (id: string, updates: Partial<UserProfile & { password?: string }>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update user');
      toast({ title: 'Utilisateur mis à jour', description: 'Les modifications ont été enregistrées.' });
      await fetchUsers();
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour l\'utilisateur', variant: 'destructive' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchUsers]);

  const deleteUser = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete user');
      toast({ title: 'Utilisateur supprimé', description: 'L\'utilisateur a été supprimé.' });
      await fetchUsers();
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'utilisateur', variant: 'destructive' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchUsers]);

  const changeUserStatus = useCallback(async (id: string, status: UserProfile['status']) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const isActive = status === 'active' || status === true;
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_active: isActive })
      });
      if (!res.ok) throw new Error('Failed to change status');
      toast({ title: 'Statut mis à jour', description: 'Le statut de l\'utilisateur a été modifié.' });
      await fetchUsers();
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de changer le statut', variant: 'destructive' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchUsers]);

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