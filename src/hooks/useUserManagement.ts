
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'editor' | 'moderator' | 'user';
  status: 'active' | 'inactive' | 'pending';
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
  role: 'admin' | 'editor' | 'moderator' | 'user';
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) {
        throw error;
      }
      // Adapter selon la structure réelle de la table 'profiles'
      setUsers((data || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        role: user.role || 'user',
        status: user.status || 'active',
        lastLogin: user.last_login ? new Date(user.last_login) : null,
        createdAt: user.created_at ? new Date(user.created_at) : new Date(),
        avatar: user.avatar_url,
        department: user.department,
        permissions: user.permissions || [],
      })));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createUser = useCallback(async (userData: CreateUserData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ 
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          department: userData.department,
          permissions: userData.permissions,
          status: 'pending',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();
      if (error) throw error;
      toast({
        title: "Utilisateur créé",
        description: `${userData.firstName} ${userData.lastName} a été ajouté avec succès`,
      });
      fetchUsers();
      return data;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'utilisateur",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, fetchUsers]);

  const updateUser = useCallback(async (id: string, updates: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      toast({
        title: "Utilisateur mis à jour",
        description: "Les modifications ont été enregistrées",
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur",
        variant: "destructive",
      });
    }
  }, [toast, fetchUsers]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    }
  }, [toast, fetchUsers]);

  const changeUserStatus = useCallback(async (id: string, status: UserProfile['status']) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      toast({
        title: "Statut modifié",
        description: `Le statut de l'utilisateur a été changé en ${status}`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'utilisateur",
        variant: "destructive",
      });
    }
  }, [toast, fetchUsers]);

  return {
    users,
    isLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    changeUserStatus,
  };
}
